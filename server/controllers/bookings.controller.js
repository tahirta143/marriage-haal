const pool = require('../config/db');

// GET /api/bookings - List all bookings from MySQL with Customer Isolation
exports.getAllBookings = async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query = `
      SELECT b.*, 
             COALESCE(NULLIF(b.customer_name, ''), u.name, 'Guest Customer') as customer_name, 
             COALESCE(NULLIF(b.customer_email, ''), u.email, 'guest@shaadipro.com') as customer_email, 
             COALESCE(NULLIF(b.customer_phone, ''), u.phone, 'N/A') as customer_phone, 
             COALESCE(h.name, 'ShaadiPro Main Hall') as hall_name,
             COALESCE(h.price_per_event, 150000) as price_per_event,
             COALESCE(h.price_per_head, 1200) as price_per_head
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN halls h ON b.hall_id = h.id
      WHERE 1=1
    `;
    const params = [];

    // Strict customer isolation: customers only see their own bookings
    if (userRole === 'customer') {
      query += ' AND (b.customer_id = ? OR LOWER(b.customer_email) = LOWER(?))';
      params.push(userId, req.user?.email || '');
    } else if (customer_id) {
      query += ' AND b.customer_id = ?';
      params.push(customer_id);
    }

    if (status && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }
    query += ' ORDER BY b.id DESC';

    const [rows] = await pool.execute(query, params);

    const processedBookings = rows.map((b) => {
      let amt = Number(b.total_amount || 0);
      if (amt <= 0) {
        const pEvt = Number(b.price_per_event || 150000);
        const pHd = Number(b.price_per_head || 1200);
        const guests = Number(b.guest_count_estimated || 100);
        amt = pEvt + (pHd * guests);
      }
      return { ...b, total_amount: amt };
    });

    return res.status(200).json({ success: true, count: processedBookings.length, bookings: processedBookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings from database', error: error.message });
  }
};

// GET /api/bookings/:id - Comprehensive booking details with line items from MySQL
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bRows] = await pool.execute(`
      SELECT b.*, 
             COALESCE(NULLIF(b.customer_name, ''), u.name, 'Guest Customer') as customer_name, 
             COALESCE(NULLIF(b.customer_email, ''), u.email, 'guest@shaadipro.com') as customer_email, 
             COALESCE(NULLIF(b.customer_phone, ''), u.phone, 'N/A') as customer_phone, 
             COALESCE(h.name, 'ShaadiPro Main Hall') as hall_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN halls h ON b.hall_id = h.id
      WHERE b.id = ?
    `, [id]);

    if (bRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bRows[0];
    const [services] = await pool.execute(`
      SELECT bs.*, 
             COALESCE(c.name, 'Custom Service') as category_name, 
             COALESCE(c.pricing_type, 'flat') as pricing_type, 
             COALESCE(cp.name, 'Standard Package') as package_name
      FROM booking_services bs
      LEFT JOIN categories c ON bs.category_id = c.id
      LEFT JOIN category_packages cp ON bs.package_id = cp.id
      WHERE bs.booking_id = ?
    `, [id]);

    booking.services = services;
    const servicesSum = services.reduce((sum, s) => sum + Number(s.price), 0);
    
    let currentTotal = Number(booking.total_amount || 0);
    if (currentTotal <= 0) {
      let hallRentalCost = 0;
      try {
        const [hData] = await pool.execute('SELECT price_per_event, price_per_head FROM halls WHERE id = ?', [booking.hall_id]);
        if (hData.length > 0) {
          const pEvt = Number(hData[0].price_per_event || 150000);
          const pHd = Number(hData[0].price_per_head || 1200);
          hallRentalCost = pEvt + (pHd * Number(booking.guest_count_estimated || 100));
        }
      } catch (_) {
        hallRentalCost = 150000 + (1200 * Number(booking.guest_count_estimated || 100));
      }
      currentTotal = hallRentalCost + servicesSum;
      await pool.execute('UPDATE bookings SET total_amount = ? WHERE id = ?', [currentTotal, id]);
    }

    booking.total_amount = currentTotal;

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch booking details', error: error.message });
  }
};

