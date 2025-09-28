/**
 * Main API routes configuration
 * Integrates all API routes into a single router
 */

const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user');
const authRoutes = require('./auth');
const messageRoutes = require('./message');
const groupRoutes = require('./group');
const messageQueueRoutes = require('./messageQueue');

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/groups', groupRoutes);
router.use('/message-queue', messageQueueRoutes);

module.exports = router;