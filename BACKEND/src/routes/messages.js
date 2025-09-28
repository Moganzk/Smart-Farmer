const express = require('express');
const router = express.Router({ mergeParams: true }); // Allow access to parent route parameters
const MessageController = require('../controllers/messages/message.controller');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  validateCreateMessage,
  validateUpdateMessage,
  validateGetMessages,
  validateGetMessage,
  validateDeleteMessage,
  validateSearchMessages
} = require('../middleware/validate/message.validate');

// Apply auth middleware to all routes
router.use(auth);

// Message routes
router.post('/', validateCreateMessage, validate, MessageController.create);
router.get('/', validateGetMessages, validate, MessageController.getMessages);
router.get('/search', validateSearchMessages, validate, MessageController.searchMessages);
router.get('/stats', MessageController.getStats);
router.get('/:messageId', validateGetMessage, validate, MessageController.getMessage);
router.put('/:messageId', validateUpdateMessage, validate, MessageController.updateMessage);
router.delete('/:messageId', validateDeleteMessage, validate, MessageController.deleteMessage);

module.exports = router;