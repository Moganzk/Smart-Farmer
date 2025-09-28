require('dotenv').config({ path: 'src/config/.env.test' });

const { pool, query } = require('../src/config/database');

let hasEnded = false;

// Global setup before all tests
global.beforeAll(async () => {
  // Clean up all test data before running tests
  try {
    // Delete all test data in the correct order to maintain referential integrity
    await query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM disease_detections WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM messages WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM group_members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    console.log('All test data cleaned up before tests');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});

// Global cleanup after all tests
global.afterAll(async () => {
  try {
    // Clean up all test data after running tests
    await query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM disease_detections WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM messages WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM group_members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    console.log('All test data cleaned up after tests');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  } finally {
    if (!hasEnded) {
      hasEnded = true;
      await pool.end();
    }
  }
});

// Reset timeout for tests
jest.setTimeout(30000);