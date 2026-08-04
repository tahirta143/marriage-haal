const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/vendors - List all partner vendors from MySQL with city & category filters (PUBLIC)
exports.getAllVendors = async (req, res) => {
  try {
    const { city, category, category_id } = req.query;
    let sql = `
      SELECT v.*, c.name as category_name,
             COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email,
             COALESCE(u.name, v.business_name) as contact_person,
             COALESCE(v.phone, u.phone, '+92 300 0000000') as vendor_phone
      FROM vendors v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by exact category ID
    if (category_id && !isNaN(parseInt(category_id))) {
      sql += ' AND v.category_id = ?';
      params.push(parseInt(category_id));
    }

    if (city && city !== 'all') {
      sql += ' AND (LOWER(v.city) = LOWER(?) OR v.business_name LIKE ?)';
      params.push(city, `%${city}%`);
    }

    // Filter by category name
    if (category && category !== 'all') {
      sql += ' AND LOWER(c.name) LIKE LOWER(?)';
      params.push(`%${category}%`);
    }

    sql += ' ORDER BY v.id ASC';

    const [rows] = await pool.execute(sql, params);

    // Fetch sub-services for each vendor's category to provide service tags
    const vendorsWithSubServices = await Promise.all(
      rows.map(async (v) => {
        let subServices = [];
        if (v.category_id) {
          try {
            const [ss] = await pool.execute(
              'SELECT name FROM sub_services WHERE category_id = ? LIMIT 5',
              [v.category_id]
            );
            subServices = ss.map(s => s.name);
          } catch (_) {}
        }
        return {
          ...v,
          sub_services_tags: subServices
        };
      })
    );

    return res.status(200).json({ success: true, count: vendorsWithSubServices.length, vendors: vendorsWithSubServices });
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors from database', error: error.message });
  }
};

// GET /api/vendors/me - Vendor self profile for logged-in vendor user
exports.getVendorSelfProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT v.*, c.name as category_name,
              u.name as user_name, u.email as user_email
       FROM vendors v
       LEFT JOIN categories c ON v.category_id = c.id
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found for this user account' });
    }

    const vendor = rows[0];

    // Fetch vendor packages
    let packages = [];
    try {
      const [pkgRows] = await pool.execute(
        'SELECT * FROM vendor_packages WHERE vendor_id = ? ORDER BY id DESC',
        [vendor.id]
      );
      packages = pkgRows;
    } catch (_) {}

    return res.status(200).json({ success: true, vendor, packages });
  } catch (error) {
    console.error('Failed to fetch vendor self profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor profile', error: error.message });
  }
};

// PUT /api/vendors/me - Update logged-in vendor's own profile & prices
exports.updateVendorSelfProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { business_name, starting_price, city, address, phone, description, image_url, gallery } = req.body;

    const [vRows] = await pool.execute('SELECT id FROM vendors WHERE user_id = ?', [userId]);
    if (vRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No vendor profile associated with your user account' });
    }

    const vendorId = vRows[0].id;
    const galleryJson = gallery !== undefined ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : undefined;

    const fields = [];
    const params = [];

    if (business_name) { fields.push('business_name = ?'); params.push(business_name); }
    if (starting_price !== undefined) { fields.push('starting_price = ?'); params.push(parseFloat(starting_price) || 0); }
    if (city) { fields.push('city = ?'); params.push(city); }
    if (address !== undefined) { fields.push('address = ?'); params.push(address); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { fields.push('image_url = ?'); params.push(image_url); }
    if (galleryJson !== undefined) { fields.push('gallery = ?'); params.push(galleryJson); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    params.push(vendorId);

    await pool.execute(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, params);

    return res.status(200).json({ success: true, message: 'Vendor profile updated successfully' });
  } catch (error) {
    console.error('Update vendor self profile error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update vendor profile' });
  }
};

// GET /api/vendors/:id - Get single vendor detail (PUBLIC)
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT v.*, c.name as category_name, c.id as cat_id,
              COALESCE(u.name, v.business_name) as contact_person,
              COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email,
              COALESCE(v.phone, u.phone, '+92 300 0000000') as vendor_phone
       FROM vendors v
       LEFT JOIN categories c ON v.category_id = c.id
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const vendor = rows[0];

    // Fetch sub-services for this category
    let subServices = [];
    if (vendor.category_id) {
      try {
        const [ssRows] = await pool.execute(
          'SELECT * FROM sub_services WHERE category_id = ? ORDER BY id ASC',
          [vendor.category_id]
        );
        subServices = ssRows;
      } catch (_) {}
    }

    // Fetch vendor custom packages
    let packages = [];
    try {
      const [pkgRows] = await pool.execute(
        'SELECT * FROM vendor_packages WHERE vendor_id = ? ORDER BY id DESC',
        [id]
      );
      packages = pkgRows;
    } catch (_) {}

    return res.status(200).json({ success: true, vendor, subServices, packages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor details', error: error.message });
  }
};

// POST /api/vendors - Register partner vendor in MySQL & auto-create User Account
exports.createVendor = async (req, res) => {
  try {
    const {
      business_name, category_id, commission_percent, starting_price,
      user_id, image_url, gallery, city, address, phone, description,
      email, password, contact_person
    } = req.body;

    if (!business_name || !category_id) {
      return res.status(400).json({ success: false, message: 'Business name and category are required' });
    }

    const comm = commission_percent ? parseFloat(commission_percent) : 10.00;
    const startPrice = starting_price ? parseFloat(starting_price) : 25000.00;
    const img = image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
    const galleryJson = gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : null;
    const vendorCity = city || 'Lahore';

    let targetUserId = user_id;
    let createdAccountEmail = null;
    let createdAccountPassword = null;

    // Automatic User Account Creation if email is provided or user_id is missing
    if (!targetUserId && email) {
      // Check if user exists with this email
      const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        targetUserId = existingUser[0].id;
      } else {
        // Create new user account with role Vendor
        const rawPassword = password || `VendorPass${Math.floor(1000 + Math.random() * 9000)}`;
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(rawPassword, salt);
        const contactName = contact_person || business_name;

        const [newUser] = await pool.execute(
          'INSERT INTO users (name, email, password_hash, phone, status) VALUES (?, ?, ?, ?, ?)',
          [contactName, email, password_hash, phone || null, 'active']
        );
        targetUserId = newUser.insertId;
        createdAccountEmail = email;
        createdAccountPassword = rawPassword;

        // Assign to Vendor Group (group_id = 4)
        try {
          await pool.execute(
            'INSERT INTO user_groups (user_id, group_id) VALUES (?, 4) ON DUPLICATE KEY UPDATE group_id=4',
            [targetUserId]
          );
        } catch (_) {}
      }
    }

    // Fallback if still no targetUserId
    if (!targetUserId) {
      const [userRows] = await pool.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
      if (userRows.length > 0) {
        targetUserId = userRows[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'No registered user found for vendor assignment' });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO vendors
       (user_id, category_id, business_name, starting_price, image_url, status, commission_percent, gallery, city, address, phone, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [targetUserId, category_id, business_name, startPrice, img, 'approved', comm, galleryJson, vendorCity, address || null, phone || null, description || null]
    );

    return res.status(201).json({
      success: true,
      vendorId: result.insertId,
      userId: targetUserId,
      loginCredentials: createdAccountEmail ? { email: createdAccountEmail, password: createdAccountPassword } : null,
      message: createdAccountEmail
        ? `Vendor created & User login account generated (${createdAccountEmail})`
        : 'Vendor partner registered successfully'
    });
  } catch (error) {
    console.error('Vendor Creation Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create vendor in database' });
  }
};

// PUT /api/vendors/:id - Admin update vendor partner details
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, category_id, commission_percent, starting_price, image_url, status, gallery, city, address, phone, description } = req.body;

    if (!business_name || !category_id) {
      return res.status(400).json({ success: false, message: 'Business name and category are required' });
    }

    const comm = commission_percent !== undefined ? parseFloat(commission_percent) : undefined;
    const startPrice = starting_price !== undefined ? parseFloat(starting_price) : undefined;
    const allowedStatuses = ['unverified', 'pending', 'approved'];
    const safeStatus = allowedStatuses.includes(status) ? status : undefined;
    const galleryJson = gallery !== undefined ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : undefined;

    const fields = [];
    const params = [];

    fields.push('business_name = ?'); params.push(business_name);
    fields.push('category_id = ?'); params.push(category_id);
    if (comm !== undefined) { fields.push('commission_percent = ?'); params.push(comm); }
    if (startPrice !== undefined) { fields.push('starting_price = ?'); params.push(startPrice); }
    if (image_url !== undefined) { fields.push('image_url = ?'); params.push(image_url); }
    if (safeStatus !== undefined) { fields.push('status = ?'); params.push(safeStatus); }
    if (galleryJson !== undefined) { fields.push('gallery = ?'); params.push(galleryJson); }
    if (city !== undefined) { fields.push('city = ?'); params.push(city); }
    if (address !== undefined) { fields.push('address = ?'); params.push(address); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }

    params.push(id);

    const [result] = await pool.execute(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, message: 'Vendor updated successfully' });
  } catch (error) {
    console.error('Vendor Update Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update vendor' });
  }
};

// DELETE /api/vendors/:id - Remove a vendor partner
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM vendors WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Vendor Delete Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete vendor' });
  }
};

// VENDOR PACKAGES CRUD
exports.getVendorPackages = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM vendor_packages WHERE vendor_id = ? ORDER BY id DESC', [id]);
    return res.status(200).json({ success: true, count: rows.length, packages: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor packages', error: error.message });
  }
};

exports.createVendorPackage = async (req, res) => {
  try {
    const { vendor_id, name, price, pricing_type, description, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Package name is required' });
    }

    let targetVendorId = vendor_id;

    // If user is a vendor, resolve targetVendorId from logged in user
    if (!targetVendorId && req.user) {
      const [vRows] = await pool.execute('SELECT id FROM vendors WHERE user_id = ?', [req.user.id]);
      if (vRows.length > 0) {
        targetVendorId = vRows[0].id;
      }
    }

    if (!targetVendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const pkgPrice = price ? parseFloat(price) : 0.00;
    const pkgType = ['fixed', 'per_head', 'per_hour'].includes(pricing_type) ? pricing_type : 'fixed';

    const [result] = await pool.execute(
      'INSERT INTO vendor_packages (vendor_id, name, price, pricing_type, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [targetVendorId, name, pkgPrice, pkgType, description || null, image_url || null]
    );

    return res.status(201).json({ success: true, packageId: result.insertId, message: 'Vendor package created successfully' });
  } catch (error) {
    console.error('Create Package Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create vendor package' });
  }
};

exports.updateVendorPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { name, price, pricing_type, description, image_url } = req.body;

    const fields = [];
    const params = [];

    if (name) { fields.push('name = ?'); params.push(name); }
    if (price !== undefined) { fields.push('price = ?'); params.push(parseFloat(price) || 0); }
    if (pricing_type) { fields.push('pricing_type = ?'); params.push(pricing_type); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { fields.push('image_url = ?'); params.push(image_url); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided' });
    }

    params.push(packageId);

    const [result] = await pool.execute(`UPDATE vendor_packages SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    return res.status(200).json({ success: true, message: 'Package updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update package' });
  }
};

