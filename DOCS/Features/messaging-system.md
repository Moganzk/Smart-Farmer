# Smart Farmer Messaging System

This module implements the messaging system for the Smart Farmer application, including offline support and profanity filtering.

## Features

### Real-time Messaging
- Group-based messaging for farmers to communicate
- Message editing and deletion
- Support for text messages and attachments

### Offline Support
- Messages created when offline are queued on the device
- Automatic synchronization when connection is restored
- Client-side tracking of message delivery status
- Server-side processing of queued messages

### Content Moderation
- Automatic profanity filtering for all messages
- Configurable profanity word list
- Customizable filtering options
- Applied to both direct and queued messages

## Technical Implementation

### Profanity Filter

The profanity filter is implemented as both a utility and middleware:

1. **Utility (`profanityFilter.js`)**: Provides core filtering functionality
   - Configurable word list
   - Word replacement options
   - Case sensitivity options
   - Methods to check for and clean profanity

2. **Middleware (`middleware/profanityFilter.js`)**: Integrates with Express routes
   - Automatically filters message content before processing
   - Handles both single messages and batch/queued messages
   - Applied to both create and update endpoints

### Offline Message Queue

The offline message queue system consists of:

1. **Client-side Implementation (`offlineMessageQueue.js`)**:
   - Detects online/offline status
   - Queues messages when offline
   - Stores queue in local storage for persistence
   - Processes queue when connection is restored
   - Tracks message delivery status

2. **Server-side Implementation (`utils/messageQueue.js`)**:
   - Processes batches of queued messages
   - Returns success/failure status for each message
   - Handles edge cases and validation
   - Provides queue status information

3. **API Endpoints**:
   - `/api/message-queue/sync`: Process queued messages
   - `/api/message-queue/status`: Get queue status

## Database Structure

The messaging system uses several tables:

- `messages`: Stores all messages
- `message_reactions`: Stores reactions to messages (likes, etc.)
- `offline_message_tracking`: Tracks offline message processing
- `profanity_filter_words`: Stores words for profanity filtering

## Usage Examples

### Sending a Message

```javascript
// Normal message sending
const message = await messageService.sendMessage({
  groupId: 1,
  content: 'Hello farmers!',
  hasAttachment: false
});

// Queued message when offline
const clientId = offlineQueue.queueMessage({
  groupId: 1,
  content: 'This will be sent when online',
  hasAttachment: false
});
```

### Processing Queued Messages

```javascript
// Client-side
await offlineQueue.processQueue();

// Server-side
router.post('/api/message-queue/sync', auth, async (req, res) => {
  const results = await MessageQueue.processQueuedMessages(req.body.messages, req.user.id);
  res.json({ success: true, ...results });
});
```

### Filtering Profanity

```javascript
// Direct usage
const cleanText = profanityFilter.clean('Message with badword1');
// Result: "Message with ****"

// Via middleware (automatic)
router.post('/messages', auth, validate, filterProfanity, MessageController.create);
```

## Future Enhancements

- End-to-end encryption
- Message delivery receipts and read status
- Multi-media attachment support
- Message threading and replies
- Advanced content moderation with AI