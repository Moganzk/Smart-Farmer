import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from '../components/common';

const SplashScreen = () => {
  const { theme } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  
  useEffect(() => {
    // Combine animations for fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Typography 
          variant="h1" 
          align="center"
          color={theme.colors.primary}
          style={styles.title}
        >
          Smart Farmer
        </Typography>
        <Typography 
          variant="subtitle2" 
          align="center"
          color={theme.colors.secondary}
        >
          Empowering farmers with technology
        </Typography>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
});

export default SplashScreen;