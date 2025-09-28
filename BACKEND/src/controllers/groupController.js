/**
 * Group Controller
 * 
 * Handles all group-related HTTP requests
 */

const GroupService = require('../utils/groupService');
const logger = require('../utils/logger');

class GroupController {
  /**
   * Create a new group
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async create(req, res) {
    try {
      const { name, description } = req.body;
      const creatorId = req.user.id;
      
      const group = await GroupService.createGroup({
        name,
        description,
        creatorId
      });
      
      return res.status(201).json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error(`Error creating group: ${error.message}`);
      
      if (
        error.message.includes('already exists') ||
        error.message.includes('between 3 and 50')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create group'
      });
    }
  }
  
  /**
   * Get all groups for a user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getUserGroups(req, res) {
    try {
      const userId = req.user.id;
      const groups = await GroupService.getUserGroups(userId);
      
      return res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      logger.error(`Error getting user groups: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve groups'
      });
    }
  }
  
  /**
   * Search for groups
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async search(req, res) {
    try {
      const { term, limit = 20, offset = 0 } = req.query;
      
      if (!term) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }
      
      const groups = await GroupService.searchGroups(term, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      logger.error(`Error searching groups: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to search groups'
      });
    }
  }
  
  /**
   * Get popular groups
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getPopular(req, res) {
    try {
      const { limit = 10 } = req.query;
      const groups = await GroupService.getPopularGroups(parseInt(limit));
      
      return res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      logger.error(`Error getting popular groups: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve popular groups'
      });
    }
  }
  
  /**
   * Get group by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getById(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const group = await GroupService.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      
      return res.json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error(`Error getting group: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve group'
      });
    }
  }
  
  /**
   * Join a group
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async join(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = req.user.id;
      
      await GroupService.joinGroup(groupId, userId);
      
      return res.json({
        success: true,
        message: 'Successfully joined group'
      });
    } catch (error) {
      logger.error(`Error joining group: ${error.message}`);
      
      if (
        error.message.includes('already a member') ||
        error.message.includes('not found') ||
        error.message.includes('maximum member limit')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to join group'
      });
    }
  }
  
  /**
   * Leave a group
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async leave(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = req.user.id;
      
      await GroupService.leaveGroup(groupId, userId);
      
      return res.json({
        success: true,
        message: 'Successfully left group'
      });
    } catch (error) {
      logger.error(`Error leaving group: ${error.message}`);
      
      if (
        error.message.includes('not a member') ||
        error.message.includes('only admin')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to leave group'
      });
    }
  }
  
  /**
   * Get group members
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getMembers(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const members = await GroupService.getGroupMembers(groupId);
      
      return res.json({
        success: true,
        data: members
      });
    } catch (error) {
      logger.error(`Error getting group members: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve group members'
      });
    }
  }
  
  /**
   * Make a user an admin
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async makeAdmin(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const { userId } = req.body;
      const adminId = req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      await GroupService.makeAdmin(groupId, parseInt(userId), adminId);
      
      return res.json({
        success: true,
        message: 'User is now an admin'
      });
    } catch (error) {
      logger.error(`Error making user admin: ${error.message}`);
      
      if (
        error.message.includes('not a member') ||
        error.message.includes('already an admin') ||
        error.message.includes('Only group admins')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to make user admin'
      });
    }
  }
  
  /**
   * Remove admin role from a user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async removeAdmin(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const { userId } = req.body;
      const adminId = req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      await GroupService.removeAdmin(groupId, parseInt(userId), adminId);
      
      return res.json({
        success: true,
        message: 'Admin role removed from user'
      });
    } catch (error) {
      logger.error(`Error removing admin role: ${error.message}`);
      
      if (
        error.message.includes('not a member') ||
        error.message.includes('not an admin') ||
        error.message.includes('Only group admins') ||
        error.message.includes('Cannot remove yourself')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to remove admin role'
      });
    }
  }
}

module.exports = GroupController;