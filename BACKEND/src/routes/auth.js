const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth/auth.controller');
const { validateRegistration, validateLogin, validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: {
      message: 'Too many requests, please try again later.'
    }
  }
});

// Routes
router.post('/register', authLimiter, validateRegistration, validate, AuthController.register);
router.post('/login', authLimiter, validateLogin, validate, AuthController.login);
router.get('/verify', auth, AuthController.verifyToken);

module.exports = router;