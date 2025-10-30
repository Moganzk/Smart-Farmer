/**
 * Authentication Flow Tests
 * Tests registration and login functionality with the backend
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';

// Generate unique username for testing
const timestamp = Date.now().toString().slice(-4);
const TEST_USER = {
  username: `testuser${timestamp}`,
  email: `testuser${timestamp}@smartfarmer.com`,
  password: 'TestPass123!',
  role: 'farmer',
  fullName: 'Test User',
  phoneNumber: '+254712345678',
  location: 'Nairobi',
  preferredLanguage: 'en'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (message) {
    log(`   ${message}`, 'yellow');
  }
}

// Test suite
async function runTests() {
  log('\n🧪 Starting Authentication Tests\n', 'blue');
  
  let testsPassed = 0;
  let testsFailed = 0;
  let authToken = null;

  // Test 1: Backend Health Check
  try {
    log('Test 1: Backend Health Check', 'yellow');
    const response = await axios.get('http://localhost:3001/health');
    const passed = response.status === 200 && response.data.status === 'ok';
    logTest('Backend is healthy', passed, passed ? '' : 'Backend may be down');
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    logTest('Backend is healthy', false, `Error: ${error.message}`);
    testsFailed++;
    log('\n⚠️  Backend is not running. Please start it first.', 'red');
    return;
  }

  // Test 2: Registration with Valid Data
  try {
    log('\nTest 2: User Registration', 'yellow');
    const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    const passed = response.status === 201 && response.data.data && response.data.data.token;
    
    if (passed) {
      authToken = response.data.data.token;
      logTest('Registration successful', true, `Token received: ${authToken.substring(0, 20)}...`);
      testsPassed++;
    } else {
      logTest('Registration successful', false, 'No token in response');
      testsFailed++;
    }
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    if (message.includes('already exists')) {
      log('   ℹ️  User already exists (expected if running multiple times)', 'blue');
      testsPassed++;
    } else {
      logTest('Registration successful', false, message);
      testsFailed++;
    }
  }

  // Test 3: Registration with Invalid Password (no special char)
  try {
    log('\nTest 3: Registration with Invalid Password', 'yellow');
    const invalidUser = { ...TEST_USER, email: 'invalid@test.com', password: 'Password123' };
    const response = await axios.post(`${API_URL}/auth/register`, invalidUser);
    logTest('Should reject invalid password', false, 'Accepted invalid password!');
    testsFailed++;
  } catch (error) {
    const passed = error.response?.status === 400;
    logTest('Should reject invalid password', passed, passed ? 'Correctly rejected' : error.message);
    passed ? testsPassed++ : testsFailed++;
  }

  // Test 4: Registration with Missing Fields
  try {
    log('\nTest 4: Registration with Missing Fields', 'yellow');
    const incompleteUser = { email: 'incomplete@test.com', password: 'Pass123!' };
    const response = await axios.post(`${API_URL}/auth/register`, incompleteUser);
    logTest('Should reject incomplete data', false, 'Accepted incomplete data!');
    testsFailed++;
  } catch (error) {
    const passed = error.response?.status === 400;
    logTest('Should reject incomplete data', passed, passed ? 'Correctly rejected' : error.message);
    passed ? testsPassed++ : testsFailed++;
  }

  // Test 5: Login with Valid Credentials
  try {
    log('\nTest 5: User Login', 'yellow');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    const passed = response.status === 200 && response.data.data && response.data.data.token;
    
    if (passed) {
      authToken = response.data.data.token;
      logTest('Login successful', true, `Token received: ${authToken.substring(0, 20)}...`);
      testsPassed++;
    } else {
      logTest('Login successful', false, 'No token in response');
      testsFailed++;
    }
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    logTest('Login successful', false, message);
    testsFailed++;
  }

  // Test 6: Login with Invalid Credentials
  try {
    log('\nTest 6: Login with Invalid Credentials', 'yellow');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: 'WrongPassword123!'
    });
    logTest('Should reject invalid credentials', false, 'Accepted invalid credentials!');
    testsFailed++;
  } catch (error) {
    const passed = error.response?.status === 401;
    logTest('Should reject invalid credentials', passed, passed ? 'Correctly rejected' : error.message);
    passed ? testsPassed++ : testsFailed++;
  }

  // Test 7: Access Protected Route with Token
  if (authToken) {
    try {
      log('\nTest 7: Access Protected Route', 'yellow');
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const passed = response.status === 200;
      logTest('Can access protected route', passed);
      passed ? testsPassed++ : testsFailed++;
    } catch (error) {
      logTest('Can access protected route', false, error.response?.data?.error?.message || error.message);
      testsFailed++;
    }
  } else {
    log('\nTest 7: Access Protected Route - SKIPPED (no token)', 'yellow');
  }

  // Test 8: Access Protected Route without Token
  try {
    log('\nTest 8: Access Protected Route without Token', 'yellow');
    const response = await axios.get(`${API_URL}/auth/verify`);
    logTest('Should reject without token', false, 'Allowed access without token!');
    testsFailed++;
  } catch (error) {
    const passed = error.response?.status === 401 || error.response?.status === 403;
    logTest('Should reject without token', passed, passed ? 'Correctly rejected' : error.message);
    passed ? testsPassed++ : testsFailed++;
  }

  // Test 9: Password Validation Rules
  try {
    log('\nTest 9: Password Validation Rules', 'yellow');
    const testCases = [
      { password: 'short!1', shouldFail: true, reason: 'Too short (< 8 chars)' },
      { password: 'NoNumbers!', shouldFail: true, reason: 'No numbers' },
      { password: 'NoSpecial123', shouldFail: true, reason: 'No special chars' },
      { password: '12345678!', shouldFail: true, reason: 'No letters' },
      { password: 'Valid123!', shouldFail: false, reason: 'Valid password' }
    ];

    let subTestsPassed = 0;
    for (const testCase of testCases) {
      try {
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        const testUser = {
          ...TEST_USER,
          username: `test${uniqueId}`,
          email: `test${uniqueId}@test.com`,
          password: testCase.password
        };
        await axios.post(`${API_URL}/auth/register`, testUser);
        
        if (testCase.shouldFail) {
          log(`   ❌ ${testCase.reason}: Should have failed but passed`, 'red');
        } else {
          log(`   ✅ ${testCase.reason}: Passed`, 'green');
          subTestsPassed++;
        }
      } catch (error) {
        if (testCase.shouldFail) {
          log(`   ✅ ${testCase.reason}: Correctly rejected`, 'green');
          subTestsPassed++;
        } else {
          log(`   ❌ ${testCase.reason}: Should have passed but failed`, 'red');
        }
      }
    }
    
    const passed = subTestsPassed === testCases.length;
    logTest('Password validation rules', passed, `${subTestsPassed}/${testCases.length} sub-tests passed`);
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    logTest('Password validation rules', false, error.message);
    testsFailed++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`✅ Tests Passed: ${testsPassed}`, 'green');
  log(`❌ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'blue');
  log('='.repeat(50) + '\n', 'blue');

  if (testsFailed === 0) {
    log('🎉 All tests passed! Authentication is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }

  return { passed: testsPassed, failed: testsFailed };
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runTests };
