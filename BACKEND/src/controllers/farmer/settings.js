// src/controllers/farmer/settings.js
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');

/**
 * Get user settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserSettings = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    // Get user settings from the database
    const result = await pool.query(
      `SELECT 
        user_id, 
        notification_preferences, 
        app_preferences,
        ai_preferences,
        sync_settings,
        privacy_settings
       FROM user_settings
       WHERE user_id = $1`,
      [userId]
    );
    
    // If user doesn't have settings yet, return defaults
    if (result.rows.length === 0) {
      // Default settings
      const defaultSettings = {
        notification_preferences: {
          push_enabled: true,
          email_enabled: true,
          detection_results: true,
          group_messages: true,
          system_updates: true,
          warnings: true
        },
        app_preferences: {
          theme: 'auto',
          language: 'en',
          font_size: 'medium',
          high_contrast: false,
          reduced_motion: false,
          offline_mode: false
        },
        ai_preferences: {
          auto_analysis: true,
          save_images: true,
          data_contribution: false,
          model_preference: 'standard'
        },
        sync_settings: {
          auto_sync: true,
          sync_over_wifi_only: false,
          sync_frequency: 'daily'
        },
        privacy_settings: {
          profile_visibility: 'registered',
          location_sharing: 'none',
          data_collection: 'minimal'
        }
      };
      
      // Create settings in database
      await pool.query(
        `INSERT INTO user_settings 
        (user_id, notification_preferences, app_preferences, ai_preferences, sync_settings, privacy_settings) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId, 
          defaultSettings.notification_preferences, 
          defaultSettings.app_preferences,
          defaultSettings.ai_preferences,
          defaultSettings.sync_settings,
          defaultSettings.privacy_settings
        ]
      );
      
      return responses.success(res, { 
        message: 'Default settings created',
        settings: defaultSettings 
      });
    }
    
    // Return existing settings
    return responses.success(res, { settings: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching user settings:', error);
    return responses.serverError(res, 'Failed to fetch user settings');
  }
};

/**
 * Update notification preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateNotificationPreferences = async (req, res) => {
  const userId = req.user.user_id;
  const notificationPreferences = req.body;
  
  try {
    // Get current notification preferences
    const currentResult = await pool.query(
      'SELECT notification_preferences FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings don't exist yet, create them
    if (currentResult.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO user_settings (user_id, notification_preferences) VALUES ($1, $2) RETURNING notification_preferences',
        [userId, notificationPreferences]
      );
      
      return responses.success(res, { 
        message: 'Notification preferences created',
        notification_preferences: result.rows[0].notification_preferences 
      });
    }
    
    // Update existing notification preferences
    const result = await pool.query(
      'UPDATE user_settings SET notification_preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING notification_preferences',
      [notificationPreferences, userId]
    );
    
    return responses.success(res, { 
      message: 'Notification preferences updated',
      notification_preferences: result.rows[0].notification_preferences 
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    return responses.serverError(res, 'Failed to update notification preferences');
  }
};

/**
 * Update app preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAppPreferences = async (req, res) => {
  const userId = req.user.user_id;
  const appPreferences = req.body;
  
  try {
    // Get current app preferences
    const currentResult = await pool.query(
      'SELECT app_preferences FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings don't exist yet, create them
    if (currentResult.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO user_settings (user_id, app_preferences) VALUES ($1, $2) RETURNING app_preferences',
        [userId, appPreferences]
      );
      
      return responses.success(res, { 
        message: 'App preferences created',
        app_preferences: result.rows[0].app_preferences 
      });
    }
    
    // Update existing app preferences
    const result = await pool.query(
      'UPDATE user_settings SET app_preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING app_preferences',
      [appPreferences, userId]
    );
    
    return responses.success(res, { 
      message: 'App preferences updated',
      app_preferences: result.rows[0].app_preferences 
    });
  } catch (error) {
    logger.error('Error updating app preferences:', error);
    return responses.serverError(res, 'Failed to update app preferences');
  }
};

/**
 * Update AI preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAIPreferences = async (req, res) => {
  const userId = req.user.user_id;
  const aiPreferences = req.body;
  
  try {
    // Get current AI preferences
    const currentResult = await pool.query(
      'SELECT ai_preferences FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings don't exist yet, create them
    if (currentResult.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO user_settings (user_id, ai_preferences) VALUES ($1, $2) RETURNING ai_preferences',
        [userId, aiPreferences]
      );
      
      return responses.success(res, { 
        message: 'AI preferences created',
        ai_preferences: result.rows[0].ai_preferences 
      });
    }
    
    // Update existing AI preferences
    const result = await pool.query(
      'UPDATE user_settings SET ai_preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING ai_preferences',
      [aiPreferences, userId]
    );
    
    return responses.success(res, { 
      message: 'AI preferences updated',
      ai_preferences: result.rows[0].ai_preferences 
    });
  } catch (error) {
    logger.error('Error updating AI preferences:', error);
    return responses.serverError(res, 'Failed to update AI preferences');
  }
};

/**
 * Update sync settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSyncSettings = async (req, res) => {
  const userId = req.user.user_id;
  const syncSettings = req.body;
  
  try {
    // Get current sync settings
    const currentResult = await pool.query(
      'SELECT sync_settings FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings don't exist yet, create them
    if (currentResult.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO user_settings (user_id, sync_settings) VALUES ($1, $2) RETURNING sync_settings',
        [userId, syncSettings]
      );
      
      return responses.success(res, { 
        message: 'Sync settings created',
        sync_settings: result.rows[0].sync_settings 
      });
    }
    
    // Update existing sync settings
    const result = await pool.query(
      'UPDATE user_settings SET sync_settings = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING sync_settings',
      [syncSettings, userId]
    );
    
    // Update last sync time for user
    await pool.query(
      'UPDATE users SET last_sync_time = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );
    
    return responses.success(res, { 
      message: 'Sync settings updated',
      sync_settings: result.rows[0].sync_settings 
    });
  } catch (error) {
    logger.error('Error updating sync settings:', error);
    return responses.serverError(res, 'Failed to update sync settings');
  }
};

/**
 * Update privacy settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePrivacySettings = async (req, res) => {
  const userId = req.user.user_id;
  const privacySettings = req.body;
  
  try {
    // Get current privacy settings
    const currentResult = await pool.query(
      'SELECT privacy_settings FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings don't exist yet, create them
    if (currentResult.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO user_settings (user_id, privacy_settings) VALUES ($1, $2) RETURNING privacy_settings',
        [userId, privacySettings]
      );
      
      return responses.success(res, { 
        message: 'Privacy settings created',
        privacy_settings: result.rows[0].privacy_settings 
      });
    }
    
    // Update existing privacy settings
    const result = await pool.query(
      'UPDATE user_settings SET privacy_settings = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING privacy_settings',
      [privacySettings, userId]
    );
    
    return responses.success(res, { 
      message: 'Privacy settings updated',
      privacy_settings: result.rows[0].privacy_settings 
    });
  } catch (error) {
    logger.error('Error updating privacy settings:', error);
    return responses.serverError(res, 'Failed to update privacy settings');
  }
};

/**
 * Reset user settings to defaults
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetSettings = async (req, res) => {
  const userId = req.user.user_id;
  const { category } = req.params;
  
  // Default settings by category
  const defaultSettings = {
    notification_preferences: {
      push_enabled: true,
      email_enabled: true,
      detection_results: true,
      group_messages: true,
      system_updates: true,
      warnings: true
    },
    app_preferences: {
      theme: 'auto',
      language: 'en',
      font_size: 'medium',
      high_contrast: false,
      reduced_motion: false,
      offline_mode: false
    },
    ai_preferences: {
      auto_analysis: true,
      save_images: true,
      data_contribution: false,
      model_preference: 'standard'
    },
    sync_settings: {
      auto_sync: true,
      sync_over_wifi_only: false,
      sync_frequency: 'daily'
    },
    privacy_settings: {
      profile_visibility: 'registered',
      location_sharing: 'none',
      data_collection: 'minimal'
    }
  };
  
  // Validate category
  if (category !== 'all' && !defaultSettings[category]) {
    return responses.badRequest(res, 'Invalid settings category');
  }
  
  try {
    if (category === 'all') {
      // Reset all settings
      await pool.query(
        `UPDATE user_settings SET 
          notification_preferences = $1, 
          app_preferences = $2, 
          ai_preferences = $3, 
          sync_settings = $4, 
          privacy_settings = $5,
          updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $6`,
        [
          defaultSettings.notification_preferences,
          defaultSettings.app_preferences,
          defaultSettings.ai_preferences,
          defaultSettings.sync_settings,
          defaultSettings.privacy_settings,
          userId
        ]
      );
      
      return responses.success(res, { 
        message: 'All settings reset to default',
        settings: defaultSettings
      });
    } else {
      // Reset specific category
      const query = `UPDATE user_settings SET ${category} = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING ${category}`;
      const result = await pool.query(query, [defaultSettings[category], userId]);
      
      return responses.success(res, { 
        message: `${category} reset to default`,
        [category]: result.rows[0][category]
      });
    }
  } catch (error) {
    logger.error('Error resetting settings:', error);
    return responses.serverError(res, 'Failed to reset settings');
  }
};

module.exports = {
  getUserSettings,
  updateNotificationPreferences,
  updateAppPreferences,
  updateAIPreferences,
  updateSyncSettings,
  updatePrivacySettings,
  resetSettings
};