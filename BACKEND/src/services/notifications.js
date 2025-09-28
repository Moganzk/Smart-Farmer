/**
 * Notification Service
 * 
 * Handles sending notifications to users through different channels:
 * - In-app notifications
 * - SMS notifications (requires integration with SMS provider)
 * - Push notifications (requires mobile app integration)
 */
const logger = require('../utils/logger');
const db = require('../db');

class NotificationService {
  /**
   * Create a new notification for a user
   * 
   * @param {string} userId - User ID to notify
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, warning, error, success)
   * @param {Object} metadata - Additional metadata for the notification
   * @returns {Promise<Object>} - Created notification
   */
  async createNotification(userId, title, message, type = 'info', metadata = {}) {
    try {
      logger.info(`Creating notification for user ${userId}: ${title}`);
      
      const notification = await db.query(
        `INSERT INTO notifications (user_id, title, message, type, metadata, created_at, is_read)
         VALUES ($1, $2, $3, $4, $5, NOW(), false)
         RETURNING id, user_id, title, message, type, metadata, created_at, is_read`,
        [userId, title, message, type, JSON.stringify(metadata)]
      );
      
      return notification.rows[0];
    } catch (error) {
      logger.error(`Failed to create notification: ${error.message}`, error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Get all notifications for a user
   * 
   * @param {string} userId - User ID
   * @param {Object} options - Query options (limit, offset, filter by read status)
   * @returns {Promise<Array>} - User notifications
   */
  async getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    try {
      logger.info(`Fetching notifications for user ${userId}`);
      
      let query = `
        SELECT id, user_id, title, message, type, metadata, created_at, is_read
        FROM notifications
        WHERE user_id = $1
      `;
      
      const queryParams = [userId];
      
      if (unreadOnly) {
        query += ' AND is_read = false';
      }
      
      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      queryParams.push(limit, offset);
      
      const notifications = await db.query(query, queryParams);
      
      return {
        total: await this.countUserNotifications(userId, unreadOnly),
        notifications: notifications.rows
      };
    } catch (error) {
      logger.error(`Failed to fetch notifications: ${error.message}`, error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  /**
   * Count total notifications for a user
   * 
   * @private
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Count only unread notifications
   * @returns {Promise<number>} - Total count
   */
  async countUserNotifications(userId, unreadOnly = false) {
    try {
      let query = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
      const queryParams = [userId];
      
      if (unreadOnly) {
        query += ' AND is_read = false';
      }
      
      const result = await db.query(query, queryParams);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error(`Failed to count notifications: ${error.message}`, error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   * 
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security check)
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      logger.info(`Marking notification ${notificationId} as read for user ${userId}`);
      
      const notification = await db.query(
        `UPDATE notifications
         SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, title, message, type, metadata, created_at, is_read`,
        [notificationId, userId]
      );
      
      if (notification.rows.length === 0) {
        throw new Error('Notification not found or does not belong to user');
      }
      
      return notification.rows[0];
    } catch (error) {
      logger.error(`Failed to mark notification as read: ${error.message}`, error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Send a test notification
   * This is a convenience method for testing
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created notification
   */
  async sendTestNotification(userId) {
    return this.createNotification(
      userId,
      'Test Notification',
      'This is a test notification from Smart Farmer',
      'info',
      { test: true, timestamp: new Date().toISOString() }
    );
  }
}

module.exports = new NotificationService();