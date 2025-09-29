import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

// Mock group data
const MOCK_GROUPS = [
  {
    id: '1',
    name: 'Organic Farmers Network',
    image: 'https://example.com/group1.jpg',
    memberCount: 125,
    unreadCount: 5,
    lastMessage: {
      text: 'Has anyone tried the new organic fertilizer?',
      sender: 'Maria Rodriguez',
      time: '10:30 AM',
    },
    joined: true,
  },
  {
    id: '2',
    name: 'Vegetable Growers Association',
    image: 'https://example.com/group2.jpg',
    memberCount: 78,
    unreadCount: 0,
    lastMessage: {
      text: 'Meeting scheduled for next Friday at the community hall',
      sender: 'John Smith',
      time: 'Yesterday',
    },
    joined: true,
  },
  {
    id: '3',
    name: 'Sustainable Farming Practices',
    image: 'https://example.com/group3.jpg',
    memberCount: 210,
    unreadCount: 12,
    lastMessage: {
      text: 'Check out this article on water conservation techniques',
      sender: 'Ahmed Hassan',
      time: 'Yesterday',
    },
    joined: true,
  },
  {
    id: '4',
    name: 'Local Farmers Market',
    image: 'https://example.com/group4.jpg',
    memberCount: 56,
    unreadCount: 0,
    lastMessage: {
      text: 'Price list for this weekend has been updated',
      sender: 'Sarah Johnson',
      time: '2 days ago',
    },
    joined: false,
  },
  {
    id: '5',
    name: 'New Agricultural Technologies',
    image: 'https://example.com/group5.jpg',
    memberCount: 143,
    unreadCount: 0,
    lastMessage: {
      text: 'Has anyone tested the new irrigation system?',
      sender: 'Michael Chen',
      time: '3 days ago',
    },
    joined: false,
  },
  {
    id: '6',
    name: 'Crop Disease Prevention',
    image: 'https://example.com/group6.jpg',
    memberCount: 89,
    unreadCount: 0,
    lastMessage: {
      text: 'Early signs of leaf blight and how to treat it',
      sender: 'Dr. Lisa Moore',
      time: '1 week ago',
    },
    joined: true,
  },
];

// Mock suggested groups
const SUGGESTED_GROUPS = [
  {
    id: '7',
    name: 'Weather Forecasting for Farmers',
    image: 'https://example.com/group7.jpg',
    memberCount: 105,
    description: 'Sharing accurate weather forecasts and climate adaptations for farming.',
  },
  {
    id: '8',
    name: 'Small Scale Farming',
    image: 'https://example.com/group8.jpg',
    memberCount: 67,
    description: 'Support and resources for small-scale and urban farmers.',
  },
  {
    id: '9',
    name: 'Agricultural Equipment Exchange',
    image: 'https://example.com/group9.jpg',
    memberCount: 93,
    description: 'Buy, sell, and trade farming equipment with other local farmers.',
  },
];

const GroupsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('myGroups'); // 'myGroups' or 'discover'
  
  // Load group data
  useEffect(() => {
    const loadGroups = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter joined and suggested groups
        setMyGroups(MOCK_GROUPS.filter(group => group.joined));
        setSuggestedGroups([
          ...SUGGESTED_GROUPS,
          ...MOCK_GROUPS.filter(group => !group.joined),
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading groups:', error);
        setIsLoading(false);
      }
    };
    
    loadGroups();
  }, []);
  
  // Handle search
  const handleSearch = () => {
    // In a real app, you would implement search functionality here
    console.log('Searching for:', searchQuery);
  };
  
  // Navigate to group detail
  const navigateToGroupDetail = (group) => {
    navigation.navigate('GroupDetail', { group });
  };
  
  // Navigate to create group screen
  const navigateToCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };
  
  // Join a group
  const handleJoinGroup = (group) => {
    // In a real app, you would make an API call to join the group
    
    // Update local state
    const updatedSuggested = suggestedGroups.filter(g => g.id !== group.id);
    setSuggestedGroups(updatedSuggested);
    
    const joinedGroup = {
      ...group,
      joined: true,
      lastMessage: {
        text: 'You joined the group',
        sender: 'System',
        time: 'Just now',
      },
      unreadCount: 0,
    };
    
    setMyGroups([joinedGroup, ...myGroups]);
  };
  
  // Render my group item
  const renderMyGroupItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.groupItem, { backgroundColor: theme.colors.cardBackground }]}
      onPress={() => navigateToGroupDetail(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.groupImage}
        defaultSource={require('../../assets/group-placeholder.png')}
      />
      
      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text 
            style={[styles.groupName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.badgeContainer, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <Text 
          style={[styles.lastMessage, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          <Text style={{ fontWeight: '500' }}>{item.lastMessage.sender}: </Text>
          {item.lastMessage.text}
        </Text>
        
        <View style={styles.groupFooter}>
          <Text style={[styles.memberCount, { color: theme.colors.textSecondary }]}>
            {item.memberCount} members
          </Text>
          <Text style={[styles.timeStamp, { color: theme.colors.textSecondary }]}>
            {item.lastMessage.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render suggested group item
  const renderSuggestedGroupItem = ({ item }) => (
    <View style={[styles.suggestedItem, { backgroundColor: theme.colors.cardBackground }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.suggestedImage}
        defaultSource={require('../../assets/group-placeholder.png')}
      />
      
      <View style={styles.suggestedContent}>
        <Text 
          style={[styles.suggestedName, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        
        <Text 
          style={[styles.suggestedDescription, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description || `A group with ${item.memberCount} members discussing farming topics.`}
        </Text>
        
        <View style={styles.suggestedFooter}>
          <Text style={[styles.memberCount, { color: theme.colors.textSecondary }]}>
            {item.memberCount} members
          </Text>
          
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleJoinGroup(item)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Render empty state for my groups
  const renderEmptyMyGroups = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Groups Yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        You haven't joined any groups yet. 
        Discover and join groups or create your own!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setActiveTab('discover')}
      >
        <Text style={styles.emptyButtonText}>Discover Groups</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render empty state for discover tab
  const renderEmptyDiscover = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={60} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Groups Found
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No groups match your search criteria.
        Try a different search term or create a new group!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
        onPress={navigateToCreateGroup}
      >
        <Text style={styles.emptyButtonText}>Create a Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Groups
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreateGroup}
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search groups..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'myGroups' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('myGroups')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'myGroups' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            My Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'discover' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('discover')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'discover' ? theme.colors.primary : theme.colors.textSecondary }
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading groups...
          </Text>
        </View>
      ) : (
        <>
          {activeTab === 'myGroups' ? (
            <FlatList
              data={myGroups}
              renderItem={renderMyGroupItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.groupsList}
              ListEmptyComponent={renderEmptyMyGroups}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={suggestedGroups}
              renderItem={renderSuggestedGroupItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.groupsList}
              ListEmptyComponent={renderEmptyDiscover}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
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
    paddingBottom: 15,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  createButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  groupsList: {
    padding: 20,
    paddingTop: 0,
  },
  groupItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  groupContent: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberCount: {
    fontSize: 12,
  },
  timeStamp: {
    fontSize: 12,
  },
  suggestedItem: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  suggestedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  suggestedContent: {
    padding: 12,
  },
  suggestedName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  suggestedDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  suggestedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupsScreen;