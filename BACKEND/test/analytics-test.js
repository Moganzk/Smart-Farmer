/**
 * Analytics API Test Script
 * 
 * Tests the analytics endpoints by making requests to them
 * and displaying the results
 */

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';

// Admin login credentials - using any credentials since test server accepts anything
const adminCredentials = {
  email: 'admin@smartfarmer.com',
  password: 'adminpassword123'
};

/**
 * Login as admin and get auth token
 */
async function login() {
  try {
    console.log('Attempting to login with:', adminCredentials);
    console.log('API URL:', `${API_URL}/auth/login`);
    const response = await axios.post(`${API_URL}/auth/login`, adminCredentials);
    authToken = response.data.token;
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

/**
 * Test the dashboard summary endpoint
 */
async function testDashboardSummary() {
  try {
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n=== DASHBOARD SUMMARY ===');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.response ? error.response.data : error.message);
  }
}

/**
 * Test the user growth endpoint
 */
async function testUserGrowth() {
  try {
    const response = await axios.get(`${API_URL}/analytics/users/growth?timeframe=monthly&limit=6`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n=== USER GROWTH (MONTHLY) ===');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching user growth:', error.response ? error.response.data : error.message);
  }
}

/**
 * Test the user activity endpoint
 */
async function testUserActivity() {
  try {
    const response = await axios.get(`${API_URL}/analytics/users/activity`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n=== USER ACTIVITY ===');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching user activity:', error.response ? error.response.data : error.message);
  }
}

/**
 * Test the disease statistics endpoint
 */
async function testDiseaseStatistics() {
  try {
    const response = await axios.get(`${API_URL}/analytics/diseases?timeframe=monthly&limit=6`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n=== DISEASE STATISTICS ===');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching disease statistics:', error.response ? error.response.data : error.message);
  }
}

/**
 * Test the group statistics endpoint
 */
async function testGroupStatistics() {
  try {
    const response = await axios.get(`${API_URL}/analytics/groups`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n=== GROUP STATISTICS ===');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching group statistics:', error.response ? error.response.data : error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('Starting analytics API tests...');
    await login();
    await testDashboardSummary();
    await testUserGrowth();
    await testUserActivity();
    await testDiseaseStatistics();
    await testGroupStatistics();
    console.log('\nAnalytics API tests completed.');
  } catch (error) {
    console.error('Test suite error:', error.message);
  }
}

// Run the tests
runTests();