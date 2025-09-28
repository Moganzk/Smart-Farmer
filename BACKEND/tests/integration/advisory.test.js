const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');
const { createTestUser, generateToken } = require('../helpers');

describe('Advisory System', () => {
  let farmerToken;
  let adminToken;
  let farmerId;
  let adminId;
  let testContentId;

  beforeAll(async () => {
    // Clean up any existing test data in correct order to maintain referential integrity
    await db.query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    
    // Create a farmer and admin user
    const farmer = await createTestUser({ role: 'farmer' });
    const admin = await createTestUser({ role: 'admin' });
    farmerId = farmer.user_id;
    adminId = admin.user_id;
    farmerToken = generateToken(farmer);
    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    // Clean up test data in correct order to maintain referential integrity
    await db.query('DELETE FROM advisory_content WHERE created_by IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    // db.end() handled by global setup
  });

  describe('Advisory Content Management', () => {
    test('should create advisory content as admin', async () => {
      const res = await request(app)
        .post('/api/advisory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Maize Rust Treatment',
          contentType: 'disease',
          content: 'How to treat maize rust...',
          cropType: 'maize',
          diseaseName: 'rust',
          severityLevel: 'medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.advisory).toBeDefined();
      testContentId = res.body.data.advisory.content_id;
    });

    test('should deny content creation to farmer', async () => {
      const res = await request(app)
        .post('/api/advisory')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          title: 'Test Content',
          contentType: 'disease',
          content: 'Test content...',
          cropType: 'maize',
          diseaseName: 'test',
          severityLevel: 'low'
        });

      expect(res.status).toBe(403);
    });

    test('should update advisory content', async () => {
      const res = await request(app)
        .put(`/api/advisory/${testContentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Maize Rust Treatment',
          content: 'Updated treatment guide...'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.advisory.title).toBe('Updated Maize Rust Treatment');
    });

    test('should get specific advisory content', async () => {
      const res = await request(app)
        .get(`/api/advisory/${testContentId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.advisory.content_id).toBe(testContentId);
    });
  });

  describe('Advisory Content Search and Filtering', () => {
    test('should search advisory content', async () => {
      const res = await request(app)
        .get('/api/advisory/search')
        .set('Authorization', `Bearer ${farmerToken}`)
        .query({
          cropType: 'maize',
          query: 'rust'
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.advisories)).toBe(true);
      expect(res.body.data.advisories.length).toBeGreaterThan(0);
    });

    test('should get crop types', async () => {
      const res = await request(app)
        .get('/api/advisory/crops')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.cropTypes)).toBe(true);
      expect(res.body.data.cropTypes).toContain('maize');
    });

    test('should get diseases by crop', async () => {
      const res = await request(app)
        .get('/api/advisory/crops/maize/diseases')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.diseases)).toBe(true);
      expect(res.body.data.diseases).toContain('rust');
    });
  });

  describe('Admin Features', () => {
    test('should get advisory stats as admin', async () => {
      const res = await request(app)
        .get('/api/advisory/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.total_content).toBeGreaterThan(0);
    });

    test('should deny stats to non-admin', async () => {
      const res = await request(app)
        .get('/api/advisory/stats')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
    });
  });
});