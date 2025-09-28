const Message = require('../../models/message');
const Group = require('../../models/group');
const logger = require('../../utils/logger');

class MessageController {
  static async create(req, res) {
    try {
      const { groupId } = req.params;
      const { content, hasAttachment, attachmentType, attachmentPath } = req.body;

      const message = await Message.create({
        groupId,
        userId: req.user.user_id,
        content,
        hasAttachment,
        attachmentType,
        attachmentPath
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: { message }
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error sending message'
        }
      });
    }
  }

  static async getMessages(req, res) {
    try {
      const { groupId } = req.params;
      const { limit, before } = req.query;

      // Check if user is a member of the group
      const isMember = await Group.isMember(groupId, req.user.user_id);
      if (!isMember) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be a group member.'
          }
        });
      }

      const messages = await Message.getGroupMessages({
        groupId,
        limit: limit ? parseInt(limit) : undefined,
        before: before ? parseInt(before) : undefined
      });

      res.json({
        data: { messages }
      });
    } catch (error) {
      logger.error('Error getting messages:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving messages'
        }
      });
    }
  }

  static async getMessage(req, res) {
    try {
      const { messageId } = req.params;

      // Check if user can access this message
      const canAccess = await Message.canAccessMessage(messageId, req.user.user_id);
      if (!canAccess) {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const message = await Message.getById(messageId);
      if (!message) {
        return res.status(404).json({
          error: {
            message: 'Message not found'
          }
        });
      }

      res.json({
        data: { message }
      });
    } catch (error) {
      logger.error('Error getting message:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving message'
        }
      });
    }
  }

  static async updateMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      // Check if user can access this message
      const canAccess = await Message.canAccessMessage(messageId, req.user.user_id);
      if (!canAccess) {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const message = await Message.update(messageId, req.user.user_id, { content });

      res.json({
        message: 'Message updated successfully',
        data: { message }
      });
    } catch (error) {
      logger.error('Error updating message:', error);
      if (error.message === 'Message not found or unauthorized') {
        return res.status(404).json({
          error: {
            message: error.message
          }
        });
      }
      res.status(400).json({
        error: {
          message: error.message || 'Error updating message'
        }
      });
    }
  }

  static async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;

      // Check if user can access this message
      const canAccess = await Message.canAccessMessage(messageId, req.user.user_id);
      if (!canAccess) {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      await Message.delete(messageId, req.user.user_id);

      res.json({
        message: 'Message deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      if (error.message === 'Message not found or unauthorized') {
        return res.status(404).json({
          error: {
            message: error.message
          }
        });
      }
      res.status(500).json({
        error: {
          message: 'Error deleting message'
        }
      });
    }
  }

  static async searchMessages(req, res) {
    try {
      const { groupId } = req.params;
      const { query, limit, offset } = req.query;

      // Check if user is a member of the group
      const isMember = await Group.isMember(groupId, req.user.user_id);
      if (!isMember) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be a group member.'
          }
        });
      }

      const messages = await Message.searchMessages({
        groupId,
        query,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      });

      res.json({
        data: { messages }
      });
    } catch (error) {
      logger.error('Error searching messages:', error);
      res.status(500).json({
        error: {
          message: 'Error searching messages'
        }
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { groupId } = req.params;

      // Check if user is a member of the group
      const isMember = await Group.isMember(groupId, req.user.user_id);
      if (!isMember) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be a group member.'
          }
        });
      }

      const stats = await Message.getMessageStats(groupId);

      res.json({
        data: { stats }
      });
    } catch (error) {
      logger.error('Error getting message stats:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving message statistics'
        }
      });
    }
  }
}

module.exports = MessageController;