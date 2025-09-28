// src/routes/farmer/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/farmer/profile');
const { authenticate } = require('../../middleware/auth');

/**
 * @route GET /api/profile
 * @desc Get the current user's profile
 * @access Private
 */
router.get('/', authenticate, profileController.getUserProfile);

/**
 * @route PUT /api/profile
 * @desc Update the current user's profile
 * @access Private
 */
router.put('/', authenticate, profileController.updateUserProfile);

/**
 * @route POST /api/profile/upload-image
 * @desc Upload/update profile image
 * @access Private
 */
router.post('/upload-image', authenticate, profileController.uploadProfileImage);

/**
 * @route DELETE /api/profile/image
 * @desc Delete the user's profile image
 * @access Private
 */
router.delete('/image', authenticate, profileController.deleteProfileImage);

/**
 * @route PUT /api/profile/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticate, profileController.changePassword);

/**
 * @route GET /api/profile/:username
 * @desc Get a user's public profile by username
 * @access Public
 */
router.get('/:username', profileController.getPublicProfile);

module.exports = router;