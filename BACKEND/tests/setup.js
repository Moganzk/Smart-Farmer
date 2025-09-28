const { pool } = require('../src/config/database');

module.exports = async () => {
  // Clean up function to run after all tests
  global.afterAll(async () => {
    await pool.end();
  });
};