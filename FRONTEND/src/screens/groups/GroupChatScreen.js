import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';

const GroupChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  const flatListRef = useRef(null);
  
  // Extract group ID and data from route params
  const { groupId, group } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Fetch messages initially
  useEffect(() => {
    fetchMessages();
    
    // Setup network state listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    
    // Setup periodic polling for new messages
    const interval = setInterval(() => {
      if (isOnline) {
        fetchLatestMessages();
      }
    }, 10000); // Poll every 10 seconds when online
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [groupId]);
  
  // Fetch initial messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.groups.getMessages(groupId, { page: 1, limit: 20 });
      
      if (response.offline) {
        showMessage({
          message: 'Offline Mode',
          description: 'Showing cached messages. Some features may be limited.',
          type: 'warning',
        });
      }
      
      setMessages(response.data.messages || []);
      setHasMore(response.data.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to load messages. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Fetch just the latest messages (for polling)
  const fetchLatestMessages = async () => {
    try {
      const since = messages.length > 0 ? messages[0].createdAt : null;
      const response = await apiService.groups.getMessages(groupId, { 
        since, 
        limit: 10 
      });
      
      if (response.data.messages && response.data.messages.length > 0) {
        // Add new messages to the top
        setMessages(prev => [...response.data.messages, ...prev]);
      }
    } catch (error) {
      console.error('Error polling new messages:', error);
    }
  };
  
  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await apiService.groups.getMessages(groupId, { 
        page: nextPage, 
        limit: 20 
      });
      
      setMessages(prev => [...prev, ...(response.data.messages || [])]);
      setHasMore(response.data.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMessages();
  };
  
  // Send message
  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return;
    
    try {
      setIsSending(true);
      
      // Create form data if there's an image
      let messageData;
      if (selectedImage) {
        const formData = new FormData();
        
        if (message.trim()) {
          formData.append('text', message.trim());
        }
        
        // Add image to form data
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri: selectedImage,
          name: filename,
          type,
        });
        
        messageData = formData;
      } else {
        messageData = { text: message.trim() };
      }
      
      const response = await apiService.groups.sendMessage(groupId, messageData);
      
      // If we're offline, message will be marked pending
      if (response.offline) {
        showMessage({
          message: 'Message Queued',
          description: 'Your message will be sent when you reconnect.',
          type: 'info',
        });
      }
      
      // Add new message to the list (at the top)
      const newMessage = {
        id: response.data.id,
        text: message,
        imageUrl: selectedImage ? selectedImage : null,
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        createdAt: new Date().toISOString(),
        pending: response.offline ? true : false,
      };
      
      setMessages(prev => [newMessage, ...prev]);
      setMessage('');
      setSelectedImage(null);
      
      // Scroll to the top (newest message)
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showMessage({
        message: 'Failed to send message',
        description: error.message || 'Please try again',
        type: 'danger',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Image picker
  const [selectedImage, setSelectedImage] = useState(null);
  
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showMessage({
          message: 'Permission Required',
          description: 'We need access to your photos to send images',
          type: 'warning',
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  // Render item for FlatList
  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender.id === user.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <Image 
            source={{ uri: item.sender.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          />
        )}
        
        <View style={[
          styles.messageContent,
          isOwnMessage 
            ? [styles.ownMessage, { backgroundColor: theme.colors.primary }] 
            : [styles.otherMessage, { backgroundColor: theme.colors.cardBackground }]
        ]}>
          {!isOwnMessage && (
            <Text style={[styles.senderName, { color: theme.colors.textSecondary }]}>
              {item.sender.name}
            </Text>
          )}
          
          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          
          {item.text && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? { color: 'white' } : { color: theme.colors.text }
            ]}>
              {item.text}
            </Text>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              isOwnMessage ? { color: 'rgba(255, 255, 255, 0.7)' } : { color: theme.colors.textSecondary }
            ]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            {item.pending && (
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : theme.colors.textSecondary} 
                style={styles.pendingIcon} 
              />
            )}
          </View>
        </View>
        
        {isOwnMessage && (
          <Image 
            source={{ uri: user.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          />
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.groupInfo}
            onPress={() => navigation.navigate('GroupDetail', { groupId, group })}
          >
            <Image 
              source={{ uri: group?.imageUrl || 'https://via.placeholder.com/40' }} 
              style={styles.groupAvatar}
              defaultSource={require('../../assets/default-group.png')}
            />
            <View>
              <Text style={[styles.groupName, { color: theme.colors.text }]}>
                {group?.name || 'Group Chat'}
              </Text>
              {group?.memberCount && (
                <Text style={[styles.groupMeta, { color: theme.colors.textSecondary }]}>
                  {group.memberCount} members
                </Text>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Offline Notice */}
        {!isOnline && (
          <View style={[styles.offlineNotice, { backgroundColor: theme.colors.warning + '30' }]}>
            <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.warning} />
            <Text style={[styles.offlineText, { color: theme.colors.warning }]}>
              You're offline. Messages will be sent when you reconnect.
            </Text>
          </View>
        )}
        
        {/* Messages List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading messages...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messageList}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={60} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No messages yet. Be the first to start the conversation!
                </Text>
              </View>
            }
          />
        )}
        
        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.cardBackground }]}>
          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            {/* Attachment Button */}
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {/* Message Input */}
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            
            {/* Send Button */}
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
                (message.trim() === '' && !selectedImage) && { opacity: 0.5 }
              ]}
              onPress={sendMessage}
              disabled={isSending || (message.trim() === '' && !selectedImage)}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={22} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 5,
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupMeta: {
    fontSize: 12,
  },
  menuButton: {
    padding: 5,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'center',
  },
  offlineText: {
    marginLeft: 5,
    fontSize: 13,
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
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    paddingBottom: 8,
  },
  ownMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  pendingIcon: {
    marginLeft: 5,
  },
  loadingMoreContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  inputContainer: {
    padding: 10,
  },
  selectedImageContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  selectedImagePreview: {
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GroupChatScreen;