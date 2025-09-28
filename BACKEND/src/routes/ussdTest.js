// src/routes/ussdTest.js
const express = require('express');
const router = express.Router();
const USSDController = require('../controllers/ussd');

/**
 * USSD Test Endpoints
 */

/**
 * @swagger
 * /api/ussd-test/session:
 *   post:
 *     summary: Test USSD session
 *     description: Endpoint to test USSD session with specific inputs
 *     tags: [USSD-Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "test-session-123"
 *               phoneNumber:
 *                 type: string
 *                 example: "+254700000000"
 *               text:
 *                 type: string
 *                 example: "1*2"
 *               serviceCode:
 *                 type: string
 *                 example: "*123#"
 *     responses:
 *       200:
 *         description: USSD response
 *       400:
 *         description: Invalid request
 */
router.post('/session', USSDController.processRequest);

/**
 * @swagger
 * /api/ussd-test/simulate:
 *   post:
 *     summary: Simulate USSD flow
 *     description: Simulates a complete USSD user journey
 *     tags: [USSD-Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+254700000000"
 *               inputs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["", "1", "2"]
 *               serviceCode:
 *                 type: string
 *                 example: "*123#"
 *     responses:
 *       200:
 *         description: Simulation results
 *       400:
 *         description: Invalid request
 */
router.post('/simulate', async (req, res) => {
    try {
        const { phoneNumber, inputs, serviceCode } = req.body;
        
        if (!phoneNumber || !Array.isArray(inputs) || !serviceCode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const sessionId = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const results = [];
        
        // Process each input sequentially to simulate a USSD session
        for (let i = 0; i < inputs.length; i++) {
            const text = inputs[i];
            const response = await new Promise((resolve) => {
                const mockReq = {
                    body: { sessionId, phoneNumber, text, serviceCode }
                };
                const mockRes = {
                    send: (data) => resolve(data),
                    set: () => {}
                };
                
                USSDController.processRequest(mockReq, mockRes);
            });
            
            results.push({
                input: text === '' ? 'Initial dial' : text,
                response
            });
        }
        
        res.json({ 
            sessionId, 
            phoneNumber,
            serviceCode,
            results 
        });
    } catch (error) {
        console.error('Error simulating USSD flow:', error);
        res.status(500).json({ error: 'An error occurred during simulation' });
    }
});

/**
 * @swagger
 * /api/ussd-test/menu:
 *   get:
 *     summary: Get USSD menu structure
 *     description: Returns the structure of the USSD menus for documentation
 *     tags: [USSD-Test]
 *     responses:
 *       200:
 *         description: USSD menu structure
 */
router.get('/menu', (req, res) => {
    // Return a structured representation of the USSD menu system
    const menuStructure = {
        mainMenu: {
            title: "Welcome to Smart Farmer USSD Service!",
            options: [
                { key: "1", label: "Disease Detection", route: "diseaseDetection" },
                { key: "2", label: "My Groups", route: "groups" },
                { key: "3", label: "Account", route: "account" },
                { key: "4", label: "Help", route: "help" }
            ]
        },
        diseaseDetection: {
            title: "Disease Detection",
            options: [
                { key: "1", label: "Identify crop disease", route: "identifyCropDisease" },
                { key: "2", label: "View recent detections", route: "viewRecentDetections" },
                { key: "3", label: "Get advice", route: "getAdvice" },
                { key: "0", label: "Back", route: "mainMenu" }
            ]
        },
        groups: {
            title: "My Groups",
            options: [
                { key: "1", label: "View my groups", route: "viewGroups" },
                { key: "2", label: "Join a group by code", route: "joinGroup" },
                { key: "0", label: "Back", route: "mainMenu" }
            ]
        },
        account: {
            title: "Account Information",
            options: [
                { key: "1", label: "My profile", route: "viewProfile" },
                { key: "2", label: "Update settings", route: "updateSettings" },
                { key: "3", label: "Subscription status", route: "subscriptionStatus" },
                { key: "0", label: "Back", route: "mainMenu" }
            ]
        },
        help: {
            title: "Help & Support",
            content: "For assistance, contact our support team:\nCall: +2547XXXXXXXX\nSMS: Send HELP to 22111",
            options: [
                { key: "0", label: "Back", route: "mainMenu" }
            ]
        }
    };
    
    res.json(menuStructure);
});

module.exports = router;