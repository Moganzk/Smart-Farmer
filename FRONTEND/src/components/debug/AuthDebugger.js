import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AuthDebugger = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@user_data');
      console.log('🔧 Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const clearOnboardingData = async () => {
    try {
      await AsyncStorage.removeItem('@onboarding_completed');
      console.log('🔧 Onboarding data cleared');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Auth Debug Panel
      </Text>
      
      <Text style={[styles.text, { color: theme.colors.text }]}>
        isLoading: {isLoading ? 'true' : 'false'}
      </Text>
      
      <Text style={[styles.text, { color: theme.colors.text }]}>
        isAuthenticated: {isAuthenticated ? 'true' : 'false'}
      </Text>
      
      <Text style={[styles.text, { color: theme.colors.text }]}>
        User: {user ? JSON.stringify(user, null, 2) : 'null'}
      </Text>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={clearAuthData}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textInverted }]}>
          Clear Auth Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.secondary }]}
        onPress={clearOnboardingData}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textInverted }]}>
          Clear Onboarding Data
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthDebugger;