// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const profileRoutes = require('./farmer/profile');
const settingsRoutes = require('./farmer/settings');
const notificationRoutes = require('./notifications');
const adminRoutes = require('./admin');
const analyticsRoutes = require('./analytics');

// Apply routes
router.use('/api/auth', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/settings', settingsRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/analytics', analyticsRoutes);

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

module.exports = router;