import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';
import { showMessage } from 'react-native-flash-message';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: theme.mode === 'dark',
    notifications: true,
    locationServices: false,
    dataSync: true,
    offlineMode: false,
    automaticUpdates: true,
    saveData: true,
  });
  
  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings,
          darkMode: theme.mode === 'dark', // Sync with current theme
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save settings
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to save settings',
        type: 'danger',
      });
    }
  };
  
  // Handle setting toggle
  const handleToggle = (key) => {
    const newSettings = { 
      ...settings, 
      [key]: !settings[key]
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Handle special cases
    if (key === 'darkMode') {
      setTheme(newSettings.darkMode ? 'dark' : 'light');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              logout();
              setIsLoading(false);
            }, 800);
          },
        },
      ]
    );
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'All your data will be permanently deleted. This cannot be undone. Are you absolutely sure?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsLoading(true);
                      // API call would go here
                      // await apiService.user.deleteAccount();
                      
                      // For now, just log out
                      setTimeout(() => {
                        logout();
                        setIsLoading(false);
                        
                        showMessage({
                          message: 'Account Deleted',
                          description: 'Your account has been deleted successfully',
                          type: 'success',
                        });
                      }, 1500);
                    } catch (error) {
                      setIsLoading(false);
                      console.error('Error deleting account:', error);
                      showMessage({
                        message: 'Error',
                        description: 'Failed to delete account. Please try again.',
                        type: 'danger',
                      });
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };
  
  // Create section item component
  const SectionItem = ({ icon, title, description, toggle, value, onPress }) => {
    return (
      <TouchableOpacity 
        style={[styles.sectionItem, { backgroundColor: theme.colors.cardBackground }]}
        onPress={onPress}
        disabled={toggle}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.sectionItemContent}>
          <Text style={[styles.sectionItemTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.sectionItemDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
        {toggle && (
          <Switch
            value={value}
            onValueChange={() => onPress()}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={value ? theme.colors.primary : '#f4f3f4'}
          />
        )}
        {!toggle && (
          <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <SectionItem 
          icon="person-outline" 
          title="Edit Profile"
          description="Change your profile information"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SectionItem 
          icon="lock-closed-outline" 
          title="Security"
          description="Change password, enable 2FA"
          onPress={() => navigation.navigate('Security')}
        />
        <SectionItem 
          icon="notifications-outline" 
          title="Notification Settings"
          description="Configure which notifications you receive"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        
        {/* App Settings Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          APP SETTINGS
        </Text>
        <SectionItem 
          icon="moon-outline" 
          title="Dark Mode"
          description="Use dark theme"
          toggle
          value={settings.darkMode}
          onPress={() => handleToggle('darkMode')}
        />
        <SectionItem 
          icon="notifications-outline" 
          title="Notifications"
          description="Enable push notifications"
          toggle
          value={settings.notifications}
          onPress={() => handleToggle('notifications')}
        />
        <SectionItem 
          icon="location-outline" 
          title="Location Services"
          description="Use your location for local farming advice"
          toggle
          value={settings.locationServices}
          onPress={() => handleToggle('locationServices')}
        />
        <SectionItem 
          icon="sync-outline" 
          title="Data Sync"
          description="Sync your data with the cloud"
          toggle
          value={settings.dataSync}
          onPress={() => handleToggle('dataSync')}
        />
        <SectionItem 
          icon="cloud-offline-outline" 
          title="Offline Mode"
          description="Access data without internet connection"
          toggle
          value={settings.offlineMode}
          onPress={() => handleToggle('offlineMode')}
        />
        <SectionItem 
          icon="arrow-down-circle-outline" 
          title="Automatic Updates"
          description="Download content updates automatically"
          toggle
          value={settings.automaticUpdates}
          onPress={() => handleToggle('automaticUpdates')}
        />
        <SectionItem 
          icon="cellular-outline" 
          title="Save Data"
          description="Reduce data usage and image quality"
          toggle
          value={settings.saveData}
          onPress={() => handleToggle('saveData')}
        />
        
        {/* Other Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          OTHER
        </Text>
        <SectionItem 
          icon="language-outline" 
          title="Language"
          description="Change app language"
          onPress={() => navigation.navigate('Language')}
        />
        <SectionItem 
          icon="help-circle-outline" 
          title="Help Center"
          description="Get help and support"
          onPress={() => navigation.navigate('HelpCenter')}
        />
        <SectionItem 
          icon="document-text-outline" 
          title="Terms of Service"
          description="Read our terms of service"
          onPress={() => navigation.navigate('Terms')}
        />
        <SectionItem 
          icon="shield-outline" 
          title="Privacy Policy"
          description="Read our privacy policy"
          onPress={() => navigation.navigate('Privacy')}
        />
        <SectionItem 
          icon="information-circle-outline" 
          title="About"
          description="App version and information"
          onPress={() => navigation.navigate('About')}
        />
        
        {/* Logout and Delete Account Section */}
        <View style={styles.accountActionsContainer}>
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: theme.colors.border }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.text} style={styles.buttonIcon} />
            <Text style={[styles.logoutButtonText, { color: theme.colors.text }]}>
              Logout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: theme.colors.errorLight }]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} style={styles.buttonIcon} />
            <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sectionItemContent: {
    flex: 1,
  },
  sectionItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionItemDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  accountActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;