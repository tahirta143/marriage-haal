const pool = require('../config/db');

// GET /api/bookings - List all bookings from MySQL
exports.getAllBookings = async (req, res) => {
  try {
    const { status, customer_id } = req.query;

    let query = `
      SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone, h.name as hall_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN halls h ON b.hall_id = h.id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (customer_id) {
      query += ' AND b.customer_id = ?';
      params.push(customer_id);
    }
    query += ' ORDER BY b.id DESC';

    const [rows] = await pool.execute(query, params);
    return res.status(200).json({ success: true, count: rows.length, bookings: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings from database', error: error.message });
  }
};

// GET /api/bookings/:id - Comprehensive booking details with line items from MySQL
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bRows] = await pool.execute(`
      SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone, h.name as hall_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN halls h ON b.hall_id = h.id
      WHERE b.id = ?
    `, [id]);

    if (bRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bRows[0];
    const [services] = await pool.execute(`
      SELECT bs.*, c.name as category_name, c.pricing_type, cp.name as package_name
      FROM booking_services bs
      JOIN categories c ON bs.category_id = c.id
      JOIN category_packages cp ON bs.package_id = cp.id
      WHERE bs.booking_id = ?
    `, [id]);

    booking.services = services;
    booking.total_amount = services.reduce((sum, s) => sum + Number(s.price), 0);

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch booking details', error: error.message });
  }
};

// POST /api/bookings - Create new booking with itemized services in MySQL
exports.createBooking = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      hall_id,
      event_type,
      event_date,
      slot,
      guest_count,
      selected_services
    } = req.body;

    if (!hall_id || !event_type || !event_date || !guest_count) {
      return res.status(400).json({ success: false, message: 'Hall, event type, date, and guest count are required' });
    }

    const guests = parseInt(guest_count);
    const servicesList = selected_services || [];

    // Resolve valid Customer ID from users table
    let customerId = req.user?.id;
    if (!customerId) {
      const [uRows] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [customer_email || 'customer@shaadipro.com']);
      if (uRows.length > 0) {
        customerId = uRows[0].id;
      } else {
        const [anyUser] = await pool.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
        customerId = anyUser.length > 0 ? anyUser[0].id : 1;
      }
    }

    const [bRes] = await pool.execute(
      `INSERT INTO bookings (customer_id, hall_id, hall_slot_id, event_type, event_date, guest_count_estimated, status, created_by)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
      [customerId, hall_id, event_type, event_date, guests, 'inquiry', customerId]
    );

    const dbBookingId = bRes.insertId;

    for (const srv of servicesList) {
      let linePrice = Number(srv.price || 0);
      if (srv.pricing_type === 'per_head') {
        linePrice = Number(srv.price || 0) * guests;
      }

      await pool.execute(
        `INSERT INTO booking_services (booking_id, category_id, package_id, price, status) VALUES (?, ?, ?, ?, ?)`,
        [dbBookingId, srv.category_id, srv.package_id, linePrice, 'assigned']
      );
    }

    return res.status(201).json({
      success: true,
      bookingId: dbBookingId,
      message: 'Booking reservation inquiry created successfully'
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create booking in database' });
  }
};

// PUT /api/bookings/:id/status - Update booking status in MySQL
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['inquiry', 'tentative', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `Booking status updated to '${status}'` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
  }
};
