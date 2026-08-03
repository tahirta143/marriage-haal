-- ShaadiPro Database Schema (MySQL) — Permission-Based RBAC
-- All business data (halls, events, vendors, etc.) is managed via the Admin Dashboard.
-- Only system-level RBAC data (permissions, groups, users) is seeded here.

CREATE DATABASE IF NOT EXISTS shaadi_pro;
USE shaadi_pro;

-- 1. PERMISSIONS (Atomic, granular actions)
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  description VARCHAR(255)
);

-- Required system permissions
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

-- Default system users (password: 'password123')
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

INSERT INTO user_groups (user_id, group_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)
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

-- 8. HALLS (Managed via Admin Dashboard -> /dashboard/halls)
CREATE TABLE IF NOT EXISTS halls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL DEFAULT 'Lahore',
  venue_type VARCHAR(50) NOT NULL DEFAULT 'Ballroom',
  capacity_min INT NOT NULL DEFAULT 100,
  capacity_max INT NOT NULL DEFAULT 1000,
  price_per_event DECIMAL(10,2) DEFAULT 150000.00,
  price_per_head DECIMAL(10,2) DEFAULT 1200.00,
  address VARCHAR(255),
  amenities JSON,
  image_url VARCHAR(255) NULL,
  status ENUM('active','maintenance','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- 10. CATEGORIES (Managed via Admin Dashboard -> /dashboard/categories)
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  pricing_type ENUM('fixed','per_head','per_hour') NOT NULL DEFAULT 'fixed',
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. CATEGORY PACKAGES (Managed via Admin Dashboard -> /dashboard/categories)
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

-- 12. VENDORS (Managed via Admin Dashboard -> /dashboard/vendors)
CREATE TABLE IF NOT EXISTS vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  business_name VARCHAR(100) NOT NULL,
  city VARCHAR(50) DEFAULT 'Lahore',
  image_url VARCHAR(255) NULL,
  starting_price DECIMAL(10,2) DEFAULT 25000.00,
  rating DECIMAL(3,2) DEFAULT 4.80,
  reviews INT DEFAULT 0,
  status ENUM('unverified','pending','approved') DEFAULT 'approved',
  commission_percent DECIMAL(5,2) DEFAULT 10.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 13. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 14. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  hall_id INT NOT NULL,
  hall_slot_id INT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  guest_count_estimated INT NOT NULL,
  guest_count_confirmed INT DEFAULT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0.00,
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

-- 17. EVENTS (Managed via Admin Dashboard -> /dashboard/events)
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. SUB-VENUES (Managed via Admin Dashboard -> /dashboard/halls, child spaces per hall)
CREATE TABLE IF NOT EXISTS sub_venues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hall_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  venue_type ENUM('Ballroom', 'Marquee', 'Lawn', 'Haveli', 'Courtyard', 'Rooftop', 'Suite') DEFAULT 'Ballroom',
  capacity_min INT DEFAULT 100,
  capacity_max INT DEFAULT 500,
  price_per_event DECIMAL(10,2) DEFAULT 150000.00,
  image_url VARCHAR(255) NULL,
  FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
);

-- 19. SUB-SERVICES (Managed via Admin Dashboard -> /dashboard/categories, add-on services per category)
CREATE TABLE IF NOT EXISTS sub_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 15000.00,
  description TEXT,
  image_url VARCHAR(255) NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 20. SUB-EVENTS (Managed via Admin Dashboard -> /dashboard/events, sub-functions per event)
CREATE TABLE IF NOT EXISTS sub_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 21. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'booking',
  link VARCHAR(255) DEFAULT '/dashboard/bookings',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
