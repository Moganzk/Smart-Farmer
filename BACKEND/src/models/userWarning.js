// src/models/userWarning.js
const db = require('../config/database');

/**
 * User Warning Model
 */
class UserWarning {
  /**
   * Create a warning for a user
   * @param {Object} warningData - Warning data
   * @returns {Promise<Object>} Created warning
   */
  static async create(warningData) {
    const {
      userId,
      adminId,
      warningMessage,
      groupId // can be null for platform-wide warning
    } = warningData;

    try {
      const result = await db.query(
        `INSERT INTO user_warnings(
          user_id,
          admin_id,
          warning_message,
          group_id
        ) VALUES($1, $2, $3, $4) 
        RETURNING *`,
        [userId, adminId, warningMessage, groupId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user warning:', error);
      throw error;
    }
  }

  /**
   * Get warnings for a user
   * @param {number} userId - User ID
   * @param {Object} options - Options
   * @param {number} options.groupId - Filter by group ID
   * @param {number} options.daysBack - Get warnings from last X days
   * @param {number} options.limit - Max number of warnings to return
   * @returns {Promise<Array>} User warnings
   */
  static async getByUser(userId, options = {}) {
    const { groupId, daysBack, limit = 100 } = options;
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramCounter = 2;

    // Add filters
    if (groupId) {
      conditions.push(`group_id = $${paramCounter++}`);
      params.push(groupId);
    }

    if (daysBack) {
      conditions.push(`created_at > NOW() - INTERVAL '${daysBack} days'`);
    }

    try {
      const result = await db.query(
        `SELECT
          w.*,
          u_admin.username as admin_username,
          g.name as group_name
        FROM user_warnings w
        JOIN users u_admin ON w.admin_id = u_admin.user_id
        LEFT JOIN groups g ON w.group_id = g.group_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY w.created_at DESC
        LIMIT $${paramCounter}`,
        [...params, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user warnings:', error);
      throw error;
    }
  }

  /**
   * Get warnings with filters
   * @param {Object} filters - Filter options
   * @param {number} filters.groupId - Filter by group
   * @param {number} filters.adminId - Filter by admin
   * @param {string} filters.dateFrom - Filter by date (from)
   * @param {string} filters.dateTo - Filter by date (to)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{warnings: Array, totalCount: number}>} Warnings with count
   */
  static async getAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Add filters
    if (filters.groupId) {
      conditions.push(`w.group_id = $${paramCounter++}`);
      params.push(filters.groupId);
    }

    if (filters.userId) {
      conditions.push(`w.user_id = $${paramCounter++}`);
      params.push(filters.userId);
    }

    if (filters.adminId) {
      conditions.push(`w.admin_id = $${paramCounter++}`);
      params.push(filters.adminId);
    }

    if (filters.dateFrom) {
      conditions.push(`w.created_at >= $${paramCounter++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push(`w.created_at <= $${paramCounter++}`);
      params.push(filters.dateTo);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query for warnings
    const warningsQuery = `
      SELECT
        w.*,
        u_user.username as user_username,
        u_admin.username as admin_username,
        g.name as group_name
      FROM user_warnings w
      JOIN users u_user ON w.user_id = u_user.user_id
      JOIN users u_admin ON w.admin_id = u_admin.user_id
      LEFT JOIN groups g ON w.group_id = g.group_id
      ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_warnings w
      ${whereClause}
    `;

    try {
      const [warningsResult, countResult] = await Promise.all([
        db.query(warningsQuery, [...params, limit, offset]),
        db.query(countQuery, params)
      ]);

      return {
        warnings: warningsResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting warnings:', error);
      throw error;
    }
  }

  /**
   * Count warnings for a user in a time period
   * @param {number} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<number>} Warning count
   */
  static async countRecentWarnings(userId, days = 90) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count
        FROM user_warnings
        WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '${days} days'`,
        [userId]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting recent warnings:', error);
      throw error;
    }
  }
}

module.exports = UserWarning;