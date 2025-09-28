const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');
const UserSuspension = require('../models/userSuspension');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract token from Bearer token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User is inactive');
    }

    // Check if user is suspended platform-wide (except for super_admin)
    if (user.role !== 'super_admin') {
      try {
        const isSuspended = await UserSuspension.isUserSuspended(user.user_id);
        if (isSuspended) {
          throw new Error('Your account is suspended');
        }
      } catch (suspensionError) {
        console.error('Error checking suspension:', suspensionError);
        // Continue if we can't check suspension status (e.g., table doesn't exist yet)
      }
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      error: {
        message: 'Please authenticate',
        details: error.message
      }
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: {
        message: 'Access denied. Admin privileges required.'
      }
    });
  }
  next();
};

// Middleware to check if user is farmer
const isFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({
      error: {
        message: 'Access denied. Farmer privileges required.'
      }
    });
  }
  next();
};

// Middleware to check if user has any admin role
const authorizeAdmin = (req, res, next) => {
  const adminRoles = ['admin', 'super_admin', 'content_moderator', 'group_moderator'];
  
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: {
        message: 'Access denied. Admin privileges required.'
      }
    });
  }

  // For group-specific operations, check if user is group_moderator
  if (req.user.role === 'group_moderator') {
    // List of routes that are restricted for group_moderator
    const restrictedRoutes = [
      '/api/admin/users/*/ban', // Can't permanently ban
      '/api/admin/metrics',     // Can't access overall metrics
    ];

    // Check if current path is restricted
    for (const route of restrictedRoutes) {
      const routePattern = new RegExp('^' + route.replace('*', '.*') + '$');
      if (routePattern.test(req.path)) {
        return res.status(403).json({ 
          error: {
            message: 'This action requires higher admin privileges'
          }
        });
      }
    }
  }

  next();
};

module.exports = {
  auth,
  isAdmin,
  isFarmer,
  authorizeAdmin,
  authenticate: auth // Alias for compatibility with the admin routes
};