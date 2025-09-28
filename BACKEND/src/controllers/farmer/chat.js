// src/controllers/farmer/chat.js
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for chat image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/messages');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `message_${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit for message images
});

/**
 * Get messages for a specific group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroupMessages = async (req, res) => {
  const userId = req.user.user_id;
  const { groupId } = req.params;
  const { limit = 50, before } = req.query;
  
  try {
    // Check if user is a member of the group
    const memberResult = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    
    if (memberResult.rows.length === 0) {
      return responses.forbidden(res, 'You are not a member of this group');
    }
    
    // Build query based on pagination
    let query = `
      SELECT 
        m.message_id, m.content, m.image_path, m.created_at,
        u.user_id, u.username, u.profile_image
      FROM messages m
      JOIN users u ON m.user_id = u.user_id
      WHERE m.group_id = $1 AND m.is_active = true
    `;
    
    const queryParams = [groupId];
    let paramCounter = 2;
    
    // Add pagination with cursor-based pagination
    if (before) {
      query += ` AND m.created_at < (SELECT created_at FROM messages WHERE message_id = $${paramCounter++})`;
      queryParams.push(before);
    }
    
    query += ` ORDER BY m.created_at DESC LIMIT $${paramCounter}`;
    queryParams.push(limit);
    
    const result = await pool.query(query, queryParams);
    
    // Reverse to get chronological order
    const messages = result.rows.reverse();
    
    return responses.success(res, {
      messages,
      pagination: {
        limit: parseInt(limit),
        has_more: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching group messages:', error);
    return responses.serverError(res, 'Failed to fetch messages');
  }
};

/**
 * Send a text message to a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendTextMessage = async (req, res) => {
  const userId = req.user.user_id;
  const { groupId } = req.params;
  const { content } = req.body;
  
  try {
    // Validate content
    if (!content || content.trim().length === 0) {
      return responses.badRequest(res, 'Message content cannot be empty');
    }
    
    if (content.length > 1000) {
      return responses.badRequest(res, 'Message is too long. Maximum length is 1000 characters');
    }
    
    // Check if user is a member of the group
    const memberResult = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    
    if (memberResult.rows.length === 0) {
      return responses.forbidden(res, 'You are not a member of this group');
    }
    
    // Check for profanity (simplified for now, can be enhanced)
    const profanityFilter = (text) => {
      const profanityList = ['badword1', 'badword2', 'badword3']; // Sample list
      return profanityList.some(word => text.toLowerCase().includes(word));
    };
    
    if (profanityFilter(content)) {
      return responses.badRequest(res, 'Message contains inappropriate content');
    }
    
    // Insert message
    const result = await pool.query(
      `INSERT INTO messages 
        (group_id, user_id, content, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING message_id, content, created_at`,
      [groupId, userId, content]
    );
    
    // Get user info
    const userResult = await pool.query(
      'SELECT user_id, username, profile_image FROM users WHERE user_id = $1',
      [userId]
    );
    
    const message = {
      ...result.rows[0],
      user_id: userId,
      username: userResult.rows[0].username,
      profile_image: userResult.rows[0].profile_image
    };
    
    // Update group's last activity timestamp
    await pool.query(
      'UPDATE groups SET last_activity = CURRENT_TIMESTAMP WHERE group_id = $1',
      [groupId]
    );
    
    return responses.success(res, { message }, 201);
  } catch (error) {
    logger.error('Error sending message:', error);
    return responses.serverError(res, 'Failed to send message');
  }
};

/**
 * Send an image message to a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendImageMessage = async (req, res) => {
  const userId = req.user.user_id;
  const { groupId } = req.params;
  
  // Use multer to handle the image upload
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return responses.badRequest(res, 'File too large. Maximum size is 3MB.');
      }
      return responses.badRequest(res, `Upload error: ${err.message}`);
    } else if (err) {
      return responses.badRequest(res, err.message);
    }
    
    // If no file was uploaded
    if (!req.file) {
      return responses.badRequest(res, 'No image uploaded');
    }
    
    const imagePath = `/uploads/messages/${req.file.filename}`;
    const { content } = req.body; // Optional caption
    
    try {
      // Check if user is a member of the group
      const memberResult = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
      );
      
      if (memberResult.rows.length === 0) {
        // Delete the uploaded file
        const fullImagePath = path.join(__dirname, '../../../', imagePath);
        if (fs.existsSync(fullImagePath)) {
          fs.unlinkSync(fullImagePath);
        }
        return responses.forbidden(res, 'You are not a member of this group');
      }
      
      // Insert message with image
      const result = await pool.query(
        `INSERT INTO messages 
          (group_id, user_id, content, image_path, created_at) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING message_id, content, image_path, created_at`,
        [groupId, userId, content || null, imagePath]
      );
      
      // Get user info
      const userResult = await pool.query(
        'SELECT user_id, username, profile_image FROM users WHERE user_id = $1',
        [userId]
      );
      
      const message = {
        ...result.rows[0],
        user_id: userId,
        username: userResult.rows[0].username,
        profile_image: userResult.rows[0].profile_image
      };
      
      // Update group's last activity timestamp
      await pool.query(
        'UPDATE groups SET last_activity = CURRENT_TIMESTAMP WHERE group_id = $1',
        [groupId]
      );
      
      // Update user's storage used
      await pool.query(
        'UPDATE users SET storage_used = storage_used + $1 WHERE user_id = $2',
        [req.file.size, userId]
      );
      
      return responses.success(res, { message }, 201);
    } catch (error) {
      // Delete the uploaded file if there was an error
      const fullImagePath = path.join(__dirname, '../../../', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
      
      logger.error('Error sending image message:', error);
      return responses.serverError(res, 'Failed to send image message');
    }
  });
};

/**
 * Delete a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMessage = async (req, res) => {
  const userId = req.user.user_id;
  const { messageId } = req.params;
  
  try {
    // Get message details
    const messageResult = await pool.query(
      'SELECT * FROM messages WHERE message_id = $1',
      [messageId]
    );
    
    if (messageResult.rows.length === 0) {
      return responses.notFound(res, 'Message not found');
    }
    
    const message = messageResult.rows[0];
    
    // Check if user is the sender or a group admin
    if (message.user_id !== userId) {
      // Check if user is a group admin
      const adminResult = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_admin = true',
        [message.group_id, userId]
      );
      
      if (adminResult.rows.length === 0) {
        return responses.forbidden(res, 'You can only delete your own messages or must be a group admin');
      }
    }
    
    // Soft delete the message
    await pool.query(
      'UPDATE messages SET is_active = false, content = NULL WHERE message_id = $1',
      [messageId]
    );
    
    // If there's an image, delete it from storage
    if (message.image_path) {
      const fullImagePath = path.join(__dirname, '../../../', message.image_path);
      if (fs.existsSync(fullImagePath)) {
        const fileStats = fs.statSync(fullImagePath);
        fs.unlinkSync(fullImagePath);
        
        // Update user's storage used
        await pool.query(
          'UPDATE users SET storage_used = storage_used - $1 WHERE user_id = $2',
          [fileStats.size, message.user_id]
        );
      }
      
      // Remove image path from message
      await pool.query(
        'UPDATE messages SET image_path = NULL WHERE message_id = $1',
        [messageId]
      );
    }
    
    return responses.success(res, { 
      message: 'Message deleted successfully',
      message_id: messageId
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    return responses.serverError(res, 'Failed to delete message');
  }
};

/**
 * Report a message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reportMessage = async (req, res) => {
  const userId = req.user.user_id;
  const { messageId } = req.params;
  const { reason } = req.body;
  
  try {
    // Check if message exists
    const messageResult = await pool.query(
      'SELECT * FROM messages WHERE message_id = $1 AND is_active = true',
      [messageId]
    );
    
    if (messageResult.rows.length === 0) {
      return responses.notFound(res, 'Message not found');
    }
    
    const message = messageResult.rows[0];
    
    // Check if user has already reported this message
    const existingReportResult = await pool.query(
      'SELECT * FROM message_reports WHERE message_id = $1 AND reported_by = $2',
      [messageId, userId]
    );
    
    if (existingReportResult.rows.length > 0) {
      return responses.badRequest(res, 'You have already reported this message');
    }
    
    // Create report
    await pool.query(
      `INSERT INTO message_reports 
        (message_id, reported_by, reason, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [messageId, userId, reason || 'Inappropriate content']
    );
    
    return responses.success(res, { 
      message: 'Message reported successfully',
      message_id: messageId
    });
  } catch (error) {
    logger.error('Error reporting message:', error);
    return responses.serverError(res, 'Failed to report message');
  }
};

module.exports = {
  getGroupMessages,
  sendTextMessage,
  sendImageMessage,
  deleteMessage,
  reportMessage
};