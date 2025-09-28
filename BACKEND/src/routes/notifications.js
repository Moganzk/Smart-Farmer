// src/routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications/notificationController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body, param } = require('express-validator');

// Apply authentication middleware to all notification routes
router.use(auth);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count for the authenticated user
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/read
 * @desc    Mark notifications as read
 * @access  Private
 */
router.put('/read', 
  validate([
    body('notification_ids')
      .optional()
      .isArray()
      .withMessage('notification_ids must be an array of notification IDs')
  ]),
  notificationController.markNotificationsAsRead
);

/**
 * @route   DELETE /api/notifications
 * @desc    Delete notifications
 * @access  Private
 */
router.delete('/', 
  validate([
    body('notification_ids')
      .isArray()
      .withMessage('notification_ids must be an array of notification IDs')
      .notEmpty()
      .withMessage('notification_ids cannot be empty')
  ]),
  notificationController.deleteNotifications
);

/**
 * @route   POST /api/notifications/test
 * @desc    Create a test notification (for testing only)
 * @access  Private
 * @note    This endpoint should be disabled in production
 */
router.post('/test', 
  validate([
    body('title').optional().isString().trim(),
    body('message').optional().isString().trim(),
    body('type').optional().isString().isIn(['info', 'warning', 'error', 'success'])
  ]),
  notificationController.createTestNotification
);

module.exports = router;