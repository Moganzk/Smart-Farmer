import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { showMessage } from 'react-native-flash-message';

const AdvisoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  
  // Get article from route params
  const { article } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [articleContent, setArticleContent] = useState(null);
  
  // Mock fetch article content
  useEffect(() => {
    const fetchArticleContent = async () => {
      try {
        // In a real app, you would fetch this from an API
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock article content
        const content = {
          title: article.title,
          image: article.image,
          author: article.author || 'Smart Farmer Team',
          date: article.date || '1 week ago',
          readTime: article.readTime || '5 min read',
          category: article.category,
          content: [
            {
              type: 'paragraph',
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eget urna vel sapien malesuada efficitur. Fusce euismod, nisl nec aliquet dictum, nisi nisl aliquet nisl, nec aliquet nisl nisl nec aliquet dictum.',
            },
            {
              type: 'heading',
              text: 'Key Benefits',
            },
            {
              type: 'paragraph',
              text: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.',
            },
            {
              type: 'bullet',
              items: [
                'Increased crop yield by up to 30%',
                'Reduced water usage by 25%',
                'Environment-friendly farming practices',
                'Lower maintenance costs over time',
              ],
            },
            {
              type: 'paragraph',
              text: 'Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.',
            },
            {
              type: 'image',
              url: 'https://example.com/article-content-image.jpg',
              caption: 'Implementation of the technique in a farm setting',
            },
            {
              type: 'heading',
              text: 'Implementation Steps',
            },
            {
              type: 'paragraph',
              text: 'Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est.',
            },
            {
              type: 'numbered',
              items: [
                'Prepare the soil by removing weeds and adding organic matter',
                'Test soil pH and adjust as necessary',
                'Apply the recommended fertilizers based on soil test results',
                'Install irrigation system using the guidelines provided',
                'Monitor plant health regularly and adjust care as needed',
              ],
            },
            {
              type: 'paragraph',
              text: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.',
            },
            {
              type: 'quote',
              text: 'Sustainable farming isn\'t just about environmental responsibility—it\'s about creating resilient agricultural systems that can withstand changing climate conditions while maintaining productivity.',
              author: 'Dr. Maria Rodriguez, Agricultural Scientist',
            },
            {
              type: 'heading',
              text: 'Conclusion',
            },
            {
              type: 'paragraph',
              text: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.',
            },
          ],
          relatedArticles: [
            {
              id: '101',
              title: 'Advanced Techniques for Maximum Crop Yield',
              category: 'Crop Management',
            },
            {
              id: '102',
              title: 'Seasonal Planning for Successful Farming',
              category: 'Weather Management',
            },
            {
              id: '103',
              title: 'How to Choose the Right Fertilizers',
              category: 'Soil Health',
            },
          ],
        };
        
        setArticleContent(content);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching article content:', error);
        setIsLoading(false);
        showMessage({
          message: 'Failed to load article',
          description: 'There was a problem loading the article content.',
          type: 'danger',
        });
      }
    };
    
    fetchArticleContent();
  }, [article]);
  
  // Handle bookmarking
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showMessage({
      message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      type: 'info',
      duration: 2000,
    });
  };
  
  // Handle sharing
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title} - Read it on Smart Farmer App`,
        url: 'https://smartfarmer.app/articles/' + article.id,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };
  
  // Open external link
  const openExternalLink = () => {
    Linking.openURL('https://www.example.com/learn-more');
  };
  
  // Render content based on its type
  const renderContentItem = (item, index) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <Text 
            key={index} 
            style={[styles.paragraph, { color: theme.colors.text }]}
          >
            {item.text}
          </Text>
        );
      case 'heading':
        return (
          <Text 
            key={index} 
            style={[styles.heading, { color: theme.colors.text }]}
          >
            {item.text}
          </Text>
        );
      case 'bullet':
        return (
          <View key={index} style={styles.bulletList}>
            {item.items.map((bulletItem, bulletIndex) => (
              <View key={bulletIndex} style={styles.bulletItem}>
                <View 
                  style={[
                    styles.bulletPoint, 
                    { backgroundColor: theme.colors.primary }
                  ]} 
                />
                <Text style={[styles.bulletText, { color: theme.colors.text }]}>
                  {bulletItem}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'numbered':
        return (
          <View key={index} style={styles.numberedList}>
            {item.items.map((numberedItem, numberedIndex) => (
              <View key={numberedIndex} style={styles.numberedItem}>
                <Text 
                  style={[
                    styles.numberedPoint, 
                    { color: theme.colors.primary }
                  ]}
                >
                  {numberedIndex + 1}.
                </Text>
                <Text style={[styles.numberedText, { color: theme.colors.text }]}>
                  {numberedItem}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'image':
        return (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={{ uri: item.url }} 
              style={styles.contentImage}
              defaultSource={require('../../assets/placeholder-image.png')}
            />
            {item.caption && (
              <Text style={[styles.imageCaption, { color: theme.colors.textSecondary }]}>
                {item.caption}
              </Text>
            )}
          </View>
        );
      case 'quote':
        return (
          <View 
            key={index} 
            style={[
              styles.quoteContainer, 
              { borderLeftColor: theme.colors.primary }
            ]}
          >
            <Text style={[styles.quoteText, { color: theme.colors.text }]}>
              "{item.text}"
            </Text>
            {item.author && (
              <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>
                - {item.author}
              </Text>
            )}
          </View>
        );
      default:
        return null;
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
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={toggleBookmark}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? theme.colors.primary : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image 
              source={{ uri: articleContent.image }} 
              style={styles.heroImage}
              defaultSource={require('../../assets/placeholder-image.png')}
            />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{articleContent.category}</Text>
            </View>
          </View>
          
          {/* Article Content */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {articleContent.title}
            </Text>
            
            <View style={styles.authorContainer}>
              <Ionicons name="person-circle-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.authorText, { color: theme.colors.textSecondary }]}>
                {articleContent.author}
              </Text>
            </View>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {articleContent.readTime}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {articleContent.date}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Article Body */}
            <View style={styles.articleBody}>
              {articleContent.content.map(renderContentItem)}
            </View>
            
            {/* Social Sharing */}
            <View style={styles.socialContainer}>
              <Text style={[styles.socialTitle, { color: theme.colors.text }]}>
                Share this Article
              </Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[
                    styles.socialButton, 
                    { backgroundColor: theme.colors.primary + '20' }
                  ]} 
                  onPress={handleShare}
                >
                  <Ionicons name="share-social-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.socialButton, 
                    { backgroundColor: '#3b5998' + '20' }
                  ]} 
                  onPress={handleShare}
                >
                  <Ionicons name="logo-facebook" size={24} color="#3b5998" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.socialButton, 
                    { backgroundColor: '#1DA1F2' + '20' }
                  ]} 
                  onPress={handleShare}
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.socialButton, 
                    { backgroundColor: '#0077B5' + '20' }
                  ]} 
                  onPress={handleShare}
                >
                  <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Related Articles */}
            <View style={styles.relatedContainer}>
              <Text style={[styles.relatedTitle, { color: theme.colors.text }]}>
                Related Articles
              </Text>
              {articleContent.relatedArticles.map((relatedArticle, index) => (
                <TouchableOpacity 
                  key={relatedArticle.id}
                  style={[
                    styles.relatedArticle, 
                    { borderBottomColor: theme.colors.border },
                    index === articleContent.relatedArticles.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => navigation.navigate('AdvisoryDetail', { article: relatedArticle })}
                >
                  <Text style={[styles.relatedArticleTitle, { color: theme.colors.text }]}>
                    {relatedArticle.title}
                  </Text>
                  <Text style={[styles.relatedArticleCategory, { color: theme.colors.primary }]}>
                    {relatedArticle.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Learn More Button */}
            <TouchableOpacity
              style={[
                styles.learnMoreButton, 
                { backgroundColor: theme.colors.primary }
              ]}
              onPress={openExternalLink}
            >
              <Text style={styles.learnMoreText}>Learn More</Text>
              <Ionicons name="open-outline" size={18} color="white" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  bookmarkButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 32,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    marginLeft: 5,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  articleBody: {
    marginBottom: 30,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  bulletList: {
    marginBottom: 15,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  numberedList: {
    marginBottom: 15,
  },
  numberedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  numberedPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    width: 20,
  },
  numberedText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  imageContainer: {
    marginVertical: 20,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageCaption: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteContainer: {
    borderLeftWidth: 4,
    paddingLeft: 15,
    marginVertical: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
  socialContainer: {
    marginBottom: 30,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedContainer: {
    marginBottom: 30,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  relatedArticle: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  relatedArticleTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  relatedArticleCategory: {
    fontSize: 14,
  },
  learnMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  learnMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvisoryDetailScreen;