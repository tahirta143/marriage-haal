const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users - List all user accounts with assigned groups
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             g.id as group_id, g.name as group_name
      FROM users u
      LEFT JOIN user_groups ug ON u.id = ug.user_id
      LEFT JOIN groups g ON ug.group_id = g.id
      ORDER BY u.id ASC
    `);
    return res.status(200).json({ success: true, count: rows.length, users: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users from database', error: error.message });
  }
};

// POST /api/users - Create new user account and assign to group
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, group_id } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, "active")',
      [name, email, phone || '', password_hash]
    );

    const userId = result.insertId;
    const targetGroupId = group_id ? parseInt(group_id) : 5; // Default Customer Group

    await pool.execute('INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)', [userId, targetGroupId]);

    return res.status(201).json({
      success: true,
      userId,
      message: `User '${name}' created successfully and assigned to group #${targetGroupId}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

// PUT /api/users/:id - Edit user profile details and/or change password (RBAC Protected)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, password, group_id } = req.body;

    const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updateFields = [];
    let queryParams = [];

    if (name) { updateFields.push('name = ?'); queryParams.push(name); }
    if (email) { updateFields.push('email = ?'); queryParams.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); queryParams.push(phone); }
    if (status) { updateFields.push('status = ?'); queryParams.push(status); }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      updateFields.push('password_hash = ?');
      queryParams.push(password_hash);
    }

    if (updateFields.length > 0) {
      queryParams.push(id);
      await pool.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, queryParams);
    }

    if (group_id) {
      await pool.execute('DELETE FROM user_groups WHERE user_id = ?', [id]);
      await pool.execute('INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)', [id, group_id]);
    }

    return res.status(200).json({ success: true, message: 'User account details & password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user details', error: error.message });
  }
};

// PUT /api/users/:id/group - Update user group assignment
exports.updateUserGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id } = req.body;

    if (!group_id) {
      return res.status(400).json({ success: false, message: 'Group ID is required' });
    }

    await pool.execute('DELETE FROM user_groups WHERE user_id = ?', [id]);
    await pool.execute('INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)', [id, group_id]);

    return res.status(200).json({ success: true, message: 'User group assignment updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user group', error: error.message });
  }
};
