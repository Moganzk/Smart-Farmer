/**
 * Role Check Middleware
 * 
 * Middleware for verifying user roles and permissions
 */

/**
 * Check if the user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * Check if the user is a farmer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isFarmer = (req, res, next) => {
  if (!req.user || req.user.role !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Farmer role required.'
    });
  }
  next();
};

/**
 * Check if the user is either an admin or a farmer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdminOrFarmer = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'farmer')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Valid user role required.'
    });
  }
  next();
};

/**
 * Check if the user is the owner of the requested resource or an admin
 * @param {Function} getResourceOwnerId - Function that returns the owner ID of the requested resource
 * @returns {Function} Middleware function
 */
const isResourceOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Authentication required.'
        });
      }
      
      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get the owner ID of the requested resource
      const ownerId = await getResourceOwnerId(req);
      
      // Check if the user is the owner
      if (req.user.id !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error in isResourceOwnerOrAdmin middleware:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while checking resource ownership.'
      });
    }
  };
};

module.exports = {
  isAdmin,
  isFarmer,
  isAdminOrFarmer,
  isResourceOwnerOrAdmin
};