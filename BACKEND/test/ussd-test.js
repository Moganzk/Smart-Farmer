/**
 * Test file for the USSD service
 * Tests the basic functionality of the USSD service
 */
const assert = require('assert');
const { getUSSDService } = require('../src/services/ussd');

// Get the mock USSD service
const ussdService = getUSSDService('mock');

// Test session data
const testPhone = '+254700000000';
let sessionId = null;

async function runTests() {
  console.log('Starting USSD service tests...');
  
  try {
    // Test starting a session
    console.log('Testing session start...');
    const startResponse = await ussdService.startSession(testPhone);
    sessionId = startResponse.sessionId;
    
    assert(sessionId, 'Session ID should be defined');
    assert(startResponse.message.includes('Smart Farmer Menu'), 'Start message should contain menu text');
    console.log('✓ Session started successfully with ID:', sessionId);
    
    // Test main menu selection (option 1)
    console.log('Testing menu selection (option 1)...');
    const mainMenuResponse = await ussdService.processRequest(
      sessionId,
      '*384*1234#',
      testPhone,
      '1'
    );
    
    assert(mainMenuResponse.includes('Select crop type'), 'Response should show crop selection menu');
    console.log('✓ Main menu selection successful');
    
    // Test crop selection (option 1 - Maize)
    console.log('Testing crop selection (Maize)...');
    const cropResponse = await ussdService.processRequest(
      sessionId,
      '*384*1234#',
      testPhone,
      '1*1'
    );
    
    assert(cropResponse.includes('Please use our app'), 'Response should instruct to use app');
    console.log('✓ Crop selection successful');
    
    // Test invalid option
    console.log('Testing invalid option...');
    const invalidResponse = await ussdService.processRequest(
      sessionId,
      '*384*1234#',
      testPhone,
      '1*9'
    );
    
    assert(invalidResponse.includes('Invalid option'), 'Response should indicate invalid option');
    console.log('✓ Invalid option handling successful');
    
    // Test ending session
    console.log('Testing session end...');
    const endResult = await ussdService.endSession(sessionId);
    assert(endResult === true, 'End session should return true');
    console.log('✓ Session ended successfully');
    
    console.log('\nAll USSD service tests passed! ✓');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the tests
runTests().catch(console.error);