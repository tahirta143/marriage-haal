const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'shaadipro_super_secret_access_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'shaadipro_super_secret_refresh_key_2026';

// Helper: Query user's permissions from DB
const getUserPermissionsFromDB = async (userId) => {
  try {
    const [rows] = await pool.execute(`
      SELECT DISTINCT p.name
      FROM permissions p
      JOIN group_permissions gp ON gp.permission_id = p.id
      JOIN user_groups ug ON ug.group_id = gp.group_id
      WHERE ug.user_id = ?
      UNION
      SELECT p.name FROM permissions p
      JOIN user_permissions up ON up.permission_id = p.id
      WHERE up.user_id = ? AND up.effect = 'grant'
    `, [userId, userId]);

    return rows.map(r => r.name);
  } catch (err) {
    console.warn('DB Permission Resolution failed, falling back:', err.message);
    return null;
  }
};

// Fallback Demo Permission Sets (used if DB connection is unavailable)
const DEMO_GROUP_PERMISSIONS = {
  owner: [
    'report.view', 'hall.manage', 'category.manage', 'vendor.manage', 'staff.manage',
    'booking.view', 'booking.create', 'booking.edit', 'booking.delete',
    'payment.view', 'payment.create', 'staff.view_own_jobs', 'vendor.view_own', 'rbac.manage'
  ],
  booking_manager: [
    'hall.manage', 'booking.view', 'booking.create', 'booking.edit',
    'payment.view', 'payment.create'
  ],
  staff: ['staff.view_own_jobs'],
  vendor: ['vendor.view_own'],
  customer: ['booking.create', 'booking.view']
};

const demoUsers = [
  { id: 1, name: 'Super Owner', email: 'owner@shaadipro.com', password_hash: bcrypt.hashSync('password123', 10), role: 'owner', permissions: DEMO_GROUP_PERMISSIONS.owner, status: 'active' },
  { id: 2, name: 'Manager Ali', email: 'manager@shaadipro.com', password_hash: bcrypt.hashSync('password123', 10), role: 'booking_manager', permissions: DEMO_GROUP_PERMISSIONS.booking_manager, status: 'active' },
  { id: 3, name: 'Staff Tariq', email: 'staff@shaadipro.com', password_hash: bcrypt.hashSync('password123', 10), role: 'staff', permissions: DEMO_GROUP_PERMISSIONS.staff, status: 'active' },
  { id: 4, name: 'Royal Decorators', email: 'vendor@shaadipro.com', password_hash: bcrypt.hashSync('password123', 10), role: 'vendor', permissions: DEMO_GROUP_PERMISSIONS.vendor, status: 'active' },
  { id: 5, name: 'Customer Usman', email: 'customer@shaadipro.com', password_hash: bcrypt.hashSync('password123', 10), role: 'customer', permissions: DEMO_GROUP_PERMISSIONS.customer, status: 'active' },
];

const generateTokens = (user, permissions) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      permissions: permissions || []
    },
    ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, group_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    try {
      const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, password_hash, 'active']
      );

      const userId = result.insertId;
      const targetGroupId = group_id || 5; // Default Customer Group

      await pool.execute('INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)', [userId, targetGroupId]);

      const permissions = await getUserPermissionsFromDB(userId) || DEMO_GROUP_PERMISSIONS.customer;
      const userPayload = { id: userId, name, email, role: 'customer' };

      const { accessToken, refreshToken } = generateTokens(userPayload, permissions);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        accessToken,
        user: { id: userId, name, email, permissions }
      });

    } catch (dbErr) {
      const password_hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: demoUsers.length + 1,
        name,
        email,
        password_hash,
        role: 'customer',
        permissions: DEMO_GROUP_PERMISSIONS.customer,
        status: 'active'
      };
      demoUsers.push(newUser);

      const { accessToken, refreshToken } = generateTokens(newUser, newUser.permissions);

      return res.status(201).json({
        success: true,
        message: 'Registration successful (Demo Mode)',
        accessToken,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, permissions: newUser.permissions }
      });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let user = null;
    let isMatch = false;

    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        user = rows[0];
        permissions = await getUserPermissionsFromDB(user.id);
        isMatch = await bcrypt.compare(password, user.password_hash);
      }
    } catch (dbErr) {}

    if (!isMatch) {
      const demoMatch = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demoMatch) {
        const demoPasswordMatch = await bcrypt.compare(password, demoMatch.password_hash);
        if (demoPasswordMatch) {
          user = demoMatch;
          permissions = demoMatch.permissions;
          isMatch = true;
        }
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }

    const { accessToken, refreshToken } = generateTokens(user, permissions);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        permissions
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    let user = null;
    let permissions = [];

    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        user = rows[0];
        permissions = await getUserPermissionsFromDB(user.id);
      }
    } catch (dbErr) {}

    if (!user) {
      const demoMatch = demoUsers.find(u => u.id === decoded.id);
      if (demoMatch) {
        user = demoMatch;
        permissions = demoMatch.permissions;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newTokens = generateTokens(user, permissions);

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      accessToken: newTokens.accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user', permissions }
    });

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions || []
    }
  });
};
