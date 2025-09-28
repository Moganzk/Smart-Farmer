# Real-time Chat API Documentation

This document outlines the real-time messaging functionality for the Smart Farmer application.

## Overview

The chat system uses WebSocket connections via Socket.IO to enable real-time messaging between farmers in groups. This allows for instant communication without needing to refresh the page or make repeated HTTP requests.

## Authentication

All WebSocket connections require authentication using a JWT token. The token can be provided in one of two ways:

1. In the connection auth object:
```javascript
const socket = io('http://yourserver.com', {
  auth: { token: 'your-jwt-token' }
});
```

2. As a query parameter:
```javascript
const socket = io('http://yourserver.com?token=your-jwt-token');
```

## Events

### Connection Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Fired when the connection is established |
| `disconnect` | Server → Client | Fired when the connection is closed |
| `connect_error` | Server → Client | Fired when a connection error occurs |

### Group Management Events

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `join_group` | Client → Server | Join a specific group chat | `groupId` (number) |
| `join_group_success` | Server → Client | Successfully joined a group | `{ groupId: number }` |
| `join_group_error` | Server → Client | Failed to join a group | `{ groupId: number, error: string }` |
| `leave_group` | Client → Server | Leave a specific group chat | `groupId` (number) |
| `leave_group_success` | Server → Client | Successfully left a group | `{ groupId: number }` |
| `leave_group_error` | Server → Client | Failed to leave a group | `{ groupId: number, error: string }` |

### Messaging Events

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `send_message` | Client → Server | Send a message to a group | `{ groupId: number, content: string, hasAttachment?: boolean, attachmentType?: string, attachmentPath?: string }` |
| `send_message_success` | Server → Client | Message sent successfully | Message object |
| `send_message_error` | Server → Client | Failed to send message | `{ error: string }` |
| `new_message` | Server → Client | New message received | Message object (see below) |

### Typing Indicators

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `typing` | Client → Server | Indicate user is typing | `{ groupId: number, isTyping: boolean }` |
| `user_typing` | Server → Client | User is typing notification | `{ userId: number, username: string, displayName: string, groupId: number, isTyping: boolean }` |

### Read Receipts

| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `mark_read` | Client → Server | Mark a message as read | `{ groupId: number, messageId: number }` |
| `message_read` | Server → Client | Message read notification | `{ userId: number, groupId: number, messageId: number }` |

## Message Object

Messages returned by the server have the following structure:

```javascript
{
  id: number,
  groupId: number,
  userId: number,
  content: string,
  hasAttachment: boolean,
  attachmentType: string | null,
  attachmentPath: string | null,
  createdAt: string,
  user: {
    id: number,
    username: string,
    displayName: string,
    avatar: string | null
  }
}
```

System messages (server-generated notifications) have a special format:

```javascript
{
  id: string, // Format: 'system_timestamp'
  groupId: number,
  userId: null,
  content: string,
  isSystemMessage: true,
  createdAt: string,
  user: {
    id: null,
    username: 'System',
    displayName: 'System Notification',
    avatar: null
  }
}
```

## Example Usage

### Connecting to the WebSocket server

```javascript
// Import Socket.IO client library
import io from 'socket.io-client';

// Get the JWT token (from login or stored in local storage)
const token = getUserToken();

// Connect to the WebSocket server
const socket = io('http://your-server.com', {
  auth: { token }
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('Failed to connect:', error.message);
});
```

### Joining a group chat

```javascript
// Join a specific group
socket.emit('join_group', groupId);

// Handle join response
socket.on('join_group_success', (data) => {
  console.log(`Successfully joined group ${data.groupId}`);
});

socket.on('join_group_error', (data) => {
  console.error(`Failed to join group ${data.groupId}: ${data.error}`);
});
```

### Sending and receiving messages

```javascript
// Send a text message
socket.emit('send_message', {
  groupId: 123,
  content: 'Hello, group!'
});

// Send a message with an attachment
socket.emit('send_message', {
  groupId: 123,
  content: 'Check out this photo!',
  hasAttachment: true,
  attachmentType: 'image',
  attachmentPath: '/uploads/images/photo.jpg'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log(`New message from ${message.user.displayName}: ${message.content}`);
  // Update UI with new message
});

// Handle send errors
socket.on('send_message_error', (error) => {
  console.error('Failed to send message:', error.error);
});
```

### Typing indicators

```javascript
// Show typing indicator when user starts typing
textField.addEventListener('focus', () => {
  socket.emit('typing', {
    groupId: 123,
    isTyping: true
  });
});

// Hide typing indicator when user stops typing
textField.addEventListener('blur', () => {
  socket.emit('typing', {
    groupId: 123,
    isTyping: false
  });
});

// Listen for typing indicators from other users
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    showTypingIndicator(`${data.displayName} is typing...`);
  } else {
    hideTypingIndicator();
  }
});
```

### Read receipts

```javascript
// Mark a message as read when it's displayed to the user
function markMessageAsRead(message) {
  socket.emit('mark_read', {
    groupId: message.groupId,
    messageId: message.id
  });
}

// Listen for read receipts
socket.on('message_read', (data) => {
  updateReadStatus(data.messageId, data.userId);
});
```

## Error Handling

The WebSocket connection will automatically attempt to reconnect if the connection is lost. However, you should handle errors appropriately in your client application:

```javascript
// Handle errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Show offline indicator to user
});

socket.on('send_message_error', (error) => {
  console.error('Failed to send message:', error.error);
  // Show error to user
});
```

## Limitations

- Maximum message length: 1000 characters
- Maximum attachment size: 5MB
- Maximum 50 concurrent users per chat group
- Rate limiting: 10 messages per minute per user