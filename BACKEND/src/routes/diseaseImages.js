// Disease Images Routes
// API endpoints for accessing disease reference images

const express = require('express');
const router = express.Router();
const diseaseImagesController = require('../controllers/diseaseImagesController');
const { auth } = require('../middleware/auth');

// Public routes (no authentication required for reference images)
router.get('/', diseaseImagesController.getAllDiseaseImages);
router.get('/crops/list', diseaseImagesController.getAvailableCrops);
router.get('/search', diseaseImagesController.searchDiseaseImages);
router.get('/random', diseaseImagesController.getRandomDiseaseImage);
router.get('/crop/:cropType', diseaseImagesController.getDiseaseImagesByCrop);
router.get('/:id', diseaseImagesController.getDiseaseImageById);

// Protected routes (optional - for admin management)
// router.post('/', auth, diseaseImagesController.createDiseaseImage);
// router.put('/:id', auth, diseaseImagesController.updateDiseaseImage);
// router.delete('/:id', auth, diseaseImagesController.deleteDiseaseImage);

module.exports = router;
