/**
 * Profanity Filter Middleware
 * 
 * Middleware to filter profanity from message content
 * before saving or sending messages
 */

const profanityFilter = require('../utils/profanityFilter');

/**
 * Middleware to filter profanity from message content
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const filterProfanity = (req, res, next) => {
  // Filter single message content
  if (req.body && req.body.content) {
    req.body.content = profanityFilter.filter(req.body.content);
  }
  
  // Filter array of messages (for queued messages)
  if (req.body && req.body.messages && Array.isArray(req.body.messages)) {
    req.body.messages = req.body.messages.map(message => {
      if (message && message.content) {
        return {
          ...message,
          content: profanityFilter.filter(message.content)
        };
      }
      return message;
    });
  }

  next();
};

module.exports = { filterProfanity };