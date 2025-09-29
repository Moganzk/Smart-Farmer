import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import TimeAgo from '../../utils/TimeAgo';

const { width } = Dimensions.get('window');

const PostItem = ({ post, onLike, onComment, onOptions, onPress }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Format timestamp
  const timeAgo = TimeAgo(new Date(post.created_at));
  
  // Navigate to user profile
  const goToUserProfile = () => {
    navigation.navigate('UserProfile', { userId: post.author.id });
  };
  
  // Render image item
  const renderImageItem = ({ item, index }) => {
    // Handle different image layouts based on count
    const imageCount = post.images.length;
    let imageWidth, imageHeight;
    
    if (imageCount === 1) {
      // Full width for single image
      imageWidth = width - 32; // Account for container padding
      imageHeight = Math.min(300, (width - 32) * (9/16)); // Maintain aspect ratio with max height
    } else if (imageCount === 2) {
      // Half width for two images
      imageWidth = (width - 32 - 4) / 2; // Account for container padding and gap
      imageHeight = imageWidth;
    } else {
      // Grid layout for 3+ images
      if (imageCount === 3 && index === 0) {
        // First image takes full width in 3-image layout
        imageWidth = width - 32;
        imageHeight = 150;
      } else if (imageCount === 3) {
        // Other images in 3-image layout take half width
        imageWidth = (width - 32 - 4) / 2;
        imageHeight = 150;
      } else {
        // Grid layout for 4+ images
        imageWidth = (width - 32 - 4) / 2;
        imageHeight = 120;
      }
    }
    
    return (
      <TouchableOpacity 
        style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}
        onPress={() => navigation.navigate('ImageViewer', { 
          images: post.images.map(img => img.url),
          initialIndex: index 
        })}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.authorContainer} onPress={goToUserProfile}>
          <Image 
            source={{ uri: post.author.profile_image || 'https://via.placeholder.com/150' }} 
            style={styles.authorImage} 
          />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>
              {post.author.full_name || post.author.username}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {timeAgo}
              </Text>
              {post.group && (
                <>
                  <Text style={[styles.bulletPoint, { color: theme.colors.textSecondary }]}>•</Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('GroupDetail', { groupId: post.group.id })}
                  >
                    <Text style={[styles.groupName, { color: theme.colors.primary }]}>
                      {post.group.name}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onOptions} style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {post.content && (
        <Text style={[styles.content, { color: theme.colors.text }]}>
          {post.content}
        </Text>
      )}
      
      {/* Images */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <FlatList
            data={post.images.slice(0, 4)} // Limit to 4 images max in preview
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${post.id}-${index}`}
            numColumns={post.images.length === 1 ? 1 : 2}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
            columnWrapperStyle={post.images.length > 1 ? { justifyContent: 'space-between' } : null}
          />
          
          {/* "More images" indicator */}
          {post.images.length > 4 && (
            <TouchableOpacity 
              style={[
                styles.moreImagesContainer, 
                { backgroundColor: theme.colors.background + 'CC' }
              ]}
              onPress={() => navigation.navigate('ImageViewer', { 
                images: post.images.map(img => img.url),
                initialIndex: 0 
              })}
            >
              <Text style={[styles.moreImagesText, { color: theme.colors.text }]}>
                +{post.images.length - 4} more
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Stats */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <View style={styles.statsContainer}>
          {post.likes_count > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.likeIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="heart" size={10} color="white" />
              </View>
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {post.likes_count}
              </Text>
            </View>
          )}
          
          {post.comments_count > 0 && (
            <TouchableOpacity 
              style={styles.commentStat} 
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            >
              <Text style={[styles.commentText, { color: theme.colors.textSecondary }]}>
                {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Action buttons */}
      <View style={[styles.actionsContainer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons 
            name={post.is_liked ? "heart" : "heart-outline"} 
            size={22} 
            color={post.is_liked ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <Text 
            style={[
              styles.actionText, 
              { 
                color: post.is_liked ? theme.colors.primary : theme.colors.textSecondary 
              }
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            Comment
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Ionicons name="share-social-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 14,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
  },
  bulletPoint: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  groupName: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  imagesContainer: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moreImagesContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  moreImagesText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
  },
  commentStat: {
    paddingVertical: 2,
  },
  commentText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default PostItem;