/**
 * Message routes
 * Handles all message-related endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const MessageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { filterProfanity } = require('../middleware/profanityFilter');

// Validation middleware for creating a message
const validateCreateMessage = [
  body('groupId').isInt().withMessage('Group ID must be an integer'),
  body('content').isString().notEmpty().withMessage('Content is required'),
  body('hasAttachment').optional().isBoolean().withMessage('Has attachment must be boolean'),
  body('attachmentType').optional().isString().withMessage('Attachment type must be a string'),
  body('attachmentPath').optional().isString().withMessage('Attachment path must be a string')
];

// Validation middleware for updating a message
const validateUpdateMessage = [
  body('content').isString().notEmpty().withMessage('Content is required'),
];

/**
 * @route GET /api/messages/:groupId
 * @description Get messages for a group
 * @access Private
 */
router.get('/:groupId', auth, MessageController.getMessagesByGroup);

/**
 * @route POST /api/messages
 * @description Create a new message
 * @access Private
 */
router.post('/', 
  auth, 
  validateCreateMessage, 
  validate, 
  filterProfanity, // Apply profanity filter
  MessageController.create
);

/**
 * @route PUT /api/messages/:messageId
 * @description Update a message
 * @access Private
 */
router.put('/:messageId', 
  auth, 
  validateUpdateMessage, 
  validate, 
  filterProfanity, // Apply profanity filter
  MessageController.updateMessage
);

/**
 * @route DELETE /api/messages/:messageId
 * @description Delete a message
 * @access Private
 */
router.delete('/:messageId', auth, MessageController.deleteMessage);

module.exports = router;