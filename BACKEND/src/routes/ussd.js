/**
 * USSD Routes
 */
const express = require('express');
const router = express.Router();
const ussdController = require('../controllers/ussd');

/**
 * @route POST /api/ussd/callback
 * @desc Handle USSD callback from provider
 * @access Public
 */
router.post('/callback', ussdController.handleUSSDCallback);

/**
 * @route POST /api/ussd/session
 * @desc Start a new USSD session
 * @access Public
 */
router.post('/session', ussdController.startUSSDSession);

/**
 * @route DELETE /api/ussd/session/:sessionId
 * @desc End an active USSD session
 * @access Public
 */
router.delete('/session/:sessionId', ussdController.endUSSDSession);

module.exports = router;