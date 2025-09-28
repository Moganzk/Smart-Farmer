// src/controllers/adminController.js
const ContentReport = require('../models/contentReport');
const UserSuspension = require('../models/userSuspension');
const MessageArchive = require('../models/messageArchive');
const UserWarning = require('../models/userWarning');
const AdminActivityLog = require('../models/adminActivityLog');
const MessageModel = require('../models/message');
const GroupModel = require('../models/group');
const UserModel = require('../models/user');

/**
 * Admin controller for moderation actions
 */
class AdminController {
  /**
   * Get all content reports with filtering
   */
  static async getReports(req, res) {
    try {
      const { status, reportedUserId, groupId, severity, page = 1, limit = 20 } = req.query;
      
      // Build filters object
      const filters = {};
      if (status) filters.status = status;
      if (reportedUserId) filters.reportedUserId = parseInt(reportedUserId);
      if (groupId) filters.groupId = parseInt(groupId);
      if (severity) filters.severity = severity;
      
      const result = await ContentReport.getAll(filters, parseInt(page), parseInt(limit));
      
      res.json(result);
    } catch (error) {
      console.error('Error getting reports:', error);
      res.status(500).json({ message: 'Failed to get reports' });
    }
  }

  /**
   * Get a specific report
   */
  static async getReportById(req, res) {
    try {
      const reportId = parseInt(req.params.id);
      
      const report = await ContentReport.getById(reportId);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      res.json(report);
    } catch (error) {
      console.error('Error getting report:', error);
      res.status(500).json({ message: 'Failed to get report' });
    }
  }

  /**
   * Update report status
   */
  static async updateReportStatus(req, res) {
    try {
      const reportId = parseInt(req.params.id);
      const { status, notes } = req.body;
      const adminId = req.user.id;
      
      // Validate status
      const validStatuses = ['pending', 'under_review', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedReport = await ContentReport.updateStatus(reportId, status, adminId, notes);
      if (!updatedReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'update_report_status',
        targetReportId: reportId,
        actionDetails: `Updated report status to ${status}`,
        ipAddress: req.ip
      });
      
      res.json(updatedReport);
    } catch (error) {
      console.error('Error updating report status:', error);
      res.status(500).json({ message: 'Failed to update report status' });
    }
  }

  /**
   * Suspend a user
   */
  static async suspendUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { groupId, reason, durationDays } = req.body;
      const adminId = req.user.id;
      
      // Validate input
      if (!reason) {
        return res.status(400).json({ message: 'Reason is required' });
      }
      
