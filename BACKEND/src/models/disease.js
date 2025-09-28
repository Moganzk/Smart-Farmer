const db = require('../config/database');
const logger = require('../utils/logger');

class Disease {
  static async create({
    userId,
    imagePath,
    originalFilename,
    fileSize,
    imageResolution,
    detectionResult,
    advisoryContentId,
    confidenceScore,
    isOfflineDetection = false,
    notes
  }) {
    try {
      const result = await db.query(
        `INSERT INTO disease_detections (
          user_id,
          image_path,
          original_filename,
          file_size,
          image_resolution,
          detection_result,
          advisory_content_id,
          confidence_score,
          is_offline_detection,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          userId,
          imagePath,
          originalFilename,
          fileSize,
          imageResolution,
          detectionResult,
          advisoryContentId,
          confidenceScore,
          isOfflineDetection,
          notes
        ]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating disease detection:', error);
      throw error;
    }
  }

  static async getById(detectionId) {
    try {
      const result = await db.query(
        `SELECT d.*,
                ac.title as advisory_title,
                ac.content as advisory_content,
                ac.crop_type,
                ac.disease_name,
                ac.severity_level,
                u.username, u.full_name
         FROM disease_detections d
         LEFT JOIN advisory_content ac ON d.advisory_content_id = ac.content_id
         JOIN users u ON d.user_id = u.user_id
         WHERE d.detection_id = $1`,
        [detectionId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting disease detection:', error);
      throw error;
    }
  }

  static async getUserHistory(userId, { limit = 50, before = null }) {
    try {
      let query = `
        SELECT d.*,
               ac.title as advisory_title,
               ac.content as advisory_content,
               ac.crop_type,
               ac.disease_name
        FROM disease_detections d
        LEFT JOIN advisory_content ac ON d.advisory_content_id = ac.content_id
        WHERE d.user_id = $1
      `;
      const params = [userId];

      // Make sure before is a valid number
      if (before && !isNaN(before)) {
        query += ' AND d.detection_id < $2';
        params.push(before);
      }

      // Ensure limit is a valid number 
      const validLimit = !isNaN(limit) ? limit : 50;
      
      query += ' ORDER BY d.created_at DESC LIMIT $' + (params.length + 1);
      params.push(validLimit);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting user detection history:', error);
      throw error;
    }
  }

  static async deleteExpiredDetections() {
    try {
      // Delete detections older than 90 days
      const result = await db.query(
        `DELETE FROM disease_detections
         WHERE retention_expires_at < CURRENT_TIMESTAMP
         RETURNING image_path`,
        []
      );
      return result.rows;
    } catch (error) {
      logger.error('Error deleting expired detections:', error);
      throw error;
    }
  }

  static async getStats({ userId = null, cropType = null, location = null }) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_detections,
          AVG(d.confidence_score) as avg_confidence,
          COUNT(DISTINCT d.user_id) as unique_users,
          COUNT(CASE WHEN d.is_offline_detection THEN 1 END) as offline_detections,
          ac.crop_type,
          ac.disease_name,
          COUNT(*) as disease_count
        FROM disease_detections d
        JOIN advisory_content ac ON d.advisory_content_id = ac.content_id
        JOIN users u ON d.user_id = u.user_id
        WHERE 1=1
      `;
      const params = [];

      if (userId) {
        query += ' AND d.user_id = $' + (params.length + 1);
        params.push(userId);
      }

      if (cropType) {
        query += ' AND ac.crop_type = $' + (params.length + 1);
        params.push(cropType);
      }

      if (location) {
        query += ' AND u.location = $' + (params.length + 1);
        params.push(location);
      }

      query += ' GROUP BY crop_type, disease_name';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting detection stats:', error);
      throw error;
    }
  }

  static async updateSyncStatus(detectionId) {
    try {
      const result = await db.query(
        `UPDATE disease_detections
         SET synced_at = CURRENT_TIMESTAMP
         WHERE detection_id = $1
         RETURNING *`,
        [detectionId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating sync status:', error);
      throw error;
    }
  }
}

module.exports = Disease;