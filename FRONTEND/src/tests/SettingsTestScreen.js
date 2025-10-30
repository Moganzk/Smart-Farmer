import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../constants/config';

const SettingsTestScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentSettings, setCurrentSettings] = useState(null);

  // Test result component
  const TestResult = ({ test, result, details }) => (
    <View style={[styles.testResultCard, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.testResultHeader}>
        <Ionicons 
          name={result === 'PASS' ? 'checkmark-circle' : result === 'FAIL' ? 'close-circle' : 'time'} 
          size={24} 
          color={result === 'PASS' ? theme.colors.success : result === 'FAIL' ? theme.colors.error : theme.colors.warning} 
        />
        <Text style={[styles.testResultTitle, { color: theme.colors.text }]}>
          {test}
        </Text>
      </View>
      {details && (
        <Text style={[styles.testResultDetails, { color: theme.colors.textSecondary }]}>
          {details}
        </Text>
      )}
    </View>
  );

  // Add test result helper
  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  // Test 1: Fetch Current Settings
  const testFetchSettings = async () => {
    addTestResult('Fetch Settings', 'PENDING', 'Fetching user settings...');
    
    try {
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const settings = response.data.data.settings;
        setCurrentSettings(settings);
        addTestResult('Fetch Settings', 'PASS', `Settings retrieved with ${Object.keys(settings).length} categories`);
        return true;
      } else {
        addTestResult('Fetch Settings', 'FAIL', 'Invalid response structure');
        return false;
      }
    } catch (error) {
      addTestResult('Fetch Settings', 'FAIL', error.message);
      return false;
    }
  };

  // Test 2: Update Notification Preferences
  const testUpdateNotifications = async () => {
    addTestResult('Update Notifications', 'PENDING', 'Updating notification preferences...');
    
    try {
      const newPrefs = {
        push_enabled: false,
        email_enabled: true,
        detection_results: true,
        group_messages: false,
        system_updates: true,
        warnings: true
      };
      
      const response = await axios.put(
        `${API_URL}/api/settings/notification`,
        newPrefs,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data) {
        addTestResult('Update Notifications', 'PASS', 'Notification preferences updated');
        return true;
      } else {
        addTestResult('Update Notifications', 'FAIL', 'Update failed');
        return false;
      }
    } catch (error) {
      addTestResult('Update Notifications', 'FAIL', error.message);
      return false;
    }
  };

  // Test 3: Update App Preferences
  const testUpdateAppPrefs = async () => {
    addTestResult('Update App Preferences', 'PENDING', 'Updating app preferences...');
    
    try {
      const newPrefs = {
        theme: 'dark',
        language: 'en',
        font_size: 'medium',
        high_contrast: false,
        reduced_motion: false,
        offline_mode: true
      };
      
      const response = await axios.put(
        `${API_URL}/api/settings/app`,
        newPrefs,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data) {
        addTestResult('Update App Preferences', 'PASS', 'App preferences updated');
        return true;
      } else {
        addTestResult('Update App Preferences', 'FAIL', 'Update failed');
        return false;
      }
    } catch (error) {
      addTestResult('Update App Preferences', 'FAIL', error.message);
      return false;
    }
  };

  // Test 4: Verify Persistence
  const testVerifyPersistence = async () => {
    addTestResult('Verify Persistence', 'PENDING', 'Checking if settings persist...');
    
    try {
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const settings = response.data.data.settings;
        
        // Check if notification settings persisted
        const notifPersisted = settings.notification_preferences?.push_enabled === false;
        // Check if app settings persisted
        const appPersisted = settings.app_preferences?.offline_mode === true;
        
        if (notifPersisted && appPersisted) {
          addTestResult('Verify Persistence', 'PASS', 'All changes persisted correctly');
          return true;
        } else {
          addTestResult('Verify Persistence', 'FAIL', 'Some changes did not persist');
          return false;
        }
      } else {
        addTestResult('Verify Persistence', 'FAIL', 'Could not fetch settings');
        return false;
      }
    } catch (error) {
      addTestResult('Verify Persistence', 'FAIL', error.message);
      return false;
    }
  };

  // Test 5: Reset Settings
  const testResetSettings = async () => {
    addTestResult('Reset Settings', 'PENDING', 'Resetting app preferences to defaults...');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/settings/reset/app_preferences`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data) {
        addTestResult('Reset Settings', 'PASS', 'Settings reset to defaults');
        return true;
      } else {
        addTestResult('Reset Settings', 'FAIL', 'Reset failed');
        return false;
      }
    } catch (error) {
      addTestResult('Reset Settings', 'FAIL', error.message);
      return false;
    }
  };

  // Run all automated tests
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test sequence
      await testFetchSettings();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      
      await testUpdateNotifications();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testUpdateAppPrefs();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testVerifyPersistence();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testResetSettings();
      
      // Final summary
      const passedTests = testResults.filter(r => r.result === 'PASS').length;
      const totalTests = testResults.filter(r => r.result !== 'PENDING').length;
      
      Alert.alert(
        'Tests Complete',
        `${passedTests}/${totalTests} tests passed`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Test execution failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear results
  const clearResults = () => {
    setTestResults([]);
    setCurrentSettings(null);
  };

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
          Settings Tests
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.primary }]}>
            This screen tests the Settings API integration
          </Text>
        </View>

        {/* Test Buttons */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Automated Tests
          </Text>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
            onPress={runAllTests}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.testButtonText}>Run All Tests</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.colors.border }]}
            onPress={clearResults}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.clearButtonText, { color: theme.colors.text }]}>
              Clear Results
            </Text>
          </TouchableOpacity>
        </View>

        {/* Individual Test Buttons */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Individual Tests
          </Text>
          
          <TouchableOpacity
            style={[styles.individualButton, { borderColor: theme.colors.border }]}
            onPress={testFetchSettings}
            disabled={isLoading}
          >
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>
              1. Fetch Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.individualButton, { borderColor: theme.colors.border }]}
            onPress={testUpdateNotifications}
            disabled={isLoading}
          >
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>
              2. Update Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.individualButton, { borderColor: theme.colors.border }]}
            onPress={testUpdateAppPrefs}
            disabled={isLoading}
          >
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>
              3. Update App Prefs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.individualButton, { borderColor: theme.colors.border }]}
            onPress={testVerifyPersistence}
            disabled={isLoading}
          >
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>
              4. Verify Persistence
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.individualButton, { borderColor: theme.colors.border }]}
            onPress={testResetSettings}
            disabled={isLoading}
          >
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>
              5. Reset Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Settings Display */}
        {currentSettings && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Current Settings
            </Text>
            <View style={styles.settingsDisplay}>
              <Text style={[styles.settingsText, { color: theme.colors.textSecondary }]}>
                {JSON.stringify(currentSettings, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Test Results ({testResults.filter(r => r.result === 'PASS').length}/{testResults.filter(r => r.result !== 'PENDING').length} passed)
            </Text>
            {testResults.map((result, index) => (
              <TestResult
                key={index}
                test={result.test}
                result={result.result}
                details={result.details}
              />
            ))}
          </View>
        )}

        {/* Manual Testing Checklist */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Manual Testing Checklist
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Navigate to Settings screen
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Toggle Dark Mode on/off
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Toggle Notifications on/off
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Toggle Location Services on/off
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Toggle Data Sync on/off
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Toggle Offline Mode on/off
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Close and reopen app - settings persist
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Logout and login - settings persist
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
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  section: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  individualButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  individualButtonText: {
    fontSize: 14,
  },
  testResultCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  testResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  testResultDetails: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 34,
  },
  settingsDisplay: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  settingsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  checklistItem: {
    fontSize: 14,
    paddingVertical: 5,
  },
});

export default SettingsTestScreen;
