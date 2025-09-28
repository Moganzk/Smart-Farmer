const Group = require('../../models/group');
const logger = require('../../utils/logger');

class GroupController {
  static async create(req, res) {
    try {
      const { name, description, cropFocus, maxMembers } = req.body;
      
      const group = await Group.create({
        name,
        description,
        createdBy: req.user.user_id,
        cropFocus,
        maxMembers
      });

      res.status(201).json({
        message: 'Group created successfully',
        data: { group }
      });
    } catch (error) {
      logger.error('Error creating group:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error creating group'
        }
      });
    }
  }

  static async getGroup(req, res) {
    try {
      const { groupId } = req.params;
      
      // Check if user is a member
      const isMember = await Group.isMember(groupId, req.user.user_id);
      if (!isMember) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be a group member.'
          }
        });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          error: {
            message: 'Group not found'
          }
        });
      }

      const members = await Group.listMembers(groupId);
      
      res.json({
        data: { 
          group,
          members
        }
      });
    } catch (error) {
      logger.error('Error getting group:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving group details'
        }
      });
    }
  }

  static async updateGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { name, description, cropFocus, maxMembers } = req.body;

      // Check if user is admin
      const isAdmin = await Group.isAdmin(groupId, req.user.user_id);
      if (!isAdmin) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Admin privileges required.'
          }
        });
      }

      const group = await Group.update(groupId, {
        name,
        description,
        cropFocus,
        maxMembers
      });

      if (!group) {
        return res.status(404).json({
          error: {
            message: 'Group not found'
          }
        });
      }

      res.json({
        message: 'Group updated successfully',
        data: { group }
      });
    } catch (error) {
      logger.error('Error updating group:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error updating group'
        }
      });
    }
  }

  static async deleteGroup(req, res) {
    try {
      const { groupId } = req.params;

      // Check if user is admin
      const isAdmin = await Group.isAdmin(groupId, req.user.user_id);
      if (!isAdmin) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Admin privileges required.'
          }
        });
      }

      const group = await Group.delete(groupId);
      if (!group) {
        return res.status(404).json({
          error: {
            message: 'Group not found'
          }
        });
      }

      res.json({
        message: 'Group deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting group:', error);
      res.status(500).json({
        error: {
          message: 'Error deleting group'
        }
      });
    }
  }

  static async addMember(req, res) {
    try {
      const { groupId } = req.params;
      const { userId, isAdmin } = req.body;

      // Check if user making request is admin
      const isRequestorAdmin = await Group.isAdmin(groupId, req.user.user_id);
      if (!isRequestorAdmin) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Admin privileges required.'
          }
        });
      }

      const member = await Group.addMember(groupId, userId, isAdmin);
      res.json({
        message: 'Member added successfully',
        data: { member }
      });
    } catch (error) {
      logger.error('Error adding member:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error adding member'
        }
      });
    }
  }

  static async removeMember(req, res) {
    try {
      const { groupId, userId } = req.params;

      // Check if user making request is admin or removing themselves
      const isAdmin = await Group.isAdmin(groupId, req.user.user_id);
      if (!isAdmin && req.user.user_id !== parseInt(userId)) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be admin or the member being removed.'
          }
        });
      }

      const member = await Group.removeMember(groupId, userId);
      if (!member) {
        return res.status(404).json({
          error: {
            message: 'Member not found'
          }
        });
      }

      res.json({
        message: 'Member removed successfully'
      });
    } catch (error) {
      logger.error('Error removing member:', error);
      res.status(500).json({
        error: {
          message: 'Error removing member'
        }
      });
    }
  }

  static async joinGroup(req, res) {
    try {
      const { groupId } = req.params;

      const member = await Group.addMember(groupId, req.user.user_id, false);
      res.json({
        message: 'Joined group successfully',
        data: { member }
      });
    } catch (error) {
      logger.error('Error joining group:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error joining group'
        }
      });
    }
  }

  static async leaveGroup(req, res) {
    try {
      const { groupId } = req.params;

      // Check if user is not the last admin
      const isAdmin = await Group.isAdmin(groupId, req.user.user_id);
      if (isAdmin) {
        const members = await Group.listMembers(groupId);
        const adminCount = members.filter(m => m.is_admin).length;
        if (adminCount === 1) {
          return res.status(400).json({
            error: {
              message: 'Cannot leave group. You are the last admin.'
            }
          });
        }
      }

      const member = await Group.removeMember(groupId, req.user.user_id);
      if (!member) {
        return res.status(404).json({
          error: {
            message: 'Not a member of this group'
          }
        });
      }

      res.json({
        message: 'Left group successfully'
      });
    } catch (error) {
      logger.error('Error leaving group:', error);
      res.status(500).json({
        error: {
          message: 'Error leaving group'
        }
      });
    }
  }

  static async searchGroups(req, res) {
    try {
      const { name, cropFocus, limit, offset } = req.query;
      const groups = await Group.search({ name, cropFocus, limit, offset });

      res.json({
        data: { groups }
      });
    } catch (error) {
      logger.error('Error searching groups:', error);
      res.status(500).json({
        error: {
          message: 'Error searching groups'
        }
      });
    }
  }

  static async getUserGroups(req, res) {
    try {
      const { limit, offset } = req.query;
      const groups = await Group.getUserGroups(req.user.user_id, { limit, offset });

      res.json({
        data: { groups }
      });
    } catch (error) {
      logger.error('Error getting user groups:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving user groups'
        }
      });
    }
  }
}

module.exports = GroupController;