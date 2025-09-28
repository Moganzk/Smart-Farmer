const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const config = require('../../config/config');
const logger = require('../../utils/logger');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, role, fullName, phoneNumber, location, preferredLanguage } = req.body;

      // Validate role
      if (!['farmer', 'admin'].includes(role)) {
        return res.status(400).json({
          error: {
            message: 'Invalid role specified'
          }
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        role,
        fullName,
        phoneNumber,
        location,
        preferredLanguage: preferredLanguage || 'en',
        is_active: true // Set user as active by default
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.user_id },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      res.status(201).json({
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error creating user'
        }
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check login attempts
      const loginStatus = await User.checkLoginAttempts(email);
      if (loginStatus && loginStatus.locked) {
        return res.status(429).json({
          error: {
            message: 'Account temporarily locked. Please try again later.'
          }
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid login credentials'
          }
        });
      }

      // Verify password
      const isValidPassword = await User.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        // Increment failed attempts
        await User.updateLoginAttempts(user.user_id, (loginStatus?.attempts || 0) + 1);
        
        return res.status(401).json({
          error: {
            message: 'Invalid login credentials'
          }
        });
      }

      // Reset login attempts on successful login
      await User.updateLoginAttempts(user.user_id, 0);

      // Generate token
      const token = jwt.sign(
        { userId: user.user_id },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      // Remove sensitive data
      delete user.password_hash;
      delete user.failed_login_attempts;
      delete user.last_login_attempt;

      res.json({
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        error: {
          message: 'Error during login'
        }
      });
    }
  }

  static async verifyToken(req, res) {
    try {
      // User is already attached to req by auth middleware
      res.json({
        message: 'Token is valid',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(500).json({
        error: {
          message: 'Error verifying token'
        }
      });
    }
  }
}

module.exports = AuthController;