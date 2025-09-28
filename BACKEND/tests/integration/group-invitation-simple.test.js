const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

describe('Group Invitation API Endpoint Test', () => {
  let token;
  let userId;
  let groupId;

  beforeAll(async () => {
    try {
      // Create a test user directly in the database
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING user_id`,
        ['test_invitation_user', 'test_inv@example.com', 'password123', 'admin', 'Test User']
      );
      
      userId = result.rows[0].user_id;
      
      // Create a JWT token for this user
      token = jwt.sign(
        { user_id: userId, username: 'test_invitation_user', role: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      // Create a test group
      const groupResult = await db.query(
        `INSERT INTO groups (name, description, created_by, crop_focus) 
         VALUES ($1, $2, $3, $4) 
         RETURNING group_id`,
        ['Test Invitation Group', 'For testing invitations', userId, 'Tomatoes']
      );
      
      groupId = groupResult.rows[0].group_id;
      
      // Add user as a group admin
      await db.query(
        `INSERT INTO group_members (group_id, user_id, is_admin) 
         VALUES ($1, $2, $3)`,
        [groupId, userId, true]
      );
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  afterAll(async () => {
    try {
      // Clean up test data
      if (groupId) {
        // Delete invitations first (foreign key constraint)
        await db.query('DELETE FROM group_invitations WHERE group_id = $1', [groupId]);
        
        // Delete group members
        await db.query('DELETE FROM group_members WHERE group_id = $1', [groupId]);
        
        // Delete the test group
        await db.query('DELETE FROM groups WHERE group_id = $1', [groupId]);
      }
      
      // Delete the test user
      if (userId) {
        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  // Test sending an invitation by email
  it('should send an invitation by email', async () => {
    try {
      const res = await request(app)
        .post(`/api/groups/${groupId}/invitations`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'invited@example.com' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Invitation sent successfully');
      expect(res.body.data.invitation).toBeDefined();
      expect(res.body.data.invitation.invitation_email).toEqual('invited@example.com');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});