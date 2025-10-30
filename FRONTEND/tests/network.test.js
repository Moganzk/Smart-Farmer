/**
 * Network Connection Tests
 * Tests ADB port forwarding and network connectivity
 */

const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (message) {
    log(`   ${message}`, 'yellow');
  }
}

async function runNetworkTests() {
  log('\n🌐 Starting Network Tests\n', 'blue');
  
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: ADB Connection
  try {
    log('Test 1: ADB Device Connection', 'yellow');
    const { stdout } = await execPromise('adb devices');
    const devices = stdout.split('\n').filter(line => line.includes('device') && !line.includes('List'));
    const passed = devices.length > 0;
    logTest('ADB device connected', passed, passed ? `Found ${devices.length} device(s)` : 'No devices found');
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    logTest('ADB device connected', false, error.message);
    testsFailed++;
  }

  // Test 2: ADB Port Forwarding
  try {
    log('\nTest 2: ADB Port Forwarding', 'yellow');
    const { stdout } = await execPromise('adb reverse --list');
    const hasBackend = stdout.includes('tcp:3001');
    const hasMetro = stdout.includes('tcp:8081');
    const hasExpo = stdout.includes('tcp:19000');
    
    const passed = hasBackend && hasMetro && hasExpo;
    const missing = [];
    if (!hasBackend) missing.push('3001 (backend)');
    if (!hasMetro) missing.push('8081 (metro)');
    if (!hasExpo) missing.push('19000 (expo)');
    
    logTest('Port forwarding active', passed, passed ? 'All ports forwarded' : `Missing: ${missing.join(', ')}`);
    passed ? testsPassed++ : testsFailed++;
    
    if (!passed) {
      log('   ℹ️  Run these commands to fix:', 'blue');
      if (!hasBackend) log('      adb reverse tcp:3001 tcp:3001', 'yellow');
      if (!hasMetro) log('      adb reverse tcp:8081 tcp:8081', 'yellow');
      if (!hasExpo) log('      adb reverse tcp:19000 tcp:19000', 'yellow');
    }
  } catch (error) {
    logTest('Port forwarding active', false, error.message);
    testsFailed++;
  }

  // Test 3: Backend Reachability (localhost)
  try {
    log('\nTest 3: Backend Reachability (localhost)', 'yellow');
    const start = Date.now();
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    const duration = Date.now() - start;
    
    const passed = response.status === 200;
    logTest('Backend reachable on localhost', passed, `Response time: ${duration}ms`);
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    logTest('Backend reachable on localhost', false, error.message);
    testsFailed++;
  }

  // Test 4: API Response Time
  try {
    log('\nTest 4: API Response Time', 'yellow');
    const times = [];
    
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await axios.get('http://localhost:3001/health');
      times.push(Date.now() - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const passed = avgTime < 1000; // Should be under 1 second
    
    logTest('Average response time < 1s', passed, `Average: ${avgTime.toFixed(0)}ms (${times.map(t => t + 'ms').join(', ')})`);
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    logTest('Average response time < 1s', false, error.message);
    testsFailed++;
  }

  // Test 5: Backend Ports
  try {
    log('\nTest 5: Backend Listening on Port 3001', 'yellow');
    const { stdout } = await execPromise('netstat -ano | findstr :3001');
    const passed = stdout.includes('LISTENING') || stdout.includes('3001');
    logTest('Backend listening on port 3001', passed);
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    // On Windows, if nothing is listening, netstat returns empty
    logTest('Backend listening on port 3001', false, 'Backend may not be running');
    testsFailed++;
  }

  // Test 6: Metro Port
  try {
    log('\nTest 6: Metro Bundler on Port 8081', 'yellow');
    const response = await axios.get('http://localhost:8081/status', { timeout: 3000 });
    const passed = response.status === 200;
    logTest('Metro bundler running', passed);
    passed ? testsPassed++ : testsFailed++;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logTest('Metro bundler running', false, 'Metro may not be running');
    } else {
      logTest('Metro bundler running', false, error.message);
    }
    testsFailed++;
  }

  // Test 7: Connection Timeout Test
  try {
    log('\nTest 7: Connection Timeout (should be fast)', 'yellow');
    const start = Date.now();
    try {
      await axios.get('http://localhost:3001/health', { timeout: 60000 });
      const duration = Date.now() - start;
      const passed = duration < 5000; // Should complete in under 5 seconds
      logTest('No timeout issues', passed, `Completed in ${duration}ms`);
      passed ? testsPassed++ : testsFailed++;
    } catch (error) {
      const duration = Date.now() - start;
      logTest('No timeout issues', false, `Timed out after ${duration}ms`);
      testsFailed++;
    }
  } catch (error) {
    logTest('No timeout issues', false, error.message);
    testsFailed++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Network Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`✅ Tests Passed: ${testsPassed}`, 'green');
  log(`❌ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'blue');
  log('='.repeat(50) + '\n', 'blue');

  if (testsFailed === 0) {
    log('🎉 All network tests passed!', 'green');
  } else {
    log('⚠️  Some network tests failed. Check the issues above.', 'yellow');
  }

  return { passed: testsPassed, failed: testsFailed };
}

// Run tests if executed directly
if (require.main === module) {
  runNetworkTests().catch(error => {
    log(`\n❌ Test suite crashed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runNetworkTests };
