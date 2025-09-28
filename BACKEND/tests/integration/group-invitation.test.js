const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');
const { generateToken } = require('../helpers/auth');
require('dotenv').config();

describe('Group Invitation API', () => {
  let token;
  let adminToken;
  let testGroup;
  let testUser;
  let adminUser;
  let secondUser;
  let testInvitation;

  beforeAll(async () => {
    try {
      // Clean up any existing test data first
      await db.query("DELETE FROM group_invitations WHERE invitation_email = 'newuser@example.com' OR invitation_email = 'another@example.com'");
      await db.query("DELETE FROM group_members WHERE user_id IN (SELECT user_id FROM users WHERE username IN ('admin_inv_test', 'test_inv_user', 'second_inv_user'))");
      await db.query("DELETE FROM groups WHERE name = 'Test Invitation Group'");
      await db.query("DELETE FROM users WHERE username IN ('admin_inv_test', 'test_inv_user', 'second_inv_user')");
      
      // Create test users with unique usernames for this test
      const adminResult = await db.query(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES ('admin_inv_test', 'admin_inv@example.com', 'password_hash', 'admin', 'Admin Inv Test') 
         RETURNING *`
      );
      adminUser = adminResult.rows[0];
      adminToken = generateToken(adminUser);

      const userResult = await db.query(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES ('test_inv_user', 'test_inv@example.com', 'password_hash', 'farmer', 'Test Inv User') 
         RETURNING *`
      );
      testUser = userResult.rows[0];
      token = generateToken(testUser);

      const secondUserResult = await db.query(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES ('second_inv_user', 'second_inv@example.com', 'password_hash', 'farmer', 'Second Inv User') 
         RETURNING *`
      );
      secondUser = secondUserResult.rows[0];

      // Create test group
      const groupResult = await db.query(
        `INSERT INTO groups (name, description, created_by, crop_focus) 
         VALUES ('Test Invitation Group', 'A test group', $1, 'Tomatoes') 
         RETURNING *`,
        [adminUser.user_id]
      );
      testGroup = groupResult.rows[0];

      // Add admin as group member with admin privileges
      await db.query(
        `INSERT INTO group_members (group_id, user_id, is_admin) 
         VALUES ($1, $2, true)`,
        [testGroup.group_id, adminUser.user_id]
      );
    } catch (error) {
      console.error('Error in test setup:', error);
    }
  });

  afterAll(async () => {
    try {
      // Clean up
      if (testGroup && testGroup.group_id) {
        await db.query('DELETE FROM group_invitations WHERE group_id = $1', [testGroup.group_id]);
        await db.query('DELETE FROM group_members WHERE group_id = $1', [testGroup.group_id]);
        await db.query('DELETE FROM groups WHERE group_id = $1', [testGroup.group_id]);
      }
      
      if (testUser && testUser.user_id) {
        await db.query('DELETE FROM users WHERE user_id = $1', [testUser.user_id]);
      }
      
      if (secondUser && secondUser.user_id) {
        await db.query('DELETE FROM users WHERE user_id = $1', [secondUser.user_id]);
      }
      
      if (adminUser && adminUser.user_id) {
        await db.query('DELETE FROM users WHERE user_id = $1', [adminUser.user_id]);
      }

      // Additional cleanup
      await db.query("DELETE FROM group_invitations WHERE invitation_email = 'newuser@example.com' OR invitation_email = 'another@example.com'");
      await db.query("DELETE FROM users WHERE username IN ('admin_inv_test', 'test_inv_user', 'second_inv_user')");
    } catch (error) {
      console.error('Error in test cleanup:', error);
    }
  });

  describe('POST /:groupId/invitations', () => {
    it('should allow admin to send an invitation by user ID', async () => {
      const res = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser.user_id });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Invitation sent successfully');
      expect(res.body.data.invitation).toBeDefined();
      expect(res.body.data.invitation.invitee_id).toEqual(testUser.user_id);
      testInvitation = res.body.data.invitation;
    });

    it('should allow admin to send an invitation by email', async () => {
      const res = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'newuser@example.com' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Invitation sent successfully');
      expect(res.body.data.invitation).toBeDefined();
      expect(res.body.data.invitation.invitation_email).toEqual('newuser@example.com');
    });

    it('should not allow non-admin to send invitations', async () => {
      const res = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: secondUser.user_id });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it('should not allow duplicate invitations', async () => {
      const res = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser.user_id });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /:groupId/invitations', () => {
    it('should list all pending invitations for a group', async () => {
      const res = await request(app)
        .get(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data.invitations)).toBe(true);
      expect(res.body.data.invitations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /invitations/pending', () => {
    it('should list all pending invitations for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/groups/invitations/pending')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data.invitations)).toBe(true);
      expect(res.body.data.invitations.length).toBeGreaterThan(0);
    });
  });

  describe('POST /invitations/:invitationId/accept', () => {
    it('should allow user to accept an invitation', async () => {
      const res = await request(app)
        .post(`/api/groups/invitations/${testInvitation.invitation_id}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Invitation accepted successfully');
      
      // Verify the user is now a group member
      const memberRes = await db.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
        [testGroup.group_id, testUser.user_id]
      );
      expect(memberRes.rows.length).toEqual(1);
    });
  });

  describe('POST /invitations/:invitationId/decline', () => {
    it('should allow user to decline an invitation', async () => {
      // Create a new invitation first
      const inviteRes = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: secondUser.user_id });
      
      const newInvitationId = inviteRes.body.data.invitation.invitation_id;
      
      // Generate token for second user
      const secondUserToken = generateToken(secondUser);
      
      const res = await request(app)
        .post(`/api/groups/invitations/${newInvitationId}/decline`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Invitation declined successfully');
      
      // Verify the invitation status is now declined
      const invitationRes = await db.query(
        'SELECT status FROM group_invitations WHERE invitation_id = $1',
        [newInvitationId]
      );
      expect(invitationRes.rows[0].status).toEqual('declined');
    });
  });

  describe('DELETE /invitations/:invitationId', () => {
    it('should allow admin to cancel an invitation', async () => {
      // Create a new invitation first
      const inviteRes = await request(app)
        .post(`/api/groups/${testGroup.group_id}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'another@example.com' });
      
      const newInvitationId = inviteRes.body.data.invitation.invitation_id;
      
      const res = await request(app)
        .delete(`/api/groups/invitations/${newInvitationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Invitation cancelled successfully');
      
      // Verify the invitation is deleted
      const invitationRes = await db.query(
        'SELECT * FROM group_invitations WHERE invitation_id = $1',
        [newInvitationId]
      );
      expect(invitationRes.rows.length).toEqual(0);
    });
  });
});