const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, pool } = require('../src/config/database');

async function createTestUser({ role = 'farmer' } = {}) {
  const username = `test_${crypto.randomBytes(4).toString('hex')}`;
  const email = `${username}@test.com`;
  const passwordHash = await bcrypt.hash('password123', 10);

  const result = await query(
    `INSERT INTO users (
      username,
      email,
      password_hash,
      role,
      full_name,
      phone_number,
      location
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [username, email, passwordHash, role, 'Test User', '+254700000000', 'Test Location']
  );

  return result.rows[0];
}

function generateToken(user) {
  const config = require('../src/config/config');
  return jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    config.auth.jwtSecret,
    { expiresIn: '24h' }
  );
}

module.exports = {
  createTestUser,
  generateToken
};