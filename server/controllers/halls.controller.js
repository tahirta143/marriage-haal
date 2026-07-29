const pool = require('../config/db');

// GET /api/halls - Fetch active halls from MySQL with city & venue_type filters
exports.getAllHalls = async (req, res) => {
  try {
    const { city, venue_type } = req.query;
    let sql = 'SELECT * FROM halls WHERE status = "active"';
    const params = [];

    if (city && city !== 'all') {
      sql += ' AND (LOWER(city) = LOWER(?) OR address LIKE ?)';
      params.push(city, `%${city}%`);
    }

    if (venue_type && venue_type !== 'all') {
      sql += ' AND LOWER(venue_type) = LOWER(?)';
      params.push(venue_type);
    }

    sql += ' ORDER BY id ASC';

    const [rows] = await pool.execute(sql, params);
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

// GET /api/halls/:id/sub-venues - Fetch child sub-venues for parent hall
exports.getSubVenues = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM sub_venues WHERE hall_id = ? ORDER BY id ASC', [id]);
    return res.status(200).json({ success: true, count: rows.length, subVenues: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sub-venues', error: error.message });
  }
};

// POST /api/halls - Create hall in MySQL
exports.createHall = async (req, res) => {
  try {
    const { name, city, venue_type, capacity_min, capacity_max, address, amenities, image_url } = req.body;
    if (!name || !capacity_min || !capacity_max) {
      return res.status(400).json({ success: false, message: 'Hall name and capacities are required' });
    }

    const jsonAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);
    const img = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
    const cty = city || 'Lahore';
    const vType = venue_type || 'Ballroom';

    let result;
    try {
      [result] = await pool.execute(
        'INSERT INTO halls (name, city, venue_type, capacity_min, capacity_max, address, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "active")',
        [name, cty, vType, capacity_min, capacity_max, address || '', jsonAmenities, img]
      );
    } catch (colErr1) {
      try {
        [result] = await pool.execute(
          'INSERT INTO halls (name, venue_type, capacity_min, capacity_max, address, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
          [name, vType, capacity_min, capacity_max, address || '', jsonAmenities, img]
        );
      } catch (colErr2) {
        [result] = await pool.execute(
          'INSERT INTO halls (name, capacity_min, capacity_max, address, amenities, image_url, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
          [name, capacity_min, capacity_max, address || '', jsonAmenities, img]
        );
      }
    }

    return res.status(201).json({ success: true, hallId: result.insertId, message: 'Hall created successfully' });
  } catch (error) {
    console.error('Error creating hall:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create hall' });
  }
};

// PUT /api/halls/:id - Update hall in MySQL
exports.updateHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, venue_type, capacity_min, capacity_max, address, amenities, image_url, status } = req.body;

    const jsonAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);
    const img = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
    const cty = city || 'Lahore';
    const vType = venue_type || 'Ballroom';

    try {
      await pool.execute(
        'UPDATE halls SET name = ?, city = ?, venue_type = ?, capacity_min = ?, capacity_max = ?, address = ?, amenities = ?, image_url = ?, status = ? WHERE id = ?',
        [name, cty, vType, capacity_min, capacity_max, address || '', jsonAmenities, img, status || 'active', id]
      );
    } catch (colErr1) {
      try {
        await pool.execute(
          'UPDATE halls SET name = ?, venue_type = ?, capacity_min = ?, capacity_max = ?, address = ?, amenities = ?, image_url = ?, status = ? WHERE id = ?',
          [name, vType, capacity_min, capacity_max, address || '', jsonAmenities, img, status || 'active', id]
        );
      } catch (colErr2) {
        await pool.execute(
          'UPDATE halls SET name = ?, capacity_min = ?, capacity_max = ?, address = ?, amenities = ?, image_url = ?, status = ? WHERE id = ?',
          [name, capacity_min, capacity_max, address || '', jsonAmenities, img, status || 'active', id]
        );
      }
    }

    return res.status(200).json({ success: true, message: 'Hall updated successfully' });
  } catch (error) {
    console.error('Error updating hall:', error);
    return res.status(500).json({ success: false, message: 'Failed to update hall', error: error.message });
  }
};

// DELETE /api/halls/:id - Delete hall in MySQL
exports.deleteHall = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM halls WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Hall deleted successfully' });
  } catch (error) {
    console.error('Error deleting hall:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete hall', error: error.message });
  }
};

