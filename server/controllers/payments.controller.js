const pool = require('../config/db');

// GET /api/payments - List all ledger transactions from MySQL
exports.getAllPayments = async (req, res) => {
  try {
    const { booking_id, method, type } = req.query;

    let query = `
      SELECT p.*, b.customer_id, u.name as customer_name, h.name as hall_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.customer_id = u.id
      JOIN halls h ON b.hall_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (booking_id) {
      query += ' AND p.booking_id = ?';
      params.push(booking_id);
    }
    if (method && method !== 'all') {
      query += ' AND p.method = ?';
      params.push(method);
    }
    if (type && type !== 'all') {
      query += ' AND p.type = ?';
      params.push(type);
    }
    query += ' ORDER BY p.id DESC';

    const [rows] = await pool.execute(query, params);
    return res.status(200).json({ success: true, count: rows.length, payments: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments ledger from database', error: error.message });
  }
};

// GET /api/payments/booking/:bookingId - Payment history & accurate balance calculation
exports.getPaymentsByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [pRows] = await pool.execute('SELECT * FROM payments WHERE booking_id = ? ORDER BY id ASC', [bookingId]);
    const [bRows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    if (bRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let bookingTotal = Number(bRows[0].total_amount || 0);

    // Fallback calculation from service line items if total_amount was NULL
    if (bookingTotal === 0) {
      const [sRows] = await pool.execute('SELECT price FROM booking_services WHERE booking_id = ?', [bookingId]);
      bookingTotal = sRows.reduce((sum, s) => sum + Number(s.price || 0), 0);
      if (bookingTotal > 0) {
        await pool.execute('UPDATE bookings SET total_amount = ? WHERE id = ?', [bookingTotal, bookingId]);
      }
    }

    const totalPaid = pRows.reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBalance = Math.max(0, bookingTotal - totalPaid);

    return res.status(200).json({
      success: true,
      booking_id: parseInt(bookingId),
      bookingTotal,
      totalPaid,
      remainingBalance,
      payments: pRows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch booking payment balance', error: error.message });
  }
};

// POST /api/payments - Record new payment in MySQL with 404 Check & Validation
exports.recordPayment = async (req, res) => {
  try {
    const { booking_id, amount, type, method } = req.body;

    if (!booking_id || !amount || !type || !method) {
      return res.status(400).json({ success: false, message: 'Booking ID, amount, payment type, and method are required' });
    }

    const validTypes = ['token', 'installment', 'final'];
    const validMethods = ['cash', 'jazzcash', 'easypaisa', 'bank_transfer'];

    if (!validTypes.includes(type) || !validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid payment type or method' });
    }

    const [bCheck] = await pool.execute('SELECT id FROM bookings WHERE id = ?', [booking_id]);
    if (bCheck.length === 0) {
      return res.status(404).json({ success: false, message: `Booking #${booking_id} not found` });
    }

    const payAmount = parseFloat(amount);

    const [result] = await pool.execute(
      'INSERT INTO payments (booking_id, amount, type, method) VALUES (?, ?, ?, ?)',
      [booking_id, payAmount, type, method]
    );

    // Auto update booking status
    if (type === 'token') {
      await pool.execute('UPDATE bookings SET status = "tentative" WHERE id = ? AND status = "inquiry"', [booking_id]);
    } else if (type === 'installment' || type === 'final') {
      await pool.execute('UPDATE bookings SET status = "confirmed" WHERE id = ?', [booking_id]);
    }

    return res.status(201).json({
      success: true,
      paymentId: result.insertId,
      message: `Payment of PKR ${payAmount.toLocaleString()} recorded successfully`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record payment in database', error: error.message });
  }
};
