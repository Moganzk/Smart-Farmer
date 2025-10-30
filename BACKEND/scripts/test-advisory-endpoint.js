const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAdvisoryEndpoint() {
  try {
    console.log('🧪 Testing Advisory Featured Content Endpoint\n');
    console.log('=============================================\n');
    
    // Login to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@smartfarmer.com',
      password: 'admin123',
      deviceInfo: {
        deviceId: 'test-device-123',
        deviceName: 'Test Device',
        platform: 'test'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');
    
    // Test featured endpoint
    console.log('2. Fetching featured advisory content...');
    const featuredResponse = await axios.get(`${API_URL}/advisory/featured?limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Featured content retrieved successfully\n');
    console.log(`📊 Retrieved ${featuredResponse.data.data.length} articles\n`);
    
    // Display the articles
    console.log('📚 Featured Articles:');
    console.log('====================\n');
    
    featuredResponse.data.data.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Crop: ${article.cropType || 'All Crops'}`);
      console.log(`   Author: ${article.author}`);
      console.log(`   Read Time: ${article.readTime}`);
      console.log(`   Image: ${article.image ? '✅ Yes' : '❌ No'}`);
      if (article.image) {
        console.log(`   Image URL: ${article.image.substring(0, 50)}...`);
      }
      console.log('');
    });
    
    console.log('\n✅ All tests passed! Advisory endpoint is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', JSON.stringify(error.response?.data, null, 2) || error.message);
    process.exit(1);
  }
}

testAdvisoryEndpoint();
