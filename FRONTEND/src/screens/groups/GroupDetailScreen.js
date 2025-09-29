import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Get group id from route params
  const { group } = route.params || {};
  const groupId = group?.id || route.params?.groupId;
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messagePreview, setMessagePreview] = useState([]);
  
  // Fetch group details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch group details
        const { data } = await apiService.groups.getDetails(groupId);
        setGroupDetails(data);
        
        // Check if user is a member or admin
        const memberIds = data.members.map(member => member.id);
        const adminIds = data.admins.map(admin => admin.id);
        
        setIsMember(memberIds.includes(user.id));
        setIsAdmin(adminIds.includes(user.id));
        
        // Set members
        setMembers(data.members);
        
        // Fetch recent messages if user is a member
        if (memberIds.includes(user.id)) {
          try {
            const messagesResponse = await apiService.groups.getMessages(groupId, { limit: 3 });
            setMessagePreview(messagesResponse.data);
          } catch (error) {
            console.error('Error fetching messages:', error);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching group details:', error);
        setIsLoading(false);
        showMessage({
          message: 'Failed to load group details',
          description: 'Please try again later',
          type: 'danger',
        });
      }
    };
    
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, user?.id]);
  
  // Join group
  const handleJoinGroup = async () => {
    try {
      await apiService.groups.join(groupDetails.code);
      
      // Update local state
      setIsMember(true);
      showMessage({
        message: 'Success!',
        description: `You've joined ${groupDetails.name}`,
        type: 'success',
      });
      
      // Refresh group details to get updated member list
      const { data } = await apiService.groups.getDetails(groupId);
      setGroupDetails(data);
      setMembers(data.members);
    } catch (error) {
      console.error('Error joining group:', error);
      showMessage({
        message: 'Failed to join group',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
    }
  };
  
  // Leave group
  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave ${groupDetails.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.groups.leave(groupId);
              
              // Update local state
              setIsMember(false);
              showMessage({
                message: 'Left Group',
                description: `You've left ${groupDetails.name}`,
                type: 'info',
              });
              
              // Navigate back to groups screen
              navigation.navigate('Groups');
            } catch (error) {
              console.error('Error leaving group:', error);
              showMessage({
                message: 'Failed to leave group',
                description: error.response?.data?.message || 'Please try again later',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };
  
  // Navigate to chat
  const navigateToChat = () => {
    navigation.navigate('GroupChat', { 
      groupId, 
      groupName: groupDetails.name,
      groupImage: groupDetails.image,
    });
  };
  
  // Render member item
  const renderMemberItem = ({ item }) => (
    <View style={[styles.memberItem, { backgroundColor: theme.colors.cardBackground }]}>
      <Image
        source={{ uri: item.profile_image || 'https://via.placeholder.com/150' }}
        style={styles.memberImage}
      />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.colors.text }]}>
          {item.full_name || item.username}
        </Text>
        {item.isAdmin && (
          <View style={[styles.adminBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
        <Text style={[styles.memberDate, { color: theme.colors.textSecondary }]}>
          {item.location || 'Member'}
        </Text>
      </View>
    </View>
  );
  
  // Render message preview item
  const renderMessagePreview = ({ item }) => (
    <View style={[styles.messagePreview, { backgroundColor: theme.colors.cardBackground }]}>
      <Image 
        source={{ uri: item.sender.profile_image || 'https://via.placeholder.com/150' }} 
        style={styles.messageSenderImage} 
      />
      <View style={styles.messageContent}>
        <Text style={[styles.messageSender, { color: theme.colors.text }]}>
          {item.sender.full_name || item.sender.username}
        </Text>
        <Text style={[styles.messageText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, { color: theme.colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading group details...
        </Text>
      </View>
    );
  }
  
  // Render error state
  if (!groupDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Group Not Found
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            This group may have been deleted or you don't have permission to view it.
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Groups')}
          >
            <Text style={styles.errorButtonText}>Go Back to Groups</Text>
          </TouchableOpacity>
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
        {isMember && (
          <TouchableOpacity onPress={navigateToChat} style={styles.chatButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Group Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: groupDetails.image || 'https://via.placeholder.com/500x300' }}
            style={styles.bannerImage}
            defaultSource={require('../../assets/group-placeholder.png')}
          />
          <View style={styles.bannerOverlay} />
          <View style={styles.groupInfoContainer}>
            <Text style={styles.groupName}>{groupDetails.name}</Text>
            <View style={styles.groupMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={16} color="white" />
                <Text style={styles.metaText}>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </Text>
              </View>
              {groupDetails.location && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={16} color="white" />
                  <Text style={styles.metaText}>{groupDetails.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Join/Leave Group Button */}
        {!isAdmin && (
          <View style={styles.actionButtonContainer}>
            {!isMember ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleJoinGroup}
              >
                <Ionicons name="people-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Group</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                onPress={handleLeaveGroup}
              >
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Leave Group</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* About Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            {groupDetails.description || 'No description available.'}
          </Text>
          
          {groupDetails.created_at && (
            <Text style={[styles.createdDate, { color: theme.colors.textSecondary }]}>
              Created on {new Date(groupDetails.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        {/* Recent Messages Preview (Only for members) */}
        {isMember && messagePreview.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recent Discussions
              </Text>
              <TouchableOpacity onPress={navigateToChat}>
                <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={messagePreview}
              renderItem={renderMessagePreview}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
            
            <TouchableOpacity 
              style={[styles.joinChatButton, { backgroundColor: theme.colors.primary }]} 
              onPress={navigateToChat}
            >
              <Text style={styles.joinChatButtonText}>Join Conversation</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Members Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Members
            </Text>
            <Text style={[styles.memberCount, { color: theme.colors.textSecondary }]}>
              {members.length}
            </Text>
          </View>
          
          {members.slice(0, 5).map((member) => (
            <View 
              key={member.id} 
              style={[
                styles.memberItem, 
                { backgroundColor: theme.colors.cardBackground }
              ]}
            >
              <Image
                source={{ uri: member.profile_image || 'https://via.placeholder.com/150' }}
                style={styles.memberImage}
              />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member.full_name || member.username}
                </Text>
                {groupDetails.admins?.find(admin => admin.id === member.id) && (
                  <View style={[styles.adminBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
                <Text style={[styles.memberDate, { color: theme.colors.textSecondary }]}>
                  {member.location || 'Member'}
                </Text>
              </View>
            </View>
          ))}
          
          {members.length > 5 && (
            <TouchableOpacity style={styles.viewMoreContainer}>
              <Text style={[styles.viewMoreText, { color: theme.colors.primary }]}>
                View {members.length - 5} more members
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Admin Controls (Only shown to admins) */}
        {isAdmin && (
          <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Admin Controls
            </Text>
            
            <View style={styles.adminControls}>
              <TouchableOpacity 
                style={[styles.adminButton, { backgroundColor: theme.colors.primaryLight }]}
                onPress={() => {/* Implement edit group functionality */}}
              >
                <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.adminButtonText, { color: theme.colors.primary }]}>
                  Edit Group
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.adminButton, { backgroundColor: theme.colors.primaryLight }]}
                onPress={() => {/* Implement invite member functionality */}}
              >
                <Ionicons name="person-add-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.adminButtonText, { color: theme.colors.primary }]}>
                  Invite Members
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.adminButton, { backgroundColor: theme.colors.errorLight }]}
                onPress={() => {/* Implement delete group functionality */}}
              >
                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
                <Text style={[styles.adminButtonText, { color: theme.colors.error }]}>
                  Delete Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  chatButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  groupInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  createdDate: {
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },
  memberCount: {
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    marginLeft: 15,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberDate: {
    fontSize: 12,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewMoreContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adminControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  adminButton: {
    width: '30%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  adminButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  messagePreview: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  messageSenderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
    marginLeft: 10,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  joinChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  joinChatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupDetailScreen;