/**
 * Real-time Chat Service
 * 
 * Handles WebSocket connections for real-time messaging
 * Uses Socket.IO for WebSocket implementation
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/message');
const Group = require('../models/group');
const User = require('../models/user');
const logger = require('../utils/logger');
const profanityFilter = require('../utils/profanityFilter');
const config = require('../config/config');

class ChatService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.connectedUsers = new Map();
    this.setupSocketHandlers();
    logger.info('Chat service initialized');
  }

  /**
   * Initialize WebSocket handlers
   */
  setupSocketHandlers() {
    this.io.use(this.authenticateSocket.bind(this));
    
    this.io.on('connection', (socket) => {
      const userId = socket.user.id;
      logger.info(`User ${userId} connected to WebSocket`);
      
      // Store user connection
      this.connectedUsers.set(userId, socket.id);
      
      // Update user's online status
      this.updateUserStatus(userId, true);
      
      // Join user's groups
      this.joinUserGroups(socket, userId);
      
      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
        this.connectedUsers.delete(userId);
        this.updateUserStatus(userId, false);
      });
      
      // Handle joining a specific group
      socket.on('join_group', (groupId) => {
        this.handleJoinGroup(socket, userId, groupId);
      });
      
      // Handle leaving a specific group
      socket.on('leave_group', (groupId) => {
        this.handleLeaveGroup(socket, userId, groupId);
      });
      
      // Handle sending a message to a group
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, userId, data);
      });
      
      // Handle typing indicator
      socket.on('typing', (data) => {
        this.handleTypingIndicator(socket, userId, data);
      });
      
      // Handle read receipts
      socket.on('mark_read', (data) => {
        this.handleMarkRead(socket, userId, data);
      });
    });
  }
  
  /**
   * Authenticate WebSocket connection using JWT
   * @param {object} socket - Socket.IO socket
   * @param {function} next - Next function
   */
  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error: Invalid token'));
        }
        
        socket.user = decoded;
        next();
      });
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error'));
    }
  }
  
  /**
   * Update user's online status
   * @param {number} userId - User ID
   * @param {boolean} isOnline - Online status
   */
  async updateUserStatus(userId, isOnline) {
    try {
      await User.updateOnlineStatus(userId, isOnline);
    } catch (error) {
      logger.error(`Error updating user online status: ${error.message}`);
    }
  }
  
  /**
   * Join user to all their groups
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   */
  async joinUserGroups(socket, userId) {
    try {
      const groups = await Group.findByUserId(userId);
      
      for (const group of groups) {
        socket.join(`group:${group.id}`);
        logger.info(`User ${userId} joined WebSocket room for group ${group.id}`);
      }
    } catch (error) {
      logger.error(`Error joining user groups: ${error.message}`);
    }
  }
  
  /**
   * Handle user joining a specific group
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   * @param {number} groupId - Group ID
   */
  async handleJoinGroup(socket, userId, groupId) {
    try {
      const isMember = await Group.isMember(groupId, userId);
      
      if (isMember) {
        socket.join(`group:${groupId}`);
        logger.info(`User ${userId} manually joined WebSocket room for group ${groupId}`);
        
        socket.emit('join_group_success', { groupId });
      } else {
        socket.emit('join_group_error', { 
          groupId, 
          error: 'You are not a member of this group' 
        });
      }
    } catch (error) {
      logger.error(`Error handling join group: ${error.message}`);
      socket.emit('join_group_error', { 
        groupId, 
        error: 'Failed to join group chat' 
      });
    }
  }
  
  /**
   * Handle user leaving a specific group
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   * @param {number} groupId - Group ID
   */
  async handleLeaveGroup(socket, userId, groupId) {
    try {
      socket.leave(`group:${groupId}`);
      logger.info(`User ${userId} left WebSocket room for group ${groupId}`);
      
      socket.emit('leave_group_success', { groupId });
    } catch (error) {
      logger.error(`Error handling leave group: ${error.message}`);
      socket.emit('leave_group_error', { 
        groupId, 
        error: 'Failed to leave group chat' 
      });
    }
  }
  
  /**
   * Handle sending a message to a group
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   * @param {object} data - Message data
   */
  async handleSendMessage(socket, userId, data) {
    try {
      const { groupId, content, hasAttachment, attachmentType, attachmentPath } = data;
      
      // Validate user belongs to group
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        return socket.emit('send_message_error', { 
          error: 'You are not a member of this group' 
        });
      }
      
      // Filter profanity
      const filteredContent = profanityFilter.filter(content);
      
      // Create the message
      const message = await Message.create({
        groupId,
        userId,
        content: filteredContent,
        hasAttachment: hasAttachment || false,
        attachmentType,
        attachmentPath
      });
      
      // Get user info for the message
      const user = await User.findById(userId);
      const messageWithUser = {
        ...message,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar
        }
      };
      
      // Broadcast to group
      this.io.to(`group:${groupId}`).emit('new_message', messageWithUser);
      
      // Send confirmation to sender
      socket.emit('send_message_success', messageWithUser);
      
      logger.info(`User ${userId} sent message to group ${groupId}`);
    } catch (error) {
      logger.error(`Error handling send message: ${error.message}`);
      socket.emit('send_message_error', { 
        error: 'Failed to send message' 
      });
    }
  }
  
  /**
   * Handle typing indicator
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   * @param {object} data - Typing data
   */
  async handleTypingIndicator(socket, userId, data) {
    try {
      const { groupId, isTyping } = data;
      
      // Get user info
      const user = await User.findById(userId);
      
      // Broadcast to group except sender
      socket.to(`group:${groupId}`).emit('user_typing', {
        userId,
        username: user.username,
        displayName: user.displayName,
        groupId,
        isTyping
      });
    } catch (error) {
      logger.error(`Error handling typing indicator: ${error.message}`);
    }
  }
  
  /**
   * Handle read receipts
   * @param {object} socket - Socket.IO socket
   * @param {number} userId - User ID
   * @param {object} data - Read receipt data
   */
  async handleMarkRead(socket, userId, data) {
    try {
      const { groupId, messageId } = data;
      
      // Update message read status
      await Message.markAsRead(messageId, userId);
      
      // Broadcast to group
      this.io.to(`group:${groupId}`).emit('message_read', {
        userId,
        groupId,
        messageId
      });
    } catch (error) {
      logger.error(`Error handling mark read: ${error.message}`);
    }
  }
  
  /**
   * Send a system notification to a group
   * @param {number} groupId - Group ID
   * @param {string} message - System message
   */
  async sendSystemNotification(groupId, message) {
    try {
      const systemMessage = {
        id: `system_${Date.now()}`,
        groupId,
        userId: null,
        content: message,
        isSystemMessage: true,
        createdAt: new Date(),
        user: {
          id: null,
          username: 'System',
          displayName: 'System Notification',
          avatar: null
        }
      };
      
      this.io.to(`group:${groupId}`).emit('new_message', systemMessage);
      
      logger.info(`System notification sent to group ${groupId}: ${message}`);
    } catch (error) {
      logger.error(`Error sending system notification: ${error.message}`);
    }
  }
  
  /**
   * Send a direct message to a specific user
   * @param {number} userId - User ID
   * @param {string} eventName - Socket.IO event name
   * @param {object} data - Event data
   */
  sendToUser(userId, eventName, data) {
    try {
      const socketId = this.connectedUsers.get(userId);
      
      if (socketId) {
        this.io.to(socketId).emit(eventName, data);
        logger.info(`Sent ${eventName} event to user ${userId}`);
      }
    } catch (error) {
      logger.error(`Error sending to user: ${error.message}`);
    }
  }
}

module.exports = ChatService;