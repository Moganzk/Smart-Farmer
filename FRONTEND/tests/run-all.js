/**
 * Run All Tests
 * Master test runner that executes all test suites
 */

const { runNetworkTests } = require('./network.test');
const { runTests: runAuthTests } = require('./auth.test');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 SMART FARMER - COMPREHENSIVE TEST SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = {
    network: { passed: 0, failed: 0 },
    auth: { passed: 0, failed: 0 }
  };

  // Run Network Tests
  try {
    results.network = await runNetworkTests();
  } catch (error) {
    log(`\n❌ Network tests crashed: ${error.message}`, 'red');
    results.network.failed = 999; // Mark as failed
  }

  log('\n' + '-'.repeat(60) + '\n', 'cyan');

  // Run Authentication Tests (only if backend is reachable)
  // Metro test failure is OK - we're using Expo
  const criticalNetworkFailure = results.network.failed > 0 && results.network.passed < 5;
  
  if (!criticalNetworkFailure) {
    try {
      results.auth = await runAuthTests();
    } catch (error) {
      log(`\n❌ Authentication tests crashed: ${error.message}`, 'red');
      results.auth.failed = 999;
    }
  } else {
    log('⚠️  Skipping authentication tests due to critical network issues\n', 'yellow');
  }

  // Final Summary
  const totalPassed = results.network.passed + results.auth.passed;
  const totalFailed = results.network.failed + results.auth.failed;
  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 FINAL SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\n🌐 Network Tests: ${results.network.passed} passed, ${results.network.failed} failed`, 'blue');
  log(`🔐 Auth Tests: ${results.auth.passed} passed, ${results.auth.failed} failed`, 'blue');
  log(`\n📈 Overall: ${totalPassed}/${totalTests} tests passed (${successRate}%)`, 'blue');
  log('='.repeat(60), 'cyan');

  if (totalFailed === 0) {
    log('\n🎉 ALL TESTS PASSED! 🎉', 'green');
    log('✅ Your Smart Farmer app is ready for action!\n', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.\n', 'yellow');
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch(error => {
  log(`\n❌ Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
