const pool = require('../config/db');

// GET /api/vendors - List all partner vendors from MySQL
exports.getAllVendors = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT v.*, c.name as category_name, COALESCE(u.email, 'vendor@shaadipro.com') as vendor_email, COALESCE(u.name, v.business_name) as contact_person
      FROM vendors v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.id
    `);
    return res.status(200).json({ success: true, count: rows.length, vendors: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors from database', error: error.message });
  }
};

// POST /api/vendors - Register partner vendor in MySQL
exports.createVendor = async (req, res) => {
  try {
    const { business_name, category_id, commission_percent, user_id, image_url } = req.body;
    if (!business_name || !category_id) {
      return res.status(400).json({ success: false, message: 'Business name and category are required' });
    }

    const comm = commission_percent ? parseFloat(commission_percent) : 10.00;
    const img = image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

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
      'INSERT INTO vendors (user_id, category_id, business_name, image_url, status, commission_percent) VALUES (?, ?, ?, ?, ?, ?)',
      [targetUserId, category_id, business_name, img, 'approved', comm]
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
