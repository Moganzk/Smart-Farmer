import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * A simple loading screen component for web compatibility
 */
const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  }
});

export default LoadingScreen;