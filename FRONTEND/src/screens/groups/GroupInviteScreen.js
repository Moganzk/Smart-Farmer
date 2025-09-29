import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Clipboard,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import QRCode from 'react-native-qrcode-svg';

const GroupInviteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Get group data from route params
  const { groupId, groupName } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [invitesSent, setInvitesSent] = useState([]);
  
  // Fetch invite data and connections
  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch invite code for the group
        const { data: inviteData } = await apiService.groups.getInviteCode(groupId);
        setInviteCode(inviteData.code || '');
        setInviteLink(`https://smartfarmer.app/join?code=${inviteData.code}`);
        
        // Fetch user connections that are not already in the group
        const { data: connectionsData } = await apiService.connections.getUserConnections({
          exclude_group: groupId,
        });
        
        setConnections(connectionsData || []);
        setFilteredConnections(connectionsData || []);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching invite data:', error);
        showMessage({
          message: 'Failed to load invitation data',
          description: error.response?.data?.message || 'Please try again later',
          type: 'danger',
        });
        setIsLoading(false);
      }
    };
    
    if (groupId) {
      fetchInviteData();
    }
  }, [groupId]);
  
  // Filter connections based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConnections(connections);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = connections.filter(
        user => 
          (user.full_name && user.full_name.toLowerCase().includes(query)) ||
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query))
      );
      setFilteredConnections(filtered);
    }
  }, [searchQuery, connections]);
  
  // Toggle user selection
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = () => {
    Clipboard.setString(inviteLink);
    showMessage({
      message: 'Link Copied',
      description: 'Invite link copied to clipboard',
      type: 'success',
    });
  };
  
  // Share invite link
  const shareInviteLink = async () => {
    try {
      await Share.share({
        message: `Join my group "${groupName}" on Smart Farmer! Use this link: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error sharing invite link:', error);
    }
  };
  
  // Send invitations to selected users
  const sendInvitations = async () => {
    if (selectedUsers.length === 0) {
      showMessage({
        message: 'No Users Selected',
        description: 'Please select at least one user to invite',
        type: 'warning',
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data } = await apiService.groups.inviteMembers(groupId, selectedUsers);
      
      setInvitesSent(data.invited || []);
      setSelectedUsers([]);
      
      showMessage({
        message: 'Invitations Sent',
        description: `Sent ${data.invited.length} invitations successfully`,
        type: 'success',
      });
      
      // Remove invited users from the connections list
      const newConnections = connections.filter(
        connection => !data.invited.includes(connection.id)
      );
      setConnections(newConnections);
      setFilteredConnections(newConnections);
    } catch (error) {
      console.error('Error sending invitations:', error);
      showMessage({
        message: 'Failed to Send Invitations',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Regenerate invite code
  const regenerateInviteCode = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiService.groups.regenerateInviteCode(groupId);
      
      setInviteCode(data.code || '');
      setInviteLink(`https://smartfarmer.app/join?code=${data.code}`);
      
      showMessage({
        message: 'Invite Code Updated',
        description: 'A new invitation code has been generated',
        type: 'success',
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error regenerating invite code:', error);
      showMessage({
        message: 'Failed to Update Invite Code',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };
  
  // Render connection item
  const renderConnectionItem = ({ item }) => {
    const isSelected = selectedUsers.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.connectionItem, 
          { backgroundColor: theme.colors.cardBackground },
          isSelected && { borderColor: theme.colors.primary, borderWidth: 1 }
        ]}
        onPress={() => toggleUserSelection(item.id)}
      >
        <Image
          source={{ uri: item.profile_image || 'https://via.placeholder.com/150' }}
          style={styles.connectionImage}
        />
        <View style={styles.connectionInfo}>
          <Text style={[styles.connectionName, { color: theme.colors.text }]}>
            {item.full_name || item.username}
          </Text>
          <Text style={[styles.connectionDetails, { color: theme.colors.textSecondary }]}>
            {item.location || item.email || '@' + item.username}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.selectionCircle,
            {
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              backgroundColor: isSelected ? theme.colors.primary : 'transparent',
            }
          ]}
          onPress={() => toggleUserSelection(item.id)}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  // Render empty connections list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.trim() !== '' ? (
        <>
          <Ionicons name="search-outline" size={60} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No connections found
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No connections match your search criteria
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="people-outline" size={60} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No connections yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Add connections to invite them to this group
          </Text>
          <TouchableOpacity 
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('FindPeople')}
          >
            <Text style={styles.emptyButtonText}>Find People</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
  
  // Render loading indicator
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Invite to Group
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading invitation options...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Invite to Group
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Group name */}
      <Text style={[styles.groupName, { color: theme.colors.textSecondary }]}>
        {groupName}
      </Text>
      
      {/* Invite code section */}
      <View style={[styles.inviteCodeSection, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Share Invite Link
        </Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={inviteLink}
            size={120}
            color={theme.colors.text}
            backgroundColor={theme.colors.cardBackground}
          />
        </View>
        
        <View style={[styles.codeContainer, { backgroundColor: theme.colors.inputBackground }]}>
          <Text style={[styles.inviteCode, { color: theme.colors.text }]}>
            {inviteCode}
          </Text>
        </View>
        
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={copyInviteLink}
          >
            <Ionicons name="copy-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Copy Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={shareInviteLink}
          >
            <Ionicons name="share-social-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
            onPress={regenerateInviteCode}
          >
            <Ionicons name="refresh-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>New Code</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      {/* Direct invite section */}
      <View style={styles.directInviteSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Invite Connections
        </Text>
        
        {/* Search bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search connections"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Selected users count */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedCountContainer}>
            <Text style={[styles.selectedCountText, { color: theme.colors.textSecondary }]}>
              {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
            </Text>
            <TouchableOpacity onPress={() => setSelectedUsers([])}>
              <Text style={[styles.clearText, { color: theme.colors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Connections list */}
        <FlatList
          data={filteredConnections}
          renderItem={renderConnectionItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
        
        {/* Send invitations button */}
        {connections.length > 0 && (
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: selectedUsers.length > 0 ? theme.colors.primary : theme.colors.disabled },
              ]}
              onPress={sendInvitations}
              disabled={selectedUsers.length === 0 || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="white" />
                  <Text style={styles.sendButtonText}>
                    Send {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  groupName: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inviteCodeSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  directInviteSection: {
    paddingHorizontal: 16,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 45,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCountText: {
    fontSize: 14,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  connectionImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  connectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  connectionDetails: {
    fontSize: 14,
    marginTop: 2,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonContainer: {
    paddingVertical: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default GroupInviteScreen;