// src/routes/farmer/detection.js
const express = require('express');
const router = express.Router();
const detectionController = require('../../controllers/farmer/detection');
const { authenticate } = require('../../middleware/auth');

/**
 * @route POST /api/detection
 * @desc Submit a new crop image for disease detection
 * @access Private
 */
router.post('/', authenticate, detectionController.detectDisease);

/**
 * @route GET /api/detection
 * @desc Get all disease detections for the current user
 * @access Private
 */
router.get('/', authenticate, detectionController.getUserDetections);

/**
 * @route GET /api/detection/:id
 * @desc Get a specific detection by ID
 * @access Private
 */
router.get('/:id', authenticate, detectionController.getDetectionById);

/**
 * @route DELETE /api/detection/:id
 * @desc Delete a specific detection
 * @access Private
 */
router.delete('/:id', authenticate, detectionController.deleteDetection);

/**
 * @route PUT /api/detection/:id/feedback
 * @desc Submit feedback on a detection result
 * @access Private
 */
router.put('/:id/feedback', authenticate, detectionController.submitFeedback);

module.exports = router;
