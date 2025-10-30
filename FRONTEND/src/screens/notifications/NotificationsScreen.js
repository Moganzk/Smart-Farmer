import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setPage(1);
      } else {
        setIsLoading(true);
      }
      
      // Call API to get notifications
      // For now we'll use dummy data since API isn't implemented
      
      // const response = await apiService.notifications.getAll({ page: 1, limit: 20 });
      // setNotifications(response.data.notifications);
      // setHasMore(response.data.hasMore);
      
      // Simulate API call
      setTimeout(() => {
        setNotifications(dummyNotifications);
        setHasMore(false);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
      setIsRefreshing(false);
      
      showMessage({
        message: 'Error',
        description: 'Failed to load notifications. Please try again.',
        type: 'danger',
      });
    }
  };
  
  // Load more notifications (pagination)
  const loadMoreNotifications = async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      
      // Call API to get more notifications
      // const response = await apiService.notifications.getAll({ page: nextPage, limit: 20 });
      // setNotifications(prev => [...prev, ...response.data.notifications]);
      // setHasMore(response.data.hasMore);
      // setPage(nextPage);
      
      // Simulate API call
      setTimeout(() => {
        if (nextPage <= 3) {
          const moreNotifications = generateDummyNotifications(nextPage);
          setNotifications(prev => [...prev, ...moreNotifications]);
          setPage(nextPage);
          setHasMore(nextPage < 3);
        } else {
          setHasMore(false);
        }
        setIsLoadingMore(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading more notifications:', error);
      setIsLoadingMore(false);
      
      showMessage({
        message: 'Error',
        description: 'Failed to load more notifications.',
        type: 'warning',
      });
    }
  };
  
  // Handle notification press
  const handleNotificationPress = (notification) => {
    // If notification is not read, mark it as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to the appropriate screen based on notification type
    switch (notification.type) {
      case 'disease_detection':
        navigation.navigate('MainTabs', { 
          screen: 'DiseaseTab',
          params: {
            screen: 'DiseaseResult',
            params: { detectionId: notification.referenceId }
          }
        });
        break;
      case 'group_invitation':
        navigation.navigate('MainTabs', { 
          screen: 'GroupsTab',
          params: {
            screen: 'GroupDetail',
            params: { groupId: notification.referenceId }
          }
        });
        break;
      case 'advisory':
        navigation.navigate('MainTabs', { 
          screen: 'AdvisoryTab',
          params: {
            screen: 'AdvisoryDetail',
            params: { advisoryId: notification.referenceId }
          }
        });
        break;
      case 'message':
        navigation.navigate('MainTabs', { 
          screen: 'GroupsTab',
          params: {
            screen: 'GroupChat',
            params: { groupId: notification.referenceId }
          }
        });
        break;
      case 'weather_alert':
        // Weather screen not implemented yet - show info message
        showMessage({
          message: 'Weather Alerts',
          description: 'Weather alerts feature coming soon!',
          type: 'info',
          duration: 3000,
        });
        break;
      default:
        // Default action for other notification types
        break;
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Call API to mark notification as read
      // await apiService.notifications.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Call API to mark all notifications as read
      // await apiService.notifications.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      showMessage({
        message: 'Success',
        description: 'All notifications marked as read',
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      showMessage({
        message: 'Error',
        description: 'Failed to mark all notifications as read',
        type: 'danger',
      });
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call API to clear all notifications
              // await apiService.notifications.clearAll();
              
              // Update local state
              setNotifications([]);
              
              showMessage({
                message: 'Success',
                description: 'All notifications cleared',
                type: 'success',
              });
            } catch (error) {
              console.error('Error clearing all notifications:', error);
              
              showMessage({
                message: 'Error',
                description: 'Failed to clear notifications',
                type: 'danger',
              });
            }
          },
        },
      ]
    );
  };
  
  // Render notification item
  const renderNotificationItem = ({ item }) => {
    const notificationStyles = [
      styles.notificationItem,
      { backgroundColor: theme.colors.cardBackground },
      !item.read && styles.unreadNotification
    ];
    
    // Get icon based on notification type
    let icon;
    switch (item.type) {
      case 'disease_detection':
        icon = 'leaf-outline';
        break;
      case 'group_invitation':
        icon = 'people-outline';
        break;
      case 'advisory':
        icon = 'information-circle-outline';
        break;
      case 'message':
        icon = 'chatbubble-outline';
        break;
      case 'weather_alert':
        icon = 'thunderstorm-outline';
        break;
      default:
        icon = 'notifications-outline';
    }
    
    return (
      <TouchableOpacity
        style={notificationStyles}
        onPress={() => handleNotificationPress(item)}
      >
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: !item.read ? theme.colors.primaryLight : theme.colors.backgroundSecondary }
          ]}
        >
          <Ionicons 
            name={icon} 
            size={24} 
            color={!item.read ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle, 
            { color: theme.colors.text },
            !item.read && styles.unreadText
          ]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.colors.textTertiary }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        {!item.read && (
          <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };
  
  // Format timestamp relative to current time
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
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
          Notifications
        </Text>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={markAllAsRead}
              >
                <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={clearAllNotifications}
              >
                <Ionicons name="trash-outline" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {/* Notifications List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoadingMore ? (
            <ActivityIndicator
              style={styles.loadingMoreSpinner}
              color={theme.colors.primary}
              size="small"
            />
          ) : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={70} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                We'll notify you when something important happens
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// Generate dummy notifications for testing
const dummyNotifications = [
  {
    id: 1,
    title: 'Disease Detection Result',
    message: 'Your tomato plant scan results are ready. The detected disease is Early Blight.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    type: 'disease_detection',
    referenceId: '123'
  },
  {
    id: 2,
    title: 'New Group Invitation',
    message: 'John Doe has invited you to join the group "Local Farmers Association".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    type: 'group_invitation',
    referenceId: '456'
  },
  {
    id: 3,
    title: 'Weather Alert',
    message: 'Heavy rain expected in your area in the next 24 hours. Consider protecting sensitive crops.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    type: 'weather_alert',
    referenceId: null
  },
  {
    id: 4,
    title: 'New Advisory Available',
    message: 'New seasonal planting guide has been published for your region.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    type: 'advisory',
    referenceId: '789'
  },
  {
    id: 5,
    title: 'New Message',
    message: 'Sarah from "Sustainable Farming" group sent you a message.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    read: false,
    type: 'message',
    referenceId: '101'
  }
];

// Generate additional dummy notifications for pagination testing
const generateDummyNotifications = (page) => {
  const offset = page * 5;
  return [
    {
      id: offset + 1,
      title: 'Market Price Update',
      message: 'Prices for tomatoes have increased by 5% in your region.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: true,
      type: 'advisory',
      referenceId: '202'
    },
    {
      id: offset + 2,
      title: 'System Notification',
      message: 'Smart Farmer app has been updated to version 1.2.0.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      read: true,
      type: 'system',
      referenceId: null
    },
    {
      id: offset + 3,
      title: 'Pest Alert',
      message: 'Reports of aphid infestation in your area. Check your crops regularly.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      read: page === 2,
      type: 'advisory',
      referenceId: '303'
    },
    {
      id: offset + 4,
      title: 'Community Event',
      message: 'Upcoming farmer workshop in your area next week.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      read: page === 3,
      type: 'advisory',
      referenceId: '404'
    },
    {
      id: offset + 5,
      title: 'New Feature Available',
      message: 'Try our new soil analysis feature. Scan your soil to get composition details.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
      read: true,
      type: 'system',
      referenceId: null
    }
  ];
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
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
  listContainer: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
    alignItems: 'center',
  },
  unreadNotification: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingMoreSpinner: {
    paddingVertical: 15,
  },
});

export default NotificationsScreen;