// POST /api/bookings - Create new booking inquiry in MySQL with Transaction & Double-Booking Check
exports.createBooking = async (req, res) => {
  let connection;
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

    if (!event_type || !event_date || !guest_count) {
      return res.status(400).json({ success: false, message: 'Event type, date, and guest count are required' });
    }

    const guests = parseInt(guest_count) || 100;
    const servicesList = Array.isArray(selected_services) ? selected_services : [];

    // ── Resolve Hall ──────────────────────────────────────────────────
    let resolvedHallId = parseInt(hall_id) || 1;
    try {
      const [hallCheck] = await pool.execute('SELECT id FROM halls WHERE id = ? LIMIT 1', [resolvedHallId]);
      if (hallCheck.length === 0) {
        const [firstHall] = await pool.execute('SELECT id FROM halls ORDER BY id ASC LIMIT 1');
        if (firstHall.length > 0) {
          resolvedHallId = firstHall[0].id;
        } else {
          const [hallRes] = await pool.execute(
            "INSERT INTO halls (name, city, venue_type, capacity_min, capacity_max, status) VALUES (?, 'Lahore', 'Ballroom', 100, 1000, 'active')",
            ['ShaadiPro Main Hall']
          );
          resolvedHallId = hallRes.insertId;
        }
      }
    } catch (hallErr) {
      console.warn('Hall resolution warning:', hallErr.message);
    }

    // ── Double-Booking Slot Conflict Check ──────────────────────────────
    const [conflictCheck] = await pool.execute(
      "SELECT id FROM bookings WHERE hall_id = ? AND event_date = ? AND status IN ('confirmed', 'tentative') LIMIT 1",
      [resolvedHallId, event_date]
    );
    if (conflictCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Slot conflict: The selected venue is already reserved on ${event_date}. Please select another date.`
      });
    }

    // ── Resolve Customer ──────────────────────────────────────────────
    let customerId = null;
    const isCustomerRole = req.user?.role === 'customer';

    if (isCustomerRole) {
      customerId = req.user.id;
    } else {
      // If admin/owner/manager is creating a booking for a client:
      if (customer_email) {
        const [uRows] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [customer_email]);
        if (uRows.length > 0) customerId = uRows[0].id;
      }
      if (!customerId && customer_phone) {
        const [uRows] = await pool.execute('SELECT id FROM users WHERE phone = ? LIMIT 1', [customer_phone]);
        if (uRows.length > 0) customerId = uRows[0].id;
      }

      // If customer is not found in users table, auto-create a user record
      if (!customerId && (customer_name || customer_email || customer_phone)) {
        try {
          const cName = customer_name || 'Guest Customer';
          const cEmail = customer_email || `customer_${Date.now()}@shaadipro.com`;
          const cPhone = customer_phone || null;
          const bcrypt = require('bcryptjs');
          const guestHash = await bcrypt.hash(`cust_${Date.now()}`, 8);
          const [newUser] = await pool.execute(
            'INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?)',
            [cName, cEmail, cPhone, guestHash, 'active']
          );
          customerId = newUser.insertId;
          try {
            await pool.execute('INSERT INTO user_groups (user_id, group_id) VALUES (?, 5)', [customerId]);
          } catch (_) {}
        } catch (_) {}
      }

      if (!customerId) {
        customerId = req.user?.id || 1;
      }
    }

    // ── Begin Transaction ─────────────────────────────────────────────
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [bRes] = await connection.execute(
      `INSERT INTO bookings
       (customer_id, hall_id, hall_slot_id, event_type, event_date, guest_count_estimated, status, created_by, total_amount, customer_name, customer_phone, customer_email)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        customerId,
        resolvedHallId,
        event_type,
        event_date,
        guests,
        'inquiry',
        req.user?.id || 1,
        customer_name || null,
        customer_phone || null,
        customer_email || null
      ]
    );

    const dbBookingId = bRes.insertId;
    let lineItemSum = 0;

    // ── Insert Service Line Items ─────────────────────────────────────
    for (const srv of servicesList) {
      if (!srv.category_id || !srv.package_id) continue;

      let linePrice = Number(srv.price || 0);
      if (srv.pricing_type === 'per_head') {
        linePrice = Number(srv.price || 0) * guests;
      }

      lineItemSum += linePrice;

      await connection.execute(
        `INSERT INTO booking_services (booking_id, category_id, package_id, price, status) VALUES (?, ?, ?, ?, ?)`,
        [dbBookingId, srv.category_id, srv.package_id, linePrice, 'assigned']
      );
    }

    // ── Calculate Hall Venue Rental Price ──────────────────────────────
    let hallRentalCost = 0;
    try {
      const [hData] = await pool.execute('SELECT price_per_event, price_per_head FROM halls WHERE id = ?', [resolvedHallId]);
      if (hData.length > 0) {
        const pEvt = Number(hData[0].price_per_event || 150000);
        const pHd = Number(hData[0].price_per_head || 1200);
        hallRentalCost = pEvt + (pHd * guests);
      }
    } catch (_) {
      hallRentalCost = 150000 + (1200 * guests);
    }

    const calculatedTotal = req.body.total_amount ? Number(req.body.total_amount) : (hallRentalCost + lineItemSum);

    // ── Update total_amount on bookings row ───────────────────────────
    await connection.execute(
      'UPDATE bookings SET total_amount = ? WHERE id = ?',
      [calculatedTotal, dbBookingId]
    );

    // ── Create Notification ───────────────────────────────────────────
    try {
      const notifTitle = `🎉 New Booking Inquiry #${dbBookingId}`;
      const notifMsg = `Customer ${customer_name || 'Guest'} requested a ${event_type || 'Wedding'} booking for ${guests} guests on ${event_date}.`;
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (NULL, ?, ?, 'booking', '/dashboard/bookings', FALSE)`,
        [notifTitle, notifMsg]
      );
    } catch (notifErr) {
      console.warn('Notification creation warning:', notifErr.message);
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      bookingId: dbBookingId,
      totalAmount: calculatedTotal,
      message: 'Booking inquiry submitted successfully'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Create Booking Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create booking inquiry' });
  }
};

// PUT /api/bookings/:id/status - Update booking status in MySQL with 404 Check
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['inquiry', 'tentative', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const [check] = await pool.execute('SELECT id FROM bookings WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `Booking status updated to '${status}'` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
  }
};
