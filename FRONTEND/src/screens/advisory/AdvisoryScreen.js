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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

// Mock data for demonstration purposes
const CATEGORIES = [
  {
    id: '1',
    name: 'Crop Management',
    icon: 'leaf-outline',
    color: '#4CAF50',
  },
  {
    id: '2',
    name: 'Pest Control',
    icon: 'bug-outline',
    color: '#FF9800',
  },
  {
    id: '3',
    name: 'Soil Health',
    icon: 'nutrition-outline',
    color: '#795548',
  },
  {
    id: '4',
    name: 'Water Management',
    icon: 'water-outline',
    color: '#2196F3',
  },
  {
    id: '5',
    name: 'Weather Alerts',
    icon: 'thunderstorm-outline',
    color: '#607D8B',
  },
  {
    id: '6',
    name: 'Market Trends',
    icon: 'trending-up-outline',
    color: '#9C27B0',
  },
];

const FEATURED_ARTICLES = [
  {
    id: '1',
    title: 'Best Practices for Organic Farming',
    image: 'https://example.com/organic-farming.jpg',
    category: 'Crop Management',
    readTime: '8 min read',
    author: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    title: 'Natural Methods to Protect Your Crops from Pests',
    image: 'https://example.com/pest-control.jpg',
    category: 'Pest Control',
    readTime: '6 min read',
    author: 'Michael Rodriguez',
  },
  {
    id: '3',
    title: 'Understanding Soil pH and Nutrient Balance',
    image: 'https://example.com/soil-health.jpg',
    category: 'Soil Health',
    readTime: '10 min read',
    author: 'Dr. Emily Chen',
  },
];

const RECENT_ARTICLES = [
  {
    id: '4',
    title: 'Drip Irrigation Systems for Water Conservation',
    image: 'https://example.com/drip-irrigation.jpg',
    category: 'Water Management',
    readTime: '5 min read',
    date: '2 days ago',
  },
  {
    id: '5',
    title: 'Preparing Your Farm for Monsoon Season',
    image: 'https://example.com/monsoon-prep.jpg',
    category: 'Weather Alerts',
    readTime: '7 min read',
    date: '3 days ago',
  },
  {
    id: '6',
    title: 'Emerging Market Trends for Organic Produce',
    image: 'https://example.com/market-trends.jpg',
    category: 'Market Trends',
    readTime: '12 min read',
    date: '4 days ago',
  },
  {
    id: '7',
    title: 'Companion Planting Strategies for Vegetable Gardens',
    image: 'https://example.com/companion-planting.jpg',
    category: 'Crop Management',
    readTime: '9 min read',
    date: '6 days ago',
  },
];

const AdvisoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('AdvisorySearch', { query: searchQuery });
      setSearchQuery('');
    }
  };

  const navigateToDetail = (article) => {
    navigation.navigate('AdvisoryDetail', { article });
  };

  const navigateToCategory = (category) => {
    navigation.navigate('AdvisoryCategory', { category });
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: item.color + '20' }]} // 20% opacity of the color
      onPress={() => navigateToCategory(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="white" />
      </View>
      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render featured article
  const renderFeaturedArticle = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigateToDetail(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.featuredImage}
        defaultSource={require('../../assets/placeholder-image.png')}
      />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredCategory}>{item.category}</Text>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredAuthor}>{item.author}</Text>
            <Text style={styles.featuredReadTime}>{item.readTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render recent article
  const renderRecentArticle = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.recentCard,
        { backgroundColor: theme.colors.cardBackground },
        index === RECENT_ARTICLES.length - 1 && styles.lastItem,
      ]}
      onPress={() => navigateToDetail(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.recentImage}
        defaultSource={require('../../assets/placeholder-image.png')}
      />
      <View style={styles.recentContent}>
        <Text style={[styles.recentCategory, { color: theme.colors.primary }]}>
          {item.category}
        </Text>
        <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <View style={styles.recentMeta}>
          <Text style={[styles.recentReadTime, { color: theme.colors.textSecondary }]}>
            {item.readTime}
          </Text>
          <Text style={[styles.recentDate, { color: theme.colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          Advisory
        </Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          <View style={[styles.notificationBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search for advisory topics..."
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

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Categories
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Featured Articles */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Featured Articles
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_ARTICLES}
            renderItem={renderFeaturedArticle}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          />
        </View>

        {/* Recent Articles */}
        <View style={[styles.sectionContainer, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Articles
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={RECENT_ARTICLES}
            renderItem={renderRecentArticle}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable scrolling since we're inside a ScrollView
            contentContainerStyle={styles.recentContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  notificationButton: {
    padding: 5,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 15,
    borderRadius: 12,
    width: 100,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuredContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  featuredCard: {
    width: 280,
    height: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 15,
  },
  featuredCategory: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 5,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredAuthor: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  featuredReadTime: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  recentContainer: {
    paddingHorizontal: 20,
  },
  recentCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  lastItem: {
    marginBottom: 0,
  },
  recentImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  recentContent: {
    flex: 1,
    padding: 12,
  },
  recentCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 20,
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentReadTime: {
    fontSize: 12,
  },
  recentDate: {
    fontSize: 12,
  },
});

export default AdvisoryScreen;