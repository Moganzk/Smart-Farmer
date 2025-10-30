// Disease Reference Images Controller
// Handles fetching disease images from remote URLs

const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all disease reference images
 * @route GET /api/disease-images
 */
exports.getAllDiseaseImages = async (req, res) => {
  try {
    const { crop_type, disease_name, severity_level } = req.query;

    let query = 'SELECT * FROM disease_reference_images WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (crop_type) {
      query += ` AND crop_type = $${paramCount}`;
      params.push(crop_type);
      paramCount++;
    }

    if (disease_name) {
      query += ` AND disease_name = $${paramCount}`;
      params.push(disease_name);
      paramCount++;
    }

    if (severity_level) {
      query += ` AND severity_level = $${paramCount}`;
      params.push(severity_level);
    }

    query += ' ORDER BY crop_type, disease_name';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching disease images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease images'
    });
  }
};

/**
 * Get disease images by crop type
 * @route GET /api/disease-images/crop/:cropType
 */
exports.getDiseaseImagesByCrop = async (req, res) => {
  try {
    const { cropType } = req.params;

    const result = await pool.query(
      `SELECT * FROM disease_reference_images 
       WHERE crop_type = $1 AND is_active = true
       ORDER BY disease_name`,
      [cropType]
    );

    res.json({
      success: true,
      crop_type: cropType,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching disease images by crop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease images'
    });
  }
};

/**
 * Get specific disease image
 * @route GET /api/disease-images/:id
 */
exports.getDiseaseImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM disease_reference_images WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Disease image not found'
      });
    }

    // Increment view count
    await pool.query(
      'UPDATE disease_reference_images SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching disease image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease image'
    });
  }
};

/**
 * Get available crop types
 * @route GET /api/disease-images/crops/list
 */
exports.getAvailableCrops = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT crop_type, COUNT(*) as disease_count
       FROM disease_reference_images
       WHERE is_active = true
       GROUP BY crop_type
       ORDER BY crop_type`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching available crops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available crops'
    });
  }
};

/**
 * Search disease images
 * @route GET /api/disease-images/search
 */
exports.searchDiseaseImages = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await pool.query(
      `SELECT * FROM disease_reference_images 
       WHERE is_active = true AND (
         display_name ILIKE $1 OR 
         description ILIKE $1 OR 
         symptoms ILIKE $1 OR
         crop_type ILIKE $1
       )
       ORDER BY view_count DESC
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json({
      success: true,
      query: q,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error searching disease images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search disease images'
    });
  }
};

/**
 * Get random disease image for learning/education
 * @route GET /api/disease-images/random
 */
exports.getRandomDiseaseImage = async (req, res) => {
  try {
    const { crop_type } = req.query;

    let query = `SELECT * FROM disease_reference_images 
                 WHERE is_active = true`;
    const params = [];

    if (crop_type) {
      query += ' AND crop_type = $1';
      params.push(crop_type);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No disease images found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching random disease image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random disease image'
    });
  }
};

module.exports = exports;
