// src/middleware/reporter.js
const ContentReport = require('../models/contentReport');

/**
 * Middleware to handle content reporting
 */
const reporter = {
  /**
   * Create a report for a message
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<Object>} - Created report
   */
  async reportMessage(req, res) {
    try {
      const { messageId, reason, description } = req.body;
      const reporterId = req.user.user_id;
      
      // Validate required fields
      if (!messageId || !reason) {
        return res.status(400).json({ 
          error: {
            message: 'Message ID and reason are required'
          }
        });
      }
      
      // Get message details to find the sender
      const MessageModel = require('../models/message');
      const message = await MessageModel.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ 
          error: {
            message: 'Message not found'
          }
        });
      }
      
      // Create the report
      const report = await ContentReport.create({
        reporterId,
        reportedUserId: message.sender_id,
        messageId,
        groupId: message.group_id,
        reason,
        description,
        severity: getSeverity(reason)
      });
      
      res.status(201).json({
        message: 'Report submitted successfully',
        reportId: report.report_id
      });
    } catch (error) {
      console.error('Error reporting message:', error);
      res.status(500).json({ 
        error: {
          message: 'Failed to submit report'
        }
      });
    }
  },
  
  /**
   * Create a report for a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<Object>} - Created report
   */
  async reportUser(req, res) {
    try {
      const { userId, groupId, reason, description } = req.body;
      const reporterId = req.user.user_id;
      
      // Validate required fields
      if (!userId || !reason) {
        return res.status(400).json({ 
          error: {
            message: 'User ID and reason are required'
          }
        });
      }
      
      // Check if user exists
      const UserModel = require('../models/user');
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: {
            message: 'User not found'
          }
        });
      }
      
      // Prevent reporting yourself
      if (userId === reporterId) {
        return res.status(400).json({ 
          error: {
            message: 'You cannot report yourself'
          }
        });
      }
      
      // Create the report
      const report = await ContentReport.create({
        reporterId,
        reportedUserId: userId,
        messageId: null,
        groupId: groupId || null,
        reason,
        description,
        severity: getSeverity(reason)
      });
      
      res.status(201).json({
        message: 'Report submitted successfully',
        reportId: report.report_id
      });
    } catch (error) {
      console.error('Error reporting user:', error);
      res.status(500).json({ 
        error: {
          message: 'Failed to submit report'
        }
      });
    }
  },
  
  /**
   * Get reports submitted by the current user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<Object>} - User's reports
   */
  async getMyReports(req, res) {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 10 } = req.query;
      
      // Query with specific filters
      const filters = { reporterId: userId };
      const reports = await ContentReport.getAll(filters, parseInt(page), parseInt(limit));
      
      res.json(reports);
    } catch (error) {
      console.error('Error getting user reports:', error);
      res.status(500).json({ 
        error: {
          message: 'Failed to get reports'
        }
      });
    }
  }
};

/**
 * Determine severity based on reason
 * @param {string} reason - Report reason
 * @returns {string} - Severity level
 */
function getSeverity(reason) {
  const highSeverityKeywords = [
    'threat', 'violence', 'harassment', 'child', 'terror', 'suicide', 'harm'
  ];
  
  const mediumSeverityKeywords = [
    'spam', 'offensive', 'inappropriate', 'misleading', 'scam'
  ];
  
  const reason_lower = reason.toLowerCase();
  
  // Check for high severity keywords
  for (const keyword of highSeverityKeywords) {
    if (reason_lower.includes(keyword)) {
      return 'high';
    }
  }
  
  // Check for medium severity keywords
  for (const keyword of mediumSeverityKeywords) {
    if (reason_lower.includes(keyword)) {
      return 'medium';
    }
  }
  
  // Default severity
  return 'low';
}

module.exports = reporter;