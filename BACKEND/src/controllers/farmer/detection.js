// src/controllers/farmer/detection.js
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../../services/ai/gemini');
const groqService = require('../../services/ai/groq');

// Configure storage for crop images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/crops');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.user_id;
    const fileExt = path.extname(file.originalname);
    const fileName = `crop_${userId}_${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for high-quality crop images
});

/**
 * Submit a crop image for disease detection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const detectDisease = async (req, res) => {
  const uploadMiddleware = upload.single('crop_image');
  
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return responses.badRequest(res, 'File too large. Maximum size is 10MB.');
      }
      return responses.badRequest(res, `Upload error: ${err.message}`);
    } else if (err) {
      return responses.badRequest(res, err.message);
    }
    
    // If no file was uploaded
    if (!req.file) {
      return responses.badRequest(res, 'No image uploaded');
    }
    
    try {
      const userId = req.user.user_id;
      const { crop_type, location, notes, model_preference = 'gemini' } = req.body;
      const imagePath = req.file.path;
      const relativeImagePath = `/uploads/crops/${req.file.filename}`;
      
      // Use the appropriate AI model based on preference
      let analysisResult;
      if (model_preference === 'groq') {
        analysisResult = await groqService.analyzeCropDisease(imagePath, { cropType: crop_type });
      } else {
        // Default to Gemini
        analysisResult = await geminiService.analyzeCropDisease(imagePath, { cropType: crop_type });
      }
      
      if (!analysisResult.success) {
        return responses.serverError(res, 'AI analysis failed: ' + analysisResult.error);
      }
      
      // Save detection to database
      const result = await pool.query(
        `INSERT INTO disease_detections
          (user_id, crop_type, image_path, location, notes, ai_model, results, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          userId,
          crop_type,
          relativeImagePath,
          location,
          notes,
          analysisResult.model,
          analysisResult.data
        ]
      );
      
      const detection = result.rows[0];
      
      // Get treatment recommendations if a disease was detected
      if (analysisResult.data.disease_detected) {
        let treatmentResult;
        if (model_preference === 'groq') {
          treatmentResult = await groqService.getTreatmentRecommendations(
            analysisResult.data.disease_name, 
            crop_type
          );
        } else {
          treatmentResult = await geminiService.getTreatmentRecommendations(
            analysisResult.data.disease_name, 
            crop_type
          );
        }
        
        if (treatmentResult.success) {
          // Update detection with treatment data
          await pool.query(
            `UPDATE disease_detections 
             SET treatment_data = $1
             WHERE detection_id = $2`,
            [treatmentResult.data, detection.detection_id]
          );
          
          detection.treatment_data = treatmentResult.data;
        }
      }
      
      return responses.success(res, { 
        message: 'Disease detection completed',
        detection: detection
      });
    } catch (error) {
      // Delete the uploaded file if processing fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      logger.error('Error processing crop image:', error);
      return responses.serverError(res, 'Failed to process crop image');
    }
  });
};

/**
 * Get all disease detections for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserDetections = async (req, res) => {
  const userId = req.user.user_id;
  const { limit = 20, offset = 0, crop_type } = req.query;
  
  try {
    let query = `
      SELECT * FROM disease_detections 
      WHERE user_id = $1
      ${crop_type ? 'AND crop_type = $4' : ''}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const queryParams = [userId, limit, offset];
    if (crop_type) {
      queryParams.push(crop_type);
    }
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM disease_detections 
       WHERE user_id = $1
       ${crop_type ? 'AND crop_type = $2' : ''}`,
      crop_type ? [userId, crop_type] : [userId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    
    return responses.success(res, {
      detections: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching user detections:', error);
    return responses.serverError(res, 'Failed to fetch disease detections');
  }
};

/**
 * Get a specific detection by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDetectionById = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM disease_detections 
       WHERE detection_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'Detection not found');
    }
    
    return responses.success(res, { detection: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching detection:', error);
    return responses.serverError(res, 'Failed to fetch detection');
  }
};

/**
 * Delete a specific detection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDetection = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  
  try {
    // First get the image path to delete the file
    const imageResult = await pool.query(
      'SELECT image_path FROM disease_detections WHERE detection_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (imageResult.rows.length === 0) {
      return responses.notFound(res, 'Detection not found');
    }
    
    const imagePath = imageResult.rows[0].image_path;
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM disease_detections WHERE detection_id = $1 AND user_id = $2 RETURNING detection_id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'Detection not found');
    }
    
    // Delete the image file
    if (imagePath) {
      const fullPath = path.join(__dirname, '../../../', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    return responses.success(res, { 
      message: 'Detection deleted successfully',
      detection_id: result.rows[0].detection_id
    });
  } catch (error) {
    logger.error('Error deleting detection:', error);
    return responses.serverError(res, 'Failed to delete detection');
  }
};

/**
 * Submit feedback on a detection result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitFeedback = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { accuracy_rating, correct_disease, feedback_notes } = req.body;
  
  try {
    // Check if detection exists and belongs to user
    const checkResult = await pool.query(
      'SELECT detection_id FROM disease_detections WHERE detection_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return responses.notFound(res, 'Detection not found');
    }
    
    // Update with feedback
    const result = await pool.query(
      `UPDATE disease_detections 
       SET 
        feedback_provided = true,
        accuracy_rating = $1,
        correct_disease = $2,
        feedback_notes = $3,
        feedback_date = CURRENT_TIMESTAMP
       WHERE detection_id = $4 AND user_id = $5
       RETURNING detection_id`,
      [accuracy_rating, correct_disease, feedback_notes, id, userId]
    );
    
    return responses.success(res, { 
      message: 'Feedback submitted successfully',
      detection_id: result.rows[0].detection_id
    });
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    return responses.serverError(res, 'Failed to submit feedback');
  }
};

module.exports = {
  detectDisease,
  getUserDetections,
  getDetectionById,
  deleteDetection,
  submitFeedback
};
