/**
 * Profile Management Integration Tests
 * Tests profile CRUD operations and persistence
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001/api';

// Test user credentials
let authToken = '';
let testUserId = '';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━ ${testName} ━━━${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Setup: Login and get auth token
 */
async function setup() {
  logTest('SETUP: Authenticating');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@smartfarmer.com',
      password: 'admin123',
      deviceInfo: {
        deviceId: 'test-device-profile',
        deviceName: 'Profile Test Device',
        platform: 'test'
      }
    });
    
    authToken = response.data.data.token;
    testUserId = response.data.data.user.user_id;
    logSuccess('Authentication successful');
    logInfo(`User ID: ${testUserId}`);
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError('Authentication failed');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 1: Get current profile
 */
async function testGetProfile() {
  logTest('TEST 1: Get Current Profile');
  
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const profile = response.data.user; // Changed from response.data.data.user
    
    logSuccess('Profile retrieved successfully');
    console.log('\n📋 Profile Data:');
    console.log(`   User ID: ${profile.user_id}`);
    console.log(`   Username: ${profile.username}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Full Name: ${profile.full_name}`);
    console.log(`   Phone: ${profile.phone_number || 'Not set'}`);
    console.log(`   Location: ${profile.location || 'Not set'}`);
    console.log(`   Bio: ${profile.bio || 'Not set'}`);
    console.log(`   Expertise: ${profile.expertise || 'Not set'}`);
    console.log(`   Profile Image: ${profile.profile_image || 'Not set'}`);
    console.log(`   Language: ${profile.preferred_language}`);
    
    console.log('\n📊 Statistics:');
    console.log(`   Detections: ${profile.stats.detection_count}`);
    console.log(`   Groups: ${profile.stats.group_count}`);
    console.log(`   Messages: ${profile.stats.message_count}`);
    console.log(`   Admin Groups: ${profile.stats.admin_group_count}`);
    
    return true;
  } catch (error) {
    logError('Failed to get profile');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 2: Update profile with various fields
 */
async function testUpdateProfile() {
  logTest('TEST 2: Update Profile Information');
  
  const updateData = {
    full_name: 'Test Farmer Updated',
    phone_number: '+254712345678',
    location: 'Nairobi, Kenya',
    bio: 'Experienced farmer with 10+ years in sustainable agriculture. Specializing in organic farming and crop rotation techniques.',
    expertise: 'Organic Farming, Crop Rotation, Pest Management, Soil Health',
    preferred_language: 'en'
  };
  
  try {
    logInfo('Updating profile with new data...');
    console.log('\n📝 Update Data:');
    Object.entries(updateData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    const response = await axios.put(
      `${API_URL}/profile`,
      updateData,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    const updatedProfile = response.data.user; // Changed from response.data.data.user
    
    logSuccess('Profile updated successfully');
    console.log('\n✅ Verification:');
    
    // Verify each field was updated
    let allMatched = true;
    for (const [key, value] of Object.entries(updateData)) {
      const dbValue = updatedProfile[key];
      const matches = dbValue === value;
      allMatched = allMatched && matches;
      
      if (matches) {
        console.log(`   ${colors.green}✓${colors.reset} ${key}: ${dbValue}`);
      } else {
        console.log(`   ${colors.red}✗${colors.reset} ${key}: Expected "${value}", got "${dbValue}"`);
      }
    }
    
    return allMatched;
  } catch (error) {
    logError('Failed to update profile');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 3: Verify persistence - Get profile again
 */
async function testProfilePersistence() {
  logTest('TEST 3: Verify Data Persistence');
  
  try {
    logInfo('Fetching profile again to verify changes persisted...');
    
    // Wait a moment to ensure database has committed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const profile = response.data.user; // Changed from response.data.data.user
    
    logSuccess('Profile retrieved after update');
    console.log('\n🔍 Persistence Check:');
    
    // Check if updated values persisted
    const expectedValues = {
      full_name: 'Test Farmer Updated',
      phone_number: '+254712345678',
      location: 'Nairobi, Kenya',
      bio: 'Experienced farmer with 10+ years in sustainable agriculture. Specializing in organic farming and crop rotation techniques.',
      expertise: 'Organic Farming, Crop Rotation, Pest Management, Soil Health',
      preferred_language: 'en'
    };
    
    let allPersisted = true;
    for (const [key, expectedValue] of Object.entries(expectedValues)) {
      const actualValue = profile[key];
      const persisted = actualValue === expectedValue;
      allPersisted = allPersisted && persisted;
      
      if (persisted) {
        console.log(`   ${colors.green}✓${colors.reset} ${key} persisted correctly`);
      } else {
        console.log(`   ${colors.red}✗${colors.reset} ${key} did not persist (expected "${expectedValue}", got "${actualValue}")`);
      }
    }
    
    return allPersisted;
  } catch (error) {
    logError('Failed to verify persistence');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 4: Partial profile update
 */
async function testPartialUpdate() {
  logTest('TEST 4: Partial Profile Update');
  
  try {
    logInfo('Updating only location and bio...');
    
    const partialUpdate = {
      location: 'Mombasa, Kenya',
      bio: 'Updated bio: Coastal farmer focusing on coconut and cashew production.'
    };
    
    const response = await axios.put(
      `${API_URL}/profile`,
      partialUpdate,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    const updatedProfile = response.data.user; // Changed from response.data.data.user
    
    logSuccess('Partial update successful');
    console.log('\n✅ Updated fields:');
    console.log(`   Location: ${updatedProfile.location}`);
    console.log(`   Bio: ${updatedProfile.bio}`);
    
    // Verify other fields weren't changed
    logInfo('Verifying other fields remained unchanged...');
    console.log(`   Full Name: ${updatedProfile.full_name} (should still be "Test Farmer Updated")`);
    console.log(`   Phone: ${updatedProfile.phone_number} (should still be "+254712345678")`);
    
    const locationMatches = updatedProfile.location === 'Mombasa, Kenya';
    const bioMatches = updatedProfile.bio === 'Updated bio: Coastal farmer focusing on coconut and cashew production.';
    const nameUnchanged = updatedProfile.full_name === 'Test Farmer Updated';
    
    return locationMatches && bioMatches && nameUnchanged;
  } catch (error) {
    logError('Failed partial update');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 5: Empty update (no changes)
 */
async function testEmptyUpdate() {
  logTest('TEST 5: Empty Update (No Changes)');
  
  try {
    logInfo('Sending update with no fields...');
    
    const response = await axios.put(
      `${API_URL}/profile`,
      {},
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    logSuccess('Empty update handled correctly');
    console.log(`   Response: ${response.data.message}`);
    
    return true;
  } catch (error) {
    logError('Empty update failed');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 6: Profile image upload
 */
async function testProfileImageUpload() {
  logTest('TEST 6: Profile Image Upload');
  
  try {
    // Create a test image (simple PNG)
    const testImagePath = path.join(__dirname, 'test-profile-image.png');
    
    // Create a simple 100x100 PNG image (base64 encoded 1x1 transparent PNG)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, pngBuffer);
    
    logInfo('Created test image');
    
    // Create form data
    const formData = new FormData();
    formData.append('profile_image', fs.createReadStream(testImagePath));
    
    logInfo('Uploading profile image...');
    
    const response = await axios.post(
      `${API_URL}/profile/upload-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      }
    );
    
    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    logSuccess('Profile image uploaded successfully');
    console.log(`   Image path: ${response.data.user.profile_image}`);
    
    // Verify image persisted
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const profileResponse = await axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const hasImage = profileResponse.data.user.profile_image !== null;
    
    if (hasImage) {
      logSuccess('Profile image persisted in database');
      console.log(`   Stored path: ${profileResponse.data.user.profile_image}`);
    } else {
      logError('Profile image did not persist');
    }
    
    return hasImage;
  } catch (error) {
    logError('Failed to upload profile image');
    console.error(error.response?.data || error.message);
    
    // Clean up test image if it exists
    const testImagePath = path.join(__dirname, 'test-profile-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return false;
  }
}

/**
 * Test 7: Change password
 */
async function testChangePassword() {
  logTest('TEST 7: Change Password');
  
  try {
    logInfo('Changing password...');
    
    const response = await axios.put( // Changed from POST to PUT and changed endpoint
      `${API_URL}/profile/change-password`,
      {
        current_password: 'admin123',
        new_password: 'newpassword123'
      },
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    logSuccess('Password changed successfully');
    
    // Change it back for other tests
    logInfo('Reverting password for other tests...');
    
    await axios.put( // Changed from POST to PUT
      `${API_URL}/profile/change-password`,
      {
        current_password: 'newpassword123',
        new_password: 'admin123'
      },
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    logSuccess('Password reverted successfully');
    
    return true;
  } catch (error) {
    logError('Failed to change password');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 8: Final persistence check after logout/login
 */
async function testPersistenceAfterReauth() {
  logTest('TEST 8: Persistence After Re-authentication');
  
  try {
    logInfo('Logging out...');
    
    // Clear current token
    const oldToken = authToken;
    authToken = '';
    
    logSuccess('Logged out (cleared token)');
    
    // Login again
    logInfo('Logging in again...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@smartfarmer.com',
      password: 'admin123',
      deviceInfo: {
        deviceId: 'test-device-profile-reauth',
        deviceName: 'Profile Test Device Reauth',
        platform: 'test'
      }
    });
    
    authToken = loginResponse.data.data.token;
    logSuccess('Logged in with new session');
    
    // Get profile
    logInfo('Fetching profile with new session...');
    
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const profile = response.data.user; // Changed from response.data.data.user
    
    logSuccess('Profile retrieved after re-authentication');
    console.log('\n🔍 Final Persistence Check:');
    console.log(`   Location: ${profile.location}`);
    console.log(`   Bio: ${profile.bio}`);
    console.log(`   Full Name: ${profile.full_name}`);
    console.log(`   Phone: ${profile.phone_number}`);
    console.log(`   Profile Image: ${profile.profile_image ? 'Set' : 'Not set'}`);
    
    // Verify the last updates are still there
    const locationCorrect = profile.location === 'Mombasa, Kenya';
    const bioCorrect = profile.bio === 'Updated bio: Coastal farmer focusing on coconut and cashew production.';
    const imageExists = profile.profile_image !== null;
    
    logInfo('Verification:');
    console.log(`   ${locationCorrect ? '✓' : '✗'} Location persisted`);
    console.log(`   ${bioCorrect ? '✓' : '✗'} Bio persisted`);
    console.log(`   ${imageExists ? '✓' : '✗'} Profile image persisted`);
    
    return locationCorrect && bioCorrect && imageExists;
  } catch (error) {
    logError('Failed persistence check after re-authentication');
    console.error(error.response?.data || error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('PROFILE MANAGEMENT INTEGRATION TESTS', 'cyan');
  log('Testing profile CRUD and persistence', 'blue');
  console.log('='.repeat(60));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Setup
  const setupSuccess = await setup();
  if (!setupSuccess) {
    log('\n❌ Setup failed. Cannot continue tests.', 'red');
    process.exit(1);
  }
  
  // Run tests
  const tests = [
    { name: 'Get Current Profile', fn: testGetProfile },
    { name: 'Update Profile Information', fn: testUpdateProfile },
    { name: 'Verify Data Persistence', fn: testProfilePersistence },
    { name: 'Partial Profile Update', fn: testPartialUpdate },
    { name: 'Empty Update Handling', fn: testEmptyUpdate },
    { name: 'Profile Image Upload', fn: testProfileImageUpload },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Persistence After Re-auth', fn: testPersistenceAfterReauth }
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    
    results.tests.push({ name: test.name, passed });
    
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  log('TEST SUMMARY', 'cyan');
  console.log('='.repeat(60));
  
  results.tests.forEach((test, index) => {
    const status = test.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${index + 1}. ${status} - ${test.name}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  log(`Total: ${results.total} | Passed: ${colors.green}${results.passed}${colors.reset} | Failed: ${colors.red}${results.failed}${colors.reset}`, 'blue');
  console.log('-'.repeat(60));
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Profile management is working correctly.', 'green');
    log('✅ Profile data persists permanently until changed by user.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️ Some tests failed. Please review the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
