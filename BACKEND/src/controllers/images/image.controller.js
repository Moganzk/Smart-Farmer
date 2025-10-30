/**
 * Image Storage Controller
 * Handles saving and retrieving images directly from the database
 */

const pool = require('../config/database');
const { handleServerError } = require('../utils/errorHandlers');
const { authorizeUser } = require('../middlewares/auth');

/**
 * Store an image in the database
 * @param {Binary} imageData - Binary image data
 * @param {String} contentType - MIME type of the image
 * @param {String} imageKey - Unique key for app images
 * @param {String} description - Optional description
 * @returns {Object} - Result containing image ID
 */
const storeImage = async (req, res) => {
  try {
    const { imageKey, description } = req.body;
    
    // Image should be sent as a binary upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file uploaded' 
      });
    }
    
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;
    const userId = req.user.id;
    
    // Insert into app_images table
    const result = await pool.query(
      `INSERT INTO app_images 
       (image_key, image_data, content_type, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (image_key) 
       DO UPDATE SET
       image_data = $2,
       content_type = $3,
       description = $4,
       updated_at = CURRENT_TIMESTAMP
       RETURNING image_id`,
      [imageKey, imageData, contentType, description, userId]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Image stored successfully',
      imageId: result.rows[0].image_id
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * Retrieve an image from the database by its key
 * @param {String} imageKey - The unique key for the image
 * @returns {Binary} - The image binary data
 */
const getImageByKey = async (req, res) => {
  try {
    const { imageKey } = req.params;
    
    const result = await pool.query(
      `SELECT image_data, content_type FROM app_images 
       WHERE image_key = $1`,
      [imageKey]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const { image_data, content_type } = result.rows[0];
    
    // Set appropriate headers and send binary data
    res.set('Content-Type', content_type);
    return res.send(image_data);
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * Store a user's profile image in the database
 */
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No profile image uploaded' 
      });
    }
    
    const userId = req.user.id;
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;
    
    await pool.query(
      `UPDATE users
       SET profile_image = $1,
           profile_image_content_type = $2,
           profile_image_updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [imageData, contentType, userId]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * Get a user's profile image
 */
const getProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT profile_image, profile_image_content_type 
       FROM users WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].profile_image) {
      // Return a default profile image
      return res.redirect('/api/images/default-profile');
    }
    
    const { profile_image, profile_image_content_type } = result.rows[0];
    
    // Set appropriate headers and send binary data
    res.set('Content-Type', profile_image_content_type);
    return res.send(profile_image);
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * Store a disease detection image in the database
 */
const storeDetectionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No detection image uploaded' 
      });
    }
    
    const userId = req.user.id;
    const imageData = req.file.buffer;
    const contentType = req.file.mimetype;
    const originalFilename = req.file.originalname;
    const fileSize = req.file.size;
    
    // First create the detection record
    const detectionResult = await pool.query(
      `INSERT INTO disease_detections
       (user_id, image_path, original_filename, file_size, image_data, image_content_type)
       VALUES ($1, 'database-stored', $2, $3, $4, $5)
       RETURNING detection_id`,
      [userId, originalFilename, fileSize, imageData, contentType]
    );
    
    const detectionId = detectionResult.rows[0].detection_id;
    
    // Here you would call your disease detection AI model
    // For now, we'll simulate a detection result
    await pool.query(
      `UPDATE disease_detections
       SET 
         disease_name = 'Simulated detection',
         confidence_score = 0.85,
         detection_date = CURRENT_TIMESTAMP,
         detection_status = 'completed'
       WHERE detection_id = $1`,
      [detectionId]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Detection image stored successfully',
      detectionId: detectionId
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * Get a disease detection image
 */
const getDetectionImage = async (req, res) => {
  try {
    const { detectionId } = req.params;
    
    const result = await pool.query(
      `SELECT image_data, image_content_type 
       FROM disease_detections WHERE detection_id = $1`,
      [detectionId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].image_data) {
      return res.status(404).json({
        success: false,
        message: 'Detection image not found'
      });
    }
    
    const { image_data, image_content_type } = result.rows[0];
    
    // Set appropriate headers and send binary data
    res.set('Content-Type', image_content_type);
    return res.send(image_data);
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * List all available app images
 */
const listAppImages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT image_id, image_key, content_type, description, 
              width, height, created_at, updated_at
       FROM app_images
       ORDER BY image_key`
    );
    
    return res.status(200).json({
      success: true,
      images: result.rows
    });
  } catch (error) {
    return handleServerError(res, error);
  }
};

module.exports = {
  storeImage,
  getImageByKey,
  updateProfileImage,
  getProfileImage,
  storeDetectionImage,
  getDetectionImage,
  listAppImages
};