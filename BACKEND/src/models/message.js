const db = require('../config/database');
const logger = require('../utils/logger');
const Group = require('./group');

class Message {
  static async create({ groupId, userId, content, hasAttachment = false, attachmentType = null, attachmentPath = null }) {
    try {
      // Check if user is a member of the group
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      const result = await db.query(
        `INSERT INTO messages (
          group_id,
          user_id,
          content,
          has_attachment,
          attachment_type,
          attachment_path
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [groupId, userId, content, hasAttachment, attachmentType, attachmentPath]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  static async getById(messageId) {
    try {
      const result = await db.query(
        `SELECT m.*,
                u.username, u.full_name
         FROM messages m
         JOIN users u ON m.user_id = u.user_id
         WHERE m.message_id = $1 AND NOT m.is_deleted`,
        [messageId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting message:', error);
      throw error;
    }
  }

  static async getGroupMessages({ groupId, limit = 50, before = null }) {
    try {
      let query = `
        SELECT m.*,
               u.username, u.full_name
        FROM messages m
        JOIN users u ON m.user_id = u.user_id
        WHERE m.group_id = $1 AND NOT m.is_deleted
      `;
      const params = [groupId];

      if (before) {
        query += ' AND m.message_id < $2';
        params.push(before);
      }

      query += ' ORDER BY m.created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting group messages:', error);
      throw error;
    }
  }

  static async update(messageId, userId, { content }) {
    try {
      const result = await db.query(
        `UPDATE messages 
         SET content = $1,
             edited_at = CURRENT_TIMESTAMP
         WHERE message_id = $2 
         AND user_id = $3 
         AND NOT is_deleted
         RETURNING *`,
        [content, messageId, userId]
      );

      if (!result.rows[0]) {
        throw new Error('Message not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating message:', error);
      throw error;
    }
  }

  static async delete(messageId, userId = null) {
    try {
      let query = `UPDATE messages SET is_deleted = true WHERE message_id = $1`;
      let params = [messageId];
      
      // If userId is provided, only allow deletion if the message was sent by that user
      // This allows admins to delete any message when userId is null
      if (userId) {
        query += ` AND user_id = $2`;
        params.push(userId);
      }
      
      query += ` RETURNING *`;
      
      const result = await db.query(query, params);

      if (!result.rows[0]) {
        throw new Error('Message not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  static async canAccessMessage(messageId, userId) {
    try {
      const result = await db.query(
        `SELECT 1
         FROM messages m
         JOIN group_members gm ON m.group_id = gm.group_id
         WHERE m.message_id = $1 
         AND gm.user_id = $2`,
        [messageId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking message access:', error);
      throw error;
    }
  }

  static async searchMessages({ groupId, query, limit = 50, offset = 0 }) {
    try {
      const result = await db.query(
        `SELECT m.*,
                u.username, u.full_name
         FROM messages m
         JOIN users u ON m.user_id = u.user_id
         WHERE m.group_id = $1 
         AND NOT m.is_deleted
         AND (
           m.content ILIKE $2
           OR u.username ILIKE $2
           OR u.full_name ILIKE $2
         )
         ORDER BY m.created_at DESC
         LIMIT $3 OFFSET $4`,
        [groupId, `%${query}%`, limit, offset]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }

  static async getMessageStats(groupId) {
    try {
      const result = await db.query(
        `SELECT 
           CAST(COUNT(*) AS INTEGER) as total_messages,
           CAST(COUNT(DISTINCT user_id) AS INTEGER) as unique_senders,
           MAX(created_at) as last_message_at,
           CAST(SUM(CASE WHEN has_attachment THEN 1 ELSE 0 END) AS INTEGER) as attachments_count
         FROM messages
         WHERE group_id = $1 AND NOT is_deleted`,
        [groupId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting message stats:', error);
      throw error;
    }
  }
}

module.exports = Message;