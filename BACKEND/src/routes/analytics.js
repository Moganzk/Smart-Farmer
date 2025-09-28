/**
 * Analytics Routes
 * 
 * Defines all analytics-related API endpoints
 * Restricted to admin users only
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics/analyticsController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Apply authentication and admin role check middleware to all routes
router.use(verifyToken, isAdmin);

// Dashboard summary
router.get('/dashboard', AnalyticsController.getDashboardSummary);

// User statistics
router.get('/users/growth', AnalyticsController.getUserGrowth);
router.get('/users/activity', AnalyticsController.getUserActivity);

// Disease statistics
router.get('/diseases', AnalyticsController.getDiseaseStatistics);

// Group statistics
router.get('/groups', AnalyticsController.getGroupStatistics);

module.exports = router;