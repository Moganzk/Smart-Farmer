const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { filterProfanity } = require('../middleware/profanityFilter');
const MessageQueue = require('../utils/messageQueue');

// Validation middleware for queued messages
const validateQueuedMessages = [
  body('messages').isArray().withMessage('Messages must be an array'),
  body('messages.*.clientId').notEmpty().withMessage('Client ID is required for each message'),
  body('messages.*.groupId').isInt().withMessage('Valid group ID is required for each message'),
  body('messages.*.content').isString().withMessage('Content must be a string')
];

/**
 * @route POST /api/message-queue/sync
 * @description Process offline queued messages
 * @access Private
 */
router.post('/sync', 
  auth, 
  validateQueuedMessages, 
  validate, 
  filterProfanity, 
  async (req, res) => {
    try {
      const { messages } = req.body;
      const userId = req.user.id;

      // Process the queued messages
      const results = await MessageQueue.processQueuedMessages(messages, userId);
      
      return res.json({
        success: true,
        ...results
      });
    } catch (error) {
      console.error('Error processing message queue:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to process message queue' 
      });
    }
});

/**
 * @route GET /api/message-queue/status
 * @description Get queue status for the user
 * @access Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const status = await MessageQueue.getQueueStatus(req.user.id);
    return res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve queue status' 
    });
  }
});

module.exports = router;