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

// Add group routes
app.use('/api/groups', groupRoutes);

describe('Group Management System', () => {
  // Test user data
  const uniqueId = Math.floor(Math.random() * 100000);
  const testAdmin = {
    username: `testadmin${uniqueId}`,
    email: `testadmin${uniqueId}@example.com`,
    password: 'Test123!@#',
    role: 'farmer',
    fullName: 'Test Admin',
    phoneNumber: '+254700000001',
    location: 'Test Location',
    preferredLanguage: 'en'
  };

  const testMember = {
    username: `testmember${uniqueId}`,
    email: `testmember${uniqueId}@example.com`,
    password: 'Test123!@#',
    role: 'farmer',
    fullName: 'Test Member',
    phoneNumber: '+254700000002',
    location: 'Test Location',
    preferredLanguage: 'en'
  };

  // Test group data
  const testGroup = {
    name: 'Test Farmers Group',
    description: 'A test group for farmers',
    cropFocus: 'Maize',
    maxMembers: 10
  };

  let adminToken;
  let memberToken;
  let groupId;
  let adminId;
  let memberId;

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
    const admin = await registerUser(testAdmin);
    adminToken = admin.token;
    adminId = admin.userId;

    const member = await registerUser(testMember);
    memberToken = member.token;
    memberId = member.userId;
  });

  // Clean up after tests
  afterAll(async () => {
    // Delete in correct order to maintain referential integrity
    await db.query('DELETE FROM messages WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM group_members WHERE group_id IN (SELECT group_id FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM groups WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('Group Creation and Management', () => {
    it('should create a new group successfully', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testGroup);

      expect(res.status).toBe(201);
      expect(res.body.data.group.name).toBe(testGroup.name);
      groupId = res.body.data.group.group_id;
    });

    it('should not create a group with invalid data', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'a', // too short
          maxMembers: 0 // too small
        });

      expect(res.status).toBe(400);
    });

    it('should get group details', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.group.name).toBe(testGroup.name);
      expect(res.body.data.members).toBeDefined();
    });

    it('should update group details', async () => {
      const updatedName = 'Updated Test Group';
      const res = await request(app)
        .put(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: updatedName
        });

      expect(res.status).toBe(200);
      expect(res.body.data.group.name).toBe(updatedName);
    });
  });

  describe('Group Membership', () => {
    it('should add a member to the group', async () => {
      const res = await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: memberId,
          isAdmin: false
        });

      expect(res.status).toBe(200);
    });

    it('should list group members', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.members.length).toBe(2); // admin + new member
    });

    it('should not allow non-admin to add members', async () => {
      const res = await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: 999999, // non-existent user
          isAdmin: false
        });

      expect(res.status).toBe(403);
    });

    it('should allow member to leave group', async () => {
      const res = await request(app)
        .post(`/api/groups/${groupId}/leave`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it('should not allow last admin to leave group', async () => {
      const res = await request(app)
        .post(`/api/groups/${groupId}/leave`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/last admin/);
    });
  });

  describe('Group Search and Listing', () => {
    it('should search for groups', async () => {
      const res = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${memberToken}`)
        .query({
          name: 'Test',
          cropFocus: 'Maize'
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.groups)).toBe(true);
    });

    it('should list user groups', async () => {
      const res = await request(app)
        .get('/api/groups/user/groups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.groups)).toBe(true);
      expect(res.body.data.groups.length).toBeGreaterThan(0);
    });
  });
});