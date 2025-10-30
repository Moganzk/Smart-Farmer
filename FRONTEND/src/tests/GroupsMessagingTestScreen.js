import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../constants/config';

const GroupsMessagingTestScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testGroupId, setTestGroupId] = useState(null);
  const [testMessageId, setTestMessageId] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  
  // Test input fields
  const [groupName, setGroupName] = useState('Test Group ' + Date.now());
  const [groupDescription, setGroupDescription] = useState('Test group for integration testing');
  const [messageContent, setMessageContent] = useState('Test message content');

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

  // Test 1: Create Group
  const testCreateGroup = async () => {
    addTestResult('Create Group', 'PENDING', 'Creating test group...');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/groups`,
        {
          name: groupName,
          description: groupDescription,
          cropFocus: 'Maize, Beans',
          maxMembers: 50
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.group) {
        const group = response.data.data.group;
        setTestGroupId(group.group_id);
        addTestResult('Create Group', 'PASS', `Group created with ID: ${group.group_id}`);
        return true;
      } else {
        addTestResult('Create Group', 'FAIL', 'Invalid response structure');
        return false;
      }
    } catch (error) {
      addTestResult('Create Group', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 2: Get Group Details
  const testGetGroup = async () => {
    if (!testGroupId) {
      addTestResult('Get Group', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Get Group', 'PENDING', 'Fetching group details...');
    
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${testGroupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.group) {
        const group = response.data.data.group;
        const members = response.data.data.members || [];
        addTestResult('Get Group', 'PASS', `Group: ${group.name}, Members: ${members.length}`);
        return true;
      } else {
        addTestResult('Get Group', 'FAIL', 'Failed to retrieve group');
        return false;
      }
    } catch (error) {
      addTestResult('Get Group', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 3: Update Group
  const testUpdateGroup = async () => {
    if (!testGroupId) {
      addTestResult('Update Group', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Update Group', 'PENDING', 'Updating group...');
    
    try {
      const response = await axios.put(
        `${API_URL}/api/groups/${testGroupId}`,
        {
          name: groupName + ' (Updated)',
          description: groupDescription + ' - Updated',
          cropFocus: 'Maize, Beans, Tomatoes'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.message) {
        addTestResult('Update Group', 'PASS', 'Group updated successfully');
        return true;
      } else {
        addTestResult('Update Group', 'FAIL', 'Update failed');
        return false;
      }
    } catch (error) {
      addTestResult('Update Group', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 4: Get User Groups
  const testGetUserGroups = async () => {
    addTestResult('Get User Groups', 'PENDING', 'Fetching user groups...');
    
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/user/groups`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.groups) {
        const groups = response.data.data.groups;
        setUserGroups(groups);
        addTestResult('Get User Groups', 'PASS', `Found ${groups.length} group(s)`);
        return true;
      } else {
        addTestResult('Get User Groups', 'FAIL', 'Failed to retrieve groups');
        return false;
      }
    } catch (error) {
      addTestResult('Get User Groups', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 5: Send Message
  const testSendMessage = async () => {
    if (!testGroupId) {
      addTestResult('Send Message', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Send Message', 'PENDING', 'Sending message...');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/groups/${testGroupId}/messages`,
        {
          content: messageContent,
          hasAttachment: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.message) {
        const message = response.data.data.message;
        setTestMessageId(message.message_id);
        addTestResult('Send Message', 'PASS', `Message sent with ID: ${message.message_id}`);
        return true;
      } else {
        addTestResult('Send Message', 'FAIL', 'Failed to send message');
        return false;
      }
    } catch (error) {
      addTestResult('Send Message', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 6: Get Messages
  const testGetMessages = async () => {
    if (!testGroupId) {
      addTestResult('Get Messages', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Get Messages', 'PENDING', 'Fetching messages...');
    
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${testGroupId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.messages) {
        const messages = response.data.data.messages;
        setGroupMessages(messages);
        addTestResult('Get Messages', 'PASS', `Retrieved ${messages.length} message(s)`);
        return true;
      } else {
        addTestResult('Get Messages', 'FAIL', 'Failed to retrieve messages');
        return false;
      }
    } catch (error) {
      addTestResult('Get Messages', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 7: Update Message
  const testUpdateMessage = async () => {
    if (!testGroupId || !testMessageId) {
      addTestResult('Update Message', 'FAIL', 'No message ID available');
      return false;
    }
    
    addTestResult('Update Message', 'PENDING', 'Updating message...');
    
    try {
      const response = await axios.put(
        `${API_URL}/api/groups/${testGroupId}/messages/${testMessageId}`,
        {
          content: messageContent + ' (EDITED)'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.message) {
        addTestResult('Update Message', 'PASS', 'Message updated successfully');
        return true;
      } else {
        addTestResult('Update Message', 'FAIL', 'Update failed');
        return false;
      }
    } catch (error) {
      addTestResult('Update Message', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 8: Search Messages
  const testSearchMessages = async () => {
    if (!testGroupId) {
      addTestResult('Search Messages', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Search Messages', 'PENDING', 'Searching messages...');
    
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${testGroupId}/messages/search?query=test`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.messages) {
        const messages = response.data.data.messages;
        addTestResult('Search Messages', 'PASS', `Found ${messages.length} matching message(s)`);
        return true;
      } else {
        addTestResult('Search Messages', 'FAIL', 'Search failed');
        return false;
      }
    } catch (error) {
      addTestResult('Search Messages', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 9: Get Message Stats
  const testGetMessageStats = async () => {
    if (!testGroupId) {
      addTestResult('Get Message Stats', 'FAIL', 'No group ID available');
      return false;
    }
    
    addTestResult('Get Message Stats', 'PENDING', 'Fetching stats...');
    
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${testGroupId}/messages/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.stats) {
        const stats = response.data.data.stats;
        addTestResult('Get Message Stats', 'PASS', `Total: ${stats.total_messages || stats.totalMessages}, Senders: ${stats.unique_senders || stats.uniqueSenders}`);
        return true;
      } else {
        addTestResult('Get Message Stats', 'FAIL', 'Failed to get stats');
        return false;
      }
    } catch (error) {
      addTestResult('Get Message Stats', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Test 10: Delete Message
  const testDeleteMessage = async () => {
    if (!testGroupId || !testMessageId) {
      addTestResult('Delete Message', 'FAIL', 'No message ID available');
      return false;
    }
    
    addTestResult('Delete Message', 'PENDING', 'Deleting message...');
    
    try {
      const response = await axios.delete(
        `${API_URL}/api/groups/${testGroupId}/messages/${testMessageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.message) {
        addTestResult('Delete Message', 'PASS', 'Message deleted successfully');
        return true;
      } else {
        addTestResult('Delete Message', 'FAIL', 'Delete failed');
        return false;
      }
    } catch (error) {
      addTestResult('Delete Message', 'FAIL', error.response?.data?.error?.message || error.message);
      return false;
    }
  };

  // Run all automated tests
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      await testCreateGroup();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testGetGroup();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testUpdateGroup();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testGetUserGroups();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testSendMessage();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testGetMessages();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testUpdateMessage();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testSearchMessages();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testGetMessageStats();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testDeleteMessage();
      
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
    setTestGroupId(null);
    setTestMessageId(null);
    setUserGroups([]);
    setGroupMessages([]);
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
          Groups & Messaging Tests
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.primary }]}>
            Test group creation, messaging, and member management
          </Text>
        </View>

        {/* Test Input Fields */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Data
          </Text>
          
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            Group Name:
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor={theme.colors.textTertiary}
          />

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            Group Description:
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholder="Enter group description"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            Message Content:
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={messageContent}
            onChangeText={setMessageContent}
            placeholder="Enter message content"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
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
          
          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testCreateGroup} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>1. Create Group</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testGetGroup} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>2. Get Group Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testUpdateGroup} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>3. Update Group</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testGetUserGroups} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>4. Get User Groups</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testSendMessage} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>5. Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testGetMessages} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>6. Get Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testUpdateMessage} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>7. Update Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testSearchMessages} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>8. Search Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testGetMessageStats} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>9. Get Message Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.individualButton, { borderColor: theme.colors.border }]} onPress={testDeleteMessage} disabled={isLoading}>
            <Text style={[styles.individualButtonText, { color: theme.colors.text }]}>10. Delete Message</Text>
          </TouchableOpacity>
        </View>

        {/* User Groups Display */}
        {userGroups.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              My Groups ({userGroups.length})
            </Text>
            {userGroups.map((group, index) => (
              <View key={index} style={styles.dataItem}>
                <Text style={[styles.dataLabel, { color: theme.colors.text }]}>
                  {group.name}
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.textSecondary }]}>
                  Members: {group.member_count}, Messages: {group.message_count}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Group Messages Display */}
        {groupMessages.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Messages ({groupMessages.length})
            </Text>
            {groupMessages.slice(0, 5).map((msg, index) => (
              <View key={index} style={styles.messageItem}>
                <Text style={[styles.messageAuthor, { color: theme.colors.primary }]}>
                  {msg.full_name || msg.username}
                </Text>
                <Text style={[styles.messageContent, { color: theme.colors.text }]}>
                  {msg.content}
                </Text>
                <Text style={[styles.messageTime, { color: theme.colors.textTertiary }]}>
                  {new Date(msg.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
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
            ☐ Navigate to Groups screen
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Create a new group
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ View group details
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Send a message in the group
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Edit a message
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Delete a message
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Add a member to group
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Remove a member from group
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Leave a group
          </Text>
          <Text style={[styles.checklistItem, { color: theme.colors.textSecondary }]}>
            ☐ Search for messages
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
    fontSize: 18,
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
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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
  dataItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 14,
    marginTop: 4,
  },
  messageItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  messageAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  checklistItem: {
    fontSize: 14,
    paddingVertical: 5,
  },
});

export default GroupsMessagingTestScreen;
