// Comprehensive Settings Integration Tests
// Tests all settings CRUD operations and persistence

const axios = require('axios');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const API_URL = 'http://localhost:3001';
const REGISTER_USER = {
  username: 'testset' + Date.now(),
  email: `testset${Date.now()}@test.com`,
  password: 'TestSettings@123',
  fullName: 'Test Settings User',
  role: 'farmer'
};
let TEST_USER = {};

let authToken = '';
let userId = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility Functions
function logSection(title) {
  console.log(`\n${colors.cyan}${'━'.repeat(60)}`);
  console.log(`━━━ ${title} ━━━`);
  console.log(`${'━'.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
  testResults.passed++;
  testResults.total++;
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
  testResults.failed++;
  testResults.total++;
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logData(label, data) {
  console.log(`${colors.magenta}🔍 ${label}:${colors.reset}`, JSON.stringify(data, null, 2));
}

// Test Functions

/**
 * Test 1: Register Test User
 */
async function testRegisterUser() {
  logSection('TEST 1: Register Test User');
  
  try {
    logInfo('Creating new test user...');
    const response = await axios.post(`${API_URL}/api/auth/register`, REGISTER_USER);
    
    if (response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      userId = response.data.data.user.user_id;
      TEST_USER = {
        email: REGISTER_USER.email,
        password: REGISTER_USER.password
      };
      logSuccess('User registered successfully');
      logInfo(`User ID: ${userId}`);
      logInfo(`Email: ${TEST_USER.email}`);
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError('Registration failed: No token received');
      logData('Response Data', response.data);
      return false;
    }
  } catch (error) {
    logError(`Registration failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      logData('Error Details', error.response.data);
    }
    return false;
  }
}

/**
 * Test 2: Get Initial Settings (Should Create Defaults)
 */
