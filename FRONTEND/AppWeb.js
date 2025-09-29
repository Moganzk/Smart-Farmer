import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebApp from './src/WebApp';

// Web compatible version of the app
export default function App() {
  // A simpler version for web preview
  return (
    <SafeAreaProvider>
      <WebApp />
    </SafeAreaProvider>
  );
}