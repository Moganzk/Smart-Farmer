# USSD Service

This module provides a USSD (Unstructured Supplementary Service Data) interface for the Smart Farmer application. USSD allows users without smartphones or internet access to interact with the system using feature phones.

## Overview

The USSD service implements a menu-driven interface that allows farmers to:
- Check crop disease information
- Get farming advice
- Join farmer groups
- Manage their account

## Architecture

The service follows an abstract factory pattern with:
- `USSDService` - Base abstract class defining the interface
- `MockUSSDService` - Local implementation for testing
- Future implementations:
  - `AfricasTalkingUSSDService` - Integration with Africa's Talking
  - `HsenidUSSDService` - Integration with hsenid mobile

## Usage

```javascript
const { getUSSDService } = require('./services/ussd');

// Get the configured USSD service
// Options: 'mock', 'africas-talking', 'hsenid'
const ussdService = getUSSDService('mock');

// Handle USSD request
app.post('/ussd/callback', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const response = await ussdService.processRequest(sessionId, serviceCode, phoneNumber, text);
  res.send(response);
});
```

## Menu Structure

1. Main Menu
   - Check crop disease
   - Get farming advice
   - Join group
   - My account

2. Disease Menu
   - Maize
   - Tomatoes
   - Beans
   - Coffee
   - Back

3. Group Menu
   - Join local group
   - Create new group
   - My groups
   - Back

4. Account Menu
   - Profile
   - Settings
   - History
   - Back

## USSD Response Format

- `CON` - Continue the session (show a menu)
- `END` - End the session (show a message and terminate)

Example:
```
CON Smart Farmer Menu
1. Check crop disease
2. Get farming advice
3. Join group
4. My account
```

## Testing

Run the test script to verify USSD functionality:

```
node test/ussd-test.js
```

## Switching Providers

When ready to switch from the mock implementation to a real provider:

1. Create the provider implementation (e.g., `africasTalkingUSSDService.js`)
2. Update the factory in `index.js` to return the new implementation
3. Configure API keys in environment variables

## Future Work

- Add SMS notifications for disease alerts
- Implement offline data synchronization
- Support for more languages (Swahili and local dialects)