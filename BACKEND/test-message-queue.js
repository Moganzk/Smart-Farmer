// Simple test for message queue

// Import the message queue service
const MessageQueue = require('./src/utils/messageQueue');

// Mock user ID for testing
const userId = 1;

// Sample queued messages
const queuedMessages = [
  {
    clientId: 'client_msg_001',
    groupId: 1,
    content: 'This is a test message with damn word that should be filtered',
    hasAttachment: false
  },
  {
    clientId: 'client_msg_002',
    groupId: 2,
    content: 'Another test message for group 2',
    hasAttachment: false
  },
  {
    clientId: 'client_msg_003',
    // Missing groupId to test validation
    content: 'This message should fail validation'
  }
];

// Test processing queued messages
async function testMessageQueue() {
  console.log("Testing message queue processing:");
  console.log("--------------------------------");
  
  try {
    // Process the queued messages
    const results = await MessageQueue.processQueuedMessages(queuedMessages, userId);
    
    // Output results
    console.log("\nProcessing Results:");
    console.log(`Total processed: ${results.processed}`);
    console.log(`Successful: ${results.successes.length}`);
    console.log(`Failed: ${results.failures.length}`);
    
    if (results.successes.length > 0) {
      console.log("\nSuccessful messages:");
      results.successes.forEach(success => {
        console.log(`- Client ID: ${success.clientId}, Server ID: ${success.messageId}`);
      });
    }
    
    if (results.failures.length > 0) {
      console.log("\nFailed messages:");
      results.failures.forEach(failure => {
        console.log(`- Client ID: ${failure.clientId}, Error: ${failure.error}`);
      });
    }
    
    // Get queue status
    const status = await MessageQueue.getQueueStatus(userId);
    console.log("\nQueue Status:");
    console.log(status);
    
  } catch (error) {
    console.error("Error in test:", error);
  }
}

// Run the test
testMessageQueue();