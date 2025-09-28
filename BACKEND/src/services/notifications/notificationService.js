// src/services/notifications/notificationService.js
const notificationController = require('../../controllers/notifications/notificationController');
const logger = require('../../utils/logger');

/**
 * Service for sending different types of notifications
 */
class NotificationService {
  /**
   * Send a notification about report resolution
   * @param {number} userId - User ID to notify
   * @param {string} reportType - Type of report
   * @param {number} reportId - ID of the report
   * @param {string} action - Action taken (approved, rejected, warning)
   * @returns {Promise<Object>} - Created notification
   */
  static async sendReportResolutionNotification(userId, reportType, reportId, action) {
    try {
      const title = `Report ${action}`;
      let message;
      
      switch (action) {
        case 'approved':
          message = `Your ${reportType} report has been reviewed and approved. Thank you for helping keep our community safe.`;
          break;
        case 'rejected':
          message = `Your ${reportType} report has been reviewed and no action was taken. Please see our community guidelines for more information.`;
          break;
        case 'warning':
          message = `Your ${reportType} report has been reviewed and a warning has been issued to the user.`;
          break;
        default:
          message = `Your ${reportType} report has been reviewed.`;
      }
      
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'report_resolution',
        title,
        message,
        related_entity_type: 'report',
        related_entity_id: reportId
      });
    } catch (error) {
      logger.error('Error sending report resolution notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a warning notification to a user
   * @param {number} userId - User ID to notify
   * @param {string} reason - Reason for the warning
   * @param {string} contentType - Type of content (message, post, etc)
   * @param {number} contentId - ID of the content
   * @returns {Promise<Object>} - Created notification
   */
  static async sendWarningNotification(userId, reason, contentType, contentId) {
    try {
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'warning',
        title: 'Community Guidelines Warning',
        message: `You have received a warning regarding your ${contentType}: ${reason}. Please review our community guidelines.`,
        related_entity_type: contentType,
        related_entity_id: contentId
      });
    } catch (error) {
      logger.error('Error sending warning notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a suspension notification to a user
   * @param {number} userId - User ID to notify
   * @param {string} reason - Reason for the suspension
   * @param {Date} endDate - End date of suspension
   * @returns {Promise<Object>} - Created notification
   */
  static async sendSuspensionNotification(userId, reason, endDate) {
    try {
      const endDateStr = endDate ? new Date(endDate).toLocaleDateString() : 'indefinitely';
      
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'suspension',
        title: 'Account Suspended',
        message: `Your account has been suspended until ${endDateStr} for the following reason: ${reason}. You can appeal this decision by contacting support.`,
        related_entity_type: 'user',
        related_entity_id: userId
      });
    } catch (error) {
      logger.error('Error sending suspension notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a suspension lifted notification to a user
   * @param {number} userId - User ID to notify
   * @returns {Promise<Object>} - Created notification
   */
  static async sendSuspensionLiftedNotification(userId) {
    try {
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'suspension_lifted',
        title: 'Account Suspension Lifted',
        message: 'Your account suspension has been lifted. You can now use all features of the platform. Please continue to follow our community guidelines.',
        related_entity_type: 'user',
        related_entity_id: userId
      });
    } catch (error) {
      logger.error('Error sending suspension lifted notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a new message notification
   * @param {number} userId - User ID to notify
   * @param {number} senderId - ID of the message sender
   * @param {string} senderName - Name of the message sender
   * @param {number} groupId - ID of the group (if group message)
   * @param {string} groupName - Name of the group (if group message)
   * @param {number} messageId - ID of the message
   * @returns {Promise<Object>} - Created notification
   */
  static async sendNewMessageNotification(userId, senderId, senderName, groupId, groupName, messageId) {
    try {
      let title, message, entityType, entityId;
      
      if (groupId) {
        title = `New message in ${groupName}`;
        message = `${senderName} has sent a new message in ${groupName}.`;
        entityType = 'group';
        entityId = groupId;
      } else {
        title = `New message from ${senderName}`;
        message = `You have received a new direct message from ${senderName}.`;
        entityType = 'user';
        entityId = senderId;
      }
      
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'new_message',
        title,
        message,
        related_entity_type: entityType,
        related_entity_id: entityId
      });
    } catch (error) {
      logger.error('Error sending new message notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a disease detection result notification
   * @param {number} userId - User ID to notify
   * @param {string} crop - Crop name
   * @param {string} disease - Disease name
   * @param {number} detectionId - ID of the detection
   * @returns {Promise<Object>} - Created notification
   */
  static async sendDetectionResultNotification(userId, crop, disease, detectionId) {
    try {
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'detection_result',
        title: 'Disease Detection Result',
        message: `Your ${crop} analysis is complete. ${disease ? `We've detected: ${disease}.` : 'No diseases were detected.'}`,
        related_entity_type: 'detection',
        related_entity_id: detectionId
      });
    } catch (error) {
      logger.error('Error sending detection result notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a system update notification to multiple users
   * @param {Array<number>} userIds - Array of user IDs to notify
   * @param {string} title - Title of the update
   * @param {string} message - Update message
   * @returns {Promise<Array<Object>>} - Array of created notifications
   */
  static async sendSystemUpdateNotification(userIds, title, message) {
    try {
      const promises = userIds.map(userId => 
        notificationController.createNotification({
          user_id: userId,
          notification_type: 'system_update',
          title,
          message,
          related_entity_type: 'system',
          related_entity_id: null
        })
      );
      
      return await Promise.all(promises);
    } catch (error) {
      logger.error('Error sending system update notifications:', error);
      throw error;
    }
  }
  
  /**
   * Send a group invitation notification
   * @param {number} userId - User ID to notify
   * @param {number} groupId - ID of the group
   * @param {string} groupName - Name of the group
   * @param {number} inviterId - ID of the inviter
   * @param {string} inviterName - Name of the inviter
   * @returns {Promise<Object>} - Created notification
   */
  static async sendGroupInvitationNotification(userId, groupId, groupName, inviterId, inviterName) {
    try {
      return await notificationController.createNotification({
        user_id: userId,
        notification_type: 'group_invitation',
        title: `Invitation to join ${groupName}`,
        message: `${inviterName} has invited you to join the group ${groupName}.`,
        related_entity_type: 'group',
        related_entity_id: groupId
      });
    } catch (error) {
      logger.error('Error sending group invitation notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;