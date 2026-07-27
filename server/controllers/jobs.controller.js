const pool = require('../config/db');

// GET /api/jobs/my-jobs - Get tasks assigned to current logged-in user from MySQL
exports.getMyJobs = async (req, res) => {
  try {
    const userRole = req.user?.role;

    let query = `
      SELECT bs.*, b.event_type, b.event_date, b.guest_count_estimated as guest_count,
             u.name as customer_name, u.phone as customer_phone, h.name as hall_name,
             c.name as category_name, cp.name as package_name
      FROM booking_services bs
      JOIN bookings b ON bs.booking_id = b.id
      JOIN users u ON b.customer_id = u.id
      JOIN halls h ON b.hall_id = h.id
      JOIN categories c ON bs.category_id = c.id
      JOIN category_packages cp ON bs.package_id = cp.id
      WHERE 1=1
    `;

    if (userRole === 'vendor') {
      query += ' AND bs.vendor_id IS NOT NULL';
    } else if (userRole === 'staff') {
      query += ' AND bs.staff_id IS NOT NULL';
    }

    query += ' ORDER BY b.event_date ASC';

    const [rows] = await pool.execute(query);
    return res.status(200).json({ success: true, count: rows.length, tasks: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch task assignments from database', error: error.message });
  }
};

// PUT /api/jobs/:serviceId/status - Update task status in MySQL
exports.updateTaskStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    const validStatuses = ['assigned', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    await pool.execute('UPDATE booking_services SET status = ? WHERE id = ?', [status, serviceId]);
    return res.status(200).json({ success: true, message: `Task status updated to '${status}'` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task status in database', error: error.message });
  }
};

// PUT /api/jobs/:serviceId/assign - Assign vendor/staff to line item in MySQL
exports.assignTask = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { vendor_id, staff_id } = req.body;

    if (vendor_id) {
      await pool.execute('UPDATE booking_services SET vendor_id = ?, staff_id = NULL WHERE id = ?', [vendor_id, serviceId]);
    } else if (staff_id) {
      await pool.execute('UPDATE booking_services SET staff_id = ?, vendor_id = NULL WHERE id = ?', [staff_id, serviceId]);
    }
    return res.status(200).json({ success: true, message: 'Line item assigned successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to assign line item in database', error: error.message });
  }
};
