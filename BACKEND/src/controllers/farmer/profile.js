// src/controllers/farmer/profile.js
const { pool } = require('../../config/database');
const bcrypt = require('bcrypt');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/profiles');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.user_id;
    const fileExt = path.extname(file.originalname);
    const fileName = `user_${userId}_${uuidv4()}${fileExt}`;
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Get the user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProfile = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const result = await pool.query(
      `SELECT 
        user_id, username, email, role, full_name, phone_number, 
        location, profile_image, preferred_language, created_at,
        bio, expertise, last_sync_time, storage_used
       FROM users
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'User not found');
    }
    
    // Get user statistics
    const statsResult = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM disease_detections WHERE user_id = $1) as detection_count,
        (SELECT COUNT(*) FROM group_members WHERE user_id = $1) as group_count,
        (SELECT COUNT(*) FROM messages WHERE user_id = $1) as message_count,
        (SELECT COUNT(DISTINCT group_id) FROM group_members WHERE user_id = $1 AND is_admin = true) as admin_group_count
      `,
      [userId]
    );
    
    const user = {
      ...result.rows[0],
      stats: statsResult.rows[0]
    };
    
    return responses.success(res, { user });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return responses.serverError(res, 'Failed to fetch user profile');
  }
};

/**
 * Update the user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { 
    full_name, phone_number, location, bio, expertise, preferred_language
  } = req.body;
  
  try {
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    
    // Add parameters that are provided
    let paramCounter = 1;
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCounter++}`);
      values.push(full_name);
    }
    
    if (phone_number !== undefined) {
      updates.push(`phone_number = $${paramCounter++}`);
      values.push(phone_number);
    }
    
    if (location !== undefined) {
      updates.push(`location = $${paramCounter++}`);
      values.push(location);
    }
    
    if (bio !== undefined) {
      updates.push(`bio = $${paramCounter++}`);
      values.push(bio);
    }
    
    if (expertise !== undefined) {
      updates.push(`expertise = $${paramCounter++}`);
      values.push(expertise);
    }
    
    if (preferred_language !== undefined) {
      updates.push(`preferred_language = $${paramCounter++}`);
      values.push(preferred_language);
    }
    
    // Add updated_at timestamp and user_id
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);
    
    // If no updates, return success
    if (updates.length === 1) {
      return responses.success(res, { 
        message: 'No changes to update',
        user: req.user
      });
    }
    
    // Execute update query
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE user_id = $${paramCounter}
      RETURNING user_id, username, email, role, full_name, phone_number, location, profile_image, preferred_language, bio, expertise, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'User not found');
    }
    
    return responses.success(res, { 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return responses.serverError(res, 'Failed to update user profile');
  }
};

/**
 * Update the user's profile image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadProfileImage = async (req, res) => {
  const uploadProfileImageMiddleware = upload.single('profile_image');
  
  uploadProfileImageMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return responses.badRequest(res, 'File too large. Maximum size is 5MB.');
      }
      return responses.badRequest(res, `Upload error: ${err.message}`);
    } else if (err) {
      return responses.badRequest(res, err.message);
    }
    
    // If no file was uploaded
    if (!req.file) {
      return responses.badRequest(res, 'No file uploaded');
    }
    
    const userId = req.user.user_id;
    const relativePath = `/uploads/profiles/${req.file.filename}`;
    
    try {
      // Check if user already has a profile image, if so, delete it
      const previousImageResult = await pool.query(
        'SELECT profile_image FROM users WHERE user_id = $1',
        [userId]
      );
      
      const previousImage = previousImageResult.rows[0]?.profile_image;
      
      if (previousImage) {
        const previousImagePath = path.join(__dirname, '../../../', previousImage);
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }
      
      // Update user's profile image
      const result = await pool.query(
        'UPDATE users SET profile_image = $1 WHERE user_id = $2 RETURNING user_id, username, profile_image',
        [relativePath, userId]
      );
      
      if (result.rows.length === 0) {
        return responses.notFound(res, 'User not found');
      }
      
      return responses.success(res, { 
        message: 'Profile image updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      // Delete the uploaded file if the database update fails
      const uploadedFilePath = req.file.path;
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      
      logger.error('Error updating profile image:', error);
      return responses.serverError(res, 'Failed to update profile image');
    }
  });
};

/**
 * Delete the user's profile image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProfileImage = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    // Get current profile image
    const imageResult = await pool.query(
      'SELECT profile_image FROM users WHERE user_id = $1',
      [userId]
    );
    
    const profileImage = imageResult.rows[0]?.profile_image;
    
    if (!profileImage) {
      return responses.badRequest(res, 'No profile image to delete');
    }
    
    // Delete the image file
    const imagePath = path.join(__dirname, '../../../', profileImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Update the database
    await pool.query(
      'UPDATE users SET profile_image = NULL WHERE user_id = $1',
      [userId]
    );
    
    return responses.success(res, { message: 'Profile image deleted successfully' });
  } catch (error) {
    logger.error('Error deleting profile image:', error);
    return responses.serverError(res, 'Failed to delete profile image');
  }
};

/**
 * Change the user's password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  const userId = req.user.user_id;
  const { current_password, new_password } = req.body;
  
  try {
    // Get the user's current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'User not found');
    }
    
    const currentHash = result.rows[0].password_hash;
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(current_password, currentHash);
    if (!passwordMatch) {
      return responses.unauthorized(res, 'Current password is incorrect');
    }
    
    // Hash the new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
    
    // Update the password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, userId]
    );
    
    return responses.success(res, { message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error changing password:', error);
    return responses.serverError(res, 'Failed to change password');
  }
};

/**
 * Get another user's public profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPublicProfile = async (req, res) => {
  const { username } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        user_id, username, full_name, profile_image, location, 
        bio, expertise, role, created_at
       FROM users
       WHERE username = $1 AND is_active = true`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'User not found');
    }
    
    // Get user statistics for public profile
    const userId = result.rows[0].user_id;
    const statsResult = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM disease_detections WHERE user_id = $1) as detection_count,
        (SELECT COUNT(*) FROM group_members WHERE user_id = $1) as group_count
      `,
      [userId]
    );
    
    // Get groups the user is a member of
    const groupsResult = await pool.query(
      `SELECT g.group_id, g.name, g.crop_focus, g.description
       FROM groups g
       JOIN group_members gm ON g.group_id = gm.group_id
       WHERE gm.user_id = $1 AND g.is_active = true
       LIMIT 5`,
      [userId]
    );
    
    const user = {
      ...result.rows[0],
      stats: statsResult.rows[0],
      groups: groupsResult.rows
    };
    
    return responses.success(res, { user });
  } catch (error) {
    logger.error('Error fetching public profile:', error);
    return responses.serverError(res, 'Failed to fetch user profile');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  getPublicProfile
};