async function testGetInitialSettings() {
  logSection('TEST 2: Get Initial Settings (Default Creation)');
  
  try {
    logInfo('Fetching settings for the first time...');
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.data && response.data.data.settings) {
      logSuccess('Settings retrieved successfully');
      
      const settings = response.data.data.settings;
      
      // Verify all settings categories exist
      const categories = [
        'notification_preferences',
        'app_preferences',
        'ai_preferences',
        'sync_settings',
        'privacy_settings'
      ];
      
      let allCategoriesPresent = true;
      categories.forEach(category => {
        if (settings[category]) {
          logSuccess(`${category} exists`);
        } else {
          logError(`${category} missing`);
          allCategoriesPresent = false;
        }
      });
      
      if (allCategoriesPresent) {
        logSuccess('All settings categories present');
        logData('Initial Settings', settings);
        return true;
      } else {
        logError('Some settings categories missing');
        return false;
      }
    } else {
      logError('Failed to retrieve settings');
      return false;
    }
  } catch (error) {
    logError(`Get settings failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 3: Update Notification Preferences
 */
async function testUpdateNotificationPreferences() {
  logSection('TEST 3: Update Notification Preferences');
  
  try {
    const newNotificationPrefs = {
      push_enabled: false,
      email_enabled: true,
      detection_results: true,
      group_messages: false,
      system_updates: true,
      warnings: true
    };
    
    logInfo('Updating notification preferences...');
    logData('New Preferences', newNotificationPrefs);
    
    const response = await axios.put(
      `${API_URL}/api/settings/notification`,
      newNotificationPrefs,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data) {
      logSuccess('Notification preferences updated');
      
      // Verify the update
      const updated = response.data.data.notification_preferences;
      if (updated.push_enabled === false && updated.group_messages === false) {
        logSuccess('Changes verified in response');
        return true;
      } else {
        logError('Changes not reflected in response');
        return false;
      }
    } else {
      logError('Update failed');
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Verify Notification Preferences Persisted
 */
async function testVerifyNotificationPersistence() {
  logSection('TEST 4: Verify Notification Preferences Persistence');
  
  try {
    logInfo('Fetching settings again to verify persistence...');
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.data ||response.data.message) {
      const settings = response.data.data.settings;
      const notifPrefs = settings.notification_preferences;
      
      logInfo('Checking persisted values...');
      
      if (notifPrefs.push_enabled === false) {
        logSuccess('push_enabled persisted correctly (false)');
      } else {
        logError('push_enabled not persisted');
      }
      
      if (notifPrefs.group_messages === false) {
        logSuccess('group_messages persisted correctly (false)');
      } else {
        logError('group_messages not persisted');
      }
      
      if (notifPrefs.email_enabled === true) {
        logSuccess('email_enabled persisted correctly (true)');
      } else {
        logError('email_enabled not persisted');
      }
      
      return (notifPrefs.push_enabled === false && 
              notifPrefs.group_messages === false && 
              notifPrefs.email_enabled === true);
    } else {
      logError('Failed to fetch settings');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 5: Update App Preferences
 */
async function testUpdateAppPreferences() {
  logSection('TEST 5: Update App Preferences');
  
  try {
    const newAppPrefs = {
      theme: 'dark',
      language: 'sw', // Swahili
      font_size: 'large',
      high_contrast: true,
      reduced_motion: false,
      offline_mode: true
    };
    
    logInfo('Updating app preferences...');
    logData('New Preferences', newAppPrefs);
    
    const response = await axios.put(
      `${API_URL}/api/settings/app`,
      newAppPrefs,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('App preferences updated');
      
      const updated = response.data.data.app_preferences;
      if (updated.theme === 'dark' && 
          updated.language === 'sw' && 
          updated.offline_mode === true) {
        logSuccess('All changes verified');
        return true;
      } else {
        logError('Some changes not reflected');
        return false;
      }
    } else {
      logError('Update failed');
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 6: Update AI Preferences
 */
async function testUpdateAIPreferences() {
  logSection('TEST 6: Update AI Preferences');
  
  try {
    const newAIPrefs = {
      auto_analysis: false,
      save_images: true,
      data_contribution: true,
      model_preference: 'advanced'
    };
    
    logInfo('Updating AI preferences...');
    logData('New Preferences', newAIPrefs);
    
    const response = await axios.put(
      `${API_URL}/api/settings/ai`,
      newAIPrefs,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('AI preferences updated');
      
      const updated = response.data.data.ai_preferences;
      if (updated.auto_analysis === false && 
          updated.data_contribution === true &&
          updated.model_preference === 'advanced') {
        logSuccess('All changes verified');
        return true;
      } else {
        logError('Some changes not reflected');
        return false;
      }
    } else {
      logError('Update failed');
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 7: Update Sync Settings
 */
async function testUpdateSyncSettings() {
  logSection('TEST 7: Update Sync Settings');
  
  try {
    const newSyncSettings = {
      auto_sync: false,
      sync_over_wifi_only: true,
      sync_frequency: 'weekly'
    };
    
    logInfo('Updating sync settings...');
    logData('New Settings', newSyncSettings);
    
    const response = await axios.put(
      `${API_URL}/api/settings/sync`,
      newSyncSettings,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('Sync settings updated');
      
      const updated = response.data.data.sync_settings;
      if (updated.auto_sync === false && 
          updated.sync_over_wifi_only === true &&
          updated.sync_frequency === 'weekly') {
        logSuccess('All changes verified');
        return true;
      } else {
        logError('Some changes not reflected');
        return false;
      }
    } else {
      logError('Update failed');
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 8: Update Privacy Settings
 */
async function testUpdatePrivacySettings() {
  logSection('TEST 8: Update Privacy Settings');
  
  try {
    const newPrivacySettings = {
      profile_visibility: 'public',
      location_sharing: 'friends',
      data_collection: 'full'
    };
    
    logInfo('Updating privacy settings...');
    logData('New Settings', newPrivacySettings);
    
    const response = await axios.put(
      `${API_URL}/api/settings/privacy`,
      newPrivacySettings,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('Privacy settings updated');
      
      const updated = response.data.data.privacy_settings;
      if (updated.profile_visibility === 'public' && 
          updated.location_sharing === 'friends' &&
          updated.data_collection === 'full') {
        logSuccess('All changes verified');
        return true;
      } else {
        logError('Some changes not reflected');
        return false;
      }
    } else {
      logError('Update failed');
      return false;
    }
  } catch (error) {
    logError(`Update failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 9: Verify All Settings Persisted
 */
async function testVerifyAllSettingsPersistence() {
  logSection('TEST 9: Verify All Settings Persistence');
  
  try {
    logInfo('Fetching all settings to verify complete persistence...');
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.data ||response.data.message) {
      const settings = response.data.data.settings;
      
      logInfo('Verifying all categories...');
      
      // Check notification preferences
      const notif = settings.notification_preferences;
      const notifOk = notif.push_enabled === false && notif.group_messages === false;
      notifOk ? logSuccess('Notification preferences persisted') : logError('Notification preferences not persisted');
      
      // Check app preferences
      const app = settings.app_preferences;
      const appOk = app.theme === 'dark' && app.language === 'sw' && app.offline_mode === true;
      appOk ? logSuccess('App preferences persisted') : logError('App preferences not persisted');
      
      // Check AI preferences
      const ai = settings.ai_preferences;
      const aiOk = ai.auto_analysis === false && ai.data_contribution === true;
      aiOk ? logSuccess('AI preferences persisted') : logError('AI preferences not persisted');
      
      // Check sync settings
      const sync = settings.sync_settings;
      const syncOk = sync.auto_sync === false && sync.sync_over_wifi_only === true;
      syncOk ? logSuccess('Sync settings persisted') : logError('Sync settings not persisted');
      
      // Check privacy settings
      const privacy = settings.privacy_settings;
      const privacyOk = privacy.profile_visibility === 'public' && privacy.location_sharing === 'friends';
      privacyOk ? logSuccess('Privacy settings persisted') : logError('Privacy settings not persisted');
      
      return notifOk && appOk && aiOk && syncOk && privacyOk;
    } else {
      logError('Failed to fetch settings');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 10: Reset Single Category
 */
async function testResetSingleCategory() {
  logSection('TEST 10: Reset Single Category (App Preferences)');
  
  try {
    logInfo('Resetting app preferences to defaults...');
    
    const response = await axios.post(
      `${API_URL}/api/settings/reset/app_preferences`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('App preferences reset');
      
      const reset = response.data.data.app_preferences;
      if (reset.theme === 'auto' && 
          reset.language === 'en' && 
          reset.font_size === 'medium') {
        logSuccess('All values reset to defaults');
        logData('Default App Preferences', reset);
        return true;
      } else {
        logError('Values not reset correctly');
        return false;
      }
    } else {
      logError('Reset failed');
      return false;
    }
  } catch (error) {
    logError(`Reset failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 11: Reset All Settings
 */
async function testResetAllSettings() {
  logSection('TEST 11: Reset All Settings');
  
  try {
    logInfo('Resetting all settings to defaults...');
    
    const response = await axios.post(
      `${API_URL}/api/settings/reset/all`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data ||response.data.message) {
      logSuccess('All settings reset');
      
      const settings = response.data.data.settings;
      
      // Verify defaults
      const notifOk = settings.notification_preferences.push_enabled === true;
      const appOk = settings.app_preferences.theme === 'auto';
      const aiOk = settings.ai_preferences.auto_analysis === true;
      const syncOk = settings.sync_settings.auto_sync === true;
      const privacyOk = settings.privacy_settings.profile_visibility === 'registered';
      
      notifOk ? logSuccess('Notifications reset to defaults') : logError('Notifications not reset');
      appOk ? logSuccess('App preferences reset to defaults') : logError('App preferences not reset');
      aiOk ? logSuccess('AI preferences reset to defaults') : logError('AI preferences not reset');
      syncOk ? logSuccess('Sync settings reset to defaults') : logError('Sync settings not reset');
      privacyOk ? logSuccess('Privacy settings reset to defaults') : logError('Privacy settings not reset');
      
      return notifOk && appOk && aiOk && syncOk && privacyOk;
    } else {
      logError('Reset failed');
      return false;
    }
  } catch (error) {
    logError(`Reset failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 12: Verify Reset Persisted
 */
async function testVerifyResetPersistence() {
  logSection('TEST 12: Verify Reset Persisted');
  
  try {
    logInfo('Fetching settings after reset...');
    
    const response = await axios.get(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.data ||response.data.message) {
      const settings = response.data.data.settings;
      
      logInfo('Verifying all settings are at defaults...');
      
      const notif = settings.notification_preferences;
      const notifOk = notif.push_enabled === true && notif.email_enabled === true;
      notifOk ? logSuccess('Notifications at defaults') : logError('Notifications not at defaults');
      
      const app = settings.app_preferences;
      const appOk = app.theme === 'auto' && app.language === 'en';
      appOk ? logSuccess('App preferences at defaults') : logError('App preferences not at defaults');
      
      const ai = settings.ai_preferences;
      const aiOk = ai.auto_analysis === true && ai.data_contribution === false;
      aiOk ? logSuccess('AI preferences at defaults') : logError('AI preferences not at defaults');
      
      logData('Final Settings State', settings);
      
      return notifOk && appOk && aiOk;
    } else {
      logError('Failed to fetch settings');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗`);
  console.log(`║     SETTINGS MANAGEMENT - COMPREHENSIVE INTEGRATION TESTS   ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Target API: ${API_URL}`);
  logInfo('Creating fresh test user for isolated testing...');
  logInfo('Starting tests...\n');
  
  try {
    // Test 1: Register user
    if (!await testRegisterUser()) {
      throw new Error('User registration failed. Cannot proceed with tests.');
    }
    
    // Test 2: Get initial settings
    await testGetInitialSettings();
    
    // Test 3-4: Update and verify notification preferences
    await testUpdateNotificationPreferences();
    await testVerifyNotificationPersistence();
    
    // Test 5: Update app preferences
    await testUpdateAppPreferences();
    
    // Test 6: Update AI preferences
    await testUpdateAIPreferences();
    
    // Test 7: Update sync settings
    await testUpdateSyncSettings();
    
    // Test 8: Update privacy settings
    await testUpdatePrivacySettings();
    
    // Test 9: Verify all settings persisted
    await testVerifyAllSettingsPersistence();
    
    // Test 10: Reset single category
    await testResetSingleCategory();
    
    // Test 11: Reset all settings
    await testResetAllSettings();
    
    // Test 12: Verify reset persisted
    await testVerifyResetPersistence();
    
  } catch (error) {
    console.error(`\n${colors.red}Fatal Error: ${error.message}${colors.reset}`);
  }
  
  // Print summary
  console.log(`\n${colors.cyan}${'═'.repeat(60)}`);
  console.log(`TEST SUMMARY`);
  console.log(`${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Total:${colors.reset} ${testResults.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Settings management is working correctly.${colors.reset}`);
    console.log(`${colors.green}✅ Settings data persists permanently until changed by user.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ Some tests failed. Please review the errors above.${colors.reset}\n`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
