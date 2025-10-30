// Import environment variables
import { getEnv } from '../utils/env';

// API Configuration
// Options:
// 1) If using ADB reverse (recommended):
//    Run: adb reverse tcp:3001 tcp:3001, then use http://localhost:3001 from the device
// 2) If on same Wi‑Fi without ADB reverse:
//    Use your computer's LAN IP (e.g., http://192.168.x.x:3001)
// You can override via environment variables API_URL and SOCKET_URL
export const API_URL = getEnv('API_URL', 'http://localhost:3001/api');
export const SOCKET_URL = getEnv('SOCKET_URL', 'http://localhost:3001');

// Gemini API Configuration
export const GEMINI_API_KEY = getEnv('GEMINI_API_KEY', '');
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// App Constants
export const APP_NAME = 'Smart Farmer';
export const APP_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  LANGUAGE: '@language',
  THEME: '@theme',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  LAST_SYNC: '@last_sync',
  APP_SETTINGS: '@app_settings',
};

// App Limits
export const LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_LENGTH: 60, // seconds
  MAX_GROUP_MEMBERS: 100,
  MAX_MESSAGE_LENGTH: 1000,
};

// Features flags
export const FEATURES = {
  DISEASE_DETECTION: true,
  GROUP_CHAT: true,
  OFFLINE_MODE: true,
  ADVISORY_SERVICE: true,
  WEATHER_ALERTS: true,
  MARKET_PRICES: false, // Coming soon
  VOICE_ASSISTANT: false, // Coming soon
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_WEAK: 'Password must be at least 8 characters with numbers and letters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  PHONE_INVALID: 'Please enter a valid phone number.',
};

// Timeouts
export const TIMEOUTS = {
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
};