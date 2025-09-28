/**
 * Group Service
 * 
 * Provides methods for interacting with the group-related API endpoints
 */

import api from '../utils/api';

export class GroupService {
  /**
   * Create a new group
   * @param {object} groupData - Group data (name, description)
   * @returns {Promise<object>} Created group
   */
  static async createGroup(groupData) {
    try {
      const response = await api.post('/api/groups', groupData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all groups for the current user
   * @returns {Promise<Array>} User's groups
   */
  static async getUserGroups() {
    try {
      const response = await api.get('/api/groups');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get a group by ID
   * @param {number} groupId - Group ID
   * @returns {Promise<object>} Group data
   */
  static async getGroupById(groupId) {
    try {
      const response = await api.get(`/api/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Search for groups by term
   * @param {string} term - Search term
   * @param {object} params - Additional parameters (limit, offset)
   * @returns {Promise<Array>} Search results
   */
  static async searchGroups(term, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        term,
        ...params
      });
      
      const response = await api.get(`/api/groups/search?${queryParams}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching groups:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get popular groups
   * @param {number} limit - Number of groups to return (default: 10)
   * @returns {Promise<Array>} Popular groups
   */
  static async getPopularGroups(limit = 10) {
    try {
      const response = await api.get(`/api/groups/popular?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching popular groups:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Join a group
   * @param {number} groupId - Group ID
   * @returns {Promise<object>} Result
   */
  static async joinGroup(groupId) {
    try {
      const response = await api.post(`/api/groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      console.error(`Error joining group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Leave a group
   * @param {number} groupId - Group ID
   * @returns {Promise<object>} Result
   */
  static async leaveGroup(groupId) {
    try {
      const response = await api.delete(`/api/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error(`Error leaving group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get group members
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Group members
   */
  static async getGroupMembers(groupId) {
    try {
      const response = await api.get(`/api/groups/${groupId}/members`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Make a user an admin
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID to make admin
   * @returns {Promise<object>} Result
   */
  static async makeAdmin(groupId, userId) {
    try {
      const response = await api.post(`/api/groups/${groupId}/admins`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error making user ${userId} admin in group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Remove admin role from a user
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID to remove admin
   * @returns {Promise<object>} Result
   */
  static async removeAdmin(groupId, userId) {
    try {
      const response = await api.delete(`/api/groups/${groupId}/admins`, { 
        data: { userId } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing admin role from user ${userId} in group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  static handleError(error) {
    if (error.response && error.response.data) {
      const { message } = error.response.data;
      return new Error(message || 'An error occurred');
    }
    return error;
  }
}

export default GroupService;