import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { useDatabase } from './DatabaseContext';
import { api } from '../services/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  checkAuth: async () => {},
  resetPassword: async () => {},
  verifyCode: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const { executeQuery, isDbReady } = useDatabase();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp > currentTime) {
            // Token is valid
            setAuthToken(token);
            await loadUser(token, decodedToken);
            return;
          }
        }
        // No valid token
        setIsAuthenticated(false);
        setUser(null);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Set auth header when token changes
  useEffect(() => {
    if (authToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [authToken]);

  // Load user data
  const loadUser = async (token, decodedToken = null) => {
    try {
      if (!decodedToken) {
        decodedToken = jwtDecode(token);
      }

      // In a real app, you might want to fetch fresh user data from the server
      // For now, we'll use the data from the token
      const userData = {
        id: decodedToken.sub || decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        phone: decodedToken.phone,
        role: decodedToken.role || 'farmer',
      };

      // Save to state
      setUser(userData);
      setIsAuthenticated(true);

      // Save to database if connected
      if (isDbReady) {
        const now = Date.now();
        
        try {
          // Check if user exists in local DB
          const existingUserResult = await executeQuery(
            'SELECT id FROM users WHERE id = ?;',
            [userData.id]
          );
          
          if (existingUserResult?.rows?.length > 0) {
            // Update existing user
            await executeQuery(
              'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, updated_at = ? WHERE id = ?;',
              [userData.name, userData.email, userData.phone, userData.role, now, userData.id]
            );
          } else {
            // Insert new user
            await executeQuery(
              'INSERT INTO users (id, name, email, phone, profile_image, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
              [userData.id, userData.name, userData.email, userData.phone, null, userData.role, now, now]
            );
          }
        } catch (dbError) {
          console.error('Error saving user to database:', dbError);
        }
      }

      return userData;
    } catch (error) {
      console.error('Error loading user:', error);
      setIsAuthenticated(false);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API request
      const response = await api.post('/auth/login', { email, password });
      
      const { token } = response.data;
      await AsyncStorage.setItem('@auth_token', token);
      setAuthToken(token);
      
      const userData = await loadUser(token);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API request
      const response = await api.post('/auth/register', userData);
      
      const { token } = response.data;
      await AsyncStorage.setItem('@auth_token', token);
      setAuthToken(token);
      
      const user = await loadUser(token);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    setIsLoading(true);
    try {
      // In a real app, this would make an API request
      const response = await api.put('/profile', profileData);
      
      // Update user state
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);

      // Update local database
      if (isDbReady) {
        await executeQuery(
          'UPDATE users SET name = ?, email = ?, phone = ?, profile_image = ?, updated_at = ? WHERE id = ?;',
          [
            updatedUser.name, 
            updatedUser.email, 
            updatedUser.phone, 
            updatedUser.profile_image,
            Date.now(),
            user.id
          ]
        );
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status (refresh token, etc.)
  const checkAuth = async () => {
    if (!authToken) {
      return false;
    }

    try {
      // In a real app, this would validate the token with the server
      const response = await api.get('/auth/verify');
      return response.data.valid;
    } catch (error) {
      console.error('Auth check error:', error);
      // Token is invalid, logout
      logout();
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      // In a real app, this would make an API request
      await api.post('/auth/reset-password', { email });
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  };

  // Verify code (for phone verification, etc.)
  const verifyCode = async (phone, code) => {
    try {
      // In a real app, this would make an API request
      const response = await api.post('/auth/verify-code', { phone, code });
      
      if (response.data.token) {
        await AsyncStorage.setItem('@auth_token', response.data.token);
        setAuthToken(response.data.token);
        const userData = await loadUser(response.data.token);
        return { success: true, user: userData };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Code verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Verification failed'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        checkAuth,
        resetPassword,
        verifyCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};