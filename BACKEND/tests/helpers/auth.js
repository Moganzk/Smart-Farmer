const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for testing
 * @param {Object} user - User object to include in token
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      user_id: user.user_id, 
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken
};