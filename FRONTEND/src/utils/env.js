import * as dotenv from 'dotenv';
import { Platform } from 'react-native';

// Load environment variables
let envConfig = {};
try {
  if (Platform.OS !== 'web') {
    // On native platforms, use the existing dotenv package
    dotenv.config();
    envConfig = process.env;
  } else {
    // For web, environment variables should be exposed through process.env by Webpack
    envConfig = process.env;
  }
} catch (error) {
  console.warn('Error loading environment variables:', error);
}

export const getEnv = (key, defaultValue = '') => {
  return envConfig[key] || defaultValue;
};