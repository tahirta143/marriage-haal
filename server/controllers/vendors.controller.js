const pool = require('../config/db');

// GET /api/vendors - List all partner vendors from MySQL with city & category filters
exports.getAllVendors = async (req, res) => {
  try {
    const { city, category, category_id } = req.query;
    let sql = `
      SELECT v.*, c.name as category_name, COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email, COALESCE(u.name, v.business_name) as contact_person
      FROM vendors v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by exact category ID (used by the category browse pages)
    if (category_id && !isNaN(parseInt(category_id))) {
      sql += ' AND v.category_id = ?';
      params.push(parseInt(category_id));
    }

    if (city && city !== 'all') {
      sql += ' AND (LOWER(v.city) = LOWER(?) OR v.business_name LIKE ?)';
      params.push(city, `%${city}%`);
    }

    // Filter by category name (partial match)
    if (category && category !== 'all') {
      sql += ' AND LOWER(c.name) LIKE LOWER(?)';
      params.push(`%${category}%`);
    }

    sql += ' ORDER BY v.id ASC';

    try {
      const [rows] = await pool.execute(sql, params);
      return res.status(200).json({ success: true, count: rows.length, vendors: rows });
    } catch (colErr) {
      const [rows] = await pool.execute(`
        SELECT v.*, c.name as category_name, COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email, COALESCE(u.name, v.business_name) as contact_person
        FROM vendors v
        LEFT JOIN categories c ON v.category_id = c.id
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY v.id ASC
      `);
      return res.status(200).json({ success: true, count: rows.length, vendors: rows });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors from database', error: error.message });
  }
};


// GET /api/vendors/:id - Get single vendor detail (public)
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT v.*, c.name as category_name, c.id as cat_id,
              COALESCE(u.name, v.business_name) as contact_person,
              COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email,
              COALESCE(u.phone, '+92 300 0000000') as vendor_phone
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

    // Fetch sub-services for this vendor's category
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

    return res.status(200).json({ success: true, vendor, subServices });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor details', error: error.message });
  }
};


// POST /api/vendors - Register partner vendor in MySQL
exports.createVendor = async (req, res) => {
  try {
    const { business_name, category_id, commission_percent, user_id, image_url, gallery } = req.body;
    if (!business_name || !category_id) {
      return res.status(400).json({ success: false, message: 'Business name and category are required' });
    }

    const comm = commission_percent ? parseFloat(commission_percent) : 10.00;
    const img = image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
    const galleryJson = gallery ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : null;

    let targetUserId = user_id || req.user?.id;
    if (!targetUserId) {
      const [userRows] = await pool.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
      if (userRows.length > 0) {
        targetUserId = userRows[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'No registered user found for vendor assignment' });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO vendors (user_id, category_id, business_name, image_url, status, commission_percent, gallery) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [targetUserId, category_id, business_name, img, 'approved', comm, galleryJson]
    );

    return res.status(201).json({ success: true, vendorId: result.insertId, message: 'Vendor partner registered successfully' });
  } catch (error) {
    console.error('Vendor Creation Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create vendor in database' });
  }
};

// GET /api/staff - List all in-house staff members from MySQL
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

// PUT /api/vendors/:id - Update vendor partner details
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_name, category_id, commission_percent, image_url, status, gallery } = req.body;

    if (!business_name || !category_id) {
      return res.status(400).json({ success: false, message: 'Business name and category are required' });
    }

    const comm = commission_percent !== undefined ? parseFloat(commission_percent) : undefined;
    const allowedStatuses = ['unverified', 'pending', 'approved'];
    const safeStatus = allowedStatuses.includes(status) ? status : undefined;
    const galleryJson = gallery !== undefined ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : undefined;

    // Build dynamic SET clause
    const fields = [];
    const params = [];

    fields.push('business_name = ?'); params.push(business_name);
    fields.push('category_id = ?'); params.push(category_id);
    if (comm !== undefined) { fields.push('commission_percent = ?'); params.push(comm); }
    if (image_url !== undefined) { fields.push('image_url = ?'); params.push(image_url); }
    if (safeStatus !== undefined) { fields.push('status = ?'); params.push(safeStatus); }
    if (galleryJson !== undefined) { fields.push('gallery = ?'); params.push(galleryJson); }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

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

// POST /api/staff - Register in-house staff in MySQL
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
