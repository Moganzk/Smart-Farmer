import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Load environment variables using Expo Constants
let envConfig = {};
try {
  if (Platform.OS !== 'web') {
    // On native platforms, use Expo Constants for environment variables
    envConfig = Constants.expoConfig?.extra || {};
    // Also include any environment variables passed through the build process
    if (process.env) {
      envConfig = { ...envConfig, ...process.env };
    }
  } else {
    // For web, environment variables should be exposed through process.env by Webpack
    envConfig = process.env;
  }
} catch (error) {
  console.warn('Error loading environment variables:', error);
  // Fallback to process.env if available
  envConfig = process.env || {};
}

export const getEnv = (key, defaultValue = '') => {
  return envConfig[key] || defaultValue;
};