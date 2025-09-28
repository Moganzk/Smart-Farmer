// test/api-test.js
const axios = require('axios');
const chalk = require('chalk'); // For colorful console output

// API base URL
const API_URL = 'http://localhost:3000';

// Store the token after login
let token = '';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

// Utility to log success/failure
const logResult = (testName, success, response = null, error = null) => {
  if (success) {
    console.log(chalk.green(`✓ ${testName}: Success`));
    if (response && process.env.DEBUG) {
      console.log(chalk.gray('Response:'), response.data);
    }
  } else {
    console.log(chalk.red(`✗ ${testName}: Failed`));
    if (error) {
      console.log(chalk.red('Error:'), error.response?.data || error.message);
    }
  }
};

// Create a test user account
const createTestUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username: 'testuser',
      email: TEST_USER.email,
      password: TEST_USER.password,
      role: 'farmer'
    });
    logResult('Create test user', true, response);
    return response.data;
  } catch (error) {
    // If user already exists, it's fine
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(chalk.yellow('Test user already exists, proceeding with login'));
      return { success: true };
    }
    logResult('Create test user', false, null, error);
    throw error;
  }
};

// Login with test user
const login = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    token = response.data.token;
    logResult('Login', true, response);
    return response.data;
  } catch (error) {
    logResult('Login', false, null, error);
    throw error;
  }
};

// Test get user profile
const testGetProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Get Profile', true, response);
    return response.data;
  } catch (error) {
    logResult('Get Profile', false, null, error);
    throw error;
  }
};

// Test update user profile
const testUpdateProfile = async () => {
  try {
    const response = await axios.put(`${API_URL}/api/profile`, 
    {
      full_name: 'Test User',
      bio: 'This is a test profile',
      location: 'Test Location',
      expertise: 'Testing'
    },
    {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Update Profile', true, response);
    return response.data;
  } catch (error) {
    logResult('Update Profile', false, null, error);
    throw error;
  }
};

// Test get user settings
const testGetSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Get Settings', true, response);
    return response.data;
  } catch (error) {
    logResult('Get Settings', false, null, error);
    throw error;
  }
};

// Test update notification preferences
const testUpdateNotificationSettings = async () => {
  try {
    const response = await axios.put(`${API_URL}/api/settings/notification`, 
    {
      push_enabled: false,
      email_enabled: true,
      detection_results: true,
      group_messages: false,
      system_updates: true,
      warnings: true
    },
    {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Update Notification Settings', true, response);
    return response.data;
  } catch (error) {
    logResult('Update Notification Settings', false, null, error);
    throw error;
  }
};

// Test reset settings
const testResetSettings = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/reset/notification_preferences`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Reset Settings', true, response);
    return response.data;
  } catch (error) {
    logResult('Reset Settings', false, null, error);
    throw error;
  }
};

// Test get notifications
const testGetNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Get Notifications', true, response);
    return response.data;
  } catch (error) {
    logResult('Get Notifications', false, null, error);
    throw error;
  }
};

// Test mark notifications as read
const testMarkNotificationsAsRead = async () => {
  try {
    const response = await axios.put(`${API_URL}/api/notifications/read`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logResult('Mark Notifications As Read', true, response);
    return response.data;
  } catch (error) {
    logResult('Mark Notifications As Read', false, null, error);
    throw error;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log(chalk.blue('=== Starting API Tests ==='));
  
  try {
    await createTestUser();
    await login();
    await testGetProfile();
    await testUpdateProfile();
    await testGetSettings();
    await testUpdateNotificationSettings();
    await testResetSettings();
    await testGetNotifications();
    await testMarkNotificationsAsRead();
    
    console.log(chalk.green('\n=== All Tests Completed ==='));
  } catch (error) {
    console.log(chalk.red('\n=== Tests Failed ==='));
    console.log(chalk.red('Error:'), error.message);
  }
};

// Run the tests
runAllTests();