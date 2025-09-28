const db = require('../config/database');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class User {
  static async create({ username, email, password, role, fullName, phoneNumber, location, preferredLanguage }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(config.auth.saltRounds);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const result = await db.query(
        `INSERT INTO users (
          username, 
          email, 
          password_hash, 
          role, 
          full_name, 
          phone_number, 
          location, 
          preferred_language,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [username, email, passwordHash, role, fullName, phoneNumber, location, preferredLanguage, true]
      );

      const user = result.rows[0];
      delete user.password_hash; // Don't return password hash
      return user;
    } catch (error) {
      if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(userId) {
    const result = await db.query(
      'SELECT user_id, username, email, role, full_name, phone_number, location, preferred_language, created_at, is_active FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }

  static async updateLoginAttempts(userId, attempts) {
    await db.query(
      'UPDATE users SET failed_login_attempts = $1, last_login_attempt = CURRENT_TIMESTAMP WHERE user_id = $2',
      [attempts, userId]
    );
  }

  static async validatePassword(providedPassword, storedHash) {
    return bcrypt.compare(providedPassword, storedHash);
  }

  static async checkLoginAttempts(email) {
    const result = await db.query(
      `SELECT 
        user_id, 
        failed_login_attempts, 
        last_login_attempt,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_login_attempt)) as seconds_since_attempt
      FROM users 
      WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) return null;

    // If 15 minutes have passed, reset attempts
    if (user.seconds_since_attempt > 900) {
      await this.updateLoginAttempts(user.user_id, 0);
      return { attempts: 0, locked: false };
    }

    return {
      attempts: user.failed_login_attempts,
      locked: user.failed_login_attempts >= 5
    };
  }
}

module.exports = User;