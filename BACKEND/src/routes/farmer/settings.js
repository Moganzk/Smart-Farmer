// src/routes/farmer/settings.js
const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/farmer/settings');
const { authenticate } = require('../../middleware/auth');

/**
 * @route GET /api/settings
 * @desc Get user settings
 * @access Private
 */
router.get('/', authenticate, settingsController.getUserSettings);

/**
 * @route PUT /api/settings/notification
 * @desc Update notification preferences
 * @access Private
 */
router.put('/notification', authenticate, settingsController.updateNotificationPreferences);

/**
 * @route PUT /api/settings/app
 * @desc Update app preferences
 * @access Private
 */
router.put('/app', authenticate, settingsController.updateAppPreferences);

/**
 * @route PUT /api/settings/ai
 * @desc Update AI preferences
 * @access Private
 */
router.put('/ai', authenticate, settingsController.updateAIPreferences);

/**
 * @route PUT /api/settings/sync
 * @desc Update sync settings
 * @access Private
 */
router.put('/sync', authenticate, settingsController.updateSyncSettings);

/**
 * @route PUT /api/settings/privacy
 * @desc Update privacy settings
 * @access Private
 */
router.put('/privacy', authenticate, settingsController.updatePrivacySettings);

/**
 * @route POST /api/settings/reset/:category
 * @desc Reset settings to default for a specific category or all
 * @access Private
 */
router.post('/reset/:category', authenticate, settingsController.resetSettings);

module.exports = router;