const db = require('../config/database');
const logger = require('../utils/logger');

class Advisory {
  static async create({
    title,
    contentType,
    content,
    cropType,
    diseaseName,
    severityLevel,
    imageUrl,
    createdBy
  }) {
    try {
      const result = await db.query(
        `INSERT INTO advisory_content (
          title,
          content_type,
          content,
          crop_type,
          disease_name,
          severity_level,
          image_url,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [title, contentType, content, cropType, diseaseName, severityLevel, imageUrl, createdBy]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating advisory content:', error);
      throw error;
    }
  }

  static async update(contentId, {
    title,
    contentType,
    content,
    cropType,
    diseaseName,
    severityLevel,
    imageUrl,
    isActive
  }) {
    try {
      // First get current version
      const currentVersion = await db.query(
        'SELECT version FROM advisory_content WHERE content_id = $1',
        [contentId]
      );

      if (!currentVersion.rows[0]) {
        throw new Error('Advisory content not found');
      }

      const newVersion = currentVersion.rows[0].version + 1;

      const result = await db.query(
        `UPDATE advisory_content
         SET title = COALESCE($1, title),
             content_type = COALESCE($2, content_type),
             content = COALESCE($3, content),
             crop_type = COALESCE($4, crop_type),
             disease_name = COALESCE($5, disease_name),
             severity_level = COALESCE($6, severity_level),
             image_url = COALESCE($7, image_url),
             is_active = COALESCE($8, is_active),
             version = $9,
             updated_at = CURRENT_TIMESTAMP
         WHERE content_id = $10
         RETURNING *`,
        [title, contentType, content, cropType, diseaseName, severityLevel, imageUrl, isActive, newVersion, contentId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating advisory content:', error);
      throw error;
    }
  }

  static async getById(contentId) {
    try {
      const result = await db.query(
        `SELECT ac.*,
                u.username as created_by_username,
                u.full_name as created_by_name
         FROM advisory_content ac
         JOIN users u ON ac.created_by = u.user_id
         WHERE ac.content_id = $1`,
        [contentId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting advisory content:', error);
      throw error;
    }
  }

  static async search({ cropType = null, diseaseName = null, contentType = null, query = null }) {
    try {
      let sqlQuery = `
        SELECT ac.*,
               u.username as created_by_username,
               u.full_name as created_by_name
        FROM advisory_content ac
        JOIN users u ON ac.created_by = u.user_id
        WHERE ac.is_active = true
      `;
      const params = [];

      if (cropType) {
        params.push(cropType);
        sqlQuery += ` AND crop_type = $${params.length}`;
      }

      if (diseaseName) {
        params.push(diseaseName);
        sqlQuery += ` AND disease_name = $${params.length}`;
      }

      if (contentType) {
        params.push(contentType);
        sqlQuery += ` AND content_type = $${params.length}`;
      }

      if (query) {
        params.push(`%${query}%`);
        sqlQuery += ` AND (
          title ILIKE $${params.length} OR
          content ILIKE $${params.length} OR
          crop_type ILIKE $${params.length} OR
          disease_name ILIKE $${params.length}
        )`;
      }

      sqlQuery += ' ORDER BY updated_at DESC';

      const result = await db.query(sqlQuery, params);
      return result.rows;
    } catch (error) {
      logger.error('Error searching advisory content:', error);
      throw error;
    }
  }

  static async getCropTypes() {
    try {
      const result = await db.query(
        `SELECT DISTINCT crop_type
         FROM advisory_content
         WHERE crop_type IS NOT NULL
         ORDER BY crop_type`
      );
      return result.rows.map(row => row.crop_type);
    } catch (error) {
      logger.error('Error getting crop types:', error);
      throw error;
    }
  }

  static async getDiseasesByCrop(cropType) {
    try {
      const result = await db.query(
        `SELECT DISTINCT disease_name
         FROM advisory_content
         WHERE crop_type = $1 AND disease_name IS NOT NULL
         ORDER BY disease_name`,
        [cropType]
      );
      return result.rows.map(row => row.disease_name);
    } catch (error) {
      logger.error('Error getting diseases by crop:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*)::int as total_content,
           COUNT(DISTINCT crop_type)::int as unique_crops,
           COUNT(DISTINCT disease_name)::int as unique_diseases,
           MAX(updated_at) as last_update,
           AVG(version)::float as avg_version
         FROM advisory_content
         WHERE advisory_content.is_active = true`
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting advisory stats:', error);
      throw error;
    }
  }

  static async getFeatured(limit = 5) {
    try {
      const result = await db.query(
        `SELECT 
           ac.content_id as id,
           ac.title,
           ac.content_type as category,
           ac.content as excerpt,
           ac.image_url,
           ac.crop_type,
           ac.disease_name,
           ac.severity_level,
           ac.created_at as date,
           ac.updated_at,
           u.full_name as author,
           u.username as author_username
         FROM advisory_content ac
         JOIN users u ON ac.created_by = u.user_id
         WHERE ac.is_active = true
         ORDER BY ac.updated_at DESC, ac.created_at DESC
         LIMIT $1`,
        [limit]
      );
      
      // Format the response to match frontend expectations
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        category: row.category || 'Advisory',
        image: row.image_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80',
        excerpt: row.excerpt ? row.excerpt.substring(0, 150) + '...' : 'No description available',
        author: row.author,
        date: row.date,
        readTime: this.calculateReadTime(row.excerpt),
        cropType: row.crop_type,
        diseaseName: row.disease_name,
        severityLevel: row.severity_level
      }));
    } catch (error) {
      logger.error('Error getting featured content:', error);
      throw error;
    }
  }

  static calculateReadTime(content) {
    if (!content) return '2 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }
}

module.exports = Advisory;