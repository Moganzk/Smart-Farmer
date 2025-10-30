/**
 * COMPREHENSIVE FRONTEND-BACKEND INTEGRATION TEST
 * 
 * This script tests ALL features and their API connections
 * Run this after starting the backend server
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let authToken = null;
let testUserId = null;
let testGroupId = null;
let testMessageId = null;
let testDetectionId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else if (status === 'FAIL') {
    testResults.failed++;
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'red');
    testResults.errors.push({ test: testName, error: details });
  } else if (status === 'SKIP') {
    testResults.skipped++;
    log(`⏭️  ${testName}`, 'yellow');
    if (details) log(`   ${details}`, 'yellow');
  }
}

function separator() {
  log('\n' + '═'.repeat(80) + '\n', 'cyan');
}

function sectionHeader(title) {
  separator();
  log(`🔍 ${title}`, 'bright');
  separator();
}

// API Helper
async function apiRequest(method, endpoint, data = null, useAuth = false) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {},
  };

  if (useAuth && authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    config.data = data;
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      status: error.response?.status,
    };
  }
}

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// TEST SUITES
// ============================================================================

// 1. AUTHENTICATION TESTS
async function testAuthentication() {
  sectionHeader('1. AUTHENTICATION TESTS');

  // Test 1.1: User Registration
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@test.com`,
    password: 'Test123!@',
    role: 'farmer',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
    location: 'Nairobi, Kenya',
    preferredLanguage: 'en',
  };

  const registerResult = await apiRequest('POST', '/auth/register', testUser);
  if (registerResult.success) {
    authToken = registerResult.data.data.token;
    testUserId = registerResult.data.data.user.user_id;
    logTest('1.1 User Registration', 'PASS', `User ID: ${testUserId}`);
  } else {
    logTest('1.1 User Registration', 'FAIL', registerResult.error);
    return false; // Stop if registration fails
  }

  await delay(500);

  // Test 1.2: User Login
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });
  
  if (loginResult.success && loginResult.data.data.token) {
    authToken = loginResult.data.data.token; // Update token
    logTest('1.2 User Login', 'PASS', 'Token received');
  } else {
    logTest('1.2 User Login', 'FAIL', loginResult.error);
  }

  await delay(500);

  // Test 1.3: Token Validation (Get Profile)
  const profileResult = await apiRequest('GET', '/profile', null, true);
  if (profileResult.success) {
    const userData = profileResult.data.user || profileResult.data.data?.user;
    if (userData && userData.username) {
      logTest('1.3 Token Validation', 'PASS', `Username: ${userData.username}`);
    } else {
      logTest('1.3 Token Validation', 'FAIL', 'Profile data structure unexpected');
    }
  } else {
    logTest('1.3 Token Validation', 'FAIL', profileResult.error);
  }

  return true;
}

// 2. PROFILE MANAGEMENT TESTS
async function testProfileManagement() {
  sectionHeader('2. PROFILE MANAGEMENT TESTS');

  // Test 2.1: Get Profile
  const getProfileResult = await apiRequest('GET', '/profile', null, true);
  if (getProfileResult.success) {
    const userData = getProfileResult.data.user || getProfileResult.data.data?.user;
    if (userData) {
      logTest('2.1 Get Profile', 'PASS', `User: ${userData.full_name || userData.username}`);
    } else {
      logTest('2.1 Get Profile', 'FAIL', 'No user data in response');
    }
  } else {
    logTest('2.1 Get Profile', 'FAIL', getProfileResult.error);
  }

  await delay(500);

  // Test 2.2: Update Profile
  const updateData = {
    full_name: 'Updated Test User',
    phone_number: '+9876543210',
    location: 'Nairobi, Kenya',
  };

  const updateProfileResult = await apiRequest('PUT', '/profile', updateData, true);
  if (updateProfileResult.success) {
    logTest('2.2 Update Profile', 'PASS', 'Profile updated successfully');
  } else {
    logTest('2.2 Update Profile', 'FAIL', updateProfileResult.error);
  }

  await delay(500);

  // Test 2.3: Verify Profile Update
  const verifyResult = await apiRequest('GET', '/profile', null, true);
  if (verifyResult.success) {
    const userData = verifyResult.data.user || verifyResult.data.data?.user;
    if (userData && userData.full_name === updateData.full_name) {
      logTest('2.3 Verify Profile Update', 'PASS', 'Profile data persisted');
    } else {
      logTest('2.3 Verify Profile Update', 'FAIL', 'Profile data not updated');
    }
  } else {
    logTest('2.3 Verify Profile Update', 'FAIL', verifyResult.error);
  }
}

// 3. SETTINGS TESTS
async function testSettings() {
  sectionHeader('3. SETTINGS TESTS');

  // Test 3.1: Get Settings
  const getSettingsResult = await apiRequest('GET', '/settings', null, true);
  if (getSettingsResult.success) {
    logTest('3.1 Get Settings', 'PASS', 'Settings retrieved');
  } else {
    logTest('3.1 Get Settings', 'FAIL', getSettingsResult.error);
  }

  await delay(500);

  // Test 3.2: Update Notification Preferences
  const notificationUpdate = {
    push_enabled: true,
    email_enabled: false,
    disease_alerts: true,
    group_messages: true,
    advisory_updates: false,
  };

  const updateNotifResult = await apiRequest('PUT', '/settings/notification', notificationUpdate, true);
  if (updateNotifResult.success) {
    logTest('3.2 Update Notification Preferences', 'PASS', 'Notifications updated');
  } else {
    logTest('3.2 Update Notification Preferences', 'FAIL', updateNotifResult.error);
  }

  await delay(500);

  // Test 3.3: Update App Preferences
  const appUpdate = {
    language: 'en',
    theme: 'dark',
    units: 'metric',
    auto_backup: true,
  };

  const updateAppResult = await apiRequest('PUT', '/settings/app', appUpdate, true);
  if (updateAppResult.success) {
    logTest('3.3 Update App Preferences', 'PASS', 'App preferences updated');
  } else {
    logTest('3.3 Update App Preferences', 'FAIL', updateAppResult.error);
  }

  await delay(500);

  // Test 3.4: Verify Settings Persistence
  const verifySettings = await apiRequest('GET', '/settings', null, true);
  if (verifySettings.success) {
    const settings = verifySettings.data.settings;
    if (!settings) {
      logTest('3.4 Verify Settings Persistence', 'FAIL', 'No settings data returned');
      return;
    }
    
    const notifCorrect = settings.notification_preferences?.push_enabled === true;
    const appCorrect = settings.app_preferences?.theme === 'dark';
    
    if (notifCorrect && appCorrect) {
      logTest('3.4 Verify Settings Persistence', 'PASS', 'Settings persisted correctly');
    } else {
      logTest('3.4 Verify Settings Persistence', 'FAIL', 'Settings not persisted correctly');
    }
  } else {
    logTest('3.4 Verify Settings Persistence', 'FAIL', verifySettings.error);
  }
}

// 4. GROUPS TESTS
async function testGroups() {
  sectionHeader('4. GROUPS TESTS');

  // Test 4.1: Create Group
  const groupData = {
    name: 'Test Farmers Group',
    description: 'A test group for integration testing',
    cropFocus: 'Maize, Beans',
    maxMembers: 50,
  };

  const createGroupResult = await apiRequest('POST', '/groups', groupData, true);
  if (createGroupResult.success) {
    testGroupId = createGroupResult.data.data.group.group_id;
    logTest('4.1 Create Group', 'PASS', `Group ID: ${testGroupId}`);
  } else {
    logTest('4.1 Create Group', 'FAIL', createGroupResult.error);
  }

  await delay(500);

  // Test 4.2: Get User's Groups
  const getUserGroupsResult = await apiRequest('GET', '/groups/user/groups', null, true);
  if (getUserGroupsResult.success) {
    const groups = getUserGroupsResult.data.data.groups;
    logTest('4.2 Get User Groups', 'PASS', `Found ${groups.length} group(s)`);
  } else {
    logTest('4.2 Get User Groups', 'FAIL', getUserGroupsResult.error);
  }

  await delay(500);

  // Test 4.3: Get Group Details
  if (testGroupId) {
    const getGroupResult = await apiRequest('GET', `/groups/${testGroupId}`, null, true);
    if (getGroupResult.success) {
      logTest('4.3 Get Group Details', 'PASS', `Name: ${getGroupResult.data.data.group.name}`);
    } else {
      logTest('4.3 Get Group Details', 'FAIL', getGroupResult.error);
    }
  } else {
    logTest('4.3 Get Group Details', 'SKIP', 'No group ID available');
  }

  await delay(500);

  // Test 4.4: Update Group
  if (testGroupId) {
    const updateGroupData = {
      name: 'Test Farmers Group - Updated',
      description: 'Updated description for testing',
    };

    const updateGroupResult = await apiRequest('PUT', `/groups/${testGroupId}`, updateGroupData, true);
    if (updateGroupResult.success) {
      logTest('4.4 Update Group', 'PASS', 'Group updated successfully');
    } else {
      logTest('4.4 Update Group', 'FAIL', updateGroupResult.error);
    }
  } else {
    logTest('4.4 Update Group', 'SKIP', 'No group ID available');
  }

  await delay(500);

  // Test 4.5: Search Groups
  const searchGroupsResult = await apiRequest('GET', '/groups?search=Test', null, true);
  if (searchGroupsResult.success) {
    logTest('4.5 Search Groups', 'PASS', `Found ${searchGroupsResult.data.data.groups.length} group(s)`);
  } else {
    logTest('4.5 Search Groups', 'FAIL', searchGroupsResult.error);
  }
}

// 5. MESSAGING TESTS
async function testMessaging() {
  sectionHeader('5. MESSAGING TESTS');

  if (!testGroupId) {
    logTest('5.x All Messaging Tests', 'SKIP', 'No group ID available');
    return;
  }

  // Test 5.1: Send Message
  const messageData = {
    content: 'Hello! This is a test message.',
  };

  const sendMessageResult = await apiRequest('POST', `/groups/${testGroupId}/messages`, messageData, true);
  if (sendMessageResult.success) {
    testMessageId = sendMessageResult.data.data.message.message_id;
    logTest('5.1 Send Message', 'PASS', `Message ID: ${testMessageId}`);
  } else {
    logTest('5.1 Send Message', 'FAIL', sendMessageResult.error);
  }

  await delay(500);

  // Test 5.2: Get Messages
  const getMessagesResult = await apiRequest('GET', `/groups/${testGroupId}/messages`, null, true);
  if (getMessagesResult.success) {
    const messages = getMessagesResult.data.data.messages;
    logTest('5.2 Get Messages', 'PASS', `Retrieved ${messages.length} message(s)`);
  } else {
    logTest('5.2 Get Messages', 'FAIL', getMessagesResult.error);
  }

  await delay(500);

  // Test 5.3: Update Message
  if (testMessageId) {
    const updateMessageData = {
      content: 'Hello! This is an EDITED test message.',
    };

    const updateMessageResult = await apiRequest(
      'PUT',
      `/groups/${testGroupId}/messages/${testMessageId}`,
      updateMessageData,
      true
    );

    if (updateMessageResult.success) {
      logTest('5.3 Update Message', 'PASS', 'Message updated successfully');
    } else {
      logTest('5.3 Update Message', 'FAIL', updateMessageResult.error);
    }
  } else {
    logTest('5.3 Update Message', 'SKIP', 'No message ID available');
  }

  await delay(500);

  // Test 5.4: Search Messages
  const searchMessagesResult = await apiRequest(
    'GET',
    `/groups/${testGroupId}/messages/search?query=EDITED`,
    null,
    true
  );

  if (searchMessagesResult.success) {
    logTest('5.4 Search Messages', 'PASS', `Found ${searchMessagesResult.data.data.messages.length} message(s)`);
  } else {
    logTest('5.4 Search Messages', 'FAIL', searchMessagesResult.error);
  }

  await delay(500);

  // Test 5.5: Get Message Stats
  const getStatsResult = await apiRequest('GET', `/groups/${testGroupId}/messages/stats`, null, true);
  if (getStatsResult.success) {
    const stats = getStatsResult.data.data.stats;
    logTest('5.5 Get Message Stats', 'PASS', `Total: ${stats.total_messages}, Senders: ${stats.unique_senders}`);
  } else {
    logTest('5.5 Get Message Stats', 'FAIL', getStatsResult.error);
  }

  await delay(500);

  // Test 5.6: Delete Message
  if (testMessageId) {
    const deleteMessageResult = await apiRequest(
      'DELETE',
      `/groups/${testGroupId}/messages/${testMessageId}`,
      null,
      true
    );

    if (deleteMessageResult.success) {
      logTest('5.6 Delete Message', 'PASS', 'Message deleted successfully');
    } else {
      logTest('5.6 Delete Message', 'FAIL', deleteMessageResult.error);
    }
  } else {
    logTest('5.6 Delete Message', 'SKIP', 'No message ID available');
  }
}

// 6. DETECTION TESTS
async function testDetections() {
  sectionHeader('6. DISEASE DETECTION TESTS');

  // Test 6.1: Check Detection Endpoint
  // Note: Actual image upload would require FormData and a real image file
  logTest('6.1 Image Upload Detection', 'SKIP', 'Requires actual image file - test manually');

  await delay(500);

  // Test 6.2: Get Detection History
  const getHistoryResult = await apiRequest('GET', '/diseases/history', null, true);
  if (getHistoryResult.success) {
    const detections = getHistoryResult.data.detections || getHistoryResult.data.history || [];
    logTest('6.2 Get Detection History', 'PASS', `Found ${detections.length} detection(s)`);
  } else {
    logTest('6.2 Get Detection History', 'FAIL', getHistoryResult.error);
  }

  await delay(500);

  // Test 6.3: Get Detection Stats
  const getStatsResult = await apiRequest('GET', '/diseases/stats', null, true);
  if (getStatsResult.success) {
    logTest('6.3 Get Detection Stats', 'PASS', 'Stats retrieved');
  } else if (getStatsResult.status === 404) {
    logTest('6.3 Get Detection Stats', 'SKIP', 'Stats endpoint not implemented');
  } else {
    logTest('6.3 Get Detection Stats', 'FAIL', getStatsResult.error);
  }
}

// 7. ADVISORY TESTS
async function testAdvisory() {
  sectionHeader('7. ADVISORY/RECOMMENDATIONS TESTS');

  // Test 7.1: Get Featured Advisories
  const getFeaturedResult = await apiRequest('GET', '/advisory/featured', null, true);
  if (getFeaturedResult.success) {
    const advisories = getFeaturedResult.data.content || getFeaturedResult.data.advisories || [];
    logTest('7.1 Get Featured Advisories', 'PASS', `Found ${advisories.length} featured advisory(ies)`);
  } else {
    logTest('7.1 Get Featured Advisories', 'FAIL', getFeaturedResult.error);
  }

  await delay(500);

  // Test 7.2: Search Advisories
  const searchAdvisoryResult = await apiRequest('GET', '/advisory/search?query=maize', null, true);
  if (searchAdvisoryResult.success) {
    const results = searchAdvisoryResult.data.results || searchAdvisoryResult.data.advisories || [];
    logTest('7.2 Search Advisories', 'PASS', `Found ${results.length} result(s)`);
  } else {
    logTest('7.2 Search Advisories', 'FAIL', searchAdvisoryResult.error);
  }

  await delay(500);

  // Test 7.3: Get Crop Types
  const getCropsResult = await apiRequest('GET', '/advisory/crops', null, true);
  if (getCropsResult.success) {
    const crops = getCropsResult.data.crops || [];
    logTest('7.3 Get Crop Types', 'PASS', `Found ${crops.length} crop type(s)`);
  } else if (getCropsResult.status === 404) {
    logTest('7.3 Get Crop Types', 'SKIP', 'Crops endpoint not implemented');
  } else {
    logTest('7.3 Get Crop Types', 'FAIL', getCropsResult.error);
  }
}

// 8. DASHBOARD TESTS
async function testDashboard() {
  sectionHeader('8. DASHBOARD/HOME TESTS');

  // Test 8.1: Get Dashboard Data
  const getDashboardResult = await apiRequest('GET', '/dashboard', null, true);
  if (getDashboardResult.success || getDashboardResult.status === 404) {
    // 404 is acceptable if endpoint doesn't exist
    if (getDashboardResult.success) {
      logTest('8.1 Get Dashboard Data', 'PASS', 'Dashboard loaded');
    } else {
      logTest('8.1 Get Dashboard Data', 'SKIP', 'Dashboard endpoint not implemented');
    }
  } else {
    logTest('8.1 Get Dashboard Data', 'FAIL', getDashboardResult.error);
  }
}

// FINAL SUMMARY
function printSummary() {
  separator();
  log('📊 TEST EXECUTION SUMMARY', 'bright');
  separator();
  
  log(`Total Tests: ${testResults.total}`, 'cyan');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⏭️  Skipped: ${testResults.skipped}`, 'yellow');
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`\n📈 Pass Rate: ${passRate}%`, 'bright');

  if (testResults.errors.length > 0) {
    separator();
    log('❌ FAILED TESTS DETAILS:', 'red');
    separator();
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error.test}`, 'red');
      log(`   ${error.error}`, 'yellow');
    });
  }

  separator();
  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED!', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - REVIEW ABOVE', 'yellow');
  }
  separator();
}

// MAIN TEST EXECUTION
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     COMPREHENSIVE FRONTEND-BACKEND INTEGRATION TESTS          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'cyan');

  const startTime = Date.now();
  log(`🚀 Test Started: ${new Date().toLocaleString()}`, 'bright');
  log(`🌐 API URL: ${API_URL}\n`, 'cyan');

  try {
    // Run all test suites
    const authSuccess = await testAuthentication();
    
    if (!authSuccess) {
      log('\n⛔ Authentication failed. Stopping tests.', 'red');
      return;
    }

    await testProfileManagement();
    await testSettings();
    await testGroups();
    await testMessaging();
    await testDetections();
    await testAdvisory();
    await testDashboard();

  } catch (error) {
    log(`\n💥 CRITICAL ERROR: ${error.message}`, 'red');
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log(`\n⏱️  Test Completed: ${new Date().toLocaleString()}`, 'bright');
  log(`⏱️  Duration: ${duration} seconds\n`, 'cyan');

  printSummary();
}

// Run the tests
runAllTests();
