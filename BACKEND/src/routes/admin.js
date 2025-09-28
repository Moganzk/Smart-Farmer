// src/routes/admin.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Report management
router.get('/reports', AdminController.getReports);
router.get('/reports/:id', AdminController.getReportById);
router.put('/reports/:id/status', AdminController.updateReportStatus);

// User management
router.post('/users/:id/suspend', AdminController.suspendUser);
router.post('/users/:id/ban', AdminController.banUser);
router.delete('/users/:id/suspension', AdminController.removeSuspension);
router.post('/users/:id/warn', AdminController.warnUser);
router.get('/users/:id/reports', AdminController.getUserReports);

// Message management
router.get('/messages/archived', AdminController.getArchivedMessages);
router.post('/messages/:id/delete', AdminController.deleteMessage);
router.post('/messages/:id/restore', AdminController.restoreMessage);

// Group management
router.post('/groups/:id/join', AdminController.joinGroup);
router.post('/groups/:id/feature', AdminController.featureGroup);
router.delete('/groups/:id/feature', AdminController.unfeatureGroup);

// Activity and metrics
router.get('/activity-log', AdminController.getActivityLogs);
router.get('/metrics', AdminController.getModerationMetrics);

module.exports = router;