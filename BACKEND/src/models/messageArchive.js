// src/models/messageArchive.js
const db = require('../config/database');

/**
 * Message Archive Model
 */
class MessageArchive {
  /**
   * Archive a message (when deleting)
   * @param {Object} archiveData - Archive data
   * @returns {Promise<Object>} Archived message
   */
  static async archiveMessage(archiveData) {
    const {
      originalMessageId,
      senderId,
      groupId,
      content,
      deletedById,
      deletionReason
    } = archiveData;

    try {
      const result = await db.query(
        `INSERT INTO message_archive(
          original_message_id,
          sender_id,
          group_id,
          content,
          deleted_by_id,
          deletion_reason
        ) VALUES($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [originalMessageId, senderId, groupId, content, deletedById, deletionReason]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error archiving message:', error);
      throw error;
    }
  }

  /**
   * Get archived messages with filters
   * @param {Object} filters - Filter options
   * @param {number} filters.groupId - Filter by group
   * @param {number} filters.senderId - Filter by sender
   * @param {number} filters.deletedById - Filter by who deleted
   * @param {string} filters.dateFrom - Filter by date (from)
   * @param {string} filters.dateTo - Filter by date (to)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{messages: Array, totalCount: number}>} Archived messages with count
   */
  static async getArchivedMessages(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Add filters
    if (filters.groupId) {
      conditions.push(`a.group_id = $${paramCounter++}`);
      params.push(filters.groupId);
    }

    if (filters.senderId) {
      conditions.push(`a.sender_id = $${paramCounter++}`);
      params.push(filters.senderId);
    }

    if (filters.deletedById) {
      conditions.push(`a.deleted_by_id = $${paramCounter++}`);
      params.push(filters.deletedById);
    }

    if (filters.dateFrom) {
      conditions.push(`a.deleted_at >= $${paramCounter++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push(`a.deleted_at <= $${paramCounter++}`);
      params.push(filters.dateTo);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query for archived messages
    const messagesQuery = `
      SELECT
        a.*,
        u_sender.username as sender_username,
        u_deleter.username as deleted_by_username,
        g.name as group_name
      FROM message_archive a
      JOIN users u_sender ON a.sender_id = u_sender.user_id
      JOIN users u_deleter ON a.deleted_by_id = u_deleter.user_id
      JOIN groups g ON a.group_id = g.group_id
      ${whereClause}
      ORDER BY a.deleted_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM message_archive a
      ${whereClause}
    `;

    try {
      const [messagesResult, countResult] = await Promise.all([
        db.query(messagesQuery, [...params, limit, offset]),
        db.query(countQuery, params)
      ]);

      return {
        messages: messagesResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting archived messages:', error);
      throw error;
    }
  }

  /**
   * Get an archived message by ID
   * @param {number} archiveId - Archive ID
   * @returns {Promise<Object>} Archived message
   */
  static async getById(archiveId) {
    try {
      const result = await db.query(
        `SELECT
          a.*,
          u_sender.username as sender_username,
          u_deleter.username as deleted_by_username,
          g.name as group_name
        FROM message_archive a
        JOIN users u_sender ON a.sender_id = u_sender.user_id
        JOIN users u_deleter ON a.deleted_by_id = u_deleter.user_id
        JOIN groups g ON a.group_id = g.group_id
        WHERE a.archive_id = $1`,
        [archiveId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting archived message by ID:', error);
      throw error;
    }
  }
}

module.exports = MessageArchive;