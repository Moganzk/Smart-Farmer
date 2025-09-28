# Group Features - Technical Implementation Details

This document outlines the technical implementation details of the group creation and search features in the Smart Farmer application.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Native   │◄────┤  Express API    │◄────┤  PostgreSQL     │
│  Frontend       │     │  Backend        │     │  Database       │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│                 │     │                 │
│  Local Storage  │     │  Cache Layer    │
│  (Offline Data) │     │  (Redis)        │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Database Schema

```sql
-- Groups table
CREATE TABLE public.groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_by_id INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    CONSTRAINT group_name_length CHECK (LENGTH(name) BETWEEN 3 AND 50)
);

-- Group membership table
CREATE TABLE public.group_members (
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (group_id, user_id)
);

-- Group tags table
CREATE TABLE public.group_tags (
    tag_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE (group_id, tag_name)
);

-- Search indexes
CREATE INDEX idx_groups_name_tsvector ON public.groups 
    USING GIN (to_tsvector('english', name));
CREATE INDEX idx_groups_description_tsvector ON public.groups 
    USING GIN (to_tsvector('english', description));
CREATE INDEX idx_group_tags_name ON public.group_tags(tag_name);

-- Update trigger for last_activity
CREATE OR REPLACE FUNCTION public.update_group_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.groups
    SET last_activity_at = NOW()
    WHERE group_id = NEW.group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_activity
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_group_last_activity();
```

## Backend Components

### Group Model Extensions

```javascript
// src/utils/groupModelExtensions.js
const db = require('../config/database');

/**
 * Search for groups matching query string across name, description, and tags
 * @param {string} query - Search query
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @param {number} userId - Optional user ID to mark if user is member
 * @returns {Promise<{groups: Array, totalCount: number}>}
 */
async function searchGroups(query, page = 1, limit = 20, userId = null) {
  const offset = (page - 1) * limit;
  
  // Construct base query with full text search
  const searchQuery = `
    WITH ranked_groups AS (
      SELECT g.*, 
        CASE WHEN g.is_featured THEN 1 ELSE 0 END as featured_rank,
        ts_rank(
          setweight(to_tsvector('english', g.name), 'A') ||
          setweight(to_tsvector('english', COALESCE(g.description, '')), 'B'),
          plainto_tsquery('english', $1)
        ) as rank,
        COUNT(gm.user_id) as member_count,
        EXISTS (
          SELECT 1 FROM group_tags gt 
          WHERE gt.group_id = g.group_id AND 
                gt.tag_name ILIKE '%' || $1 || '%'
        ) as tag_match,
        EXISTS (
          SELECT 1 FROM group_members gm2 
          WHERE gm2.group_id = g.group_id AND gm2.user_id = $4
        ) as is_member
      FROM groups g
      LEFT JOIN group_members gm ON g.group_id = gm.group_id
      GROUP BY g.group_id
      WHERE to_tsvector('english', g.name) @@ plainto_tsquery('english', $1)
        OR to_tsvector('english', COALESCE(g.description, '')) @@ plainto_tsquery('english', $1)
        OR EXISTS (
          SELECT 1 FROM group_tags gt 
          WHERE gt.group_id = g.group_id AND 
                gt.tag_name ILIKE '%' || $1 || '%'
        )
    )
    SELECT *, 
      (SELECT array_agg(tag_name) FROM group_tags gt WHERE gt.group_id = rg.group_id) as tags
    FROM ranked_groups rg
    ORDER BY featured_rank DESC, rank DESC, last_activity_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM groups g
    WHERE to_tsvector('english', g.name) @@ plainto_tsquery('english', $1)
      OR to_tsvector('english', COALESCE(g.description, '')) @@ plainto_tsquery('english', $1)
      OR EXISTS (
        SELECT 1 FROM group_tags gt 
        WHERE gt.group_id = g.group_id AND 
              gt.tag_name ILIKE '%' || $1 || '%'
      )
  `;
  
  const [results, counts] = await Promise.all([
    db.query(searchQuery, [query, limit, offset, userId || 0]),
    db.query(countQuery, [query])
  ]);
  
  return {
    groups: results.rows,
    totalCount: parseInt(counts.rows[0].total)
  };
}

// More methods...

module.exports = {
  searchGroups,
  // other methods...
};
```

