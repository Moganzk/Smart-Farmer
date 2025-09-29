import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { STORAGE_KEYS } from '../constants/config';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyPhoneScreen from '../screens/auth/VerifyPhoneScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import DiseaseDetectionScreen from '../screens/diseases/DiseaseDetectionScreen';
import DiseaseResultScreen from '../screens/diseases/DiseaseResultScreen';
import DiseaseHistoryScreen from '../screens/diseases/DiseaseHistoryScreen';
import TestGeminiScreen from '../screens/diseases/TestGeminiScreen';
import AdvisoryScreen from '../screens/advisory/AdvisoryScreen';
import AdvisoryDetailScreen from '../screens/advisory/AdvisoryDetailScreen';
import AdvisorySearchScreen from '../screens/advisory/AdvisorySearchScreen';
import AdvisoryCategoryScreen from '../screens/advisory/AdvisoryCategoryScreen';
import GroupsScreen from '../screens/groups/GroupsScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import GroupCreateScreen from '../screens/groups/GroupCreateScreen';
import GroupChatScreen from '../screens/groups/GroupChatScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Icons for tabs and drawer
import { Ionicons } from '@expo/vector-icons';

// Main Tab Navigator (Bottom Tabs)
const MainTabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabIconInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="DiseaseTab" 
        component={DiseaseNavigator} 
        options={{
          tabBarLabel: 'Diseases',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AdvisoryTab" 
        component={AdvisoryNavigator} 
        options={{
          tabBarLabel: 'Advisory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="GroupsTab" 
        component={GroupsNavigator} 
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Disease Stack Navigator
const DiseaseNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiseaseDetection" component={DiseaseDetectionScreen} />
      <Stack.Screen name="DiseaseResult" component={DiseaseResultScreen} />
      <Stack.Screen name="DiseaseHistory" component={DiseaseHistoryScreen} />
      <Stack.Screen name="TestGemini" component={TestGeminiScreen} />
    </Stack.Navigator>
  );
};

// Advisory Stack Navigator
const AdvisoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Advisory" component={AdvisoryScreen} />
      <Stack.Screen name="AdvisoryDetail" component={AdvisoryDetailScreen} />
      <Stack.Screen name="AdvisorySearch" component={AdvisorySearchScreen} />
      <Stack.Screen name="AdvisoryCategory" component={AdvisoryCategoryScreen} />
    </Stack.Navigator>
  );
};

// Groups Stack Navigator
const GroupsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
    </Stack.Navigator>
  );
};

// Main Drawer Navigator
const MainDrawerNavigator = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: theme.colors.primaryLight,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -20,
        },
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        }
      }}
      drawerContent={(props) => (
        <DrawerContent {...props} user={user} logout={logout} />
      )}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerLabel: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          drawerLabel: 'About',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setHasCompletedOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboarding();
  }, []);
  
  // Show splash screen while loading
  if (isLoading || hasCompletedOnboarding === null) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer theme={theme.navigation}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainDrawerNavigator} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Custom Drawer Content
const DrawerContent = (props) => {
  // This will be implemented later
  return null;
};

export default AppNavigator;