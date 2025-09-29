const fs = require('fs');
const path = require('path');

// Paths to our App files
const originalAppPath = path.join(__dirname, '..', 'App.js');
const webAppPath = path.join(__dirname, '..', 'AppWeb.js');
const backupAppPath = path.join(__dirname, '..', 'App.backup.js');

// Check if backup exists
if (!fs.existsSync(backupAppPath)) {
  // Create a backup of the original App.js
  fs.copyFileSync(originalAppPath, backupAppPath);
  console.log('Created backup of original App.js');
}

// Copy the web version to App.js
fs.copyFileSync(webAppPath, originalAppPath);
console.log('Switched to web-compatible version of App.js');
console.log('Run "npm run web" to start the web application');