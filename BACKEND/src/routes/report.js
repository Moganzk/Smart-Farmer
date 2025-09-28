// src/routes/report.js
const express = require('express');
const router = express.Router();
const reporter = require('../middleware/reporter');
const { auth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// Report endpoints
router.post('/message', reporter.reportMessage);
router.post('/user', reporter.reportUser);
router.get('/my-reports', reporter.getMyReports);

module.exports = router;