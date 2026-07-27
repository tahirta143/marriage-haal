const pool = require('../config/db');

// In-memory RBAC Store Fallback (if DB is offline)
let mockPermissions = [
  { id: 1, name: 'report.view', module: 'report', description: 'View executive analytics & revenue reports' },
  { id: 2, name: 'hall.manage', module: 'hall', description: 'Create, edit, and manage hall slots' },
  { id: 3, name: 'category.manage', module: 'category', description: 'Manage service categories and package pricing' },
  { id: 4, name: 'vendor.manage', module: 'vendor', description: 'Approve and manage partner vendors' },
  { id: 5, name: 'staff.manage', module: 'staff', description: 'Manage in-house staff members' },
  { id: 6, name: 'booking.view', module: 'booking', description: 'View event bookings' },
  { id: 7, name: 'booking.create', module: 'booking', description: 'Create new hall reservation inquiries' },
  { id: 8, name: 'booking.edit', module: 'booking', description: 'Update booking details and status' },
  { id: 9, name: 'booking.delete', module: 'booking', description: 'Cancel or delete bookings' },
  { id: 10, name: 'payment.view', module: 'payment', description: 'View payment records and ledger' },
  { id: 11, name: 'payment.create', module: 'payment', description: 'Record token, installment, and final payments' },
  { id: 12, name: 'staff.view_own_jobs', module: 'staff', description: 'View assigned in-house tasks' },
  { id: 13, name: 'vendor.view_own', module: 'vendor', description: 'View assigned vendor job line-items & commissions' },
  { id: 14, name: 'rbac.manage', module: 'rbac', description: 'Manage security groups and user permissions' },
];

let mockGroups = [
  { id: 1, name: 'Owner', description: 'Full system control & executive reports', permissions: [1,2,3,4,5,6,7,8,9,10,11,12,13,14] },
  { id: 2, name: 'Booking Manager', description: 'Manages bookings, halls, and customer payments', permissions: [2,6,7,8,10,11] },
  { id: 3, name: 'Staff', description: 'In-house execution staff', permissions: [12] },
  { id: 4, name: 'Vendor', description: 'External partnered service providers', permissions: [13] },
  { id: 5, name: 'Customer', description: 'Client portal for event inquiries', permissions: [6,7] },
];

// Get all system permissions
exports.getAllPermissions = async (req, res) => {
  try {
    try {
      const [rows] = await pool.execute('SELECT * FROM permissions ORDER BY module, id');
      if (rows.length > 0) return res.status(200).json({ success: true, permissions: rows });
    } catch (err) {}

    return res.status(200).json({ success: true, permissions: mockPermissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
  }
};

// Get all security groups with their permission IDs
exports.getAllGroups = async (req, res) => {
  try {
    try {
      const [groups] = await pool.execute('SELECT * FROM groups ORDER BY id');
      const [groupPerms] = await pool.execute('SELECT group_id, permission_id FROM group_permissions');

      const enrichedGroups = groups.map(g => ({
        ...g,
        permissions: groupPerms.filter(gp => gp.group_id === g.id).map(gp => gp.permission_id)
      }));

      return res.status(200).json({ success: true, groups: enrichedGroups });
    } catch (err) {}

    return res.status(200).json({ success: true, groups: mockGroups });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
};

// Create a new security group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });

    try {
      const [result] = await pool.execute(
        'INSERT INTO groups (name, description) VALUES (?, ?)',
        [name, description || '']
      );
      const groupId = result.insertId;

      if (permissionIds && permissionIds.length > 0) {
        for (const pId of permissionIds) {
          await pool.execute(
            'INSERT INTO group_permissions (group_id, permission_id) VALUES (?, ?)',
            [groupId, pId]
          );
        }
      }

      return res.status(201).json({ success: true, groupId, message: 'Group created successfully' });
    } catch (err) {
      const newGroup = {
        id: mockGroups.length + 1,
        name,
        description: description || '',
        permissions: permissionIds || []
      };
      mockGroups.push(newGroup);
      return res.status(201).json({ success: true, group: newGroup, message: 'Group created (Demo Mode)' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create group' });
  }
};

// Update a group's permission assignments
exports.updateGroupPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body; // array of permission IDs

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ success: false, message: 'permissionIds must be an array' });
    }

    try {
      await pool.execute('DELETE FROM group_permissions WHERE group_id = ?', [id]);
      for (const pId of permissionIds) {
        await pool.execute('INSERT INTO group_permissions (group_id, permission_id) VALUES (?, ?)', [id, pId]);
      }
      return res.status(200).json({ success: true, message: 'Group permissions updated successfully' });
    } catch (err) {
      const g = mockGroups.find(group => group.id == id);
      if (g) {
        g.permissions = permissionIds;
      }
      return res.status(200).json({ success: true, message: 'Group permissions updated (Demo Mode)' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update group permissions' });
  }
};
