const pool = require('../config/db');

// GET /api/reports/analytics - Executive Analytics & Category Sales Breakdown from MySQL
exports.getExecutiveAnalytics = async (req, res) => {
  try {
    const [bRows] = await pool.execute('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as sum FROM bookings WHERE status IN ("confirmed","completed")');
    const [hRows] = await pool.execute('SELECT COUNT(*) as count FROM halls WHERE status = "active"');
    const [pRows] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments');

    const totalRevenue = Number(bRows[0].sum || 0);
    const totalPaid = Number(pRows[0].total_paid || 0);
    const pendingReceivables = Math.max(0, totalRevenue - totalPaid);

    // Category Sales Breakdown
    const [catSales] = await pool.execute(`
      SELECT c.name as category_name, COALESCE(SUM(bs.price), 0) as total_sales
      FROM categories c
      LEFT JOIN booking_services bs ON bs.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `);

    const grandCatTotal = catSales.reduce((acc, curr) => acc + Number(curr.total_sales), 0) || 1;
    const categoryBreakdown = catSales.map(c => ({
      category_name: c.category_name,
      total_sales: Number(c.total_sales),
      percentage: Math.round((Number(c.total_sales) / grandCatTotal) * 100 * 10) / 10
    }));

    const summary = {
      total_revenue: totalRevenue,
      confirmed_bookings: Number(bRows[0].count || 0),
      pending_receivables: pendingReceivables,
      active_halls: Number(hRows[0].count || 0),
      category_breakdown: categoryBreakdown,
      monthly_trends: [
        { month: 'Jul 2026', revenue: totalRevenue, bookings: Number(bRows[0].count || 0) }
      ]
    };

    return res.status(200).json({ success: true, analytics: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch executive analytics from database', error: error.message });
  }
};

// GET /api/reports/calendar - Monthly Hall Slot Availability Grid from MySQL
exports.getCalendarEvents = async (req, res) => {
  try {
    const { month, hall_id } = req.query;
    const targetMonth = month || '2026-10';

    let query = `
      SELECT b.id as booking_id, b.event_date as date, b.hall_id, b.slot, b.status, b.event_type,
             u.name as customer_name, h.name as hall_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN halls h ON b.hall_id = h.id
      WHERE DATE_FORMAT(b.event_date, '%Y-%m') = ?
    `;
    const params = [targetMonth];

    if (hall_id && hall_id !== 'all') {
      query += ' AND b.hall_id = ?';
      params.push(hall_id);
    }

    query += ' ORDER BY b.event_date ASC';

    const [rows] = await pool.execute(query, params);
    return res.status(200).json({ success: true, month: targetMonth, slots: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch calendar slot grid from database', error: error.message });
  }
};