### Group Controller

```javascript
// src/controllers/groupController.js
const Group = require('../models/groupWithExtensions');
const { validateGroupData } = require('../utils/validators');

/**
 * Create a new group
 */
exports.createGroup = async (req, res) => {
  try {
    const { name, description, tags = [] } = req.body;
    const userId = req.user.id;
    
    // Validate input
    const errors = validateGroupData(name, description, tags);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Check for duplicate group name
    const existing = await Group.findByName(name);
    if (existing) {
      return res.status(400).json({
        errors: { name: 'Group with this name already exists' }
      });
    }
    
    // Create group
    const newGroup = await Group.create({
      name,
      description,
      createdById: userId,
      tags
    });
    
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

/**
 * Search for groups
 */
exports.searchGroups = async (req, res) => {
  try {
    const { query = '', page = 1, limit = 20 } = req.query;
    const userId = req.user ? req.user.id : null;
    
    const result = await Group.search(query, page, limit, userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({ message: 'Failed to search groups' });
  }
};

// More controller methods...
```

### API Routes

```javascript
// src/routes/group.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/search', groupController.searchGroups);
router.get('/popular', groupController.getPopularGroups);

// Protected routes
router.use(authenticate);
router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:id', groupController.getGroupById);
router.post('/:id/join', groupController.joinGroup);
router.delete('/:id/leave', groupController.leaveGroup);
router.get('/:id/members', groupController.getGroupMembers);

// Admin-only routes
router.post('/:id/admins', groupController.makeAdmin);
router.delete('/:id/admins/:userId', groupController.removeAdmin);

module.exports = router;
```

## Frontend Components

### Group Service

```javascript
// FRONTEND/src/services/groupService.js
import axios from 'axios';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

const headers = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

export const groupService = {
  /**
   * Search for groups
   * @param {string} query - Search term
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Results per page
   * @returns {Promise<{groups: Array, totalCount: number}>}
   */
  searchGroups: async (query = '', page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        { headers: headers() }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching groups:', error);
      throw error;
    }
  },
  
  /**
   * Create a new group
   * @param {Object} groupData - Group data
   * @returns {Promise<Object>} - Created group
   */
  createGroup: async (groupData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/groups`,
        groupData,
        { headers: headers() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },
  
  // More service methods...
};
```

### Group Search Screen

```jsx
// FRONTEND/src/screens/GroupSearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { groupService } from '../services/groupService';
import GroupListItem from '../components/GroupListItem';

const GroupSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'popular', 'search'
  
  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyGroups();
    } else if (activeTab === 'popular') {
      fetchPopularGroups();
    }
  }, [activeTab]);
  
  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupService.getUserGroups();
      setGroups(data.groups);
    } catch (err) {
      setError('Failed to fetch your groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPopularGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupService.getPopularGroups();
      setGroups(data.groups);
    } catch (err) {
      setError('Failed to fetch popular groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const searchGroups = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setActiveTab('search');
      const data = await groupService.searchGroups(searchQuery);
      setGroups(data.groups);
    } catch (err) {
      setError('Failed to search groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === 'my' 
          ? "You haven't joined any groups yet"
          : activeTab === 'search'
            ? "No groups match your search"
            : "No popular groups found"}
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateGroup}
      >
        <Text style={styles.createButtonText}>Create a Group</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchGroups}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={searchGroups}
        >
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'my' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={styles.tabText}>My Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'popular' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('popular')}
        >
          <Text style={styles.tabText}>Popular</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={groups}
          renderItem={({ item }) => (
            <GroupListItem 
              group={item} 
              onPress={() => navigation.navigate('GroupDetail', { groupId: item.group_id })}
            />
          )}
          keyExtractor={(item) => item.group_id.toString()}
          contentContainerStyle={groups.length === 0 ? { flex: 1 } : {}}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleCreateGroup}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 80,
    height: 48,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTabButton: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default GroupSearchScreen;
