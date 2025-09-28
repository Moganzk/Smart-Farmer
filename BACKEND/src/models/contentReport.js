// src/models/contentReport.js
const db = require('../config/database');

/**
 * Content Report Model
 */
class ContentReport {
  /**
   * Create a new content report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Created report
   */
  static async create(reportData) {
    const {
      reporterId,
      reportedUserId,
      messageId,
      groupId,
      reason,
      description,
      severity = 'medium'
    } = reportData;

    try {
      const result = await db.query(
        `INSERT INTO content_reports(
          reporter_id,
          reported_user_id,
          message_id,
          group_id,
          report_reason,
          report_description,
          severity
        ) VALUES($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [reporterId, reportedUserId, messageId, groupId, reason, description, severity]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating content report:', error);
      throw error;
    }
  }

  /**
   * Get all reports with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {number} filters.reportedUserId - Filter by reported user
   * @param {number} filters.groupId - Filter by group
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{reports: Array, totalCount: number}>} Reports with count
   */
  static async getAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Add filters
    if (filters.status) {
      conditions.push(`status = $${paramCounter++}`);
      params.push(filters.status);
    }

    if (filters.reportedUserId) {
      conditions.push(`reported_user_id = $${paramCounter++}`);
      params.push(filters.reportedUserId);
    }

    if (filters.groupId) {
      conditions.push(`group_id = $${paramCounter++}`);
      params.push(filters.groupId);
    }

    if (filters.severity) {
      conditions.push(`severity = $${paramCounter++}`);
      params.push(filters.severity);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query for reports
    const reportsQuery = `
      SELECT
        r.*,
        u_reporter.username as reporter_username,
        u_reported.username as reported_username,
        u_resolver.username as resolver_username,
        g.name as group_name
      FROM content_reports r
      JOIN users u_reporter ON r.reporter_id = u_reporter.user_id
      JOIN users u_reported ON r.reported_user_id = u_reported.user_id
      LEFT JOIN users u_resolver ON r.resolved_by_id = u_resolver.user_id
      LEFT JOIN groups g ON r.group_id = g.group_id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN r.severity = 'critical' THEN 1
          WHEN r.severity = 'high' THEN 2
          WHEN r.severity = 'medium' THEN 3
          ELSE 4
        END,
        r.created_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM content_reports
      ${whereClause}
    `;

    try {
      const [reportsResult, countResult] = await Promise.all([
        db.query(reportsQuery, [...params, limit, offset]),
        db.query(countQuery, params)
      ]);

      return {
        reports: reportsResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting content reports:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} Report with details
   */
  static async getById(reportId) {
    try {
      const result = await db.query(
        `SELECT
          r.*,
          u_reporter.username as reporter_username,
          u_reported.username as reported_username,
          u_resolver.username as resolver_username,
          g.name as group_name,
          m.content as message_content
        FROM content_reports r
        JOIN users u_reporter ON r.reporter_id = u_reporter.user_id
        JOIN users u_reported ON r.reported_user_id = u_reported.user_id
        LEFT JOIN users u_resolver ON r.resolved_by_id = u_resolver.user_id
        LEFT JOIN groups g ON r.group_id = g.group_id
        LEFT JOIN messages m ON r.message_id = m.message_id
        WHERE r.report_id = $1`,
        [reportId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting report by ID:', error);
      throw error;
    }
  }

  /**
   * Update report status
   * @param {number} reportId - Report ID
   * @param {string} status - New status
   * @param {number} resolvedById - Admin ID who resolved
   * @param {string} notes - Resolution notes
   * @returns {Promise<Object>} Updated report
   */
  static async updateStatus(reportId, status, resolvedById, notes) {
    try {
      const result = await db.query(
        `UPDATE content_reports
        SET 
          status = $1,
          resolved_by_id = CASE WHEN $2 IS NOT NULL THEN $2 ELSE resolved_by_id END,
          resolution_notes = CASE WHEN $3 IS NOT NULL THEN $3 ELSE resolution_notes END,
          updated_at = NOW()
        WHERE report_id = $4
        RETURNING *`,
        [status, resolvedById, notes, reportId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Get reports by user
   * @param {number} userId - User ID
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<{reports: Array, totalCount: number}>} Reports with count
   */
  static async getByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    try {
      const reportsQuery = `
        SELECT
          r.*,
          u_reporter.username as reporter_username,
          u_reported.username as reported_username,
          u_resolver.username as resolver_username,
          g.name as group_name
        FROM content_reports r
        JOIN users u_reporter ON r.reporter_id = u_reporter.user_id
        JOIN users u_reported ON r.reported_user_id = u_reported.user_id
        LEFT JOIN users u_resolver ON r.resolved_by_id = u_resolver.user_id
        LEFT JOIN groups g ON r.group_id = g.group_id
        WHERE r.reported_user_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM content_reports
        WHERE reported_user_id = $1
      `;

      const [reportsResult, countResult] = await Promise.all([
        db.query(reportsQuery, [userId, limit, offset]),
        db.query(countQuery, [userId])
      ]);

      return {
        reports: reportsResult.rows,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting reports by user:', error);
      throw error;
    }
  }

  /**
   * Get moderation metrics
   * @returns {Promise<Object>} Moderation metrics
   */
  static async getMetrics() {
    try {
      const result = await db.query('SELECT * FROM moderation_metrics');
      return result.rows[0];
    } catch (error) {
      console.error('Error getting moderation metrics:', error);
      throw error;
    }
  }
}

module.exports = ContentReport;