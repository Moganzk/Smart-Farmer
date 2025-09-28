/**
 * Mock USSD Service Implementation
 * 
 * This provides a local implementation for testing without requiring
 * actual USSD provider credentials
 */
const USSDService = require('./USSDService');
const logger = require('../../utils/logger');

// Store active USSD sessions with their state
const sessions = new Map();

class MockUSSDService extends USSDService {
  /**
   * Process incoming USSD request
   * @param {string} sessionId - USSD session ID
   * @param {string} serviceCode - USSD service code (e.g., *123#)
   * @param {string} phoneNumber - User's phone number
   * @param {string} text - USSD input text
   * @returns {Promise<string>} - Response text to display to user
   */
  async processRequest(sessionId, serviceCode, phoneNumber, text) {
    logger.info(`USSD request: ${sessionId}, ${phoneNumber}, text: ${text}`);

    // Create session if it doesn't exist
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        phoneNumber,
        serviceCode,
        level: 0,
        data: {}
      });
      return this.renderMainMenu();
    }

    const session = sessions.get(sessionId);
    const textArray = text.split('*');
    const lastInput = textArray[textArray.length - 1];
    
    switch(session.level) {
      case 0: // Main menu
        return this.handleMainMenu(sessionId, lastInput);
      case 1: // Disease detection submenu
        return this.handleDiseaseMenu(sessionId, lastInput);
      case 2: // Group submenu
        return this.handleGroupMenu(sessionId, lastInput);
      default:
        return this.renderMainMenu();
    }
  }

  /**
   * Start new USSD session with welcome message
   * @param {string} phoneNumber - User's phone number 
   * @returns {Promise<string>} - Welcome message
   */
  async startSession(phoneNumber) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    sessions.set(sessionId, {
      phoneNumber,
      level: 0,
      data: {}
    });
    logger.info(`Started USSD session: ${sessionId} for ${phoneNumber}`);
    
    return {
      sessionId,
      message: this.renderMainMenu()
    };
  }

  /**
   * End active USSD session
   * @param {string} sessionId - USSD session ID
   * @returns {Promise<boolean>} - Success status
   */
  async endSession(sessionId) {
    if (sessions.has(sessionId)) {
      sessions.delete(sessionId);
      logger.info(`Ended USSD session: ${sessionId}`);
      return true;
    }
    return false;
  }

  // Helper methods for menu rendering and handling
  
  renderMainMenu() {
    return "CON Smart Farmer Menu\n1. Check crop disease\n2. Get farming advice\n3. Join group\n4. My account\n";
  }

  renderDiseaseMenu() {
    return "CON Select crop type:\n1. Maize\n2. Tomatoes\n3. Beans\n4. Coffee\n5. Back";
  }

  renderGroupMenu() {
    return "CON Groups:\n1. Join local group\n2. Create new group\n3. My groups\n4. Back";
  }

  renderAccountMenu() {
    return "CON My Account:\n1. Profile\n2. Settings\n3. History\n4. Back";
  }

  async handleMainMenu(sessionId, input) {
    const session = sessions.get(sessionId);
    
    switch(input) {
      case "1":
        session.level = 1;
        return this.renderDiseaseMenu();
      case "2":
        return "END We'll send farming advice to your phone shortly.";
      case "3":
        session.level = 2;
        return this.renderGroupMenu();
      case "4":
        return this.renderAccountMenu();
      default:
        return "END Invalid option. Please dial again.";
    }
  }

  async handleDiseaseMenu(sessionId, input) {
    const session = sessions.get(sessionId);
    
    switch(input) {
      case "1": // Maize
      case "2": // Tomatoes
      case "3": // Beans
      case "4": // Coffee
        return "END Please use our app to upload crop images for disease detection.";
      case "5": // Back
        session.level = 0;
        return this.renderMainMenu();
      default:
        return "END Invalid option. Please dial again.";
    }
  }

  async handleGroupMenu(sessionId, input) {
    const session = sessions.get(sessionId);
    
    switch(input) {
      case "1": // Join local group
        return "END Please use our app to browse and join available farmer groups.";
      case "2": // Create group
        return "END Please use our app to create a new farmer group.";
      case "3": // My groups
        return "END Please use our app to view your farmer groups.";
      case "4": // Back
        session.level = 0;
        return this.renderMainMenu();
      default:
        return "END Invalid option. Please dial again.";
    }
  }
}

module.exports = new MockUSSDService();