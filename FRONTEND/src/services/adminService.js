// src/services/adminService.js
import api from './api';

export const adminService = {
  /**
   * Get reports with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Reports with count
   */
  async getReports(filters = {}) {
    try {
      const response = await api.get('/admin/reports', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  /**
   * Get a specific report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} Report details
   */
  async getReportById(reportId) {
    try {
      const response = await api.get(`/admin/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  /**
   * Update report status
   * @param {number} reportId - Report ID
   * @param {string} status - New status
   * @param {string} notes - Resolution notes
   * @returns {Promise<Object>} Updated report
   */
  async updateReportStatus(reportId, status, notes) {
    try {
      const response = await api.put(`/admin/reports/${reportId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  /**
   * Suspend a user
   * @param {number} userId - User ID
   * @param {number} groupId - Optional group ID
   * @param {string} reason - Suspension reason
   * @param {number} durationDays - Suspension duration in days
   * @returns {Promise<Object>} Suspension details
   */
  async suspendUser(userId, groupId, reason, durationDays) {
    try {
      const response = await api.post(`/admin/users/${userId}/suspend`, {
        groupId,
        reason,
        durationDays
      });
      return response.data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  /**
   * Ban a user permanently
   * @param {number} userId - User ID
   * @param {number} groupId - Optional group ID
   * @param {string} reason - Ban reason
   * @returns {Promise<Object>} Ban details
   */
  async banUser(userId, groupId, reason) {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`, {
        groupId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  /**
   * Remove a suspension
   * @param {number} userId - User ID
   * @param {number} suspensionId - Suspension ID
   * @returns {Promise<Object>} Updated suspension
   */
  async removeSuspension(userId, suspensionId) {
    try {
      const response = await api.delete(`/admin/users/${userId}/suspension`, {
        data: { suspensionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing suspension:', error);
      throw error;
    }
  },

  /**
   * Warn a user
   * @param {number} userId - User ID
   * @param {number} groupId - Optional group ID
   * @param {string} warningMessage - Warning message
   * @returns {Promise<Object>} Warning details
   */
  async warnUser(userId, groupId, warningMessage) {
    try {
      const response = await api.post(`/admin/users/${userId}/warn`, {
        groupId,
        warningMessage
      });
      return response.data;
    } catch (error) {
      console.error('Error warning user:', error);
      throw error;
    }
  },

  /**
   * Get reports for a specific user
   * @param {number} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} Reports with count
   */
  async getUserReports(userId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/admin/users/${userId}/reports`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  },

  /**
   * Get archived messages
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Archived messages with count
   */
  async getArchivedMessages(filters = {}) {
    try {
      const response = await api.get('/admin/messages/archived', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived messages:', error);
      throw error;
    }
  },

  /**
   * Delete a message
   * @param {number} messageId - Message ID
   * @param {string} reason - Deletion reason
   * @returns {Promise<Object>} Result
   */
  async deleteMessage(messageId, reason) {
    try {
      const response = await api.post(`/admin/messages/${messageId}/delete`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Restore a deleted message
   * @param {number} archiveId - Archive ID
   * @returns {Promise<Object>} Restored message
   */
  async restoreMessage(archiveId) {
    try {
      const response = await api.post(`/admin/messages/${archiveId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring message:', error);
      throw error;
    }
  },

  /**
   * Join a group as admin
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Result
   */
  async joinGroup(groupId) {
    try {
      const response = await api.post(`/admin/groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  /**
   * Feature a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Result
   */
  async featureGroup(groupId) {
    try {
      const response = await api.post(`/admin/groups/${groupId}/feature`);
      return response.data;
    } catch (error) {
      console.error('Error featuring group:', error);
      throw error;
    }
  },

  /**
   * Unfeature a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Result
   */
  async unfeatureGroup(groupId) {
    try {
      const response = await api.delete(`/admin/groups/${groupId}/feature`);
      return response.data;
    } catch (error) {
      console.error('Error unfeaturing group:', error);
      throw error;
    }
  },

  /**
   * Get admin activity logs
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Activity logs with count
   */
  async getActivityLogs(filters = {}) {
    try {
      const response = await api.get('/admin/activity-log', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  /**
   * Get moderation metrics
   * @param {string} dateFrom - Optional start date
   * @param {string} dateTo - Optional end date
   * @returns {Promise<Object>} Metrics
   */
  async getMetrics(dateFrom, dateTo) {
    try {
      const response = await api.get('/admin/metrics', {
        params: { dateFrom, dateTo }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  /**
   * Get user suspensions
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Suspensions with count
   */
  async getSuspensions(filters = {}) {
    // This endpoint doesn't exist directly in our API, so we simulate it with admin activity logs
    try {
      // We use a query that filters by suspension actions
      const params = { ...filters, actionType: 'suspend_user' };
      const response = await api.get('/admin/activity-log', { params });
      
      // Transform the data to match the expected format
      const suspensions = response.data.logs.map(log => ({
        suspension_id: log.log_id,
        user_id: log.target_user_id,
        user_username: log.target_username,
        admin_id: log.admin_id,
        admin_username: log.admin_username,
        reason: log.action_details,
        created_at: log.created_at,
        is_active: true,
        group_id: log.target_group_id,
        group_name: log.group_name,
        end_date: null // We don't have this information directly
      }));
      
      return {
        suspensions,
        totalCount: response.data.totalCount
      };
    } catch (error) {
      console.error('Error fetching suspensions:', error);
      throw error;
    }
  }
};

export default adminService;