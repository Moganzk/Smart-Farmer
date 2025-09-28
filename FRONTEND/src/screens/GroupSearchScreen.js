import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GroupService } from '../services/groupService';
import GroupListItem from '../components/GroupListItem';
import EmptyState from '../components/EmptyState';
import ErrorDisplay from '../components/ErrorDisplay';
import GroupTagBadge from '../components/GroupTagBadge';

const GroupSearchScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularGroups, setPopularGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myGroups'); // 'myGroups', 'popular', 'search'

  // Fetch user groups
  const fetchUserGroups = async () => {
    try {
      setError(null);
      const groups = await GroupService.getUserGroups();
      setUserGroups(groups);
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setError('Failed to load your groups');
    }
  };

  // Fetch popular groups
  const fetchPopularGroups = async () => {
    try {
      setError(null);
      const groups = await GroupService.getPopularGroups();
      setPopularGroups(groups);
    } catch (err) {
      console.error('Error fetching popular groups:', err);
      setError('Failed to load popular groups');
    }
  };

  // Search groups
  const searchGroups = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await GroupService.searchGroups(searchTerm);
      setSearchResults(results);
      setActiveTab('search');
    } catch (err) {
      console.error('Error searching groups:', err);
      setError('Failed to search groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchUserGroups(),
      fetchPopularGroups()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    Promise.all([
      fetchUserGroups(),
      fetchPopularGroups()
    ]).finally(() => {
      setIsRefreshing(false);
    });
  };

  // Create new group
  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  // Handle group selection
  const handleSelectGroup = (group) => {
    navigation.navigate('GroupDetail', { groupId: group.group_id });
  };

  // Handle search submission
  const handleSearch = () => {
    searchGroups();
  };

  // Render group item
  const renderGroupItem = ({ item }) => (
    <GroupListItem
      group={item}
      onPress={() => handleSelectGroup(item)}
      isUserMember={activeTab === 'myGroups'}
    />
  );

  // Render tab content
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <ErrorDisplay 
          message={error} 
          onRetry={handleRefresh} 
        />
      );
    }

    switch (activeTab) {
      case 'myGroups':
        if (userGroups.length === 0) {
          return (
            <EmptyState
              icon="people-outline"
              title="No Groups Yet"
              message="You haven't joined any groups yet. Join or create a group to collaborate with other farmers."
              actionLabel="Create a Group"
              onAction={handleCreateGroup}
            />
          );
        }
        return (
          <FlatList
            data={userGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.group_id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          />
        );
      
      case 'popular':
        if (popularGroups.length === 0) {
          return (
            <EmptyState
              icon="trending-up"
              title="No Popular Groups"
              message="There are no popular groups yet. Be the first to create one!"
              actionLabel="Create a Group"
              onAction={handleCreateGroup}
            />
          );
        }
        return (
          <FlatList
            data={popularGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.group_id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          />
        );
      
      case 'search':
        if (!searchTerm.trim()) {
          return (
            <EmptyState
              icon="search"
              title="Search for Groups"
              message="Enter keywords to find groups related to specific crops or topics."
            />
          );
        }
        
        if (searchResults.length === 0) {
          return (
            <EmptyState
              icon="search-outline"
              title="No Results Found"
              message={`No groups found matching "${searchTerm}". Try different keywords or create a new group.`}
              actionLabel="Create a Group"
              onAction={handleCreateGroup}
            />
          );
        }
        
        return (
          <FlatList
            data={searchResults}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.group_id.toString()}
            contentContainerStyle={styles.listContent}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search for groups..."
          placeholderTextColor={theme.colors.grey}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.grey} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'myGroups' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('myGroups')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'myGroups' && [styles.activeTabText, { color: theme.colors.primary }]
          ]}>
            My Groups
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'popular' && [styles.activeTab, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab('popular')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'popular' && [styles.activeTabText, { color: theme.colors.primary }]
          ]}>
            Popular
          </Text>
        </TouchableOpacity>
        
        {searchResults.length > 0 && (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'search' && [styles.activeTab, { borderColor: theme.colors.primary }]
            ]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'search' && [styles.activeTabText, { color: theme.colors.primary }]
            ]}>
              Search Results
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content area */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Create group button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateGroup}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default GroupSearchScreen;