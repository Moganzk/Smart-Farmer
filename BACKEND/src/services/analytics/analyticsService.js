/**
 * Analytics Service
 * 
 * Provides analytics and reporting functions for admin users
 * Collects data from various models to generate insights on app usage
 */

const db = require('../../db/index');
const logger = require('../../utils/logger');

class AnalyticsService {
  /**
   * Get user growth statistics by timeframe
   * @param {string} timeframe - 'daily', 'weekly', 'monthly', or 'yearly'
   * @param {number} limit - Number of data points to return
   * @returns {Promise<Array>} - User growth statistics
   */
  static async getUserGrowth(timeframe = 'monthly', limit = 12) {
    try {
      let timeFormat;
      let intervalStr;
      
      // Set up time formatting and interval based on timeframe
      switch (timeframe) {
        case 'daily':
          timeFormat = 'YYYY-MM-DD';
          intervalStr = '1 day';
          break;
        case 'weekly':
          timeFormat = 'YYYY-WW';
          intervalStr = '1 week';
          break;
        case 'monthly':
          timeFormat = 'YYYY-MM';
          intervalStr = '1 month';
          break;
        case 'yearly':
          timeFormat = 'YYYY';
          intervalStr = '1 year';
          break;
        default:
          timeFormat = 'YYYY-MM';
          intervalStr = '1 month';
      }
      
      // Query to get user registrations by time period
      const query = `
        WITH time_series AS (
          SELECT generate_series(
            date_trunc($1, NOW() - ($2 || ' ' || $3)::interval),
            date_trunc($1, NOW()),
            ($3)::interval
          ) AS time_period
        )
        SELECT 
          to_char(t.time_period, $4) AS period,
          COUNT(u.id) AS new_users
        FROM 
          time_series t
        LEFT JOIN 
          users u ON date_trunc($1, u.created_at) = t.time_period
        GROUP BY 
          t.time_period
        ORDER BY 
          t.time_period ASC;
      `;
      
      const result = await db.query(query, [
        timeframe, 
        limit - 1, 
        intervalStr,
        timeFormat
      ]);
      
      return result.rows;
    } catch (error) {
      logger.error(`Error getting user growth analytics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get statistics about disease detections
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Disease detection statistics
   */
  static async getDiseaseStatistics(options = {}) {
    try {
      const { timeframe = 'monthly', limit = 12, cropType = null } = options;
      
      // Query to get most common diseases detected
      const commonDiseasesQuery = `
        SELECT 
          d.disease_name,
          COUNT(*) AS detection_count
        FROM 
          disease_detections dd
        JOIN 
          diseases d ON dd.disease_id = d.id
        ${cropType ? 'WHERE d.crop_type = $1' : ''}
        GROUP BY 
          d.disease_name
        ORDER BY 
          detection_count DESC
        LIMIT 10;
      `;
      
      const commonDiseasesResult = await db.query(
        commonDiseasesQuery,
        cropType ? [cropType] : []
      );
      
      // Query to get detection trends over time
      let timeFormat;
      let intervalStr;
      
      // Set up time formatting and interval based on timeframe
      switch (timeframe) {
        case 'daily':
          timeFormat = 'YYYY-MM-DD';
          intervalStr = '1 day';
          break;
        case 'weekly':
          timeFormat = 'YYYY-WW';
          intervalStr = '1 week';
          break;
        case 'monthly':
          timeFormat = 'YYYY-MM';
          intervalStr = '1 month';
          break;
        case 'yearly':
          timeFormat = 'YYYY';
          intervalStr = '1 year';
          break;
        default:
          timeFormat = 'YYYY-MM';
          intervalStr = '1 month';
      }
      
      const trendsQuery = `
        WITH time_series AS (
          SELECT generate_series(
            date_trunc($1, NOW() - ($2 || ' ' || $3)::interval),
            date_trunc($1, NOW()),
            ($3)::interval
          ) AS time_period
        )
        SELECT 
          to_char(t.time_period, $4) AS period,
          COUNT(dd.id) AS detection_count
        FROM 
          time_series t
        LEFT JOIN 
          disease_detections dd ON date_trunc($1, dd.created_at) = t.time_period
        ${cropType ? 'LEFT JOIN diseases d ON dd.disease_id = d.id WHERE d.crop_type = $5' : ''}
        GROUP BY 
          t.time_period
        ORDER BY 
          t.time_period ASC;
      `;
      
      const trendsResult = await db.query(
        trendsQuery,
        cropType ? [timeframe, limit - 1, intervalStr, timeFormat, cropType] : [timeframe, limit - 1, intervalStr, timeFormat]
      );
      
      return {
        commonDiseases: commonDiseasesResult.rows,
        trends: trendsResult.rows
      };
    } catch (error) {
      logger.error(`Error getting disease statistics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get user activity metrics
   * @returns {Promise<Object>} - User activity statistics
   */
  static async getUserActivity() {
    try {
      // Query to get active users by day/week/month
      const activeUsersQuery = `
        SELECT
          COUNT(DISTINCT CASE WHEN last_login_at > NOW() - INTERVAL '1 day' THEN id END) AS daily_active_users,
          COUNT(DISTINCT CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN id END) AS weekly_active_users,
          COUNT(DISTINCT CASE WHEN last_login_at > NOW() - INTERVAL '30 days' THEN id END) AS monthly_active_users,
          COUNT(*) AS total_users
        FROM
          users;
      `;
      
      const activeUsersResult = await db.query(activeUsersQuery);
      
      // Query to get feature usage statistics
      const featureUsageQuery = `
        SELECT
          (SELECT COUNT(*) FROM disease_detections WHERE created_at > NOW() - INTERVAL '30 days') AS disease_detections,
          (SELECT COUNT(*) FROM advisory_requests WHERE created_at > NOW() - INTERVAL '30 days') AS advisory_requests,
          (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '30 days') AS messages_sent,
          (SELECT COUNT(*) FROM group_members WHERE joined_at > NOW() - INTERVAL '30 days') AS group_joins
      `;
      
      const featureUsageResult = await db.query(featureUsageQuery);
      
      return {
        activeUsers: activeUsersResult.rows[0],
        featureUsage: featureUsageResult.rows[0]
      };
    } catch (error) {
      logger.error(`Error getting user activity metrics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get group activity statistics
   * @returns {Promise<Array>} - Group statistics
   */
  static async getGroupStatistics() {
    try {
      const query = `
        SELECT
          g.id,
          g.name,
          g.created_at,
          COUNT(DISTINCT gm.user_id) AS member_count,
          COUNT(m.id) AS message_count,
          MAX(m.created_at) AS last_activity
        FROM
          groups g
        LEFT JOIN
          group_members gm ON g.id = gm.group_id
        LEFT JOIN
          messages m ON g.id = m.group_id
        GROUP BY
          g.id, g.name, g.created_at
        ORDER BY
          member_count DESC, message_count DESC
        LIMIT 50;
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting group statistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AnalyticsService;