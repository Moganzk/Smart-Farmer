import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import PostItem from '../../components/posts/PostItem';
import CreatePostModal from '../../components/posts/CreatePostModal';

const GroupPostsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Get group data from route params
  const { groupId, groupName, groupImage } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  
  // Fetch group posts
  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      }
      
      const { data } = await apiService.groups.getPosts(groupId, { page: pageNum, limit: 10 });
      
      if (shouldRefresh || pageNum === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prevPosts => [...prevPosts, ...(data.posts || [])]);
      }
      
      setHasMorePosts((data.posts || []).length === 10);
      setPage(pageNum);
      
      if (pageNum === 1) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching group posts:', error);
      showMessage({
        message: 'Failed to load posts',
        description: error.response?.data?.message || 'Please try again',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };
  
  // Fetch group info
  const fetchGroupInfo = async () => {
    try {
      const { data } = await apiService.groups.getDetails(groupId);
      setGroupInfo(data);
      
      // Check if user is a member
      const memberIds = data.members.map(member => member.id);
      setIsMember(memberIds.includes(user.id));
    } catch (error) {
      console.error('Error fetching group info:', error);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (groupId) {
      fetchPosts();
      fetchGroupInfo();
    }
  }, [groupId]);
  
  // Load more posts when reaching end of list
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePosts) {
      setIsLoadingMore(true);
      fetchPosts(page + 1).finally(() => {
        setIsLoadingMore(false);
      });
    }
  };
  
  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(1, true), fetchGroupInfo()]);
    setRefreshing(false);
  };
  
  // Create new post
  const handleCreatePost = async (postData) => {
    try {
      const response = await apiService.posts.create({
        ...postData,
        group_id: groupId,
      });
      
      // Add the new post to the list
      setPosts(prevPosts => [response.data, ...prevPosts]);
      
      showMessage({
        message: 'Post Created',
        description: 'Your post has been published successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      showMessage({
        message: 'Failed to Create Post',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
    }
  };
  
  // Like/unlike post
  const handleLikePost = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await apiService.posts.unlike(postId);
      } else {
        await apiService.posts.like(postId);
      }
      
      // Update post in the list
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };
  
  // Delete post
  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.posts.delete(postId);
              
              // Remove post from the list
              setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
              
              showMessage({
                message: 'Post Deleted',
                description: 'Your post has been deleted successfully',
                type: 'success',
              });
            } catch (error) {
              console.error('Error deleting post:', error);
              showMessage({
                message: 'Failed to Delete Post',
                description: error.response?.data?.message || 'Please try again later',
                type: 'danger',
              });
            }
          }
        },
      ]
    );
  };
  
  // Show post options
  const showPostOptions = (post) => {
    const isCurrentUserAuthor = post.author.id === user.id;
    
    if (Platform.OS === 'ios') {
      // iOS action sheet
      const options = ['Cancel'];
      const actions = [null];
      
      if (isCurrentUserAuthor) {
        options.push('Edit Post', 'Delete Post');
        actions.push(
          () => navigation.navigate('EditPost', { postId: post.id }),
          () => handleDeletePost(post.id)
        );
      }
      
      options.push('Report Post');
      actions.push(() => handleReportPost(post.id));
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: isCurrentUserAuthor ? 2 : 1,
        },
        (index) => {
          if (index > 0 && actions[index]) {
            actions[index]();
          }
        }
      );
    } else {
      // Android/other platforms
      const options = [];
      
      if (isCurrentUserAuthor) {
        options.push(
          {
            text: 'Edit Post',
            onPress: () => navigation.navigate('EditPost', { postId: post.id }),
          },
          {
            text: 'Delete Post',
            style: 'destructive',
            onPress: () => handleDeletePost(post.id),
          }
        );
      }
      
      options.push({
        text: 'Report Post',
        onPress: () => handleReportPost(post.id),
      });
      
      options.push({ text: 'Cancel', style: 'cancel' });
      
      Alert.alert('Post Options', null, options);
    }
  };
  
  // Report post
  const handleReportPost = (postId) => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Inappropriate Content', 
          onPress: () => submitReport(postId, 'inappropriate_content') 
        },
        { 
          text: 'Spam', 
          onPress: () => submitReport(postId, 'spam') 
        },
        { 
          text: 'Harmful Information', 
          onPress: () => submitReport(postId, 'harmful_information') 
        },
        { 
          text: 'Other', 
          onPress: () => submitReport(postId, 'other') 
        },
      ]
    );
  };
  
  // Submit report
  const submitReport = async (postId, reason) => {
    try {
      await apiService.posts.report(postId, { reason });
      
      showMessage({
        message: 'Report Submitted',
        description: 'Thank you for helping keep our community safe',
        type: 'success',
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      showMessage({
        message: 'Failed to Submit Report',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
    }
  };
  
  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View 
        style={[
          styles.headerBackground, 
          { 
            backgroundColor: theme.colors.background,
            opacity: headerOpacity 
          }
        ]} 
      />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text 
          style={[styles.headerTitle, { color: theme.colors.text }]} 
          numberOfLines={1}
        >
          {groupName || 'Group Posts'}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('GroupDetail', { groupId })} 
          style={styles.infoButton}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render group info
  const renderGroupInfo = () => (
    <View style={[styles.groupInfoContainer, { backgroundColor: theme.colors.cardBackground }]}>
      <Image 
        source={{ uri: groupImage || groupInfo?.image || 'https://via.placeholder.com/150' }} 
        style={styles.groupImage} 
      />
      <View style={styles.groupTextContainer}>
        <Text style={[styles.groupName, { color: theme.colors.text }]}>
          {groupName}
        </Text>
        <Text style={[styles.groupMemberCount, { color: theme.colors.textSecondary }]}>
          {groupInfo?.members?.length || 0} members
        </Text>
      </View>
    </View>
  );
  
  // Render create post input (only for members)
  const renderCreatePostInput = () => {
    if (!isMember) return null;
    
    return (
      <TouchableOpacity 
        style={[styles.createPostContainer, { backgroundColor: theme.colors.cardBackground }]}
        onPress={() => setIsCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: user.profile_image || 'https://via.placeholder.com/150' }} 
          style={styles.userAvatar} 
        />
        <View 
          style={[
            styles.createPostInput, 
            { 
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border 
            }
          ]}
        >
          <Text style={[styles.createPostText, { color: theme.colors.textSecondary }]}>
            Share something with the group...
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render not a member message
  const renderNotMemberMessage = () => {
    if (isMember || isLoading) return null;
    
    return (
      <View style={[styles.notMemberContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <Ionicons name="lock-closed" size={24} color={theme.colors.warning} />
        <Text style={[styles.notMemberText, { color: theme.colors.text }]}>
          Join this group to see posts and share content
        </Text>
        <TouchableOpacity 
          style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('GroupDetail', { groupId })}
        >
          <Text style={styles.joinButtonText}>View Group Details</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={60} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Posts Yet
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Be the first to share something with the group!
        </Text>
        {isMember && (
          <TouchableOpacity 
            style={[styles.createFirstPostButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Text style={styles.createFirstPostButtonText}>Create First Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading group posts...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <Animated.FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem 
            post={item} 
            onLike={() => handleLikePost(item.id, item.is_liked)}
            onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
            onOptions={() => showPostOptions(item)}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            {renderGroupInfo()}
            {renderCreatePostInput()}
            {renderNotMemberMessage()}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingMoreText, { color: theme.colors.textSecondary }]}>
                Loading more posts...
              </Text>
            </View>
          ) : null
        }
      />
      
      {/* Create Post Modal */}
      <CreatePostModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreatePost}
        groupId={groupId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  headerContent: {
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
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  groupInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 90,
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupMemberCount: {
    fontSize: 14,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createPostInput: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  createPostText: {
    fontSize: 14,
  },
  notMemberContainer: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  notMemberText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    marginBottom: 20,
  },
  createFirstPostButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createFirstPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default GroupPostsScreen;