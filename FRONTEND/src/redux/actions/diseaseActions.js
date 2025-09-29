import { 
  DETECTION_REQUEST, 
  DETECTION_SUCCESS, 
  DETECTION_FAILURE,
  GET_DETECTION_HISTORY,
  ADD_DETECTION_TO_HISTORY,
  DELETE_DETECTION
} from '../types';
import apiService from '../../services/api';

// Detect disease from image
export const detectDisease = (imageData) => {
  return async (dispatch) => {
    dispatch({ type: DETECTION_REQUEST });
    
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      
      const response = await apiService.diseases.detect(formData);
      
      dispatch({
        type: DETECTION_SUCCESS,
        payload: response.data
      });
      
      // Add to history
      dispatch({
        type: ADD_DETECTION_TO_HISTORY,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: DETECTION_FAILURE,
        payload: error.response?.data?.message || 'Failed to detect disease. Please try again.'
      });
      throw error;
    }
  };
};

// Get detection history
export const getDetectionHistory = (params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiService.diseases.getHistory(params);
      
      dispatch({
        type: GET_DETECTION_HISTORY,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Get detection details
export const getDetectionDetails = (id) => {
  return async () => {
    try {
      const response = await apiService.diseases.getDetails(id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Delete detection from history
export const deleteDetection = (id) => {
  return async (dispatch) => {
    try {
      await apiService.diseases.deleteDetection(id);
      
      dispatch({
        type: DELETE_DETECTION,
        payload: id
      });
    } catch (error) {
      throw error;
    }
  };
};