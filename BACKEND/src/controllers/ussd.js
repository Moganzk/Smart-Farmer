/**
 * USSD Controller
 * 
 * Handles USSD requests and routes them to the appropriate USSD service.
 */
const { getUSSDService } = require('../services/ussd');
const config = require('../config/config');
const logger = require('../utils/logger');

// Get configured USSD service
const ussdService = getUSSDService(config.ussd?.provider || 'mock');

/**
 * Handle USSD callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleUSSDCallback = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    logger.info(`USSD request received: ${sessionId}, ${phoneNumber}, text: ${text}`);
    
    if (!sessionId || !phoneNumber) {
      return res.status(400).send('Missing required parameters');
    }
    
    const response = await ussdService.processRequest(
      sessionId,
      serviceCode || '*384*1234#', // Default service code if not provided
      phoneNumber,
      text || ''
    );
    
    // Return response in the format expected by USSD gateway
    return res.send(response);
  } catch (error) {
    logger.error(`USSD error: ${error.message}`, error);
    return res.status(500).send('END An error occurred. Please try again later.');
  }
};

/**
 * Start a new USSD session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.startUSSDSession = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }
    
    const result = await ussdService.startSession(phoneNumber);
    
    return res.status(200).json({
      success: true,
      sessionId: result.sessionId,
      message: result.message
    });
  } catch (error) {
    logger.error(`Failed to start USSD session: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start USSD session'
    });
  }
};

/**
 * End an active USSD session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.endUSSDSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    const success = await ussdService.endSession(sessionId);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'USSD session ended successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'USSD session not found'
      });
    }
  } catch (error) {
    logger.error(`Failed to end USSD session: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to end USSD session'
    });
  }
};