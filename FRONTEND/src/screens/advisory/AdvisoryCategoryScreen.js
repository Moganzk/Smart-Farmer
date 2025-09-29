import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

// Mock category data
const CATEGORY_COLORS = {
  'Crop Management': '#4CAF50',
  'Pest Control': '#FF9800',
  'Soil Health': '#795548',
  'Water Management': '#2196F3',
  'Weather Alerts': '#607D8B',
  'Market Trends': '#9C27B0',
};

const CATEGORY_ICONS = {
  'Crop Management': 'leaf-outline',
  'Pest Control': 'bug-outline',
  'Soil Health': 'nutrition-outline',
  'Water Management': 'water-outline',
  'Weather Alerts': 'thunderstorm-outline',
  'Market Trends': 'trending-up-outline',
};

// Mock articles by category
const ARTICLES_BY_CATEGORY = {
  'Crop Management': [
    {
      id: '1',
      title: 'Best Practices for Organic Farming',
      image: 'https://example.com/organic-farming.jpg',
      excerpt: 'Learn about the latest organic farming techniques that can improve your yield while maintaining soil health...',
      readTime: '8 min read',
      date: '2 days ago',
    },
    {
      id: '2',
      title: 'Crop Rotation Benefits',
      image: 'https://example.com/crop-rotation.jpg',
      excerpt: 'How rotating crops can improve soil fertility, reduce pest problems, and increase overall farm productivity...',
      readTime: '6 min read',
      date: '1 week ago',
    },
    {
      id: '3',
      title: 'Companion Planting Strategies',
      image: 'https://example.com/companion-planting.jpg',
      excerpt: 'Strategic placement of certain plants next to each other to enhance growth, flavor, and pest management...',
      readTime: '10 min read',
      date: '2 weeks ago',
    },
    {
      id: '4',
      title: 'Season Extension Techniques',
      image: 'https://example.com/season-extension.jpg',
      excerpt: 'Methods for extending your growing season including row covers, greenhouses, and timing strategies...',
      readTime: '7 min read',
      date: '3 weeks ago',
    },
    {
      id: '5',
      title: 'Maximizing Crop Yield in Small Spaces',
      image: 'https://example.com/small-space.jpg',
      excerpt: 'Techniques for getting the most production out of limited farming space through vertical growing and intensive planting...',
      readTime: '9 min read',
      date: '1 month ago',
    },
  ],
  'Pest Control': [
    {
      id: '6',
      title: 'Natural Methods to Protect Your Crops from Pests',
      image: 'https://example.com/pest-control.jpg',
      excerpt: 'Discover natural ways to keep pests away from your crops without using harmful chemicals...',
      readTime: '6 min read',
      date: '3 days ago',
    },
    {
      id: '7',
      title: 'Beneficial Insects for Your Farm',
      image: 'https://example.com/beneficial-insects.jpg',
      excerpt: 'How to attract and maintain populations of insects that help control pests naturally...',
      readTime: '5 min read',
      date: '1 week ago',
    },
    {
      id: '8',
      title: 'Integrated Pest Management',
      image: 'https://example.com/ipm.jpg',
      excerpt: 'A comprehensive approach to pest control that minimizes risks to people and the environment...',
      readTime: '12 min read',
      date: '2 weeks ago',
    },
  ],
  'Soil Health': [
    {
      id: '9',
      title: 'Understanding Soil pH and Nutrient Balance',
      image: 'https://example.com/soil-health.jpg',
      excerpt: 'How soil pH affects plant growth and techniques to optimize it for different crops...',
      readTime: '10 min read',
      date: '5 days ago',
    },
    {
      id: '10',
      title: 'Cover Crops for Soil Improvement',
      image: 'https://example.com/cover-crops.jpg',
      excerpt: 'Using cover crops to prevent erosion, add organic matter, and improve soil structure...',
      readTime: '8 min read',
      date: '1 week ago',
    },
  ],
  'Water Management': [
    {
      id: '11',
      title: 'Drip Irrigation Systems for Water Conservation',
      image: 'https://example.com/drip-irrigation.jpg',
      excerpt: 'How to set up and maintain efficient drip irrigation systems for your farm...',
      readTime: '5 min read',
      date: '4 days ago',
    },
    {
      id: '12',
      title: 'Rainwater Harvesting Techniques',
      image: 'https://example.com/rainwater.jpg',
      excerpt: 'Systems for collecting and storing rainwater for agricultural use during dry periods...',
      readTime: '7 min read',
      date: '2 weeks ago',
    },
  ],
  'Weather Alerts': [
    {
      id: '13',
      title: 'Preparing Your Farm for Monsoon Season',
      image: 'https://example.com/monsoon-prep.jpg',
      excerpt: 'Steps to protect your crops and infrastructure before heavy rains arrive...',
      readTime: '7 min read',
      date: '1 week ago',
    },
  ],
  'Market Trends': [
    {
      id: '14',
      title: 'Emerging Market Trends for Organic Produce',
      image: 'https://example.com/market-trends.jpg',
      excerpt: 'Current and future market opportunities for organic farmers based on consumer demand...',
      readTime: '12 min read',
      date: '3 days ago',
    },
    {
      id: '15',
      title: 'Direct-to-Consumer Marketing Strategies',
      image: 'https://example.com/direct-marketing.jpg',
      excerpt: 'Building farm-to-table relationships with consumers through CSAs, farmers markets, and online sales...',
      readTime: '9 min read',
      date: '1 week ago',
    },
  ],
};

const AdvisoryCategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  
  // Get category from route params
  const { category } = route.params || {};
  
  // State variables
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'recent', 'popular'
  
  // Load articles for the selected category
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // In a real app, you would fetch from API
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (category && ARTICLES_BY_CATEGORY[category.name]) {
          setArticles(ARTICLES_BY_CATEGORY[category.name]);
        } else {
          setArticles([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, [category]);
  
  // Get filtered articles based on active filter
  const getFilteredArticles = () => {
    switch (activeFilter) {
      case 'recent':
        // Sort by date (newest first)
        return [...articles].sort((a, b) => {
          // This is a simplified sort, you'd use actual dates in a real app
          const aValue = a.date.includes('day') ? 1 : a.date.includes('week') ? 7 : 30;
          const bValue = b.date.includes('day') ? 1 : b.date.includes('week') ? 7 : 30;
          return aValue - bValue;
        });
      case 'popular':
        // In a real app, you'd sort by view count or user ratings
        // For demo purposes, we'll just shuffle the array
        return [...articles].sort(() => Math.random() - 0.5);
      default:
        return articles;
    }
  };
  
  // Navigate to article detail
  const navigateToDetail = (article) => {
    navigation.navigate('AdvisoryDetail', { 
      article: {
        ...article,
        category: category.name,
      }
    });
  };
  
  // Render article item
  const renderArticleItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: theme.colors.cardBackground }]}
      onPress={() => navigateToDetail(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.articleImage}
        defaultSource={require('../../assets/placeholder-image.png')}
      />
      <View style={styles.articleContent}>
        <Text style={[styles.articleTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text 
          style={[styles.articleExcerpt, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.excerpt}
        </Text>
        <View style={styles.articleMeta}>
          <Text style={[styles.articleReadTime, { color: theme.colors.textSecondary }]}>
            {item.readTime}
          </Text>
          <Text style={[styles.articleDate, { color: theme.colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={CATEGORY_ICONS[category.name] || 'document-text-outline'} 
        size={60} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Articles Available
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        We don't have any articles in this category yet.
        Check back later for updates!
      </Text>
    </View>
  );

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
          {category ? category.name : 'Category'}
        </Text>
      </View>
      
      {/* Category Banner */}
      <View 
        style={[
          styles.categoryBanner, 
          { backgroundColor: category ? CATEGORY_COLORS[category.name] + '20' : theme.colors.cardBackground }
        ]}
      >
        <View 
          style={[
            styles.categoryIcon, 
            { backgroundColor: category ? CATEGORY_COLORS[category.name] : theme.colors.primary }
          ]}
        >
          <Ionicons 
            name={category ? CATEGORY_ICONS[category.name] : 'folder-outline'} 
            size={30} 
            color="white" 
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>
            {category ? category.name : 'Unknown Category'}
          </Text>
          <Text style={[styles.categoryCount, { color: theme.colors.textSecondary }]}>
            {isLoading ? 'Loading...' : `${articles.length} articles`}
          </Text>
        </View>
      </View>
      
      {/* Filters */}
      <View style={[styles.filtersContainer, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && [styles.activeFilter, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'all' && { color: theme.colors.primary, fontWeight: '600' }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'recent' && [styles.activeFilter, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveFilter('recent')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'recent' && { color: theme.colors.primary, fontWeight: '600' }
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'popular' && [styles.activeFilter, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveFilter('popular')}
        >
          <Text 
            style={[
              styles.filterText,
              activeFilter === 'popular' && { color: theme.colors.primary, fontWeight: '600' }
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Article List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading articles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredArticles()}
          renderItem={renderArticleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.articlesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryCount: {
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  filterButton: {
    marginRight: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  activeFilter: {
    borderBottomWidth: 2,
  },
  filterText: {
    fontSize: 16,
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
  articlesList: {
    padding: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },
  articleCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  articleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleReadTime: {
    fontSize: 12,
  },
  articleDate: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AdvisoryCategoryScreen;