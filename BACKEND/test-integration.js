// Integration test script for the messaging system
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { filterProfanity } = require('./src/middleware/profanityFilter');

// Middleware
app.use(bodyParser.json());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // Set mock authenticated user
  req.user = {
    id: 1,
    username: 'testuser'
  };
  next();
};

// Setup test routes with profanity filter
app.post('/test/message', mockAuth, filterProfanity, (req, res) => {
  // Return the filtered message
  return res.json({
    success: true,
    originalContent: req.body.originalContent,
    filteredContent: req.body.content
  });
});

app.post('/test/message-queue', mockAuth, filterProfanity, (req, res) => {
  // Return the filtered messages
  return res.json({
    success: true,
    messages: req.body.messages
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

// Start the test server
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Run the tests after server starts
  runTests()
    .then(() => {
      console.log('\nAll tests completed');
      // Close the server after tests
      server.close();
      process.exit(0);
    })
    .catch(err => {
      console.error('Test failed:', err);
      server.close();
      process.exit(1);
    });
});

// Test functions
async function runTests() {
  // Test single message profanity filtering
  await testSingleMessage();
  
  // Test batch message profanity filtering (for queue)
  await testMessageQueue();
}

async function testSingleMessage() {
  console.log('\n1. Testing single message profanity filter:');
  console.log('----------------------------------------');
  
  try {
    // Make a request to our test endpoint
    const response = await fetch('http://localhost:3001/test/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalContent: 'This message has damn and hell words that should be filtered',
        content: 'This message has damn and hell words that should be filtered'
      })
    });
    
    const data = await response.json();
    
    console.log('Original:', data.originalContent);
    console.log('Filtered:', data.filteredContent);
    
    // Check if filtering worked
    if (data.filteredContent.includes('damn') || data.filteredContent.includes('hell')) {
      throw new Error('Profanity filter failed to filter bad words');
    } else {
      console.log('✓ Profanity filter working correctly');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  }
}

async function testMessageQueue() {
  console.log('\n2. Testing message queue batch filtering:');
  console.log('---------------------------------------');
  
  try {
    // Make a request to our test endpoint
    const response = await fetch('http://localhost:3001/test/message-queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            clientId: 'test1',
            groupId: 1,
            content: 'First message with damn word',
            hasAttachment: false
          },
          {
            clientId: 'test2',
            groupId: 2,
            content: 'Second message with hell word',
            hasAttachment: false
          }
        ]
      })
    });
    
    const data = await response.json();
    
    // Check messages
    console.log('Filtered messages:');
    data.messages.forEach((msg, i) => {
      console.log(`- Message ${i + 1}: ${msg.content}`);
      
      // Check if filtering worked
      if (msg.content.includes('damn') || msg.content.includes('hell')) {
        throw new Error(`Profanity filter failed on message ${i + 1}`);
      }
    });
    
    console.log('✓ Batch message filtering working correctly');
  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  }
}