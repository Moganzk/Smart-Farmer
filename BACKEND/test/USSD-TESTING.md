# Smart Farmer USSD Testing Tools

This directory contains tools for testing the USSD functionality of the Smart Farmer application.

## Web-Based USSD Testing Tool

A comprehensive browser-based USSD simulator that provides a visual interface for testing USSD functionality.

### Features

- **Virtual Phone Interface**: Complete with keypad and display
- **Session History**: Track all interactions during a session
- **Menu Map Visualization**: View the complete USSD menu structure
- **Customizable Settings**: Change phone number, service code, and API endpoint

### Usage Instructions

1. **Start the testing environment**:
   ```
   start-ussd-tester.bat
   ```
   This will:
   - Start the backend server
   - Open the USSD testing tool in your browser

2. **Manual Access**:
   - Start the server: `node src/server.js`
   - Navigate to: `http://localhost:3001/ussd-tester.html`

3. **Testing Process**:
   - Press the "Dial" button to initiate a USSD session
   - Use the keypad to navigate through menus
   - View session history on the right panel
   - Click "View Menu Map" to see the complete menu structure

## API Testing Endpoints

The following API endpoints are available for testing:

### 1. Process Single USSD Request

```
POST /api/ussd-test/session
```

**Request Body**:
```json
{
  "sessionId": "test-session-123",
  "phoneNumber": "+254700000000",
  "text": "1*2",
  "serviceCode": "*123#"
}
```

**Response**: Text response from USSD service

### 2. Simulate USSD Flow

```
POST /api/ussd-test/simulate
```

**Request Body**:
```json
{
  "phoneNumber": "+254700000000",
  "inputs": ["", "1", "2"],
  "serviceCode": "*123#"
}
```

**Response**:
```json
{
  "sessionId": "sim-1234567890-123",
  "phoneNumber": "+254700000000",
  "serviceCode": "*123#",
  "results": [
    {
      "input": "Initial dial",
      "response": "CON Welcome to Smart Farmer USSD Service!..."
    },
    {
      "input": "1",
      "response": "CON Disease Detection..."
    },
    {
      "input": "2",
      "response": "CON View recent detections..."
    }
  ]
}
```

### 3. Get Menu Structure

```
GET /api/ussd-test/menu
```

**Response**: JSON representation of the USSD menu structure

## Automated Tests

Automated test scripts are available in the `test` directory:

1. **PowerShell Test Script**:
   ```
   powershell -File test\ussd-test.ps1
   ```
   Runs a series of predefined test cases against the USSD API

2. **Interactive Node.js Test**:
   ```
   node test\ussd-interactive-test.js
   ```
   Interactive CLI-based testing tool for USSD functionality

## Integration with Africa's Talking

For detailed instructions on integrating with Africa's Talking, refer to the comprehensive documentation in `docs/USSD-README.md`.

## Troubleshooting

**Issue**: USSD response not showing in browser tool
- **Solution**: Check browser console for errors; ensure server is running

**Issue**: Session ends unexpectedly
- **Solution**: Verify that responses properly use CON/END prefixes

**Issue**: Menu navigation doesn't work
- **Solution**: Check the text input format; should include all previous selections