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
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [title, contentType, content, cropType, diseaseName, severityLevel, createdBy]
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
             is_active = COALESCE($7, is_active),
             version = $8,
             updated_at = CURRENT_TIMESTAMP
         WHERE content_id = $9
         RETURNING *`,
        [title, contentType, content, cropType, diseaseName, severityLevel, isActive, newVersion, contentId]
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
}

module.exports = Advisory;