/**
 * Analytics Controller
 * 
 * Handles HTTP requests for analytics data
 * Provides endpoints for admin dashboard
 */

const AnalyticsService = require('../../services/analytics/analyticsService');
const logger = require('../../utils/logger');

class AnalyticsController {
  /**
   * Get user growth statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserGrowth(req, res) {
    try {
      const { timeframe = 'monthly', limit = 12 } = req.query;
      
      // Validate timeframe
      const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];
      if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timeframe parameter. Must be one of: daily, weekly, monthly, yearly'
        });
      }
      
      // Validate limit
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid limit parameter. Must be a number between 1 and 50'
        });
      }
      
      const data = await AnalyticsService.getUserGrowth(timeframe, parsedLimit);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error(`Error getting user growth analytics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user growth analytics'
      });
    }
  }
  
  /**
   * Get disease detection statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDiseaseStatistics(req, res) {
    try {
      const { timeframe = 'monthly', limit = 12, cropType = null } = req.query;
      
      // Validate timeframe
      const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];
      if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid timeframe parameter. Must be one of: daily, weekly, monthly, yearly'
        });
      }
      
      const data = await AnalyticsService.getDiseaseStatistics({
        timeframe,
        limit: parseInt(limit),
        cropType
      });
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error(`Error getting disease statistics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve disease statistics'
      });
    }
  }
  
  /**
   * Get user activity metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserActivity(req, res) {
    try {
      const data = await AnalyticsService.getUserActivity();
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error(`Error getting user activity metrics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user activity metrics'
      });
    }
  }
  
  /**
   * Get group activity statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getGroupStatistics(req, res) {
    try {
      const data = await AnalyticsService.getGroupStatistics();
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error(`Error getting group statistics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve group statistics'
      });
    }
  }
  
  /**
   * Get dashboard summary with key metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDashboardSummary(req, res) {
    try {
      // Get user activity data
      const userActivity = await AnalyticsService.getUserActivity();
      
      // Get recent user growth (last 6 months)
      const userGrowth = await AnalyticsService.getUserGrowth('monthly', 6);
      
      // Get top diseases
      const diseaseStats = await AnalyticsService.getDiseaseStatistics({
        timeframe: 'monthly',
        limit: 6
      });
      
      // Combine all data for the dashboard
      const data = {
        userActivity,
        userGrowth,
        topDiseases: diseaseStats.commonDiseases.slice(0, 5),
        diseaseTrends: diseaseStats.trends
      };
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error(`Error getting dashboard summary: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard summary'
      });
    }
  }
}

module.exports = AnalyticsController;