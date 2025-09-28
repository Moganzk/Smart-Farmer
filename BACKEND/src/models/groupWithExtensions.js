/**
 * Group Model Extensions Loader
 * 
 * This file loads the Group model extensions into the main Group model.
 * It's imported in the application startup to ensure the extensions are available.
 */

// Import the base Group model
const Group = require('../models/group');

// Import the extensions
const extensions = require('../utils/groupModelExtensions');

// Apply the extensions (these are already merged in the extensions file)
console.log('Group model extensions loaded');

module.exports = Group;