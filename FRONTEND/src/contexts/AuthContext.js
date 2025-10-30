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
          } else {
            // Token expired, clear it
            await AsyncStorage.removeItem('@auth_token');
          }
        }
        // No valid token
        setIsAuthenticated(false);
        setUser(null);
      } catch (error) {
        console.error('❌ AuthContext: Error checking authentication:', error);
        // Clear potentially corrupted token
        await AsyncStorage.removeItem('@auth_token');
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
  const loadUser = async (token, decodedToken = null, userDataFromResponse = null) => {
    try {
      if (!decodedToken) {
        decodedToken = jwtDecode(token);
      }

      let userData = userDataFromResponse;
      
      // If no response data provided, try to load from database
      if (!userData && isDbReady) {
        const userId = decodedToken.userId || decodedToken.sub || decodedToken.id;
        
        if (userId) {
          console.log('🔍 AuthContext: Loading user from database, userId:', userId);
          
          try {
            const result = await executeQuery(
              'SELECT id, name, email, phone, role FROM users WHERE id = ?;',
              [userId]
            );
            
            if (result?.rows?.length > 0) {
              const dbUser = result.rows[0];
              userData = {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                phone: dbUser.phone,
                role: dbUser.role,
              };
              console.log('✅ AuthContext: User loaded from database:', userData);
            }
          } catch (dbError) {
            console.error('❌ Error loading user from database:', dbError);
          }
        }
      }
      
      // Fallback to minimal data from token if still no userData
      if (!userData) {
        userData = {
          id: decodedToken.userId || decodedToken.sub || decodedToken.id,
          name: decodedToken.name || decodedToken.fullName || 'User',
          email: decodedToken.email || '',
          phone: decodedToken.phone || decodedToken.phoneNumber || '',
          role: decodedToken.role || 'farmer',
        };
      }

      // Ensure all required fields have values (prevent NULL constraints)
      userData = {
        id: userData.id,
        name: userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'farmer',
      };

      console.log('🔍 AuthContext: Loading user data:', userData);

      // Save to state
      setUser(userData);
      setIsAuthenticated(true);

      // Save to database if connected
      if (isDbReady && userData.id) {
        const now = Date.now();
        
        try {
          // Check if user exists in local DB
          const existingUserResult = await executeQuery(
            'SELECT id FROM users WHERE id = ?;',
            [userData.id]
          );
          
          if (existingUserResult?.rows?.length > 0) {
            // Update existing user (only non-null values)
            await executeQuery(
              'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, updated_at = ? WHERE id = ?;',
              [
                userData.name || 'User', 
                userData.email || '', 
                userData.phone || '', 
                userData.role || 'farmer', 
                now, 
                userData.id
              ]
            );
            console.log('✅ AuthContext: User updated in database');
          } else {
            // Insert new user with default values for NOT NULL columns
            await executeQuery(
              'INSERT INTO users (id, name, email, phone, profile_image, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
              [
                userData.id, 
                userData.name || 'User', 
                userData.email || '', 
                userData.phone || '', 
                null, 
                userData.role || 'farmer', 
                now, 
                now
              ]
            );
            console.log('✅ AuthContext: User inserted into database');
          }
        } catch (dbError) {
          console.error('❌ AuthContext: Error saving user to database:', dbError);
          // Don't fail authentication if database save fails
        }
      }

      return userData;
    } catch (error) {
      console.error('❌ AuthContext: Error loading user:', error);
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
      
      const { token, user: userFromResponse } = response.data.data; // Backend returns { data: { user, token } }
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('🔍 AuthContext: User from login response:', userFromResponse);
      
      await AsyncStorage.setItem('@auth_token', token);
      setAuthToken(token);
      
      // Pass user data from response to avoid decoding issues
      const userData = {
        id: userFromResponse.user_id,
        name: userFromResponse.full_name || userFromResponse.name || 'User',
        email: userFromResponse.email || '',
        phone: userFromResponse.phone_number || userFromResponse.phone || '',
        role: userFromResponse.role || 'farmer',
      };
      
      const user = await loadUser(token, null, userData);
      return { success: true, user };
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
      console.log('🔍 AuthContext: Starting registration...', { email: userData.email });
      console.log('🔍 AuthContext: Registration data:', JSON.stringify(userData, null, 2));
      
      // In a real app, this would make an API request
      const response = await api.post('/auth/register', userData);
      
      console.log('✅ AuthContext: Registration successful');
      
      const { token, user: userFromResponse } = response.data.data; // Backend returns { data: { user, token } }
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('🔍 AuthContext: User from response:', userFromResponse);
      
      await AsyncStorage.setItem('@auth_token', token);
      setAuthToken(token);
      
      // Pass user data from response to avoid decoding issues
      const registeredUserData = {
        id: userFromResponse.user_id,
        name: userFromResponse.full_name || userFromResponse.name || 'User',
        email: userFromResponse.email || '',
        phone: userFromResponse.phone_number || userFromResponse.phone || '',
        role: userFromResponse.role || 'farmer',
      };
      
      const user = await loadUser(token, null, registeredUserData);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Log validation errors if available
      if (error.response?.data?.error?.details) {
        console.error('❌ Validation errors:', JSON.stringify(error.response.data.error.details, null, 2));
      }
      
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.response) {
        // Check for validation errors
        if (error.response.data?.error?.details && Array.isArray(error.response.data.error.details)) {
          const validationErrors = error.response.data.error.details
            .map(err => `${err.path || err.param}: ${err.msg}`)
            .join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else {
          errorMessage = error.response.data?.error?.message || error.response.data?.message || 'Registration failed';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage
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