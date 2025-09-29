import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LOGIN_REQUEST, 
  LOGIN_SUCCESS, 
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT,
  UPDATE_USER
} from '../types';
import apiService from '../../services/api';
import { STORAGE_KEYS } from '../../constants/config';

// Login action
export const login = (email, password) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    
    try {
      const response = await apiService.auth.login({ email, password });
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: response.data.user
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Failed to login. Please check your credentials.'
      });
      throw error;
    }
  };
};

// Register action
export const register = (userData) => {
  return async (dispatch) => {
    dispatch({ type: REGISTER_REQUEST });
    
    try {
      const response = await apiService.auth.register(userData);
      
      dispatch({
        type: REGISTER_SUCCESS,
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: REGISTER_FAILURE,
        payload: error.response?.data?.message || 'Registration failed. Please try again.'
      });
      throw error;
    }
  };
};

// Logout action
export const logout = () => {
  return async (dispatch) => {
    // Clear stored data
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    dispatch({ type: LOGOUT });
  };
};

// Update user profile action
export const updateUserProfile = (userData) => {
  return async (dispatch) => {
    try {
      const response = await apiService.user.updateProfile(userData);
      
      // Update stored user data
      const currentUserData = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA));
      const updatedUserData = { ...currentUserData, ...response.data };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
      
      dispatch({
        type: UPDATE_USER,
        payload: updatedUserData
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };
};