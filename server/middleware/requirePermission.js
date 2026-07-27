/**
 * Express Middleware: requirePermission
 * Validates if the authenticated user possesses a specific atomic permission
 */
const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required.' });
    }

    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes(permissionName)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission '${permissionName}'`,
        requiredPermission: permissionName
      });
    }

    next();
  };
};

module.exports = requirePermission;
