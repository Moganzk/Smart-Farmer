/**
 * USSD Service Interface
 * 
 * This module provides a generic interface for USSD services that can be
 * implemented by different providers (Africa's Talking, hsenid, etc.)
 */
class USSDService {
  /**
   * Process incoming USSD request
   * @param {string} sessionId - USSD session ID
   * @param {string} serviceCode - USSD service code (e.g., *123#)
   * @param {string} phoneNumber - User's phone number
   * @param {string} text - USSD input text
   * @returns {Promise<string>} - Response text to display to user
   */
  async processRequest(sessionId, serviceCode, phoneNumber, text) {
    throw new Error('Method not implemented');
  }

  /**
   * Start new USSD session with welcome message
   * @param {string} phoneNumber - User's phone number 
   * @returns {Promise<string>} - Welcome message
   */
  async startSession(phoneNumber) {
    throw new Error('Method not implemented');
  }

  /**
   * End active USSD session
   * @param {string} sessionId - USSD session ID
   * @returns {Promise<boolean>} - Success status
   */
  async endSession(sessionId) {
    throw new Error('Method not implemented');
  }
}

module.exports = USSDService;