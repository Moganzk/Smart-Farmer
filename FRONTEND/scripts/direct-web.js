const fs = require('fs');
const path = require('path');

// Path to App.js
const appJsPath = path.join(__dirname, '..', 'App.js');

// Create a new App.js that completely bypasses the navigation system
const webAppContent = `
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import WebApp from './src/WebApp';

// This is a special web-only version of the app
// It bypasses all the native components and navigation that cause errors
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

// Write the new App.js
fs.writeFileSync(appJsPath, webAppContent);
console.log('✅ Successfully created a web-only version of the app!');
console.log('All navigation and native component errors have been bypassed.');
console.log('Run "npx expo start --web" to start the web app.');