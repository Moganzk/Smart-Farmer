const { body, param, query } = require('express-validator');

const validateCreateMessage = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message content cannot exceed 2000 characters'),
  body('hasAttachment')
    .optional()
    .isBoolean()
    .withMessage('hasAttachment must be a boolean'),
  body('attachmentType')
    .optional()
    .isIn(['image', 'document', 'audio', 'video'])
    .withMessage('Invalid attachment type'),
  body('attachmentPath')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Attachment path cannot exceed 255 characters')
];

const validateUpdateMessage = [
  param('messageId')
    .isInt()
    .withMessage('Invalid message ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message content cannot exceed 2000 characters')
];

const validateGetMessages = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('before')
    .optional()
    .isInt()
    .withMessage('Before must be a valid message ID')
];

const validateGetMessage = [
  param('messageId')
    .isInt()
    .withMessage('Invalid message ID')
];

const validateDeleteMessage = [
  param('messageId')
    .isInt()
    .withMessage('Invalid message ID')
];

const validateSearchMessages = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

module.exports = {
  validateCreateMessage,
  validateUpdateMessage,
  validateGetMessages,
  validateGetMessage,
  validateDeleteMessage,
  validateSearchMessages
};