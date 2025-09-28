const sharp = require('sharp');
const logger = require('./logger');
const { body, param, query, validationResult } = require('express-validator');

/**
 * API validation middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

/**
 * Common validation rules
 */
const rules = {
  // Profile validation rules
  profile: {
    updateProfile: [
      body('full_name').optional().isString().trim().isLength({ min: 1, max: 100 })
        .withMessage('Full name must be between 1 and 100 characters'),
      body('phone_number').optional().isString().trim().matches(/^[+]?[\d\s()-]{7,20}$/)
        .withMessage('Invalid phone number format'),
      body('location').optional().isString().trim().isLength({ min: 1, max: 255 })
        .withMessage('Location must be between 1 and 255 characters'),
      body('bio').optional().isString().trim().isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
      body('expertise').optional().isString().trim().isLength({ max: 255 })
        .withMessage('Expertise cannot exceed 255 characters'),
      body('preferred_language').optional().isString().trim().isLength({ min: 2, max: 10 })
        .withMessage('Invalid language code')
    ],
    changePassword: [
      body('current_password').notEmpty().withMessage('Current password is required'),
      body('new_password').isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    ],
    username: [
      param('username').isString().trim().isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
    ]
  },
  
  // Settings validation rules
  settings: {
    notificationPreferences: [
      body('push_enabled').optional().isBoolean().withMessage('push_enabled must be a boolean'),
      body('email_enabled').optional().isBoolean().withMessage('email_enabled must be a boolean'),
      body('detection_results').optional().isBoolean().withMessage('detection_results must be a boolean'),
      body('group_messages').optional().isBoolean().withMessage('group_messages must be a boolean'),
      body('system_updates').optional().isBoolean().withMessage('system_updates must be a boolean'),
      body('warnings').optional().isBoolean().withMessage('warnings must be a boolean')
    ],
    appPreferences: [
      body('theme').optional().isString().isIn(['light', 'dark', 'auto'])
        .withMessage('Theme must be light, dark, or auto'),
      body('language').optional().isString().trim().isLength({ min: 2, max: 10 })
        .withMessage('Invalid language code'),
      body('font_size').optional().isString().isIn(['small', 'medium', 'large'])
        .withMessage('Font size must be small, medium, or large'),
      body('high_contrast').optional().isBoolean().withMessage('high_contrast must be a boolean'),
      body('reduced_motion').optional().isBoolean().withMessage('reduced_motion must be a boolean'),
      body('offline_mode').optional().isBoolean().withMessage('offline_mode must be a boolean')
    ],
    resetSettings: [
      param('category').isIn(['all', 'notification_preferences', 'app_preferences', 'ai_preferences', 'sync_settings', 'privacy_settings'])
        .withMessage('Invalid settings category')
    ]
  },
  
  // Notifications validation rules
  notifications: {
    getNotifications: [
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a positive number'),
      query('unread_only').optional().isBoolean().withMessage('unread_only must be a boolean')
    ],
    markAsRead: [
      body('notification_ids').optional().isArray().withMessage('notification_ids must be an array'),
      body('notification_ids.*').optional().isInt().withMessage('Each notification ID must be an integer')
    ],
    deleteNotifications: [
      body('notification_ids').isArray().notEmpty().withMessage('notification_ids must be a non-empty array'),
      body('notification_ids.*').isInt().withMessage('Each notification ID must be an integer')
    ]
  }
};

class ImageValidation {
  static async validateImage(file) {
    try {
      // Check file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_SIZE) {
        return {
          error: 'Image size must be less than 5MB'
        };
      }

      // Check file type
      const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return {
          error: 'Only JPEG and PNG images are allowed'
        };
      }

      // Get image info
      const metadata = await sharp(file.buffer).metadata();

      // Check dimensions (max 1920x1080)
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        return {
          error: 'Image dimensions must not exceed 1920x1080'
        };
      }

      // Check minimum dimensions (min 720p)
      const MIN_WIDTH = 1280;
      const MIN_HEIGHT = 720;
      if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
        return {
          error: 'Image dimensions must be at least 1280x720'
        };
      }

      // Check for image blur
      const blurScore = await this.calculateBlurScore(file.buffer);
      if (blurScore < 0.5) { // Threshold can be adjusted
        return {
          error: 'Image appears to be too blurry'
        };
      }

      return {
        error: null,
        imageInfo: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: file.size
        }
      };
    } catch (error) {
      logger.error('Error validating image:', error);
      return {
        error: 'Error processing image'
      };
    }
  }

  static async calculateBlurScore(buffer) {
    try {
      // Use Laplacian variance as a measure of image sharpness
      const { data, info } = await sharp(buffer)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      let sum = 0;
      let sumSquares = 0;
      const pixels = info.width * info.height;

      // Calculate variance
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
        sumSquares += data[i] * data[i];
      }

      const mean = sum / pixels;
      const variance = (sumSquares / pixels) - (mean * mean);

      // Normalize score between 0 and 1
      return Math.min(variance / 1000, 1);
    } catch (error) {
      logger.error('Error calculating blur score:', error);
      return 1; // Return maximum score on error to avoid false negatives
    }
  }
}

module.exports = {
  ImageValidation,
  validate,
  rules
};