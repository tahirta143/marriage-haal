-- ShaadiPro Database Schema (MySQL) — Permission-Based RBAC with Image Upload Support

CREATE DATABASE IF NOT EXISTS shaadi_pro;
USE shaadi_pro;

-- 1. PERMISSIONS (Atomic, granular actions)
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  description VARCHAR(255)
);

-- Seed permissions
INSERT INTO permissions (id, name, module, description) VALUES
(1, 'report.view', 'report', 'View executive analytics & revenue reports'),
(2, 'hall.manage', 'hall', 'Create, edit, and manage hall slots'),
(3, 'category.manage', 'category', 'Manage service categories and package pricing'),
(4, 'vendor.manage', 'vendor', 'Approve and manage partner vendors'),
(5, 'staff.manage', 'staff', 'Manage in-house staff members'),
(6, 'booking.view', 'booking', 'View event bookings'),
(7, 'booking.create', 'booking', 'Create new hall reservation inquiries'),
(8, 'booking.edit', 'booking', 'Update booking details and status'),
(9, 'booking.delete', 'booking', 'Cancel or delete bookings'),
(10, 'payment.view', 'payment', 'View payment records and ledger'),
(11, 'payment.create', 'payment', 'Record token, installment, and final payments'),
(12, 'staff.view_own_jobs', 'staff', 'View assigned in-house tasks'),
(13, 'vendor.view_own', 'vendor', 'View assigned vendor job line-items & commissions'),
(14, 'rbac.manage', 'rbac', 'Manage security groups and user permissions')
ON DUPLICATE KEY UPDATE module=VALUES(module), description=VALUES(description);

