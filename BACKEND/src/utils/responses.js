// src/utils/responses.js
/**
 * Standard response utility functions for API endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send in the response
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

/**
 * Send a created response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send in the response
 */
const created = (res, data) => {
  return success(res, data, 201);
};

/**
 * Send a bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} errors - Optional validation errors
 */
const badRequest = (res, message, errors = null) => {
  const response = {
    success: false,
    message: message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(400).json(response);
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message: message
  });
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message: message
  });
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message: message
  });
};

/**
 * Send a conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflict = (res, message) => {
  return res.status(409).json({
    success: false,
    message: message
  });
};

/**
 * Send a server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const serverError = (res, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    message: message
  });
};

module.exports = {
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError
};