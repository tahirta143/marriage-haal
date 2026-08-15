const pool = require('../config/db');

// GET /api/reports/analytics - Executive Analytics & Backend Chart Metrics
exports.getExecutiveAnalytics = async (req, res) => {
  try {
    let totalRevenue = 0;
    let confirmedCount = 0;
    let pendingReceivables = 0;
    let activeHallsCount = 0;
    let categoryBreakdown = [];
    let monthlyTrends = [];
    let statusDistribution = [];
    let hallPerformance = [];

    try {
      // 1. Executive Total Revenue & Confirmed Bookings Count
      const [bRows] = await pool.execute(`
        SELECT COUNT(*) as count,
               COALESCE(SUM(total_amount), 0) as sum
        FROM bookings
        WHERE status IN ('confirmed', 'completed', 'inquiry', 'tentative')
      `);

      const [hRows] = await pool.execute('SELECT COUNT(*) as count FROM halls WHERE status = "active"');
      const [pRows] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments');

      if (bRows && bRows.length > 0) {
        confirmedCount = Number(bRows[0].count || 0);
        totalRevenue = Number(bRows[0].sum || 0);
        const totalPaid = Number(pRows[0].total_paid || 0);
        pendingReceivables = Math.max(0, totalRevenue - totalPaid);
      }
      if (hRows && hRows.length > 0) {
        activeHallsCount = Number(hRows[0].count || 0);
      }

      // 2. Fetch Monthly Revenue Growth Trends from DB
      const [trendRows] = await pool.execute(`
        SELECT DATE_FORMAT(event_date, '%b %Y') as month,
               COALESCE(SUM(total_amount), 0) as revenue,
               COUNT(id) as bookings
        FROM bookings
        GROUP BY DATE_FORMAT(event_date, '%Y-%m'), DATE_FORMAT(event_date, '%b %Y')
        ORDER BY MIN(event_date) ASC
      `);

      if (trendRows && trendRows.length > 0) {
        monthlyTrends = trendRows.map(r => ({
          month: r.month,
          revenue: Number(r.revenue || 0),
          bookings: Number(r.bookings || 0)
        }));
      } else {
        // Default clean timeline structure if no bookings exist yet
        monthlyTrends = [
          { month: 'May 2026', revenue: 0, bookings: 0 },
          { month: 'Jun 2026', revenue: 0, bookings: 0 },
          { month: 'Jul 2026', revenue: 0, bookings: 0 },
          { month: 'Aug 2026', revenue: 0, bookings: 0 },
          { month: 'Sep 2026', revenue: 0, bookings: 0 },
          { month: 'Oct 2026', revenue: 0, bookings: 0 }
        ];
      }

      // 3. Fetch Status Distribution from DB
      const [statusRows] = await pool.execute(`
        SELECT status, COUNT(*) as count
        FROM bookings
        GROUP BY status
      `);

      const colorMap = {
        confirmed: '#AA336A',
        tentative: '#E6A15C',
        inquiry: '#3B82F6',
        completed: '#10B981',
        cancelled: '#EF4444'
      };

      if (statusRows && statusRows.length > 0) {
        statusDistribution = statusRows.map(r => ({
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          count: Number(r.count),
          color: colorMap[r.status] || '#AA336A'
        }));
      }

      // 4. Fetch Category Revenue Breakdown from DB
      const [catSales] = await pool.execute(`
        SELECT c.name as category_name, COALESCE(SUM(bs.price), 0) as total_sales
        FROM categories c
        LEFT JOIN booking_services bs ON bs.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY total_sales DESC
      `);

      if (catSales && catSales.length > 0) {
        const grandCatTotal = catSales.reduce((acc, curr) => acc + Number(curr.total_sales), 0);
        categoryBreakdown = catSales.map(c => ({
          category_name: c.category_name,
          total_sales: Number(c.total_sales),
          percentage: grandCatTotal > 0 ? Math.round((Number(c.total_sales) / grandCatTotal) * 100 * 10) / 10 : 0
        }));
      }

      // 5. Fetch Hall Performance & Revenue Comparison from DB
      const [hallPerfRows] = await pool.execute(`
        SELECT h.name as hall_name,
               COUNT(b.id) as bookings,
               COALESCE(SUM(b.total_amount), 0) as revenue
        FROM halls h
        LEFT JOIN bookings b ON b.hall_id = h.id
        GROUP BY h.id, h.name
      `);

      if (hallPerfRows && hallPerfRows.length > 0) {
        hallPerformance = hallPerfRows.map(r => ({
          hall_name: r.hall_name,
          bookings: Number(r.bookings),
          revenue: Number(r.revenue)
        }));
      }

    } catch (dbErr) {
      console.warn('DB Analytics Query warning:', dbErr.message);
    }

    const summary = {
      total_revenue: totalRevenue,
      confirmed_bookings: confirmedCount,
      pending_receivables: pendingReceivables,
      active_halls: activeHallsCount,
      category_breakdown: categoryBreakdown,
      monthly_trends: monthlyTrends,
      status_distribution: statusDistribution,
      hall_performance: hallPerformance
    };

    return res.status(200).json({ success: true, analytics: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch executive analytics', error: error.message });
  }
};

// GET /api/reports/calendar - Monthly Hall Slot Availability Grid
exports.getCalendarEvents = async (req, res) => {
  try {
    const { month, hall_id } = req.query;
    const targetMonth = month || '2026-10';

    let query = `
      SELECT b.id as booking_id, DATE_FORMAT(b.event_date, '%Y-%m-%d') as date, b.hall_id, b.slot, b.status, b.event_type,
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
    return res.status(500).json({ success: false, message: 'Failed to fetch calendar slot grid', error: error.message });
  }
};
