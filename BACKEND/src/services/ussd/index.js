/**
 * USSD Service Factory
 * 
 * Provides a factory method to get the appropriate USSD service implementation
 * based on configuration. This allows switching between providers.
 */
const MockUSSDService = require('./mockUSSDService');

// Will implement these provider services when credentials are available
// const AfricasTalkingUSSDService = require('./africasTalkingUSSDService');
// const HsenidUSSDService = require('./hsenidUSSDService');

/**
 * Get the appropriate USSD service implementation
 * @param {string} provider - The provider name ('mock', 'africas-talking', 'hsenid')
 * @returns {USSDService} - The USSD service implementation
 */
function getUSSDService(provider = 'mock') {
  switch(provider.toLowerCase()) {
    case 'africas-talking':
      // return new AfricasTalkingUSSDService();
      throw new Error('Africa\'s Talking USSD service not yet implemented');
    case 'hsenid':
      // return new HsenidUSSDService();
      throw new Error('Hsenid USSD service not yet implemented');
    case 'mock':
    default:
      return MockUSSDService;
  }
}

module.exports = {
  getUSSDService
};