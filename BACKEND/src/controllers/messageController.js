/**
 * Message Controller
 * 
 * Handles all message-related operations and business logic
 */

const Message = require('../models/message');
const Group = require('../models/group');
const logger = require('../utils/logger');

class MessageController {
  /**
   * Get messages for a specific group
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getMessagesByGroup(req, res) {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;
      
      // Validate user belongs to group
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not a member of this group' 
        });
      }
      
      // Get messages with pagination
      const offset = (page - 1) * limit;
      const messages = await Message.findByGroup(groupId, limit, offset);
      const totalCount = await Message.countByGroup(groupId);
      
      return res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Error getting messages: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get messages' 
      });
    }
  }
  
  /**
   * Create a new message
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async create(req, res) {
    try {
      const { groupId, content, hasAttachment, attachmentType, attachmentPath } = req.body;
      const userId = req.user.id;
      
      // Validate user belongs to group
      const isMember = await Group.isMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not a member of this group' 
        });
      }
      
      // Create the message
      const message = await Message.create({
        groupId,
        userId,
        content,
        hasAttachment: hasAttachment || false,
        attachmentType,
        attachmentPath
      });
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error(`Error creating message: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create message' 
      });
    }
  }
  
  /**
   * Update a message
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateMessage(req, res) {
    try {
      const { content } = req.body;
      const messageId = parseInt(req.params.messageId);
      const userId = req.user.id;
      
      // Get the message and check ownership
      const message = await Message.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: 'Message not found' 
        });
      }
      
      if (message.user_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own messages' 
        });
      }
      
      // Update the message
      const updatedMessage = await Message.update(messageId, { content });
      
      return res.json({
        success: true,
        data: updatedMessage
      });
    } catch (error) {
      logger.error(`Error updating message: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update message' 
      });
    }
  }
  
  /**
   * Delete a message
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteMessage(req, res) {
    try {
      const messageId = parseInt(req.params.messageId);
      const userId = req.user.id;
      
      // Get the message and check ownership
      const message = await Message.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: 'Message not found' 
        });
      }
      
      if (message.user_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own messages' 
        });
      }
      
      // Delete the message
      await Message.delete(messageId);
      
      return res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting message: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete message' 
      });
    }
  }
}

module.exports = MessageController;