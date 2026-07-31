const pool = require('../config/db');

// Ensure notifications table exists
const ensureNotificationTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'booking',
        link VARCHAR(255) DEFAULT '/dashboard/bookings',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('Notifications table creation warning:', err.message);
  }
};

ensureNotificationTable();

// GET /api/notifications - Fetch latest notifications
exports.getNotifications = async (req, res) => {
  try {
    await ensureNotificationTable();
    const [rows] = await pool.execute('SELECT * FROM notifications ORDER BY id DESC LIMIT 20');
    return res.status(200).json({ success: true, count: rows.length, notifications: rows });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

// POST /api/notifications - Helper endpoint to create notification
exports.createNotification = async (req, res) => {
  try {
    await ensureNotificationTable();
    const { title, message, type, link, user_id } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, FALSE)',
      [user_id || null, title, message, type || 'booking', link || '/dashboard/bookings']
    );

    return res.status(201).json({ success: true, notificationId: result.insertId, message: 'Notification created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message });
  }
};

// PUT /api/notifications/read-all - Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await ensureNotificationTable();
    await pool.execute('UPDATE notifications SET is_read = TRUE');
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read', error: error.message });
  }
};
