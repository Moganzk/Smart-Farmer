/**
 * Message Queue Service
 * 
 * Handles message queueing for offline support.
 * This service would normally be used by the mobile app,
 * but we're implementing the backend part that will handle
 * processing messages that were created while offline.
 */

const Message = require('../models/message');
const logger = require('./logger');

class MessageQueue {
  /**
   * Process queued messages from client
   * @param {object[]} queuedMessages - Array of queued messages from client
   * @param {number} userId - User ID of the sender
   * @returns {object} Processing results with successes and failures
   */
  static async processQueuedMessages(queuedMessages, userId) {
    if (!Array.isArray(queuedMessages) || queuedMessages.length === 0) {
      return { 
        processed: 0,
        successes: [],
        failures: []
      };
    }

    const results = {
      processed: queuedMessages.length,
      successes: [],
      failures: []
    };

    // Process each message
    for (const queuedMessage of queuedMessages) {
      try {
        // Validate message has required fields
        if (!queuedMessage.groupId || !queuedMessage.content) {
          results.failures.push({
            clientId: queuedMessage.clientId,
            error: 'Missing required fields'
          });
          continue;
        }

        // Add message to database
        const message = await Message.create({
          groupId: queuedMessage.groupId,
          userId: userId,
          content: queuedMessage.content,
          hasAttachment: queuedMessage.hasAttachment || false,
          attachmentType: queuedMessage.attachmentType,
          attachmentPath: queuedMessage.attachmentPath
        });

        // Record success
        results.successes.push({
          clientId: queuedMessage.clientId,
          messageId: message.message_id,
          createdAt: message.created_at
        });
      } catch (error) {
        logger.error(`Error processing queued message: ${error.message}`, {
          userId,
          clientId: queuedMessage.clientId,
          groupId: queuedMessage.groupId
        });

        // Record failure
        results.failures.push({
          clientId: queuedMessage.clientId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get queue status for client
   * @param {number} userId - User ID
   * @returns {object} Queue status
   */
  static async getQueueStatus(userId) {
    // In a real implementation, this would check the status of any
    // server-side queues for the user. For this implementation,
    // we'll return a simple status object.
    return {
      pending: 0,
      lastProcessed: new Date(),
      serverTime: new Date()
    };
  }
}

module.exports = MessageQueue;