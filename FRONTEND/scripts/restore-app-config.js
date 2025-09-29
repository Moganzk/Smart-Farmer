const fs = require('fs');
const path = require('path');

// Paths to our App files
const appConfigPath = path.join(__dirname, '..', 'app.json');
const appConfigBackupPath = path.join(__dirname, '..', 'app.json.backup');

// Check if backup exists
if (fs.existsSync(appConfigBackupPath)) {
  fs.copyFileSync(appConfigBackupPath, appConfigPath);
  console.log('✅ Restored original app.json configuration');
} else {
  console.log('❌ No backup found. Run dev-mode.js first.');
}