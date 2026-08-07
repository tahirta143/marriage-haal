const pool = require('../config/db');

// Ensure events table exists on boot (no seed data — managed via Admin Dashboard)
const initEventsTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Failed to initialize events table in MySQL:', err.message);
  }
};

initEventsTable();

// GET /api/events - List all event functions from MySQL
exports.getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events ORDER BY id ASC');
    let subEventsList = [];
    try {
      const [se] = await pool.execute('SELECT * FROM sub_events ORDER BY id ASC');
      subEventsList = se;
    } catch (_) {}

    const events = rows.map(e => ({
      ...e,
      subEvents: subEventsList.filter(s => s.event_id === e.id)
    }));

    return res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch events from MySQL database', error: error.message });
  }
};

// GET /api/events/:id/sub-events - Fetch child sub-events for parent event
exports.getSubEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM sub_events WHERE event_id = ? ORDER BY id ASC',
      [id]
    );
    return res.status(200).json({ success: true, count: rows.length, subEvents: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sub-events', error: error.message });
  }
};

// POST /api/events/:id/sub-events - Create new child sub-event
exports.createSubEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Sub-event name is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO sub_events (event_id, name, description) VALUES (?, ?, ?)',
      [id, name, description || null]
    );

    return res.status(201).json({ success: true, subEventId: result.insertId, message: 'Sub-event created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create sub-event', error: error.message });
  }
};

// PUT /api/events/sub-events/:subId - Update sub-event
exports.updateSubEvent = async (req, res) => {
  try {
    const { subId } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Sub-event name is required' });
    }

    await pool.execute(
      'UPDATE sub_events SET name = ?, description = ? WHERE id = ?',
      [name, description || null, subId]
    );

    return res.status(200).json({ success: true, message: 'Sub-event updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update sub-event', error: error.message });
  }
};

// DELETE /api/events/sub-events/:subId - Delete sub-event
exports.deleteSubEvent = async (req, res) => {
  try {
    const { subId } = req.params;
    await pool.execute('DELETE FROM sub_events WHERE id = ?', [subId]);
    return res.status(200).json({ success: true, message: 'Sub-event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete sub-event', error: error.message });
  }
};

// GET /api/events/:id - Get single event function
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ? OR slug = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event function not found' });
    }

    let subEvents = [];
    try {
      const [se] = await pool.execute('SELECT * FROM sub_events WHERE event_id = ? ORDER BY id ASC', [rows[0].id]);
      subEvents = se;
    } catch (_) {}

    return res.status(200).json({ success: true, event: { ...rows[0], subEvents } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
};

// POST /api/events - Create new event function in MySQL
exports.createEvent = async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Event name and description are required' });
    }

    const eventSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const img = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.execute(
      'INSERT INTO events (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name, eventSlug, description, img]
    );

    return res.status(201).json({ success: true, eventId: result.insertId, message: 'Event function created in MySQL' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create event function in database', error: error.message });
  }
};

// PUT /api/events/:id - Update event function in MySQL
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url } = req.body;

    const eventSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const img = image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

    await pool.execute(
      'UPDATE events SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?',
      [name, eventSlug, description, img, id]
    );

    return res.status(200).json({ success: true, message: 'Event function updated in MySQL' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update event function in database', error: error.message });
  }
};

// DELETE /api/events/:id - Delete event function from MySQL
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM events WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Event function deleted from MySQL' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete event function from database', error: error.message });
  }
};
