/**
 * Image Routes
 * Handles routes for storing and retrieving images directly from database
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authorizeUser } = require('../../middlewares/auth');
const imageController = require('../../controllers/images/image.controller');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * @route   POST /api/images
 * @desc    Store an application image in database
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authorizeUser,
  upload.single('image'),
  imageController.storeImage
);

/**
 * @route   GET /api/images/:imageKey
 * @desc    Get an image by its key
 * @access  Public
 */
router.get('/:imageKey', imageController.getImageByKey);

/**
 * @route   GET /api/images
 * @desc    List all available app images
 * @access  Private (Admin only)
 */
router.get('/', authorizeUser, imageController.listAppImages);

/**
 * @route   POST /api/images/profile
 * @desc    Update user's profile image
 * @access  Private
 */
router.post(
  '/profile',
  authorizeUser,
  upload.single('profileImage'),
  imageController.updateProfileImage
);

/**
 * @route   GET /api/images/profile/:userId
 * @desc    Get a user's profile image
 * @access  Public
 */
router.get('/profile/:userId', imageController.getProfileImage);

/**
 * @route   POST /api/images/detection
 * @desc    Store a disease detection image
 * @access  Private
 */
router.post(
  '/detection',
  authorizeUser,
  upload.single('detectionImage'),
  imageController.storeDetectionImage
);

/**
 * @route   GET /api/images/detection/:detectionId
 * @desc    Get a disease detection image
 * @access  Private
 */
router.get(
  '/detection/:detectionId',
  authorizeUser,
  imageController.getDetectionImage
);

module.exports = router;