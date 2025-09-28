const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Initialize routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const diseaseRoutes = require('./routes/diseases');
const advisoryRoutes = require('./routes/advisory');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/report');
const profileRoutes = require('./routes/farmer/profile');
const settingsRoutes = require('./routes/farmer/settings');
const notificationRoutes = require('./routes/notifications');
const ussdRoutes = require('./routes/ussd');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(config.server.env === 'development' && { stack: err.stack })
    }
  });
});

// Export the app
module.exports = app;

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = 3001; // Force port to 3001 for testing
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}