exports.deleteVendorPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const [result] = await pool.execute('DELETE FROM vendor_packages WHERE id = ?', [packageId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    return res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete package' });
  }
};

// VENDOR INQUIRIES
exports.submitVendorInquiry = async (req, res) => {
  try {
    const { id } = req.params; // vendor_id
    const { customer_name, customer_phone, customer_email, event_function, event_date, guest_count, message } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
    }

    const customerId = req.user?.id || null;
    const gCount = parseInt(guest_count) || 100;

    const [result] = await pool.execute(
      `INSERT INTO vendor_inquiries
       (vendor_id, customer_id, customer_name, customer_phone, customer_email, event_function, event_date, guest_count, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, customerId, customer_name, customer_phone, customer_email || null, event_function || 'Wedding Function', event_date || null, gCount, message || null]
    );

    return res.status(201).json({ success: true, inquiryId: result.insertId, message: 'Inquiry submitted successfully! The vendor will contact you shortly.' });
  } catch (error) {
    console.error('Submit Inquiry Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit inquiry' });
  }
};

exports.getVendorInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT vi.*, v.business_name
       FROM vendor_inquiries vi
       JOIN vendors v ON vi.vendor_id = v.id
       WHERE v.user_id = ?
       ORDER BY vi.id DESC`,
      [userId]
    );
    return res.status(200).json({ success: true, count: rows.length, inquiries: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch inquiries', error: error.message });
  }
};

exports.updateVendorInquiryStatus = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'contacted', 'accepted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [result] = await pool.execute('UPDATE vendor_inquiries SET status = ? WHERE id = ?', [status, inquiryId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    return res.status(200).json({ success: true, message: `Inquiry status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

// GET /api/staff - List all in-house staff members
exports.getAllStaff = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, c.name as category_name, COALESCE(u.name, 'In-House Staff') as staff_name, COALESCE(u.email, 'staff@shaadipro.com') as staff_email
      FROM staff s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);
    return res.status(200).json({ success: true, count: rows.length, staff: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch staff members from database', error: error.message });
  }
};

// POST /api/staff - Register in-house staff
exports.createStaff = async (req, res) => {
  try {
    const { user_id, category_id } = req.body;
    if (!user_id || !category_id) {
      return res.status(400).json({ success: false, message: 'User ID and category ID are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO staff (user_id, category_id) VALUES (?, ?)',
      [user_id, category_id]
    );
    return res.status(201).json({ success: true, staffId: result.insertId, message: 'Staff registered successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register staff in database', error: error.message });
  }
};
