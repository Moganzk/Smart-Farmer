# Smart Farmer - Test Suite

Comprehensive test suite for Smart Farmer frontend authentication and network connectivity.

## Test Files

### 1. `network.test.js`
Tests network connectivity and ADB port forwarding:
- ✅ ADB device connection
- ✅ Port forwarding (3001, 8081, 19000)
- ✅ Backend reachability
- ✅ API response times
- ✅ Port availability
- ✅ Timeout detection

### 2. `auth.test.js`
Tests authentication flow:
- ✅ Backend health check
- ✅ User registration
- ✅ Password validation rules
- ✅ User login
- ✅ Token generation
- ✅ Protected route access
- ✅ Error handling

### 3. `run-all.js`
Master test runner that executes all test suites and provides a comprehensive summary.

## Prerequisites

1. **Backend Running**: Make sure backend is running on `http://localhost:3001`
2. **ADB Connected**: Phone must be connected via ADB
3. **Port Forwarding**: ADB reverse ports must be configured
4. **Node.js**: Node.js must be installed

## Running Tests

### Run All Tests
```bash
cd FRONTEND
node tests/run-all.js
```

### Run Individual Test Suites

**Network Tests Only:**
```bash
node tests/network.test.js
```

**Authentication Tests Only:**
```bash
node tests/auth.test.js
```

## Test Output

Tests use colored output for easy reading:
- 🟢 **Green**: Tests passed
- 🔴 **Red**: Tests failed
- 🟡 **Yellow**: Warnings or additional info
- 🔵 **Blue**: Headers and summaries

### Example Output

```
🧪 SMART FARMER - COMPREHENSIVE TEST SUITE
============================================================

🌐 Starting Network Tests

Test 1: ADB Device Connection
✅ ADB device connected
   Found 1 device(s)

Test 2: ADB Port Forwarding
✅ Port forwarding active
   All ports forwarded

Test 3: Backend Reachability (localhost)
✅ Backend reachable on localhost
   Response time: 45ms

...

📊 FINAL SUMMARY
============================================================

🌐 Network Tests: 7 passed, 0 failed
🔐 Auth Tests: 9 passed, 0 failed

📈 Overall: 16/16 tests passed (100.0%)
============================================================

🎉 ALL TESTS PASSED! 🎉
✅ Your Smart Farmer app is ready for action!
```

## What Each Test Validates

### Network Tests

| Test | What It Checks | Why It Matters |
|------|----------------|----------------|
| ADB Connection | `adb devices` shows connected device | Phone can communicate with computer |
| Port Forwarding | tcp:3001, 8081, 19000 are forwarded | App can reach backend via localhost |
| Backend Reachability | `GET /health` returns 200 | Backend is running and accessible |
| Response Time | Average < 1000ms | No timeout issues |
| Port Listening | Backend listening on 3001 | Backend server is active |
| Metro Running | Metro on port 8081 | Development server ready |
| Timeout Check | Request completes < 5s | Network is fast enough |

### Authentication Tests

| Test | What It Checks | Why It Matters |
|------|----------------|----------------|
| Health Check | Backend responds to /health | Backend API is working |
| Registration | Can create new user | User can sign up |
| Invalid Password | Rejects weak passwords | Security is enforced |
| Missing Fields | Rejects incomplete data | Validation works |
| Login | Can authenticate with credentials | User can sign in |
| Invalid Credentials | Rejects wrong password | Security works |
| Protected Route | Can access with token | JWT auth works |
| No Token Access | Blocks access without token | Security enforced |
| Password Rules | All validation rules work | Passwords are secure |

## Troubleshooting

### "Backend may not be running"
**Fix:**
```bash
cd BACKEND
npm start
```

### "No devices found"
**Fix:**
```bash
adb connect <your-phone-ip>:41015
adb devices
```

### "Port forwarding not active"
**Fix:**
```bash
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

### "Tests timing out"
**Fix:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Check ADB connection: `adb devices`
3. Restart port forwarding (see above)

## Adding New Tests

To add new tests, follow this pattern:

```javascript
// Test N: Your Test Name
try {
  log('\nTest N: Your Test Name', 'yellow');
  
  // Your test logic here
  const passed = /* your condition */;
  
  logTest('Test description', passed, 'Additional info');
  passed ? testsPassed++ : testsFailed++;
} catch (error) {
  logTest('Test description', false, error.message);
  testsFailed++;
}
```

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - name: Run Tests
      run: |
        cd FRONTEND
        node tests/run-all.js
```

## Best Practices

1. **Run tests before committing** to catch issues early
2. **Run all tests** to ensure nothing is broken
3. **Check test output** for warnings and suggestions
4. **Fix failures immediately** before continuing development
5. **Keep backend running** during development for quick testing

## Test Coverage

Current test coverage:
- ✅ Network connectivity: 100%
- ✅ Authentication flow: 100%
- ⏳ Disease detection: Coming soon
- ⏳ Advisory service: Coming soon
- ⏳ Group chat: Coming soon

## Support

If tests are failing and you're not sure why:

1. Read the error messages carefully
2. Check the "Troubleshooting" section above
3. Review `DOCS/` for detailed setup guides
4. Ensure all prerequisites are met

---

**Happy Testing! 🧪✨**
