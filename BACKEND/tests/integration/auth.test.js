const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const { auth } = require('../../src/middleware/auth');
const db = require('../../src/config/database');

// Create a test app instance
const app = express();
app.use(express.json());

// Apply auth middleware to the test app
app.use('/api/auth', authRoutes);
app.use('/api/auth/verify', auth); // Explicitly attach auth middleware for verify endpoint

describe('Authentication System', () => {
  // Generate unique username and email for each test run
  const uniqueId = Math.floor(Math.random() * 100000);
  const testUser = {
    username: `testfarmer${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'Test123!@#',
    role: 'farmer',
    fullName: 'Test Farmer',
    phoneNumber: '+254700000099',
    location: 'Test Location',
    preferredLanguage: 'en'
  };

  let authToken;

  // Clean up database before tests
  beforeAll(async () => {
    // Delete in correct order to maintain referential integrity
    await db.query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM disease_detections WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM messages WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM group_members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  afterAll(async () => {
    // Clean up all test users
    await db.query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM disease_detections WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM messages WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM group_members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  // Create a fresh user before login and verify tests
  beforeEach(async () => {
    if (expect.getState().currentTestName.includes('login') || 
        expect.getState().currentTestName.includes('verify')) {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/verify', () => {
    let validToken;

    beforeEach(async () => {
      // Register a new user specifically for verify tests
      const uniqueId = Math.floor(Math.random() * 100000);
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `verifytest${uniqueId}`,
          email: `verify_test${uniqueId}@example.com`,
          password: 'Test123!@#',
          role: 'farmer',
          fullName: 'Verify Test',
          phoneNumber: '+254700000088',
          location: 'Test Location',
          preferredLanguage: 'en'
        });
      validToken = response.body.data.token;
    });

    it('should verify valid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});