 // src/controllers/notifications/notificationController.js
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');

/**
 * Create notification tables if they don't exist
 * NOTE: Table already exists in schema.sql, so this is disabled to prevent startup errors
 */
const initializeNotificationSystem = async () => {
  try {
    // Table already created in schema.sql - skip initialization
    logger.info('Notification system initialized successfully (table exists in schema)');
  } catch (error) {
    logger.error('Error initializing notification system:', error);
  }
};

// Initialize notification tables
initializeNotificationSystem();

/**
 * Create a new notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (data) => {
  const { user_id, notification_type, title, message, related_entity_type, related_entity_id } = data;
  
  try {
    const result = await pool.query(
      `INSERT INTO notifications 
        (user_id, notification_type, title, message, related_entity_type, related_entity_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, notification_type, title, message, related_entity_type, related_entity_id]
    );
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserNotifications = async (req, res) => {
  const userId = req.user.user_id;
  const { limit = 20, offset = 0, unread_only = false } = req.query;
  
  try {
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
      ${unread_only === 'true' ? 'AND is_read = FALSE' : ''}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    
    // Get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1
       ${unread_only === 'true' ? 'AND is_read = FALSE' : ''}`,
      [userId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    
    return responses.success(res, {
      notifications: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return responses.serverError(res, 'Failed to fetch notifications');
  }
};

/**
 * Mark notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markNotificationsAsRead = async (req, res) => {
  const userId = req.user.user_id;
  const { notification_ids } = req.body;
  
  try {
    // If notification_ids is provided, mark specific notifications as read
    // Otherwise, mark all notifications as read
    let query;
    let params;
    
    if (notification_ids && notification_ids.length > 0) {
      query = `
        UPDATE notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND notification_id = ANY($2)
        RETURNING *
      `;
      params = [userId, notification_ids];
    } else {
      query = `
        UPDATE notifications 
        SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = FALSE
        RETURNING *
      `;
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    
    return responses.success(res, {
      message: 'Notifications marked as read',
      updated_count: result.rowCount,
      updated_notifications: result.rows
    });
  } catch (error) {
    logger.error('Error marking notifications as read:', error);
    return responses.serverError(res, 'Failed to mark notifications as read');
  }
};

/**
 * Delete notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotifications = async (req, res) => {
  const userId = req.user.user_id;
  const { notification_ids } = req.body;
  
  try {
    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      return responses.badRequest(res, 'Please provide valid notification IDs');
    }
    
    const result = await pool.query(
      `DELETE FROM notifications 
       WHERE user_id = $1 AND notification_id = ANY($2)
       RETURNING notification_id`,
      [userId, notification_ids]
    );
    
    return responses.success(res, {
      message: 'Notifications deleted successfully',
      deleted_count: result.rowCount,
      deleted_ids: result.rows.map(row => row.notification_id)
    });
  } catch (error) {
    logger.error('Error deleting notifications:', error);
    return responses.serverError(res, 'Failed to delete notifications');
  }
};

/**
 * Get unread notification count for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadCount = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    
    return responses.success(res, {
      unread_count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    logger.error('Error getting unread notification count:', error);
    return responses.serverError(res, 'Failed to get unread notification count');
  }
};

/**
 * Create a test notification (for testing only)
 * This endpoint should be disabled in production
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTestNotification = async (req, res) => {
  const userId = req.user.user_id;
  const { title, message, type } = req.body;
  
  try {
    // Create a test notification with provided details or defaults
    const notification = await createNotification(
      userId,
      type || 'info',
      title || 'Test Notification',
      message || 'This is a test notification from the Smart Farmer system.',
      null,
      null
    );
    
    return responses.success(res, {
      message: 'Test notification created successfully',
      notification
    });
  } catch (error) {
    logger.error('Error creating test notification:', error);
    return responses.serverError(res, 'Failed to create test notification');
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
  getUnreadCount,
  createTestNotification
};