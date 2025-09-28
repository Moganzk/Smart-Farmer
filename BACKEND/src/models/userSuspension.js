// src/models/userSuspension.js
const db = require('../config/database');

/**
 * User Suspension Model
 */
class UserSuspension {
  /**
   * Suspend a user
   * @param {Object} suspensionData - Suspension data
   * @returns {Promise<Object>} Created suspension record
   */
  static async create(suspensionData) {
    const {
      userId,
      groupId, // can be null for platform-wide suspension
      adminId,
      reason,
      endDate, // can be null for permanent ban
    } = suspensionData;

    try {
      const result = await db.query(
        `INSERT INTO user_suspensions(
          user_id,
          group_id,
          admin_id,
          reason,
          end_date
        ) VALUES($1, $2, $3, $4, $5) 
        RETURNING *`,
        [userId, groupId, adminId, reason, endDate]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user suspension:', error);
      throw error;
    }
  }

  /**
   * Remove a user suspension
   * @param {number} suspensionId - Suspension ID
   * @returns {Promise<Object>} Updated suspension record
   */
  static async remove(suspensionId) {
    try {
      const result = await db.query(
        `UPDATE user_suspensions
        SET is_active = FALSE, updated_at = NOW()
        WHERE suspension_id = $1 AND is_active = TRUE
        RETURNING *`,
        [suspensionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error removing user suspension:', error);
      throw error;
    }
  }

  /**
   * Get active suspensions for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Active suspensions
   */
  static async getActiveByUser(userId) {
    try {
      const result = await db.query(
        `SELECT
          s.*,
          u.username as admin_username,
          g.name as group_name
        FROM user_suspensions s
        JOIN users u ON s.admin_id = u.user_id
        LEFT JOIN groups g ON s.group_id = g.group_id
        WHERE s.user_id = $1 AND s.is_active = TRUE
        AND (s.end_date IS NULL OR s.end_date > NOW())`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting active suspensions:', error);
      throw error;
    }
  }

  /**
   * Check if a user is suspended
   * @param {number} userId - User ID
   * @param {number} groupId - Optional group ID
   * @returns {Promise<boolean>} True if user is suspended
   */
  static async isUserSuspended(userId, groupId = null) {
    try {
      const result = await db.query(
        'SELECT is_user_suspended($1, $2) as suspended',
        [userId, groupId]
      );
      
      return result.rows[0].suspended;
    } catch (error) {
      console.error('Error checking user suspension:', error);
      throw error;
    }
  }

  /**
   * Get all suspensions with optional filters
   * @param {Object} filters - Filter options
   * @param {boolean} filters.isActive - Filter by active status
   * @param {number} filters.groupId - Filter by group
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{suspensions: Array, totalCount: number}>} Suspensions with count
   */
  static async getAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Add filters
    if (typeof filters.isActive === 'boolean') {
      conditions.push(`is_active = $${paramCounter++}`);
      params.push(filters.isActive);
    }

    if (filters.groupId) {
      conditions.push(`group_id = $${paramCounter++}`);
      params.push(filters.groupId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query for suspensions
    const suspensionsQuery = `
      SELECT
        s.*,
        u_user.username as user_username,
        u_admin.username as admin_username,
        g.name as group_name
      FROM user_suspensions s
      JOIN users u_user ON s.user_id = u_user.user_id
      JOIN users u_admin ON s.admin_id = u_admin.user_id
      LEFT JOIN groups g ON s.group_id = g.group_id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_suspensions
      ${whereClause}
    `;

    try {
      const [suspensionsResult, countResult] = await Promise.all([
        db.query(suspensionsQuery, [...params, limit, offset]),
        db.query(countQuery, params)
      ]);

      return {
        suspensions: suspensionsResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting suspensions:', error);
      throw error;
    }
  }

  /**
   * Ban a user permanently
   * @param {Object} banData - Ban data
   * @returns {Promise<Object>} Created ban record
   */
  static async banUser(banData) {
    const {
      userId,
      adminId,
      reason,
      groupId = null // can be null for platform-wide ban
    } = banData;

    try {
      // Create a suspension with no end date (permanent)
      const result = await db.query(
        `INSERT INTO user_suspensions(
          user_id,
          group_id,
          admin_id,
          reason,
          end_date
        ) VALUES($1, $2, $3, $4, NULL) 
        RETURNING *`,
        [userId, groupId, adminId, reason]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }
}

module.exports = UserSuspension;