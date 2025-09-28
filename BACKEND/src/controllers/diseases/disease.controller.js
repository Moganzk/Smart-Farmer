const Disease = require('../../models/disease');
const Advisory = require('../../models/advisory');
const User = require('../../models/user');
const logger = require('../../utils/logger');
const { GeminiAPI } = require('../../utils/ai');
const { uploadImage, deleteImage } = require('../../utils/storage');
const ImageValidation = require('../../utils/validation');

const diseaseController = {
  detect: async (req, res) => {
    try {
      // First validate image
      const { error: validationError, imageInfo } = await ImageValidation.validateImage(req.file);
      if (validationError) {
        return res.status(400).json({
          error: {
            message: validationError
          }
        });
      }

      // Upload image and get path
      const imagePath = await uploadImage(req.file, 'disease-images');

      // Process with Gemini API
      const geminiResult = await GeminiAPI.detectDisease({
        imagePath,
        cropType: req.body.cropType
      });

      // Get matching advisory content
      const advisoryResults = await Advisory.search({
        cropType: req.body.cropType,
        diseaseName: geminiResult.diseaseName
      });

      // Create detection record
      const detection = await Disease.create({
        userId: req.user.user_id,
        imagePath,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        imageResolution: `${imageInfo.width}x${imageInfo.height}`,
        detectionResult: geminiResult,
        advisoryContentId: advisoryResults[0]?.content_id,
        confidenceScore: geminiResult.confidence,
        notes: req.body.notes
      });

      // Update user's storage quota
      await User.updateStorageUsed(req.user.user_id, req.file.size);

      res.status(201).json({
        data: {
          detection,
          advisory: advisoryResults[0]
        }
      });
    } catch (error) {
      logger.error('Error in disease detection:', error);
      res.status(500).json({
        error: {
          message: 'Error processing disease detection'
        }
      });
    }
  },

  getHistory: async (req, res) => {
    try {
      const { limit, before } = req.query;
      const detections = await Disease.getUserHistory(req.user.user_id, {
        limit: parseInt(limit),
        before: before ? parseInt(before) : null
      });

      res.json({
        data: { detections }
      });
    } catch (error) {
      logger.error('Error getting detection history:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving detection history'
        }
      });
    }
  },

  getDetection: async (req, res) => {
    try {
      const detection = await Disease.getById(req.params.detectionId);
      
      if (!detection) {
        return res.status(404).json({
          error: {
            message: 'Detection not found'
          }
        });
      }

      // Verify ownership
      if (detection.user_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      res.json({
        data: { detection }
      });
    } catch (error) {
      logger.error('Error getting detection:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving detection'
        }
      });
    }
  },

  deleteExpired: async (req, res) => {
    try {
      // Only admins can manually trigger cleanup
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const deletedDetections = await Disease.deleteExpiredDetections();

      // Delete the actual image files
      for (const detection of deletedDetections) {
        try {
          await deleteImage(detection.image_path);
        } catch (deleteError) {
          logger.error('Error deleting image file:', deleteError);
        }
      }

      res.json({
        message: `Successfully deleted ${deletedDetections.length} expired detections`
      });
    } catch (error) {
      logger.error('Error deleting expired detections:', error);
      res.status(500).json({
        error: {
          message: 'Error cleaning up expired detections'
        }
      });
    }
  },

  getStats: async (req, res) => {
    try {
      // Only admins can view stats
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const stats = await Disease.getStats({
        userId: req.query.userId,
        cropType: req.query.cropType,
        location: req.query.location
      });

      res.json({
        data: { stats }
      });
    } catch (error) {
      logger.error('Error getting detection stats:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving detection statistics'
        }
      });
    }
  },

  syncOfflineDetections: async (req, res) => {
    try {
      const { detections } = req.body;
      const results = [];

      for (const detection of detections) {
        try {
          // Re-process with Gemini API if needed
          let geminiResult = detection.detectionResult;
          if (detection.needsReprocessing) {
            geminiResult = await GeminiAPI.detectDisease({
              imagePath: detection.imagePath,
              cropType: detection.cropType
            });
          }

          // Get or create advisory content
          const advisoryResults = await Advisory.search({
            cropType: detection.cropType,
            diseaseName: geminiResult.diseaseName
          });

          // Create or update detection record
          const result = await Disease.updateSyncStatus(detection.detectionId);
          results.push(result);

        } catch (syncError) {
          logger.error('Error syncing detection:', syncError);
          results.push({
            detectionId: detection.detectionId,
            error: syncError.message
          });
        }
      }

      res.json({
        message: `Synced ${results.length} detections`,
        data: { results }
      });
    } catch (error) {
      logger.error('Error syncing offline detections:', error);
      res.status(500).json({
        error: {
          message: 'Error syncing offline detections'
        }
      });
    }
  }
}

module.exports = diseaseController;