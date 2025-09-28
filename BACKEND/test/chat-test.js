/**
 * Chat Service Test Script
 * 
 * Simple client to test WebSocket chat functionality
 * This script simulates two users chatting in a group
 */

const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config();

// Test users (using tokens obtained from login)
const USER1_TOKEN = 'test-token-for-user1'; // Replace with actual token
const USER2_TOKEN = 'test-token-for-user2'; // Replace with actual token

// Server URL
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

// Group ID to test with
const TEST_GROUP_ID = 1; // Replace with an actual group ID

// Connect user 1
console.log('Connecting user 1...');
const user1Socket = io(SERVER_URL, {
  auth: { token: USER1_TOKEN }
});

// Connect user 2
console.log('Connecting user 2...');
const user2Socket = io(SERVER_URL, {
  auth: { token: USER2_TOKEN }
});

// User 1 event handlers
user1Socket.on('connect', () => {
  console.log('User 1 connected');
  
  // Join group
  user1Socket.emit('join_group', TEST_GROUP_ID);
});

user1Socket.on('connect_error', (error) => {
  console.error('User 1 connection error:', error.message);
});

user1Socket.on('join_group_success', (data) => {
  console.log('User 1 joined group:', data.groupId);
  
  // Send a test message after 2 seconds
  setTimeout(() => {
    user1Socket.emit('send_message', {
      groupId: TEST_GROUP_ID,
      content: 'Hello from User 1!'
    });
  }, 2000);
});

user1Socket.on('join_group_error', (data) => {
  console.error('User 1 failed to join group:', data.error);
});

user1Socket.on('new_message', (message) => {
  console.log('User 1 received message:', message);
});

user1Socket.on('user_typing', (data) => {
  console.log(`User 1 sees that ${data.displayName} is typing in group ${data.groupId}`);
});

// User 2 event handlers
user2Socket.on('connect', () => {
  console.log('User 2 connected');
  
  // Join group
  user2Socket.emit('join_group', TEST_GROUP_ID);
});

user2Socket.on('connect_error', (error) => {
  console.error('User 2 connection error:', error.message);
});

user2Socket.on('join_group_success', (data) => {
  console.log('User 2 joined group:', data.groupId);
  
  // Show typing indicator
  setTimeout(() => {
    user2Socket.emit('typing', {
      groupId: TEST_GROUP_ID,
      isTyping: true
    });
  }, 3000);
  
  // Send a response message after 4 seconds
  setTimeout(() => {
    user2Socket.emit('send_message', {
      groupId: TEST_GROUP_ID,
      content: 'Hello from User 2!'
    });
    
    // Stop typing
    user2Socket.emit('typing', {
      groupId: TEST_GROUP_ID,
      isTyping: false
    });
  }, 4000);
});

user2Socket.on('join_group_error', (data) => {
  console.error('User 2 failed to join group:', data.error);
});

user2Socket.on('new_message', (message) => {
  console.log('User 2 received message:', message);
  
  // Mark message as read
  if (message.userId !== user2Socket.id) {
    user2Socket.emit('mark_read', {
      groupId: TEST_GROUP_ID,
      messageId: message.id
    });
  }
});

user2Socket.on('user_typing', (data) => {
  console.log(`User 2 sees that ${data.displayName} is typing in group ${data.groupId}`);
});

// Clean up after 10 seconds
setTimeout(() => {
  console.log('\nTest completed, disconnecting...');
  user1Socket.disconnect();
  user2Socket.disconnect();
  process.exit(0);
}, 10000);