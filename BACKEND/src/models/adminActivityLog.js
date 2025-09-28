// src/models/adminActivityLog.js
const db = require('../config/database');

/**
 * Admin Activity Log Model
 */
class AdminActivityLog {
  /**
   * Log an admin activity
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} Created log entry
   */
  static async create(logData) {
    const {
      adminId,
      actionType,
      targetUserId,
      targetGroupId,
      targetMessageId,
      targetReportId,
      actionDetails,
      ipAddress
    } = logData;

    try {
      const result = await db.query(
        `INSERT INTO admin_activity_log(
          admin_id,
          action_type,
          target_user_id,
          target_group_id,
          target_message_id,
          target_report_id,
          action_details,
          ip_address
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [adminId, actionType, targetUserId, targetGroupId, targetMessageId, targetReportId, actionDetails, ipAddress]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating admin activity log:', error);
      throw error;
    }
  }

  /**
   * Get admin activity logs with filters
   * @param {Object} filters - Filter options
   * @param {number} filters.adminId - Filter by admin
   * @param {string} filters.actionType - Filter by action type
   * @param {number} filters.targetUserId - Filter by target user
   * @param {number} filters.targetGroupId - Filter by target group
   * @param {string} filters.dateFrom - Filter by date (from)
   * @param {string} filters.dateTo - Filter by date (to)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{logs: Array, totalCount: number}>} Logs with count
   */
  static async getAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Add filters
    if (filters.adminId) {
      conditions.push(`l.admin_id = $${paramCounter++}`);
      params.push(filters.adminId);
    }

    if (filters.actionType) {
      conditions.push(`l.action_type = $${paramCounter++}`);
      params.push(filters.actionType);
    }

    if (filters.targetUserId) {
      conditions.push(`l.target_user_id = $${paramCounter++}`);
      params.push(filters.targetUserId);
    }

    if (filters.targetGroupId) {
      conditions.push(`l.target_group_id = $${paramCounter++}`);
      params.push(filters.targetGroupId);
    }

    if (filters.dateFrom) {
      conditions.push(`l.created_at >= $${paramCounter++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      conditions.push(`l.created_at <= $${paramCounter++}`);
      params.push(filters.dateTo);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query for logs
    const logsQuery = `
      SELECT
        l.*,
        u_admin.username as admin_username,
        u_target.username as target_username,
        g.name as group_name
      FROM admin_activity_log l
      JOIN users u_admin ON l.admin_id = u_admin.user_id
      LEFT JOIN users u_target ON l.target_user_id = u_target.user_id
      LEFT JOIN groups g ON l.target_group_id = g.group_id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM admin_activity_log l
      ${whereClause}
    `;

    try {
      const [logsResult, countResult] = await Promise.all([
        db.query(logsQuery, [...params, limit, offset]),
        db.query(countQuery, params)
      ]);

      return {
        logs: logsResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting admin activity logs:', error);
      throw error;
    }
  }

  /**
   * Get recent activity for an admin
   * @param {number} adminId - Admin ID
   * @param {number} limit - Max number of activities to return
   * @returns {Promise<Array>} Recent activities
   */
  static async getRecentByAdmin(adminId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT
          l.*,
          u_target.username as target_username,
          g.name as group_name
        FROM admin_activity_log l
        LEFT JOIN users u_target ON l.target_user_id = u_target.user_id
        LEFT JOIN groups g ON l.target_group_id = g.group_id
        WHERE l.admin_id = $1
        ORDER BY l.created_at DESC
        LIMIT $2`,
        [adminId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting recent admin activities:', error);
      throw error;
    }
  }

  /**
   * Get action counts by admin
   * @param {string} dateFrom - Start date (YYYY-MM-DD)
   * @param {string} dateTo - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Action counts by admin
   */
  static async getActionCountsByAdmin(dateFrom, dateTo) {
    try {
      const result = await db.query(
        `SELECT
          u.username as admin_username,
          l.admin_id,
          COUNT(*) as total_actions,
          COUNT(CASE WHEN l.action_type = 'delete_message' THEN 1 END) as delete_count,
          COUNT(CASE WHEN l.action_type = 'suspend_user' THEN 1 END) as suspend_count,
          COUNT(CASE WHEN l.action_type = 'ban_user' THEN 1 END) as ban_count,
          COUNT(CASE WHEN l.action_type = 'warn_user' THEN 1 END) as warning_count,
          COUNT(CASE WHEN l.action_type = 'resolve_report' THEN 1 END) as resolve_count
        FROM admin_activity_log l
        JOIN users u ON l.admin_id = u.user_id
        WHERE l.created_at BETWEEN $1 AND $2
        GROUP BY l.admin_id, u.username
        ORDER BY total_actions DESC`,
        [dateFrom, dateTo]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting admin action counts:', error);
      throw error;
    }
  }
}

module.exports = AdminActivityLog;