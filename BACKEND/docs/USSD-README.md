# USSD Service Implementation Guide

## Overview

This document provides comprehensive guidance on the USSD service implementation for the Smart Farmer application. The USSD service allows farmers without smartphones to access essential features via basic feature phones.

## Architecture

The USSD service follows a modular architecture with the following components:

1. **Base USSD Service Interface** (`USSDService.js`)
   - Abstract class defining the interface for all USSD service implementations
   - Enforces consistent methods across different providers

2. **USSD Service Factory** (`index.js`)
   - Creates the appropriate USSD service implementation based on configuration
   - Allows switching between providers without changing application code

3. **Mock USSD Service** (`mockUSSDService.js`)
   - Implementation for testing without a real provider
   - Simulates USSD session management and menu navigation

4. **Africa's Talking Implementation** (`africasTalkingUSSDService.js`)
   - Production implementation using Africa's Talking API
   - Handles real USSD requests from the telecom network

5. **USSD Controller** (`controllers/ussd.js`)
   - Processes incoming USSD requests
   - Validates input and forwards to the appropriate service

6. **Menu Structure**
   - Hierarchical menu system with navigation options
   - Support for dynamic content based on user context

## Configuration

The USSD service can be configured via environment variables:

```
# USSD Configuration
USSD_PROVIDER=mock                            # Options: mock, africas-talking
AFRICAS_TALKING_API_KEY=your_api_key_here     # Africa's Talking API key
AFRICAS_TALKING_USERNAME=your_username        # Africa's Talking username
USSD_SERVICE_CODE=*123#                       # USSD service code
USSD_CALLBACK_URL=https://moganspace.live/api/ussd  # Callback URL for USSD requests
```

## Testing Tools

### Interactive Web-Based USSD Tester

The Smart Farmer application includes a comprehensive web-based USSD testing tool that simulates the USSD experience directly in your browser:

1. **Start the testing environment**:
   - Run the `start-ussd-tester.bat` script in the project root
   - This will start the server and open the USSD testing tool in your browser

2. **Testing features**:
   - Simulated phone keypad for intuitive interaction
   - Session history tracking
   - Visual menu map display
   - Customizable phone number and service code
   - Real-time status indicators

3. **Access the tester directly**:
   - URL: `http://localhost:3001/ussd-tester.html`

### Test Endpoints

The following endpoints are available for testing:

1. **Process USSD Request**:
   - `POST /api/ussd`
   - Request body:
     ```json
     {
       "sessionId": "unique-session-id",
       "phoneNumber": "+254700000000",
       "text": "1*2",
       "serviceCode": "*123#"
     }
     ```

2. **Simulate USSD Flow**:
   - `POST /api/ussd-test/simulate`
   - Simulates a complete USSD journey
   - Request body:
     ```json
     {
       "phoneNumber": "+254700000000",
       "inputs": ["", "1", "2"],
       "serviceCode": "*123#"
     }
     ```

3. **Get Menu Structure**:
   - `GET /api/ussd-test/menu`
   - Returns the complete USSD menu hierarchy

### Command-Line Testing

For command-line testing, use the PowerShell script:
```
cd BACKEND
powershell -File test\ussd-test.ps1
```

## Africa's Talking Integration

To integrate with Africa's Talking:

1. **Create an account**
   - Sign up at [Africa's Talking](https://africastalking.com/)
   - Create a new application in the dashboard

2. **Generate API keys**
   - Navigate to your application in the Africa's Talking dashboard
   - Generate API key and note your username

3. **Configure callback URL**
   - In the Africa's Talking dashboard, set up a USSD channel
   - Set the callback URL to your server endpoint: `https://moganspace.live/api/ussd`
   - Note the service code assigned to your application

4. **Update environment variables**
   - Set `USSD_PROVIDER=africas-talking`
   - Configure `AFRICAS_TALKING_API_KEY` and `AFRICAS_TALKING_USERNAME`
   - Set `USSD_SERVICE_CODE` to the assigned code
   - Update `USSD_CALLBACK_URL` if needed

5. **Deploy your application**
   - Ensure your server is publicly accessible
   - Africa's Talking will send requests to your callback URL

6. **Test the integration**
   - Use the Africa's Talking simulator in their dashboard
   - Test with real devices if possible

## Implementation Notes

### Session Management

USSD sessions are stateless but maintain context through the accumulated text input:
- First request: Empty text
- Subsequent requests: Accumulated menu selections separated by asterisks
- Example: `1*2*3` represents selecting option 1, then 2, then 3

### Response Format

USSD responses must follow a specific format:
- `CON` prefix: Continue session, expect more input
- `END` prefix: End session, display final message
- Example: `CON Welcome to Smart Farmer\n1. Disease Detection\n2. My Groups`

### Error Handling

The USSD service implements comprehensive error handling:
- Invalid inputs return to appropriate menus
- System errors end the session with a friendly message
- All errors are logged for analysis

## Security Considerations

1. **Input Validation**
   - All USSD inputs are validated to prevent injection attacks
   - Only accept expected input formats

2. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Consider session frequency limits per phone number

3. **Sensitive Information**
   - Never expose sensitive data via USSD
   - Use masked or partial information when necessary

4. **Session Expiry**
   - USSD sessions automatically expire after provider timeout
   - Implement server-side session expiry as backup

## Troubleshooting

Common issues and solutions:

1. **Session Termination**
   - Problem: Sessions end unexpectedly
   - Solution: Check response format, ensure proper `CON`/`END` prefixes

2. **Menu Navigation Issues**
   - Problem: Can't navigate between menus
   - Solution: Verify text parsing and menu structure logic

3. **Provider Connection Errors**
   - Problem: Can't connect to Africa's Talking
   - Solution: Verify API credentials and network connectivity

## Reference Implementation

The mock USSD service provides a reference implementation for menu structure and navigation logic:

```javascript
// Example menu generation
generateMenu(text) {
  if (text === '') {
    return 'CON Welcome to Smart Farmer USSD Service!\n\n1. Disease Detection\n2. My Groups\n3. Account\n4. Help';
  }
  
  const sections = text.split('*');
  const lastSection = sections[sections.length - 1];
  
  // Main menu options
  if (sections.length === 1) {
    switch(lastSection) {
      case '1':
        return 'CON Disease Detection\n\n1. Identify crop disease\n2. View recent detections\n3. Get advice\n0. Back';
      // Additional menu options...
    }
  }
  
  // Additional menu handling...
}
```

## Additional Resources

- [Africa's Talking USSD API Documentation](https://developers.africastalking.com/docs/ussd/overview)
- [USSD Best Practices Guide](https://docs.africastalking.com/ussd)