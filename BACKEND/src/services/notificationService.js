// src/services/notificationService.js
const { createNotification } = require('../controllers/notifications/notificationController');
const logger = require('../utils/logger');

/**
 * Notification types
 */
const NotificationType = {
  REPORT_RESOLUTION: 'report_resolution',
  ADMIN_WARNING: 'admin_warning',
  SUSPENSION: 'suspension',
  GROUP_INVITATION: 'group_invitation',
  GROUP_JOIN_REQUEST: 'group_join_request',
  GROUP_ACTIVITY: 'group_activity',
  DETECTION_COMPLETE: 'detection_complete',
  ADVISORY_UPDATE: 'advisory_update',
  MESSAGE_MENTION: 'message_mention',
  NEW_REPLY: 'new_reply',
  ACCOUNT_SECURITY: 'account_security',
  SYSTEM_NOTIFICATION: 'system_notification'
};

/**
 * Send a notification
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} relatedEntityType - Related entity type (e.g., 'group', 'message', 'user')
 * @param {number} relatedEntityId - Related entity ID
 * @returns {Promise<Object>} Created notification
 */
const sendNotification = async (userId, type, title, message, relatedEntityType = null, relatedEntityId = null) => {
  try {
    return await createNotification({
      user_id: userId,
      notification_type: type,
      title,
      message,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send a notification when a report is resolved
 * @param {number} userId - User ID of the reporter
 * @param {number} reportId - Report ID
 * @param {string} resolution - Resolution status
 */
const sendReportResolutionNotification = async (userId, reportId, resolution) => {
  const title = 'Report Resolution';
  const message = `Your report has been reviewed and marked as ${resolution}.`;
  
  try {
    return await sendNotification(
      userId,
      NotificationType.REPORT_RESOLUTION,
      title,
      message,
      'report',
      reportId
    );
  } catch (error) {
    logger.error('Error sending report resolution notification:', error);
    throw error;
  }
};

/**
 * Send an admin warning notification
 * @param {number} userId - User ID
 * @param {string} warning - Warning message
 * @param {number} groupId - Optional group ID if warning is related to a group
 */
const sendAdminWarningNotification = async (userId, warning, groupId = null) => {
  const title = 'Warning from Administrator';
  
  try {
    return await sendNotification(
      userId,
      NotificationType.ADMIN_WARNING,
      title,
      warning,
      groupId ? 'group' : null,
      groupId
    );
  } catch (error) {
    logger.error('Error sending admin warning notification:', error);
    throw error;
  }
};

/**
 * Send a suspension notification
 * @param {number} userId - User ID
 * @param {string} reason - Suspension reason
 * @param {Date} endDate - Suspension end date (null for permanent ban)
 * @param {number} groupId - Optional group ID if suspension is for a specific group
 */
const sendSuspensionNotification = async (userId, reason, endDate, groupId = null) => {
  const isPermanent = !endDate;
  const title = isPermanent 
    ? 'Account Ban' 
    : groupId ? 'Group Suspension' : 'Account Suspension';
  
  const message = isPermanent
    ? `Your account has been permanently banned. Reason: ${reason}`
    : `Your ${groupId ? 'access to this group' : 'account'} has been suspended until ${new Date(endDate).toLocaleDateString()}. Reason: ${reason}`;
  
  try {
    return await sendNotification(
      userId,
      NotificationType.SUSPENSION,
      title,
      message,
      groupId ? 'group' : 'user',
      groupId || userId
    );
  } catch (error) {
    logger.error('Error sending suspension notification:', error);
    throw error;
  }
};

/**
 * Send a group invitation notification
 * @param {number} userId - User ID
 * @param {number} groupId - Group ID
 * @param {string} groupName - Group name
 * @param {number} inviterId - Inviter user ID
 * @param {string} inviterName - Inviter username
 */
const sendGroupInvitationNotification = async (userId, groupId, groupName, inviterId, inviterName) => {
  const title = 'New Group Invitation';
  const message = `${inviterName} has invited you to join the group "${groupName}".`;
  
  try {
    return await sendNotification(
      userId,
      NotificationType.GROUP_INVITATION,
      title,
      message,
      'group',
      groupId
    );
  } catch (error) {
    logger.error('Error sending group invitation notification:', error);
    throw error;
  }
};

/**
 * Send a group join request notification to group admin
 * @param {number} adminUserId - Admin user ID
 * @param {number} requesterId - Requester user ID
 * @param {string} requesterName - Requester username
 * @param {number} groupId - Group ID
 * @param {string} groupName - Group name
 */
const sendGroupJoinRequestNotification = async (adminUserId, requesterId, requesterName, groupId, groupName) => {
  const title = 'New Group Join Request';
  const message = `${requesterName} has requested to join your group "${groupName}".`;
  
  try {
    return await sendNotification(
      adminUserId,
      NotificationType.GROUP_JOIN_REQUEST,
      title,
      message,
      'group',
      groupId
    );
  } catch (error) {
    logger.error('Error sending group join request notification:', error);
    throw error;
  }
};

/**
 * Send a notification when detection is complete
 * @param {number} userId - User ID
 * @param {number} detectionId - Detection ID
 * @param {string} cropType - Crop type
 * @param {string} disease - Detected disease
 */
const sendDetectionCompleteNotification = async (userId, detectionId, cropType, disease) => {
  const title = 'Disease Detection Complete';
  const message = `Your ${cropType} disease detection is complete. Detected: ${disease}`;
  
  try {
    return await sendNotification(
      userId,
      NotificationType.DETECTION_COMPLETE,
      title,
      message,
      'detection',
      detectionId
    );
  } catch (error) {
    logger.error('Error sending detection complete notification:', error);
    throw error;
  }
};

/**
 * Send a notification when a user is mentioned in a message
 * @param {number} userId - User ID of mentioned user
 * @param {number} messageId - Message ID
 * @param {string} mentionerName - Username of the person who mentioned
 * @param {number} groupId - Group ID
 * @param {string} groupName - Group name
 */
const sendMentionNotification = async (userId, messageId, mentionerName, groupId, groupName) => {
  const title = 'You were mentioned';
  const message = `${mentionerName} mentioned you in ${groupName}.`;
  
  try {
    return await sendNotification(
      userId,
      NotificationType.MESSAGE_MENTION,
      title,
      message,
      'message',
      messageId
    );
  } catch (error) {
    logger.error('Error sending mention notification:', error);
    throw error;
  }
};

/**
 * Send a notification for new advisory content
 * @param {number[]} userIds - Array of user IDs to notify
 * @param {number} contentId - Advisory content ID
 * @param {string} title - Advisory title
 * @param {string} cropType - Crop type
 */
const sendAdvisoryUpdateNotification = async (userIds, contentId, title, cropType) => {
  const notificationTitle = 'New Advisory Content Available';
  const message = `New advisory for ${cropType}: ${title}`;
  
  try {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await sendNotification(
        userId,
        NotificationType.ADVISORY_UPDATE,
        notificationTitle,
        message,
        'advisory',
        contentId
      );
      notifications.push(notification);
    }
    return notifications;
  } catch (error) {
    logger.error('Error sending advisory update notification:', error);
    throw error;
  }
};

/**
 * Send a system notification to all users or specific users
 * @param {number[]} userIds - Array of user IDs (null for all users)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
const sendSystemNotification = async (userIds, title, message) => {
  try {
    if (!userIds || userIds.length === 0) {
      // Get all user IDs from the database
      const { pool } = require('../config/database');
      const result = await pool.query('SELECT user_id FROM users WHERE is_active = TRUE');
      userIds = result.rows.map(row => row.user_id);
    }
    
    const notifications = [];
    for (const userId of userIds) {
      const notification = await sendNotification(
        userId,
        NotificationType.SYSTEM_NOTIFICATION,
        title,
        message
      );
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    logger.error('Error sending system notification:', error);
    throw error;
  }
};

module.exports = {
  NotificationType,
  sendNotification,
  sendReportResolutionNotification,
  sendAdminWarningNotification,
  sendSuspensionNotification,
  sendGroupInvitationNotification,
  sendGroupJoinRequestNotification,
  sendDetectionCompleteNotification,
  sendAdvisoryUpdateNotification,
  sendMentionNotification,
  sendSystemNotification
};