```

### Create Group Screen

```jsx
// FRONTEND/src/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { groupService } from '../services/groupService';

const CreateGroupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    } else if (name.length > 50) {
      newErrors.name = 'Group name must be less than 50 characters';
    }
    
    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (tags.includes(newTag)) {
      Alert.alert('Duplicate Tag', 'This tag has already been added');
      return;
    }
    
    if (newTag.length > 50) {
      Alert.alert('Tag Too Long', 'Tags must be less than 50 characters');
      return;
    }
    
    if (tags.length >= 5) {
      Alert.alert('Maximum Tags', 'You can add up to 5 tags per group');
      return;
    }
    
    setTags([...tags, newTag]);
    setTagInput('');
  };
  
  const handleRemoveTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const createdGroup = await groupService.createGroup({
        name,
        description,
        tags
      });
      
      Alert.alert(
        'Success',
        'Group created successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.replace('GroupDetail', { groupId: createdGroup.group_id }) 
          }
        ]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert('Error', 'Failed to create group. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Group Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Enter group name (3-50 characters)"
          maxLength={50}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <Text style={styles.charCount}>{name.length}/50</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your group's purpose (optional)"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags (Optional)</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag"
            maxLength={50}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity
            style={styles.tagButton}
            onPress={handleAddTag}
          >
            <Text style={styles.tagButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                <Text style={styles.removeTag}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        <Text style={styles.helpText}>
          Add up to 5 tags to help others find your group
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  tagButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 8,
  },
  tagButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e0f2f1',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    marginRight: 4,
    color: '#00796b',
  },
  removeTag: {
    fontSize: 16,
    color: '#00796b',
    fontWeight: 'bold',
  },
  helpText: {
    color: '#888',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroupScreen;
```

## Integration Points

### Backend-Database Integration

The backend integrates with PostgreSQL through:

1. **Connection Pool**: Using node-postgres for connection pooling
2. **Parameterized Queries**: All database queries use parameterized statements for security
3. **Transaction Management**: Critical operations use transactions
4. **Search Optimization**: Leveraging PostgreSQL's full-text search capabilities

### Frontend-Backend Integration

1. **Authentication**: JWT tokens included in API calls
2. **Error Handling**: Structured error responses for better UX
3. **Data Validation**: Validation on both client and server sides
4. **Caching**: Response caching for frequently accessed data
5. **Optimistic Updates**: UI updates before server response for better UX

## Performance Considerations

1. **Database Indexing**: Proper indexing on search fields and foreign keys
2. **Query Optimization**: Efficient PostgreSQL queries with proper JOIN patterns
3. **Connection Pooling**: Reusing database connections
4. **Response Pagination**: All list endpoints support pagination
5. **Caching Strategy**: Redis caching for frequently accessed data
6. **Lazy Loading**: Loading group members only when needed

## Security Considerations

1. **Input Validation**: Thorough validation of all user inputs
2. **SQL Injection Protection**: Parameterized queries for all database operations
3. **Authentication**: JWT-based authentication for protected routes
4. **Authorization**: Permission checks for admin operations
5. **Rate Limiting**: API rate limiting to prevent abuse
6. **Error Handling**: No sensitive information in error responses

## Testing Strategy

1. **Unit Testing**: Testing individual components
2. **Integration Testing**: Testing component interactions
3. **API Testing**: Testing API endpoints with Postman/Supertest
4. **Performance Testing**: Load testing for search endpoints
5. **UI Testing**: Automated UI tests with React Native Testing Library