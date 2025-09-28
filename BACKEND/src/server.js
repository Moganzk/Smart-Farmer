/**
 * Server Entry Point
 * 
 * Initializes the Express app and starts the HTTP server
 */

const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const ChatService = require('./services/chat/chatService');
const config = require('./config/config');

// Create HTTP server
const server = http.createServer(app);

// Initialize chat service with WebSocket
const chatService = new ChatService(server);

// Make chat service available to the app
app.set('chatService', chatService);

// Set port and start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

module.exports = server;
