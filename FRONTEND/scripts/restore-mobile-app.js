const fs = require('fs');
const path = require('path');

// Paths to our App files
const originalAppPath = path.join(__dirname, '..', 'App.js');
const backupAppPath = path.join(__dirname, '..', 'App.backup.js');

// Check if backup exists
if (fs.existsSync(backupAppPath)) {
  // Restore the original App.js
  fs.copyFileSync(backupAppPath, originalAppPath);
  console.log('Restored original App.js');
} else {
  console.log('No backup found. Cannot restore original App.js');
}