import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const GroupMembersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Get group data from route params
  const { groupId, groupName, isAdmin = false } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [admins, setAdmins] = useState([]);
  
  // Fetch members data
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.groups.getMembers(groupId);
      
      // Sort members (admins first, then alphabetically)
      const memberList = response.data.members || [];
      const adminsList = response.data.admins || [];
      
      setAdmins(adminsList.map(admin => admin.id));
      setMembers(memberList);
      setFilteredMembers(memberList);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching group members:', error);
      showMessage({
        message: 'Failed to load members',
        description: error.response?.data?.message || 'Please try again',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = members.filter(
        member => 
          (member.full_name && member.full_name.toLowerCase().includes(query)) ||
          (member.username && member.username.toLowerCase().includes(query)) ||
          (member.email && member.email.toLowerCase().includes(query))
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };
  
  // Remove member (admin only)
  const handleRemoveMember = (member) => {
    if (!isAdmin) return;
    
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.full_name || member.username} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.groups.removeMember(groupId, member.id);
              
              // Update local state
              const updatedMembers = members.filter(m => m.id !== member.id);
              setMembers(updatedMembers);
              setFilteredMembers(updatedMembers);
              
              showMessage({
                message: 'Member Removed',
                description: `${member.full_name || member.username} has been removed from the group`,
                type: 'success',
              });
            } catch (error) {
              console.error('Error removing member:', error);
              showMessage({
                message: 'Failed to remove member',
                description: error.response?.data?.message || 'Please try again',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };
  
  // Make member admin (admin only)
  const handlePromoteToAdmin = (member) => {
    if (!isAdmin) return;
    
    Alert.alert(
      'Promote to Admin',
      `Are you sure you want to make ${member.full_name || member.username} an admin of this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: async () => {
            try {
              await apiService.groups.promoteToAdmin(groupId, member.id);
              
              // Update local state
              setAdmins([...admins, member.id]);
              
              showMessage({
                message: 'Admin Added',
                description: `${member.full_name || member.username} is now an admin`,
                type: 'success',
              });
            } catch (error) {
              console.error('Error promoting member:', error);
              showMessage({
                message: 'Failed to promote member',
                description: error.response?.data?.message || 'Please try again',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };
  
  // Remove admin privileges (admin only)
  const handleRemoveAdmin = (member) => {
    if (!isAdmin) return;
    
    Alert.alert(
      'Remove Admin',
      `Are you sure you want to remove admin privileges from ${member.full_name || member.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Admin',
          onPress: async () => {
            try {
              await apiService.groups.demoteFromAdmin(groupId, member.id);
              
              // Update local state
              setAdmins(admins.filter(id => id !== member.id));
              
              showMessage({
                message: 'Admin Removed',
                description: `${member.full_name || member.username} is no longer an admin`,
                type: 'success',
              });
            } catch (error) {
              console.error('Error demoting admin:', error);
              showMessage({
                message: 'Failed to remove admin privileges',
                description: error.response?.data?.message || 'Please try again',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };
  
  // Handle member options
  const handleMemberOptions = (member) => {
    setSelectedMember(member);
    
    const options = [];
    const cancelIndex = { text: 'Cancel', style: 'cancel' };
    
    if (isAdmin && member.id !== user.id) {
      // Admin options for other members
      if (admins.includes(member.id)) {
        options.push({
          text: 'Remove Admin Privileges',
          onPress: () => handleRemoveAdmin(member),
        });
      } else {
        options.push({
          text: 'Make Admin',
          onPress: () => handlePromoteToAdmin(member),
        });
      }
      
      options.push({
        text: 'Remove from Group',
        style: 'destructive',
        onPress: () => handleRemoveMember(member),
      });
    }
    
    // View profile option for all
    options.push({
      text: 'View Profile',
      onPress: () => navigation.navigate('UserProfile', { userId: member.id }),
    });
    
    // Send message option
    options.push({
      text: 'Send Message',
      onPress: () => navigation.navigate('Chat', { receiverId: member.id, receiverName: member.full_name || member.username }),
    });
    
    options.push(cancelIndex);
    
    Alert.alert(
      member.full_name || member.username,
      null,
      options
    );
  };
  
  // Render member item
  const renderMemberItem = ({ item }) => {
    const isUserAdmin = admins.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.memberItem, { backgroundColor: theme.colors.cardBackground }]}
        onPress={() => handleMemberOptions(item)}
      >
        <Image
          source={{ uri: item.profile_image || 'https://via.placeholder.com/150' }}
          style={styles.memberImage}
        />
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={[styles.memberName, { color: theme.colors.text }]}>
              {item.full_name || item.username}
            </Text>
            {isUserAdmin && (
              <View style={[styles.adminBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
            {item.id === user.id && (
              <View style={[styles.youBadge, { backgroundColor: theme.colors.secondary }]}>
                <Text style={styles.youBadgeText}>You</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.memberDetails, { color: theme.colors.textSecondary }]}>
            {item.location || item.email || 'Member'}
          </Text>
          
          {item.bio && (
            <Text 
              style={[styles.memberBio, { color: theme.colors.textSecondary }]} 
              numberOfLines={1}
            >
              {item.bio}
            </Text>
          )}
        </View>
        
        {isAdmin && item.id !== user.id && (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleMemberOptions(item)}
          >
            <Ionicons 
              name="ellipsis-vertical" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.trim() !== '' ? (
        <>
          <Ionicons name="search-outline" size={60} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No members found
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No members match your search criteria
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="people-outline" size={60} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No members yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            This group doesn't have any members yet
          </Text>
        </>
      )}
    </View>
  );
  
  // Render loading indicator
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Group Members
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading members...
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
          Group Members
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Group name */}
      <Text style={[styles.groupName, { color: theme.colors.textSecondary }]}>
        {groupName}
      </Text>
      
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search members"
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
      
      {/* Members count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
          {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          {searchQuery.trim() !== '' && ' found'}
        </Text>
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.inviteButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('GroupInvite', { groupId, groupName })}
          >
            <Ionicons name="person-add" size={16} color="white" />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Members list */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
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
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  inviteButtonText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberDetails: {
    fontSize: 14,
    marginVertical: 2,
  },
  memberBio: {
    fontSize: 14,
  },
  optionsButton: {
    padding: 8,
    alignSelf: 'center',
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

export default GroupMembersScreen;