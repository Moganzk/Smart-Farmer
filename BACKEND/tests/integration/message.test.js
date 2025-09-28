const request = require('supertest');
const express = require('express');
const groupRoutes = require('../../src/routes/groups');
const { auth } = require('../../src/middleware/auth');
const db = require('../../src/config/database');

// Create test app
const app = express();
app.use(express.json());

// Add auth routes
const authRoutes = require('../../src/routes/auth');
app.use('/api/auth', authRoutes);

// Add group routes (which include message routes)
app.use('/api/groups', groupRoutes);

describe('Messaging System', () => {
  // Test user data
  const uniqueId = Math.floor(Math.random() * 100000);
  const testSender = {
    username: `testsender${uniqueId}`,
    email: `testsender${uniqueId}@example.com`,
    password: 'Test123!@#',
    role: 'farmer',
    fullName: 'Test Sender',
    phoneNumber: '+254700000001',
    location: 'Test Location',
    preferredLanguage: 'en'
  };

  const testReceiver = {
    username: `testreceiver${uniqueId}`,
    email: `testreceiver${uniqueId}@example.com`,
    password: 'Test123!@#',
    role: 'farmer',
    fullName: 'Test Receiver',
    phoneNumber: '+254700000002',
    location: 'Test Location',
    preferredLanguage: 'en'
  };

  // Test group data
  const testGroup = {
    name: 'Test Message Group',
    description: 'A test group for messages',
    cropFocus: 'Maize',
    maxMembers: 10
  };

  let senderToken;
  let receiverToken;
  let groupId;
  let senderId;
  let receiverId;
  let messageId;

  // Helper function to register a user
  const registerUser = async (userData) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    return { 
      token: res.body.data.token,
      userId: res.body.data.user.user_id
    };
  };

  // Setup test data
  beforeAll(async () => {
    // Clean up any existing test data in correct order
    await db.query('DELETE FROM messages WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM group_members WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);

    // Register test users
    const sender = await registerUser(testSender);
    senderToken = sender.token;
    senderId = sender.userId;

    const receiver = await registerUser(testReceiver);
    receiverToken = receiver.token;
    receiverId = receiver.userId;

    // Create test group
    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${senderToken}`)
      .send(testGroup);

    groupId = groupRes.body.data.group.group_id;

    // Add receiver to group
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        userId: receiverId,
        isAdmin: false
      });
  });

  // Clean up after tests
  afterAll(async () => {
    await db.query('DELETE FROM messages WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM group_members WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('Message Creation and Management', () => {
    it('should create a new message successfully', async () => {
      const res = await request(app)
        .post(`/api/groups/${groupId}/messages`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          content: 'Hello, this is a test message!'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.message.content).toBe('Hello, this is a test message!');
      messageId = res.body.data.message.message_id;
    });

    it('should not create a message if not group member', async () => {
      // Create a new user who is not a group member
      const nonMember = await registerUser({
        username: `nonmember${uniqueId}`,
        email: `nonmember${uniqueId}@example.com`,
        password: 'Test123!@#',
        role: 'farmer',
        fullName: 'Non Member',
        phoneNumber: '+254700000003',
        location: 'Test Location',
        preferredLanguage: 'en'
      });

      const res = await request(app)
        .post(`/api/groups/${groupId}/messages`)
        .set('Authorization', `Bearer ${nonMember.token}`)
        .send({
          content: 'This should fail'
        });

      expect(res.status).toBe(400);
    });

    it('should get group messages', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/messages`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
      expect(res.body.data.messages.length).toBeGreaterThan(0);
    });

    it('should get a specific message', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message.message_id).toBe(messageId);
    });

    it('should update a message', async () => {
      const res = await request(app)
        .put(`/api/groups/${groupId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          content: 'Updated test message'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.message.content).toBe('Updated test message');
      expect(res.body.data.message.edited_at).toBeDefined();
    });

    it('should not allow updating another user\'s message', async () => {
      const res = await request(app)
        .put(`/api/groups/${groupId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${receiverToken}`)
        .send({
          content: 'This should fail'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Message Searching and Stats', () => {
    it('should search messages', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/messages/search`)
        .set('Authorization', `Bearer ${senderToken}`)
        .query({
          query: 'test'
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
    });

    it('should get message statistics', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/messages/stats`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats.total_messages).toBeGreaterThan(0);
    });
  });

  describe('Message Deletion', () => {
    it('should delete a message', async () => {
      const res = await request(app)
        .delete(`/api/groups/${groupId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(res.status).toBe(200);
    });

    it('should not return deleted messages', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(res.status).toBe(404);
    });
  });
});