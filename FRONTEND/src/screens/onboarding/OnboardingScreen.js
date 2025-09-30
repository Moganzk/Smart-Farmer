import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Dimensions, 
  Image, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Button } from '../../components/common';
import { STORAGE_KEYS } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Disease Detection',
    description: 'Take a photo of your crops and instantly identify diseases using AI technology',
    image: require('../../assets/images/onboarding-disease.png'),
  },
  {
    id: '2',
    title: 'Expert Advisory',
    description: 'Get personalized recommendations and advice from agricultural experts',
    image: require('../../assets/images/onboarding-advisory.png'),
  },
  {
    id: '3',
    title: 'Community Groups',
    description: 'Connect with other farmers and share knowledge and experiences',
    image: require('../../assets/images/onboarding-community.png'),
  },
  {
    id: '4',
    title: 'Offline Access',
    description: 'Access key features even without internet connection',
    image: require('../../assets/images/onboarding-offline.png'),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const handleNext = () => {
    console.log('🔍 OnboardingScreen: handleNext called, currentIndex:', currentIndex);
    if (currentIndex < onboardingData.length - 1) {
      console.log('🔍 OnboardingScreen: Moving to next slide');
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      console.log('🔍 OnboardingScreen: Completing onboarding');
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    console.log('🔍 OnboardingScreen: handleSkip called');
    completeOnboarding();
  };
  
  const completeOnboarding = async () => {
    console.log('🔍 OnboardingScreen: completeOnboarding called');
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      console.log('🔍 OnboardingScreen: Onboarding completion saved to AsyncStorage');
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      console.error('❌ OnboardingScreen: Error setting onboarding status:', error);
    }
  };
  
  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image 
          source={item.image} 
          style={styles.image}
          resizeMode="contain"
        />
        <Typography 
          variant="h2" 
          align="center"
          color={theme.colors.primary}
          style={styles.title}
        >
          {item.title}
        </Typography>
        <Typography 
          variant="body1" 
          align="center"
          style={styles.description}
        >
          {item.description}
        </Typography>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Typography 
          variant="subtitle2" 
          color={theme.colors.primary}
        >
          Skip
        </Typography>
      </TouchableOpacity>
      
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      
      <View style={styles.pagination}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleNext}
          rightIcon={
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={theme.colors.buttonText} 
            />
          }
        >
          {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  slide: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default OnboardingScreen;