      // Calculate end date if duration provided
      let endDate = null;
      if (durationDays) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(durationDays));
      }
      
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If group provided, check if it exists
      let groupIdParsed = null;
      if (groupId) {
        groupIdParsed = parseInt(groupId);
        const group = await GroupModel.findById(groupIdParsed);
        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }
      }
      
      const suspension = await UserSuspension.create({
        userId,
        groupId: groupIdParsed,
        adminId,
        reason,
        endDate
      });
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'suspend_user',
        targetUserId: userId,
        targetGroupId: groupIdParsed,
        actionDetails: `Suspended user for ${durationDays || 'indefinite'} days. Reason: ${reason}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(suspension);
    } catch (error) {
      console.error('Error suspending user:', error);
      res.status(500).json({ message: 'Failed to suspend user' });
    }
  }

  /**
   * Permanently ban a user
   */
  static async banUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { groupId, reason } = req.body;
      const adminId = req.user.id;
      
      // Validate input
      if (!reason) {
        return res.status(400).json({ message: 'Reason is required' });
      }
      
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If group provided, check if it exists
      let groupIdParsed = null;
      if (groupId) {
        groupIdParsed = parseInt(groupId);
        const group = await GroupModel.findById(groupIdParsed);
        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }
      }
      
      const ban = await UserSuspension.banUser({
        userId,
        groupId: groupIdParsed,
        adminId,
        reason
      });
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'ban_user',
        targetUserId: userId,
        targetGroupId: groupIdParsed,
        actionDetails: `Permanently banned user. Reason: ${reason}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(ban);
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({ message: 'Failed to ban user' });
    }
  }

  /**
   * Remove a suspension
   */
  static async removeSuspension(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { suspensionId } = req.body;
      const adminId = req.user.id;
      
      if (!suspensionId) {
        return res.status(400).json({ message: 'Suspension ID is required' });
      }
      
      const removedSuspension = await UserSuspension.remove(suspensionId);
      if (!removedSuspension) {
        return res.status(404).json({ message: 'Suspension not found or already inactive' });
      }
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'remove_suspension',
        targetUserId: userId,
        actionDetails: `Removed suspension #${suspensionId}`,
        ipAddress: req.ip
      });
      
      res.json(removedSuspension);
    } catch (error) {
      console.error('Error removing suspension:', error);
      res.status(500).json({ message: 'Failed to remove suspension' });
    }
  }

  /**
   * Warn a user
   */
  static async warnUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { groupId, warningMessage } = req.body;
      const adminId = req.user.id;
      
      // Validate input
      if (!warningMessage) {
        return res.status(400).json({ message: 'Warning message is required' });
      }
      
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If group provided, check if it exists
      let groupIdParsed = null;
      if (groupId) {
        groupIdParsed = parseInt(groupId);
        const group = await GroupModel.findById(groupIdParsed);
        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }
      }
      
      const warning = await UserWarning.create({
        userId,
        adminId,
        warningMessage,
        groupId: groupIdParsed
      });
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'warn_user',
        targetUserId: userId,
        targetGroupId: groupIdParsed,
        actionDetails: `Issued warning: ${warningMessage}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(warning);
    } catch (error) {
      console.error('Error warning user:', error);
      res.status(500).json({ message: 'Failed to warn user' });
    }
  }

  /**
   * Get reports involving a user
   */
  static async getUserReports(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { page = 1, limit = 20 } = req.query;
      
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const result = await ContentReport.getByUser(userId, parseInt(page), parseInt(limit));
      
      res.json(result);
    } catch (error) {
      console.error('Error getting user reports:', error);
      res.status(500).json({ message: 'Failed to get user reports' });
    }
  }

  /**
   * Get archived messages
   */
  static async getArchivedMessages(req, res) {
    try {
      const { 
        groupId, 
        senderId, 
        deletedById,
        dateFrom,
        dateTo,
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Build filters object
      const filters = {};
      if (groupId) filters.groupId = parseInt(groupId);
      if (senderId) filters.senderId = parseInt(senderId);
      if (deletedById) filters.deletedById = parseInt(deletedById);
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      
      const result = await MessageArchive.getArchivedMessages(
        filters, parseInt(page), parseInt(limit)
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error getting archived messages:', error);
      res.status(500).json({ message: 'Failed to get archived messages' });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req, res) {
    try {
      const messageId = parseInt(req.params.id);
      const { reason } = req.body;
      const adminId = req.user.id;
      
      // Validate input
      if (!reason) {
        return res.status(400).json({ message: 'Reason is required' });
      }
      
      // Get message details before deletion
      const message = await MessageModel.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Archive the message
      await MessageArchive.archiveMessage({
        originalMessageId: messageId,
        senderId: message.sender_id,
        groupId: message.group_id,
        content: message.content,
        deletedById: adminId,
        deletionReason: reason
      });
      
      // Delete the message
      await MessageModel.delete(messageId);
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'delete_message',
        targetUserId: message.sender_id,
        targetGroupId: message.group_id,
        targetMessageId: messageId,
        actionDetails: `Deleted message. Reason: ${reason}`,
        ipAddress: req.ip
      });
      
      res.json({ message: 'Message deleted and archived successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Failed to delete message' });
    }
  }

  /**
   * Restore a deleted message
   */
  static async restoreMessage(req, res) {
    try {
      const archiveId = parseInt(req.params.id);
      const adminId = req.user.id;
      
      // Get archived message
      const archivedMessage = await MessageArchive.getById(archiveId);
      if (!archivedMessage) {
        return res.status(404).json({ message: 'Archived message not found' });
      }
      
      // Restore the message
      const restoredMessage = await MessageModel.create({
        senderId: archivedMessage.sender_id,
        groupId: archivedMessage.group_id,
        content: archivedMessage.content
      });
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'restore_message',
        targetUserId: archivedMessage.sender_id,
        targetGroupId: archivedMessage.group_id,
        targetMessageId: restoredMessage.message_id,
        actionDetails: `Restored message from archive #${archiveId}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(restoredMessage);
    } catch (error) {
      console.error('Error restoring message:', error);
      res.status(500).json({ message: 'Failed to restore message' });
    }
  }

  /**
   * Admin joins a group (for monitoring)
   */
  static async joinGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const adminId = req.user.id;
      
      // Check if group exists
      const group = await GroupModel.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      // Check if admin is already a member
      const isMember = await GroupModel.isMember(groupId, adminId);
      if (isMember) {
        return res.status(400).json({ message: 'Already a member of this group' });
      }
      
      // Join the group
      await GroupModel.addMember(groupId, adminId);
      
      // Add admin privilege to the admin user in the group
      await GroupModel.setAdminStatus(groupId, adminId, true);
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'join_group_as_admin',
        targetGroupId: groupId,
        actionDetails: 'Joined group as admin for monitoring',
        ipAddress: req.ip
      });
      
      res.json({ message: 'Joined group successfully as admin' });
    } catch (error) {
      console.error('Error joining group as admin:', error);
      res.status(500).json({ message: 'Failed to join group' });
    }
  }

  /**
   * Feature a group
   */
  static async featureGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const adminId = req.user.id;
      
      // Check if group exists
      const group = await GroupModel.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      // Set featured status
      await GroupModel.setFeatured(groupId, true);
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'feature_group',
        targetGroupId: groupId,
        actionDetails: 'Set group as featured',
        ipAddress: req.ip
      });
      
      res.json({ message: 'Group is now featured' });
    } catch (error) {
      console.error('Error featuring group:', error);
      res.status(500).json({ message: 'Failed to feature group' });
    }
  }

  /**
   * Unfeature a group
   */
  static async unfeatureGroup(req, res) {
    try {
      const groupId = parseInt(req.params.id);
      const adminId = req.user.id;
      
      // Check if group exists
      const group = await GroupModel.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      // Remove featured status
      await GroupModel.setFeatured(groupId, false);
      
      // Log admin activity
      await AdminActivityLog.create({
        adminId,
        actionType: 'unfeature_group',
        targetGroupId: groupId,
        actionDetails: 'Removed featured status from group',
        ipAddress: req.ip
      });
      
      res.json({ message: 'Group is no longer featured' });
    } catch (error) {
      console.error('Error unfeaturing group:', error);
      res.status(500).json({ message: 'Failed to unfeature group' });
    }
  }

  /**
   * Get admin activity logs
   */
  static async getActivityLogs(req, res) {
    try {
      const { 
        adminId, 
        actionType, 
        targetUserId,
        targetGroupId,
        dateFrom,
        dateTo,
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Build filters object
      const filters = {};
      if (adminId) filters.adminId = parseInt(adminId);
      if (actionType) filters.actionType = actionType;
      if (targetUserId) filters.targetUserId = parseInt(targetUserId);
      if (targetGroupId) filters.targetGroupId = parseInt(targetGroupId);
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      
      const result = await AdminActivityLog.getAll(
        filters, parseInt(page), parseInt(limit)
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ message: 'Failed to get activity logs' });
    }
  }

  /**
   * Get moderation metrics
   */
  static async getModerationMetrics(req, res) {
    try {
      const metrics = await ContentReport.getMetrics();
      
      // Get action counts for admins
      let adminStats = [];
      const { dateFrom, dateTo } = req.query;
      
      if (dateFrom && dateTo) {
        adminStats = await AdminActivityLog.getActionCountsByAdmin(dateFrom, dateTo);
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        adminStats = await AdminActivityLog.getActionCountsByAdmin(
          thirtyDaysAgo.toISOString().split('T')[0], 
          new Date().toISOString().split('T')[0]
        );
      }
      
      res.json({
        metrics,
        adminStats
      });
    } catch (error) {
      console.error('Error getting moderation metrics:', error);
      res.status(500).json({ message: 'Failed to get moderation metrics' });
    }
  }
}

module.exports = AdminController;