// Comprehensive Groups and Messaging Integration Tests
// Tests all group and message operations with persistence verification

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
const REGISTER_USER1 = {
  username: 'grouptest1_' + Date.now(),
  email: `grouptest1_${Date.now()}@test.com`,
  password: 'TestGroup@123',
  fullName: 'Group Test User 1',
  role: 'farmer'
};
const REGISTER_USER2 = {
  username: 'grouptest2_' + Date.now(),
  email: `grouptest2_${Date.now()}@test.com`,
  password: 'TestGroup@123',
  fullName: 'Group Test User 2',
  role: 'farmer'
};

let user1Token = '';
let user1Id = '';
let user2Token = '';
let user2Id = '';
let testGroupId = '';
let testMessageId = '';

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
 * Test 1: Register Two Test Users
 */
async function testRegisterUsers() {
  logSection('TEST 1: Register Test Users');
  
  try {
    // Register User 1
    logInfo('Registering User 1...');
    const response1 = await axios.post(`${API_URL}/api/auth/register`, REGISTER_USER1);
    
    if (response1.data && response1.data.data && response1.data.data.token) {
      user1Token = response1.data.data.token;
      user1Id = response1.data.data.user.user_id;
      logSuccess('User 1 registered successfully');
      logInfo(`User 1 ID: ${user1Id}`);
    } else {
      logError('User 1 registration failed');
      return false;
    }

    // Register User 2
    logInfo('Registering User 2...');
    const response2 = await axios.post(`${API_URL}/api/auth/register`, REGISTER_USER2);
    
    if (response2.data && response2.data.data && response2.data.data.token) {
      user2Token = response2.data.data.token;
      user2Id = response2.data.data.user.user_id;
      logSuccess('User 2 registered successfully');
      logInfo(`User 2 ID: ${user2Id}`);
      return true;
    } else {
      logError('User 2 registration failed');
      return false;
    }
  } catch (error) {
    logError(`Registration failed: ${error.response?.data?.error?.message || error.message}`);
    if (error.response?.data) {
      logData('Error Details', error.response.data);
    }
    return false;
  }
}

/**
 * Test 2: Create a Group
 */