-- 2. GROUPS (Permission bundles)
CREATE TABLE IF NOT EXISTS groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default groups
INSERT INTO groups (id, name, description) VALUES
(1, 'Owner', 'Full system control & executive reports'),
(2, 'Booking Manager', 'Manages bookings, halls, and customer payments'),
(3, 'Staff', 'In-house execution staff'),
(4, 'Vendor', 'External partnered service providers'),
(5, 'Customer', 'Client portal for event inquiries and package customization')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 3. GROUP <-> PERMISSIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS group_permissions (
  group_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (group_id, permission_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Seed group permissions
INSERT INTO group_permissions (group_id, permission_id) VALUES
(1,1), (1,2), (1,3), (1,4), (1,5), (1,6), (1,7), (1,8), (1,9), (1,10), (1,11), (1,12), (1,13), (1,14),
(2,2), (2,6), (2,7), (2,8), (2,10), (2,11),
(3,12),
(4,13),
(5,6), (5,7)
ON DUPLICATE KEY UPDATE group_id=VALUES(group_id);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','pending','disabled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default demo users (password: 'password123')
INSERT INTO users (id, name, email, phone, password_hash, status) VALUES
(1, 'Super Owner', 'owner@shaadipro.com', '+92 300 1111111', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(2, 'Manager Ali', 'manager@shaadipro.com', '+92 300 2222222', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(3, 'Tariq Chef', 'staff@shaadipro.com', '+92 300 3333333', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(4, 'Royal Vendor', 'vendor@shaadipro.com', '+92 300 4444444', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
(5, 'Usman Customer', 'customer@shaadipro.com', '+92 300 5555555', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. USER <-> GROUPS (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_groups (
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Seed user group mappings
INSERT INTO user_groups (user_id, group_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5)
ON DUPLICATE KEY UPDATE group_id=VALUES(group_id);

-- 6. USER <-> PERMISSIONS OVERRIDES
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  effect ENUM('grant','deny') DEFAULT 'grant',
  PRIMARY KEY (user_id, permission_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 7. REFRESH TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. HALLS (With Image URL Column)
CREATE TABLE IF NOT EXISTS halls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  capacity_min INT NOT NULL DEFAULT 100,
  capacity_max INT NOT NULL DEFAULT 1000,
  address VARCHAR(255),
  amenities JSON,
  image_url VARCHAR(255) NULL,
  status ENUM('active','maintenance','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default halls with image URLs
INSERT INTO halls (id, name, capacity_min, capacity_max, address, amenities, image_url, status) VALUES
(1, 'Royal Crystal Grand Ballroom', 300, 1200, 'Main Boulevard, Gulberg III, Lahore', '["AC", "VIP Parking", "Chandelier Lighting", "Sound System"]', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', 'active'),
(2, 'Emerald Marquee & Gardens', 150, 600, 'Club Road, Saddar, Rawalpindi', '["Lawn/Garden", "Segregation", "Valet Parking"]', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', 'active'),
(3, 'The Pearl Imperial Hall', 200, 800, 'Shahrah-e-Faisal, Karachi', '["AC", "Backup Generator", "Stage Decor"]', 'https://images.unsplash.com/photo-1545232979-fbfd42e20068?auto=format&fit=crop&w=800&q=80', 'active')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- 9. HALL SLOTS
CREATE TABLE IF NOT EXISTS hall_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hall_id INT NOT NULL,
  date DATE NOT NULL,
  slot ENUM('day','night','full_day') NOT NULL,
  status ENUM('available','tentative','booked') DEFAULT 'available',
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hall_date_slot (hall_id, date, slot)
);

-- 10. CATEGORIES (With Image URL Column)
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  pricing_type ENUM('fixed','per_head','per_hour') NOT NULL DEFAULT 'fixed',
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default categories with image URLs
INSERT INTO categories (id, name, pricing_type, image_url) VALUES
(1, 'Food & Catering', 'per_head', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'),
(2, 'Decor & Stage Setup', 'fixed', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),
(3, 'Bridal Makeup', 'fixed', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'),
(4, 'Mehndi Artist', 'fixed', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
(5, 'DJ & Sound System', 'per_hour', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'),
(6, 'Photography & Videography', 'fixed', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- 11. CATEGORY PACKAGES (With Image URL Column)
CREATE TABLE IF NOT EXISTS category_packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  details JSON,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed default packages
INSERT INTO category_packages (id, category_id, name, price, details, image_url) VALUES
(101, 1, 'Silver Menu', 1500.00, '["Chicken Biryani", "Chicken Qorma", "Roti/Naan", "Kheer", "Salad & Raita"]', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'),
(102, 1, 'Gold Menu', 2200.00, '["Mutton Qorma", "Chicken Biryani", "Seekh Kabab", "Fresh Naan", "Gulab Jamun & Ice Cream", "Salad Bar"]', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'),
(103, 1, 'Royal Diamond Buffet', 3200.00, '["Mutton Karahi", "Chicken Reshmi Kabab", "Mutton Yakhni Pulao", "Fish Tikka", "Live Tandoor", "Assorted Sweets & Dessert Bar"]', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'),
(201, 2, 'Classic Floral Stage', 120000.00, '["Artificial Floral Backdrop", "Stage Sofa Set", "Ambient LED Cans", "Entry Tunnel"]', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'),
(202, 2, 'Royal Mughal Theme Decor', 350000.00, '["Fresh Exotic Flowers", "Crystal Chandeliers", "Draped Ceiling Canopy", "VIP Walkway", "Pathway Torches"]', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'),
(301, 3, 'HD Signature Bridal Makeup', 45000.00, '["HD Airbrush Makeup", "Hair Styling", "Dupatta & Jewelry Setting", "Nail Extensions", "Pre-Bridal Facial"]', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'),
(302, 3, 'Party / Baraat Glam Makeup', 25000.00, '["Glam Makeup", "Hair Styling", "Draping"]', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'),
(401, 4, 'Bridal Full Arm Mehndi', 18000.00, '["Heavy Organic Henna", "Both Arms (Elbow)", "Both Feet", "Bridal Motifs"]', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
(501, 5, 'Concert Sound & DJ Night', 15000.00, '["JBL Concert Speakers", "Professional DJ console", "Moving Head Intelligent Lights", "Smoke & Sparkler Fountains"]', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'),
(601, 6, 'Cinematic Wedding Memories', 180000.00, '["2 DSLR Photographers", "1 Cinematic Videographer", "Drone Aerial Footage", "Premium Leather Album (100 Photos)", "Highlight Video & Full Event Edit"]', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- 12. VENDORS (With Image URL Column)
CREATE TABLE IF NOT EXISTS vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  business_name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255) NULL,
  status ENUM('unverified','pending','approved') DEFAULT 'approved',
  commission_percent DECIMAL(5,2) DEFAULT 10.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed default vendor
INSERT INTO vendors (id, user_id, category_id, business_name, image_url, status, commission_percent) VALUES
(1, 4, 2, 'Royal Floral Decorators', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 'approved', 12.00)
ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);

-- 13. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed default staff
INSERT INTO staff (id, user_id, category_id) VALUES
(1, 3, 1)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id);

-- 14. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  hall_id INT NOT NULL,
  hall_slot_id INT NULL,
  event_type ENUM('mehndi','baraat','walima','engagement','other') NOT NULL,
  event_date DATE NOT NULL,
  guest_count_estimated INT NOT NULL,
  guest_count_confirmed INT DEFAULT NULL,
  status ENUM('inquiry','tentative','confirmed','completed','cancelled') DEFAULT 'inquiry',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (hall_id) REFERENCES halls(id)
);

-- 15. BOOKING SERVICES
CREATE TABLE IF NOT EXISTS booking_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  category_id INT NOT NULL,
  package_id INT NOT NULL,
  vendor_id INT NULL,
  staff_id INT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('assigned','in_progress','done') DEFAULT 'assigned',
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (package_id) REFERENCES category_packages(id)
);

-- 16. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('token','installment','final') NOT NULL,
  method ENUM('cash','jazzcash','easypaisa','bank_transfer') NOT NULL,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
