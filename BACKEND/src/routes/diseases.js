const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');

// Create async route handler middleware
const asyncHandler = fn => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

const controller = require('../controllers/diseases/disease.controller');

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Handle disease detection
router.post('/detect', 
  auth, 
  upload.single('image'),
  asyncHandler(controller.detect)
);

// Handle history request
router.get('/history', auth, asyncHandler(controller.getHistory));

// Handle offline detection sync
router.post('/sync', auth, asyncHandler(controller.syncOfflineDetections));

// Admin only endpoints
router.post('/cleanup', auth, asyncHandler(controller.deleteExpired));

router.get('/stats', auth, asyncHandler(controller.getStats));

// This route must be last to avoid conflicts with other routes
router.get('/:detectionId', auth, asyncHandler(controller.getDetection));

module.exports = router;