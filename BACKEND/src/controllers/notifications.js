/**
 * Notification Controllers
 * 
 * Handles API endpoints related to user notifications
 */
const notificationService = require('../services/notifications');
const logger = require('../utils/logger');

/**
 * Get notifications for authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset, unreadOnly } = req.query;
    
    // Parse query parameters
    const options = {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      unreadOnly: unreadOnly === 'true'
    };
    
    const notifications = await notificationService.getUserNotifications(userId, options);
    
    return res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Failed to fetch notifications: ${error.message}`, error);
    return res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    const updatedNotification = await notificationService.markAsRead(notificationId, userId);
    
    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    logger.error(`Failed to mark notification as read: ${error.message}`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Notification not found',
        error: error.message
      });
    }
    
    return res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Create a test notification (for testing only)
 * This endpoint should be disabled in production
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type } = req.body;
    
    let notification;
    
    if (title && message) {
      // Create custom notification if title and message provided
      notification = await notificationService.createNotification(
        userId, 
        title, 
        message, 
        type || 'info',
        { test: true }
      );
    } else {
      // Otherwise send default test notification
      notification = await notificationService.sendTestNotification(userId);
    }
    
    return res.status(201).json({
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    logger.error(`Failed to create test notification: ${error.message}`, error);
    return res.status(500).json({
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};