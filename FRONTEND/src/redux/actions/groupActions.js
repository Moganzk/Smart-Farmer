import { 
  FETCH_USER_GROUPS, 
  CREATE_GROUP, 
  JOIN_GROUP, 
  LEAVE_GROUP,
  FETCH_GROUP_MESSAGES,
  SEND_GROUP_MESSAGE
} from '../types';
import apiService from '../../services/api';

// Get user's groups
export const getUserGroups = () => {
  return async (dispatch) => {
    try {
      const response = await apiService.groups.getMyGroups();
      
      dispatch({
        type: FETCH_USER_GROUPS,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Create a new group
export const createGroup = (groupData) => {
  return async (dispatch) => {
    try {
      const response = await apiService.groups.create(groupData);
      
      dispatch({
        type: CREATE_GROUP,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Join a group
export const joinGroup = (groupCode) => {
  return async (dispatch) => {
    try {
      const response = await apiService.groups.join(groupCode);
      
      dispatch({
        type: JOIN_GROUP,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Leave a group
export const leaveGroup = (groupId) => {
  return async (dispatch) => {
    try {
      await apiService.groups.leave(groupId);
      
      dispatch({
        type: LEAVE_GROUP,
        payload: groupId
      });
    } catch (error) {
      throw error;
    }
  };
};

// Get group messages
export const getGroupMessages = (groupId, params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiService.groups.getMessages(groupId, params);
      
      dispatch({
        type: FETCH_GROUP_MESSAGES,
        payload: {
          groupId,
          messages: response.data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Send a group message
export const sendGroupMessage = (groupId, message) => {
  return async (dispatch) => {
    try {
      const response = await apiService.groups.sendMessage(groupId, message);
      
      dispatch({
        type: SEND_GROUP_MESSAGE,
        payload: {
          groupId,
          message: response.data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};