const pool = require('../config/db');

// GET /api/halls - Fetch active halls from MySQL
exports.getAllHalls = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM halls WHERE status = "active" ORDER BY id ASC');
    return res.status(200).json({ success: true, count: rows.length, halls: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch halls from database', error: error.message });
  }
};

// GET /api/halls/:id - Fetch single hall from MySQL
exports.getHallById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM halls WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }
    return res.status(200).json({ success: true, hall: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database query error', error: error.message });
  }
};

// GET /api/halls/:id/slots - Fetch hall slots from MySQL
exports.getHallSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    let query = 'SELECT * FROM hall_slots WHERE hall_id = ?';
    let params = [id];
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    const [rows] = await pool.execute(query, params);
    return res.status(200).json({ success: true, count: rows.length, slots: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch hall slots', error: error.message });
  }
};

// POST /api/halls - Create hall in MySQL
exports.createHall = async (req, res) => {
  try {
    const { name, capacity_min, capacity_max, address, amenities, image_url } = req.body;
    if (!name || !capacity_min || !capacity_max) {
      return res.status(400).json({ success: false, message: 'Hall name and capacities are required' });
    }

    const jsonAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);
    const img = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.execute(
      'INSERT INTO halls (name, capacity_min, capacity_max, address, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
      [name, capacity_min, capacity_max, address || '', jsonAmenities, img]
    );

    return res.status(201).json({ success: true, hallId: result.insertId, message: 'Hall created successfully' });
  } catch (error) {
    console.error('Error creating hall:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create hall' });
  }
};
