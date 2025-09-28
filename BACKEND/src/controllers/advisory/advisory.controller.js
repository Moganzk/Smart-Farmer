const Advisory = require('../../models/advisory');
const logger = require('../../utils/logger');

const advisoryController = {
  create: async (req, res) => {
    try {
      // Only admins can create advisory content
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const {
        title,
        contentType,
        content,
        cropType,
        diseaseName,
        severityLevel
      } = req.body;

      const advisory = await Advisory.create({
        title,
        contentType,
        content,
        cropType,
        diseaseName,
        severityLevel,
        createdBy: req.user.user_id
      });

      res.status(201).json({
        message: 'Advisory content created successfully',
        data: { advisory }
      });
    } catch (error) {
      logger.error('Error creating advisory content:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error creating advisory content'
        }
      });
    }
  },

  update: async (req, res) => {
    try {
      // Only admins can update advisory content
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Access denied'
          }
        });
      }

      const {
        title,
        contentType,
        content,
        cropType,
        diseaseName,
        severityLevel,
        isActive
      } = req.body;

      const advisory = await Advisory.update(req.params.contentId, {
        title,
        contentType,
        content,
        cropType,
        diseaseName,
        severityLevel,
        isActive
      });

      if (!advisory) {
        return res.status(404).json({
          error: {
            message: 'Advisory content not found'
          }
        });
      }

      res.json({
        message: 'Advisory content updated successfully',
        data: { advisory }
      });
    } catch (error) {
      logger.error('Error updating advisory content:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error updating advisory content'
        }
      });
    }
  },

  getAdvisory: async (req, res) => {
    try {
      const advisory = await Advisory.getById(req.params.contentId);
      
      if (!advisory) {
        return res.status(404).json({
          error: {
            message: 'Advisory content not found'
          }
        });
      }

      res.json({
        data: { advisory }
      });
    } catch (error) {
      logger.error('Error getting advisory content:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving advisory content'
        }
      });
    }
  },

  search: async (req, res) => {
    try {
      const { cropType, diseaseName, contentType, query } = req.query;

      const advisories = await Advisory.search({
        cropType,
        diseaseName,
        contentType,
        query
      });

      res.json({
        data: { advisories }
      });
    } catch (error) {
      logger.error('Error searching advisory content:', error);
      res.status(500).json({
        error: {
          message: 'Error searching advisory content'
        }
      });
    }
  },

  getCropTypes: async (req, res) => {
    try {
      const cropTypes = await Advisory.getCropTypes();

      res.json({
        data: { cropTypes }
      });
    } catch (error) {
      logger.error('Error getting crop types:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving crop types'
        }
      });
    }
  },

  getDiseasesByCrop: async (req, res) => {
    try {
      const { cropType } = req.params;
      const diseases = await Advisory.getDiseasesByCrop(cropType);

      res.json({
        data: { diseases }
      });
    } catch (error) {
      logger.error('Error getting diseases by crop:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving diseases'
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

      const stats = await Advisory.getStats();

      res.json({
        data: { stats }
      });
    } catch (error) {
      logger.error('Error getting advisory stats:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving advisory statistics'
        }
      });
    }
  }
}

module.exports = advisoryController;