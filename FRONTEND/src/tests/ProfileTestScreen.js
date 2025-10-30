/**
 * Profile Screen Frontend Test
 * Manual testing checklist for profile functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const ProfileTestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [profileBefore, setProfileBefore] = useState(null);
  const [profileAfter, setProfileAfter] = useState(null);

  const addResult = (testName, passed, message) => {
    setTestResults(prev => [...prev, { testName, passed, message }]);
  };

  /**
   * Test 1: Fetch current profile
   */
  const testFetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data && response.data.user) {
        setProfileBefore(response.data.user);
        addResult('Fetch Profile', true, 'Profile loaded successfully');
        return true;
      } else {
        addResult('Fetch Profile', false, 'Invalid response structure');
        return false;
      }
    } catch (error) {
      addResult('Fetch Profile', false, error.message);
      return false;
    }
  };

  /**
   * Test 2: Update profile
   */
  const testUpdateProfile = async () => {
    const testData = {
      full_name: 'Mobile Test User',
      phone_number: '+254700123456',
      location: 'Nairobi, Kenya',
      bio: 'Testing profile updates from mobile app',
      expertise: 'Mobile Testing, React Native',
      preferred_language: 'en'
    };

    try {
      const response = await api.put('/profile', testData);
      if (response.data && response.data.user) {
        const updated = response.data.user;
        const allFieldsMatch = 
          updated.full_name === testData.full_name &&
          updated.phone_number === testData.phone_number &&
          updated.location === testData.location &&
          updated.bio === testData.bio &&
          updated.expertise === testData.expertise;

        if (allFieldsMatch) {
          addResult('Update Profile', true, 'All fields updated correctly');
          return true;
        } else {
          addResult('Update Profile', false, 'Some fields did not update');
          return false;
        }
      } else {
        addResult('Update Profile', false, 'Invalid response structure');
        return false;
      }
    } catch (error) {
      addResult('Update Profile', false, error.message);
      return false;
    }
  };

  /**
   * Test 3: Verify persistence
   */
  const testPersistence = async () => {
    try {
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch profile again
      const response = await api.get('/profile');
      if (response.data && response.data.user) {
        setProfileAfter(response.data.user);
        
        const persisted = 
          response.data.user.full_name === 'Mobile Test User' &&
          response.data.user.phone_number === '+254700123456' &&
          response.data.user.location === 'Nairobi, Kenya' &&
          response.data.user.bio === 'Testing profile updates from mobile app';

        if (persisted) {
          addResult('Verify Persistence', true, 'Changes persisted in database');
          return true;
        } else {
          addResult('Verify Persistence', false, 'Changes did not persist');
          return false;
        }
      } else {
        addResult('Verify Persistence', false, 'Failed to fetch profile');
        return false;
      }
    } catch (error) {
      addResult('Verify Persistence', false, error.message);
      return false;
    }
  };

  /**
   * Test 4: Partial update
   */
  const testPartialUpdate = async () => {
    try {
      const partialData = {
        location: 'Mombasa, Kenya'
      };

      const response = await api.put('/profile', partialData);
      if (response.data && response.data.user) {
        const updated = response.data.user;
        
        // Verify location changed but other fields remain
        const locationUpdated = updated.location === 'Mombasa, Kenya';
        const otherFieldsIntact = updated.full_name === 'Mobile Test User';

        if (locationUpdated && otherFieldsIntact) {
          addResult('Partial Update', true, 'Partial update successful');
          return true;
        } else {
          addResult('Partial Update', false, 'Partial update failed');
          return false;
        }
      } else {
        addResult('Partial Update', false, 'Invalid response');
        return false;
      }
    } catch (error) {
      addResult('Partial Update', false, error.message);
      return false;
    }
  };

  /**
   * Run all tests
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProfileBefore(null);
    setProfileAfter(null);

    addResult('Test Suite', true, 'Starting profile tests...');
    
    await testFetchProfile();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testUpdateProfile();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPersistence();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPartialUpdate();
    
    addResult('Test Suite', true, 'All tests completed');
    setIsRunning(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile Tests
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Test Profile CRUD Operations
        </Text>
        <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
          This will test:
          {'\n'}• Fetch profile data
          {'\n'}• Update profile fields
          {'\n'}• Verify data persistence
          {'\n'}• Partial updates
        </Text>
        
        <TouchableOpacity
          style={[
            styles.runButton,
            { backgroundColor: theme.colors.primary },
            isRunning && styles.disabledButton
          ]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.runButtonText}>Run Tests</Text>
          )}
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Test Results
          </Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.testResult}>
              <Text style={result.passed ? styles.passIcon : styles.failIcon}>
                {result.passed ? '✓' : '✗'}
              </Text>
              <View style={styles.testResultContent}>
                <Text style={[styles.testName, { color: theme.colors.text }]}>
                  {result.testName}
                </Text>
                <Text style={[styles.testMessage, { color: theme.colors.textSecondary }]}>
                  {result.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {profileBefore && (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Profile Before Update
          </Text>
          <Text style={[styles.dataText, { color: theme.colors.text }]}>
            Name: {profileBefore.full_name}
            {'\n'}Phone: {profileBefore.phone_number || 'Not set'}
            {'\n'}Location: {profileBefore.location || 'Not set'}
            {'\n'}Bio: {profileBefore.bio || 'Not set'}
          </Text>
        </View>
      )}

      {profileAfter && (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Profile After Update
          </Text>
          <Text style={[styles.dataText, { color: theme.colors.text }]}>
            Name: {profileAfter.full_name}
            {'\n'}Phone: {profileAfter.phone_number || 'Not set'}
            {'\n'}Location: {profileAfter.location || 'Not set'}
            {'\n'}Bio: {profileAfter.bio || 'Not set'}
          </Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.colors.warningLight }]}>
        <Text style={[styles.noteTitle, { color: theme.colors.warning }]}>
          📝 Manual Test Checklist
        </Text>
        <Text style={[styles.noteText, { color: theme.colors.text }]}>
          After running automated tests, manually verify:
          {'\n\n'}1. Navigate to Profile screen
          {'\n'}2. Check if updated data is displayed
          {'\n'}3. Close and reopen the app
          {'\n'}4. Verify data persisted after app restart
          {'\n'}5. Edit profile through settings
          {'\n'}6. Confirm changes are saved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 5,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  runButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passIcon: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
    width: 24,
  },
  failIcon: {
    fontSize: 20,
    color: '#F44336',
    marginRight: 12,
    width: 24,
  },
  testResultContent: {
    flex: 1,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  testMessage: {
    fontSize: 13,
  },
  dataText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default ProfileTestScreen;
