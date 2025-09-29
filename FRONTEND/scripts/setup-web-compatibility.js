const fs = require('fs');
const path = require('path');

console.log('🌱 Smart Farmer Web Compatibility Setup');
console.log('=======================================');

// Create placeholder asset directories if they don't exist
const assetsDirs = [
  path.join(__dirname, '..', 'assets'),
  path.join(__dirname, '..', 'assets', 'images'),
];

assetsDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${path.relative(__dirname, dir)}`);
  }
});

// Create a simple placeholder logo.png
const logoPath = path.join(__dirname, '..', 'assets', 'images', 'logo.png');
if (!fs.existsSync(logoPath)) {
  // This is a simple 1x1 transparent pixel PNG
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const imageBuffer = Buffer.from(base64Image, 'base64');
  fs.writeFileSync(logoPath, imageBuffer);
  console.log('✅ Created placeholder logo.png');
}

// Create or update App.js for web compatibility
const appJsPath = path.join(__dirname, '..', 'App.js');
const webAppContent = `
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import WebApp from './src/WebApp';

// This is a special web-only version of the app that bypasses all native components
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
`;

// Backup original App.js if it exists and hasn't been backed up yet
const backupAppPath = path.join(__dirname, '..', 'App.backup.js');
if (fs.existsSync(appJsPath) && !fs.existsSync(backupAppPath)) {
  fs.copyFileSync(appJsPath, backupAppPath);
  console.log('✅ Created backup of original App.js');
}

// Write new App.js
fs.writeFileSync(appJsPath, webAppContent);
console.log('✅ Created web-compatible App.js');

console.log('✅ Web compatibility setup complete!');
console.log('');
console.log('Run "npx expo start --web" to start the web app.');
console.log('To restore the original mobile app, run "node scripts/restore-mobile-app.js"');