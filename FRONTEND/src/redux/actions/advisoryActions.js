import { 
  FETCH_ADVISORY_CATEGORIES, 
  FETCH_ADVISORY_CONTENT, 
  SEARCH_ADVISORY, 
  FETCH_FEATURED_CONTENT,
  TOGGLE_SAVE_CONTENT
} from '../types';
import apiService from '../../services/api';

// Get advisory categories
export const getAdvisoryCategories = () => {
  return async (dispatch) => {
    try {
      const response = await apiService.advisory.getCategories();
      
      dispatch({
        type: FETCH_ADVISORY_CATEGORIES,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Get advisory content by category
export const getAdvisoryContent = (categoryId, params = {}) => {
  return async (dispatch) => {
    try {
      const response = await apiService.advisory.getContent(categoryId, params);
      
      dispatch({
        type: FETCH_ADVISORY_CONTENT,
        payload: {
          categoryId,
          content: response.data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Search advisory content
export const searchAdvisory = (query) => {
  return async (dispatch) => {
    try {
      const response = await apiService.advisory.search(query);
      
      dispatch({
        type: SEARCH_ADVISORY,
        payload: {
          query,
          results: response.data
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Get featured advisory content
export const getFeaturedContent = () => {
  return async (dispatch) => {
    try {
      const response = await apiService.advisory.getFeatured();
      
      dispatch({
        type: FETCH_FEATURED_CONTENT,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};

// Toggle save/unsave content
export const toggleSaveContent = (contentId) => {
  return async (dispatch) => {
    try {
      const response = await apiService.advisory.toggleSave(contentId);
      
      dispatch({
        type: TOGGLE_SAVE_CONTENT,
        payload: {
          contentId,
          isSaved: response.data.isSaved
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};