import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

/**
 * GroupListItem Component
 * 
 * Displays a single group in a list with details
 */
const GroupListItem = ({ group, onPress, isUserMember = false }) => {
  const { theme } = useTheme();
  
  // Format member count text
  const formatMemberCount = (count) => {
    if (count === 1) return '1 member';
    return `${count} members`;
  };

  // Generate group avatar or use a placeholder
  const getGroupAvatar = () => {
    if (group.image_url) {
      return { uri: group.image_url };
    }
    return require('../assets/images/group-placeholder.png');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={getGroupAvatar()}
        style={styles.avatar}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          {group.is_featured && (
            <View style={[styles.featuredBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.description, { color: theme.colors.textLight }]} numberOfLines={2}>
          {group.description || "No description available"}
        </Text>
        
        <View style={styles.metaContainer}>
          {/* Member count */}
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={theme.colors.textLight} />
            <Text style={[styles.metaText, { color: theme.colors.textLight }]}>
              {formatMemberCount(group.member_count || 0)}
            </Text>
          </View>
          
          {/* Message count */}
          <View style={styles.metaItem}>
            <Ionicons name="chatbubble-outline" size={14} color={theme.colors.textLight} />
            <Text style={[styles.metaText, { color: theme.colors.textLight }]}>
              {group.message_count || 0} messages
            </Text>
          </View>

          {/* Admin badge */}
          {isUserMember && group.is_user_admin && (
            <View style={[styles.adminBadge, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        
        {/* Tags row */}
        {group.tags && group.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {group.tags.slice(0, 3).map((tag, index) => (
              <View 
                key={index}
                style={[styles.tagBadge, { backgroundColor: theme.colors.tagBackground }]}
              >
                <Text style={[styles.tagText, { color: theme.colors.tagText }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {group.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: theme.colors.textLight }]}>
                +{group.tags.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.textLight} 
        style={styles.chevron} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  featuredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  featuredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    marginLeft: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default GroupListItem;