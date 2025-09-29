const fs = require('fs');
const path = require('path');

// Paths to our App files
const appConfigPath = path.join(__dirname, '..', 'app.json');
const appConfigBackupPath = path.join(__dirname, '..', 'app.json.backup');

// Backup the original app.json if it doesn't exist
if (!fs.existsSync(appConfigBackupPath)) {
  fs.copyFileSync(appConfigPath, appConfigBackupPath);
  console.log('✅ Backed up app.json');
}

// Read the app.json file
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

// Remove features that require authentication
if (appConfig.expo.updates) {
  delete appConfig.expo.updates;
  console.log('✅ Removed updates configuration');
}

if (appConfig.expo.extra && appConfig.expo.extra.eas) {
  delete appConfig.expo.extra.eas;
  console.log('✅ Removed EAS configuration');
}

// Write the modified config back
fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
console.log('✅ Updated app.json for local development');
console.log('');
console.log('You can now run the app without authentication:');
console.log('npm run android');
console.log('');
console.log('To restore the original configuration:');
console.log('node scripts/restore-app-config.js');