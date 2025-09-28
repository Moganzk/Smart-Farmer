/**
 * Group Service
 * 
 * Handles group creation, search, and management functionality
 */

const Group = require('../models/groupWithExtensions');
const logger = require('./logger');

class GroupService {
  /**
   * Create a new group
   * @param {object} groupData - Group data including name, description, creatorId
   * @returns {object} Created group
   */
  static async createGroup(groupData) {
    try {
      // Check for required fields
      const { name, description, creatorId } = groupData;
      
      if (!name || !creatorId) {
        throw new Error('Group name and creator ID are required');
      }
      
      // Validate name length (3-50 characters as per requirements)
      if (name.length < 3 || name.length > 50) {
        throw new Error('Group name must be between 3 and 50 characters');
      }
      
      // Check if a group with this name already exists
      const existingGroup = await Group.findByName(name);
      if (existingGroup) {
        throw new Error('A group with this name already exists');
      }
      
      // Create the group
      const group = await Group.create({
        name,
        description: description || '',
        creatorId
      });
      
      // Add the creator as first member and admin
      await Group.addMember(group.group_id, creatorId, true);
      
      return group;
    } catch (error) {
      logger.error(`Error creating group: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Search for groups by name or description
   * @param {string} searchTerm - Search term
   * @param {object} options - Search options (limit, offset)
   * @returns {array} Matching groups
   */
  static async searchGroups(searchTerm, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;
      
      if (!searchTerm) {
        return [];
      }
      
      // Search for groups
      const groups = await Group.search(searchTerm, limit, offset);
      return groups;
    } catch (error) {
      logger.error(`Error searching groups: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get popular groups
   * @param {number} limit - Number of groups to return
   * @returns {array} Popular groups
   */
  static async getPopularGroups(limit = 10) {
    try {
      const groups = await Group.findPopular(limit);
      return groups;
    } catch (error) {
      logger.error(`Error getting popular groups: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get groups for a user
   * @param {number} userId - User ID
   * @returns {array} User's groups
   */
  static async getUserGroups(userId) {
    try {
      const groups = await Group.findByUserId(userId);
      return groups;
    } catch (error) {
      logger.error(`Error getting user groups: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Join a group
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @returns {boolean} Success
   */
  static async joinGroup(groupId, userId) {
    try {
      // Check if user is already a member
      const isMember = await Group.isMember(groupId, userId);
      if (isMember) {
        throw new Error('User is already a member of this group');
      }
      
      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      // Check if group has reached member limit (100 as per requirements)
      const memberCount = await Group.getMemberCount(groupId);
      if (memberCount >= 100) {
        throw new Error('Group has reached maximum member limit');
      }
      
      // Add user to group
      await Group.addMember(groupId, userId, false);
      
      return true;
    } catch (error) {
      logger.error(`Error joining group: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Leave a group
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @returns {boolean} Success
   */
  static async leaveGroup(groupId, userId) {
    try {
      // Check if user is a member
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }
      
      // Check if user is the only admin
      const isAdmin = await Group.isAdmin(groupId, userId);
      if (isAdmin) {
        const adminCount = await Group.getAdminCount(groupId);
        if (adminCount === 1) {
          // User is the only admin, check if there are other members
          const memberCount = await Group.getMemberCount(groupId);
          if (memberCount > 1) {
            throw new Error('Cannot leave group: you are the only admin. Assign another admin first.');
          }
        }
      }
      
      // Remove user from group
      await Group.removeMember(groupId, userId);
      
      return true;
    } catch (error) {
      logger.error(`Error leaving group: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get group members
   * @param {number} groupId - Group ID
   * @returns {array} Group members
   */
  static async getGroupMembers(groupId) {
    try {
      const members = await Group.getMembers(groupId);
      return members;
    } catch (error) {
      logger.error(`Error getting group members: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Make a user an admin
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID to make admin
   * @param {number} adminId - ID of user making the change (must be admin)
   * @returns {boolean} Success
   */
  static async makeAdmin(groupId, userId, adminId) {
    try {
      // Check if requestor is admin
      const isRequestorAdmin = await Group.isAdmin(groupId, adminId);
      if (!isRequestorAdmin) {
        throw new Error('Only group admins can assign admin rights');
      }
      
      // Check if target user is a member
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }
      
      // Check if target user is already admin
      const isAlreadyAdmin = await Group.isAdmin(groupId, userId);
      if (isAlreadyAdmin) {
        throw new Error('User is already an admin');
      }
      
      // Make user admin
      await Group.updateMemberRole(groupId, userId, true);
      
      return true;
    } catch (error) {
      logger.error(`Error making user admin: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Remove admin role from a user
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID to remove admin
   * @param {number} adminId - ID of user making the change (must be admin)
   * @returns {boolean} Success
   */
  static async removeAdmin(groupId, userId, adminId) {
    try {
      // Check if requestor is admin
      const isRequestorAdmin = await Group.isAdmin(groupId, adminId);
      if (!isRequestorAdmin) {
        throw new Error('Only group admins can remove admin rights');
      }
      
      // Cannot remove yourself as admin
      if (userId === adminId) {
        throw new Error('Cannot remove yourself as admin');
      }
      
      // Check if target user is a member
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }
      
      // Check if target user is admin
      const isUserAdmin = await Group.isAdmin(groupId, userId);
      if (!isUserAdmin) {
        throw new Error('User is not an admin');
      }
      
      // Remove admin role
      await Group.updateMemberRole(groupId, userId, false);
      
      return true;
    } catch (error) {
      logger.error(`Error removing admin role: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GroupService;