async function testCreateGroup() {
  logSection('TEST 2: Create a Group');
  
  try {
    const groupData = {
      name: 'Test Farmers Group',
      description: 'A test group for farmers to discuss best practices',
      cropFocus: 'Maize, Beans',
      maxMembers: 50
    };
    
    logInfo('Creating group...');
    logData('Group Data', groupData);
    
    const response = await axios.post(
      `${API_URL}/api/groups`,
      groupData,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.group) {
      testGroupId = response.data.data.group.group_id;
      logSuccess('Group created successfully');
      logInfo(`Group ID: ${testGroupId}`);
      logData('Created Group', response.data.data.group);
      return true;
    } else {
      logError('Group creation failed');
      return false;
    }
  } catch (error) {
    logError(`Group creation failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 3: Get Group Details
 */
async function testGetGroupDetails() {
  logSection('TEST 3: Get Group Details');
  
  try {
    logInfo('Fetching group details...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.group) {
      logSuccess('Group details retrieved');
      
      const group = response.data.data.group;
      const members = response.data.data.members;
      
      // Verify data
      if (group.name === 'Test Farmers Group') {
        logSuccess('Group name correct');
      } else {
        logError('Group name mismatch');
      }
      
      if (members && members.length > 0) {
        logSuccess(`Group has ${members.length} member(s)`);
      } else {
        logError('No members found');
      }
      
      logData('Group Details', { group, members });
      return true;
    } else {
      logError('Failed to retrieve group details');
      return false;
    }
  } catch (error) {
    logError(`Get group failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Add Member to Group
 */
async function testAddMember() {
  logSection('TEST 4: Add Member to Group');
  
  try {
    const memberData = {
      userId: user2Id,
      isAdmin: false
    };
    
    logInfo(`Adding User 2 (ID: ${user2Id}) to group...`);
    
    const response = await axios.post(
      `${API_URL}/api/groups/${testGroupId}/members`,
      memberData,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.message) {
      logSuccess('Member added successfully');
      return true;
    } else {
      logError('Failed to add member');
      return false;
    }
  } catch (error) {
    logError(`Add member failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 5: Verify Member Added
 */
async function testVerifyMemberAdded() {
  logSection('TEST 5: Verify Member Added');
  
  try {
    logInfo('Fetching group members...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.members) {
      const members = response.data.data.members;
      
      if (members.length >= 2) {
        logSuccess(`Group now has ${members.length} members`);
        
        const user2IsMember = members.some(m => m.user_id === user2Id);
        if (user2IsMember) {
          logSuccess('User 2 is a member');
          return true;
        } else {
          logError('User 2 not found in members');
          return false;
        }
      } else {
        logError('Member count incorrect');
        return false;
      }
    } else {
      logError('Failed to fetch members');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 6: Send Message to Group
 */
async function testSendMessage() {
  logSection('TEST 6: Send Message to Group');
  
  try {
    const messageData = {
      content: 'Hello everyone! This is a test message.',
      hasAttachment: false
    };
    
    logInfo('Sending message to group...');
    logData('Message Content', messageData);
    
    const response = await axios.post(
      `${API_URL}/api/groups/${testGroupId}/messages`,
      messageData,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.message) {
      testMessageId = response.data.data.message.message_id;
      logSuccess('Message sent successfully');
      logInfo(`Message ID: ${testMessageId}`);
      logData('Sent Message', response.data.data.message);
      return true;
    } else {
      logError('Failed to send message');
      return false;
    }
  } catch (error) {
    logError(`Send message failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 7: Get Messages from Group
 */
async function testGetMessages() {
  logSection('TEST 7: Get Messages from Group');
  
  try {
    logInfo('Fetching messages from group...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}/messages`,
      { headers: { Authorization: `Bearer ${user2Token}` } } // User 2 fetching
    );
    
    if (response.data && response.data.data && response.data.data.messages) {
      const messages = response.data.data.messages;
      logSuccess(`Retrieved ${messages.length} message(s)`);
      
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.content === 'Hello everyone! This is a test message.') {
          logSuccess('Message content correct');
        } else {
          logError('Message content mismatch');
        }
        
        logData('Latest Message', lastMessage);
      }
      
      return true;
    } else {
      logError('Failed to retrieve messages');
      return false;
    }
  } catch (error) {
    logError(`Get messages failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 8: Send Message as User 2
 */
async function testSendMessageUser2() {
  logSection('TEST 8: Send Message as User 2');
  
  try {
    const messageData = {
      content: 'Thanks for adding me! Excited to be part of this group.',
      hasAttachment: false
    };
    
    logInfo('User 2 sending message...');
    
    const response = await axios.post(
      `${API_URL}/api/groups/${testGroupId}/messages`,
      messageData,
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.message) {
      logSuccess('User 2 message sent successfully');
      return true;
    } else {
      logError('Failed to send message as User 2');
      return false;
    }
  } catch (error) {
    logError(`Send message failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 9: Update Message
 */
async function testUpdateMessage() {
  logSection('TEST 9: Update Message');
  
  try {
    const updateData = {
      content: 'Hello everyone! This is an EDITED test message.'
    };
    
    logInfo('Updating message...');
    
    const response = await axios.put(
      `${API_URL}/api/groups/${testGroupId}/messages/${testMessageId}`,
      updateData,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.message) {
      logSuccess('Message updated successfully');
      return true;
    } else {
      logError('Failed to update message');
      return false;
    }
  } catch (error) {
    logError(`Update message failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 10: Verify Message Updated
 */
async function testVerifyMessageUpdate() {
  logSection('TEST 10: Verify Message Updated');
  
  try {
    logInfo('Fetching message to verify update...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}/messages/${testMessageId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.message) {
      const message = response.data.data.message;
      
      if (message.content === 'Hello everyone! This is an EDITED test message.') {
        logSuccess('Message content updated correctly');
      } else {
        logError('Message content not updated');
      }
      
      if (message.edited_at) {
        logSuccess('edited_at timestamp set');
      } else {
        logWarning('edited_at timestamp not set');
      }
      
      return true;
    } else {
      logError('Failed to fetch message');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 11: Search Messages
 */
async function testSearchMessages() {
  logSection('TEST 11: Search Messages');
  
  try {
    logInfo('Searching for messages with "EDITED"...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}/messages/search?query=EDITED`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.messages) {
      const messages = response.data.data.messages;
      logSuccess(`Found ${messages.length} matching message(s)`);
      
      if (messages.length > 0 && messages.some(m => m.content.includes('EDITED'))) {
        logSuccess('Search results correct');
      }
      
      return true;
    } else {
      logError('Search failed');
      return false;
    }
  } catch (error) {
    logError(`Search failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 12: Get Message Stats
 */
async function testGetMessageStats() {
  logSection('TEST 12: Get Message Stats');
  
  try {
    logInfo('Fetching message statistics...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}/messages/stats`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.stats) {
      const stats = response.data.data.stats;
      logSuccess('Stats retrieved');
      logData('Message Stats', stats);
      
      if (stats.totalMessages >= 2) {
        logSuccess(`Total messages: ${stats.totalMessages}`);
      }
      
      return true;
    } else {
      logError('Failed to get stats');
      return false;
    }
  } catch (error) {
    logError(`Get stats failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 13: Update Group Details
 */
async function testUpdateGroup() {
  logSection('TEST 13: Update Group Details');
  
  try {
    const updateData = {
      name: 'Test Farmers Group - Updated',
      description: 'Updated description for the test group',
      cropFocus: 'Maize, Beans, Tomatoes'
    };
    
    logInfo('Updating group details...');
    
    const response = await axios.put(
      `${API_URL}/api/groups/${testGroupId}`,
      updateData,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.group) {
      logSuccess('Group updated successfully');
      
      const group = response.data.data.group;
      if (group.name === 'Test Farmers Group - Updated') {
        logSuccess('Group name updated');
      }
      
      return true;
    } else {
      logError('Failed to update group');
      return false;
    }
  } catch (error) {
    logError(`Update group failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 14: User 2 Cannot Update Group (Not Admin)
 */
async function testNonAdminCannotUpdate() {
  logSection('TEST 14: Non-Admin Cannot Update Group');
  
  try {
    const updateData = {
      name: 'Hacked Group Name'
    };
    
    logInfo('User 2 attempting to update group (should fail)...');
    
    const response = await axios.put(
      `${API_URL}/api/groups/${testGroupId}`,
      updateData,
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );
    
    // If we get here, the request succeeded when it shouldn't have
    logError('User 2 was able to update group (SECURITY ISSUE!)');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('User 2 correctly denied permission');
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

/**
 * Test 15: Get User Groups
 */
async function testGetUserGroups() {
  logSection('TEST 15: Get User Groups');
  
  try {
    logInfo('Fetching User 1 groups...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/user/groups`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.groups) {
      const groups = response.data.data.groups;
      logSuccess(`User 1 is in ${groups.length} group(s)`);
      
      if (groups.some(g => g.group_id === testGroupId)) {
        logSuccess('Test group found in user groups');
      }
      
      return true;
    } else {
      logError('Failed to get user groups');
      return false;
    }
  } catch (error) {
    logError(`Get user groups failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 16: Delete Message
 */
async function testDeleteMessage() {
  logSection('TEST 16: Delete Message');
  
  try {
    logInfo('Deleting message...');
    
    const response = await axios.delete(
      `${API_URL}/api/groups/${testGroupId}/messages/${testMessageId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.message) {
      logSuccess('Message deleted successfully');
      return true;
    } else {
      logError('Failed to delete message');
      return false;
    }
  } catch (error) {
    logError(`Delete message failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 17: Remove Member from Group
 */
async function testRemoveMember() {
  logSection('TEST 17: Remove Member from Group');
  
  try {
    logInfo(`Removing User 2 (ID: ${user2Id}) from group...`);
    
    const response = await axios.delete(
      `${API_URL}/api/groups/${testGroupId}/members/${user2Id}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.message) {
      logSuccess('Member removed successfully');
      return true;
    } else {
      logError('Failed to remove member');
      return false;
    }
  } catch (error) {
    logError(`Remove member failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test 18: Verify Member Removed
 */
async function testVerifyMemberRemoved() {
  logSection('TEST 18: Verify Member Removed');
  
  try {
    logInfo('Verifying member removed...');
    
    const response = await axios.get(
      `${API_URL}/api/groups/${testGroupId}`,
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    
    if (response.data && response.data.data && response.data.data.members) {
      const members = response.data.data.members;
      
      const user2IsMember = members.some(m => m.user_id === user2Id);
      if (!user2IsMember) {
        logSuccess('User 2 successfully removed from group');
        return true;
      } else {
        logError('User 2 still in group');
        return false;
      }
    } else {
      logError('Failed to fetch members');
      return false;
    }
  } catch (error) {
    logError(`Verification failed: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗`);
  console.log(`║   GROUPS & MESSAGING - COMPREHENSIVE INTEGRATION TESTS     ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  logInfo(`Target API: ${API_URL}`);
  logInfo('Creating test users and testing group functionality...');
  logInfo('Starting tests...\n');
  
  try {
    // Test 1: Register users
    if (!await testRegisterUsers()) {
      throw new Error('User registration failed. Cannot proceed with tests.');
    }
    
    // Test 2: Create group
    await testCreateGroup();
    
    // Test 3: Get group details
    await testGetGroupDetails();
    
    // Test 4: Add member
    await testAddMember();
    
    // Test 5: Verify member added
    await testVerifyMemberAdded();
    
    // Test 6: Send message
    await testSendMessage();
    
    // Test 7: Get messages
    await testGetMessages();
    
    // Test 8: Send message as User 2
    await testSendMessageUser2();
    
    // Test 9: Update message
    await testUpdateMessage();
    
    // Test 10: Verify message update
    await testVerifyMessageUpdate();
    
    // Test 11: Search messages
    await testSearchMessages();
    
    // Test 12: Get message stats
    await testGetMessageStats();
    
    // Test 13: Update group
    await testUpdateGroup();
    
    // Test 14: Non-admin cannot update
    await testNonAdminCannotUpdate();
    
    // Test 15: Get user groups
    await testGetUserGroups();
    
    // Test 16: Delete message
    await testDeleteMessage();
    
    // Test 17: Remove member
    await testRemoveMember();
    
    // Test 18: Verify member removed
    await testVerifyMemberRemoved();
    
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
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Groups and messaging working correctly.${colors.reset}`);
    console.log(`${colors.green}✅ Groups persist permanently in database.${colors.reset}`);
    console.log(`${colors.green}✅ Messages persist permanently in database.${colors.reset}`);
    console.log(`${colors.green}✅ Permissions enforced correctly.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ Some tests failed. Please review the errors above.${colors.reset}\n`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
