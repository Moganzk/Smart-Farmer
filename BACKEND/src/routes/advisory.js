const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

// Create async route handler middleware
const asyncHandler = fn => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

const controller = require('../controllers/advisory/advisory.controller');

// Advisory content endpoints
router.get('/search', auth, asyncHandler(controller.search));

router.get('/crops', auth, asyncHandler(controller.getCropTypes));

router.get('/crops/:cropType/diseases', auth, asyncHandler(controller.getDiseasesByCrop));

// Admin only endpoints
router.post('/', auth, isAdmin, asyncHandler(controller.create));

router.put('/:contentId', auth, isAdmin, asyncHandler(controller.update));

router.get('/stats', auth, isAdmin, asyncHandler(controller.getStats));

// This route must be last to avoid conflicts with other routes
router.get('/:contentId', auth, asyncHandler(controller.getAdvisory));

module.exports = router;