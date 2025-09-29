import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

// Mock search results
const SEARCH_RESULTS = {
  'organic': [
    {
      id: '1',
      title: 'Best Practices for Organic Farming',
      category: 'Crop Management',
      image: 'https://example.com/organic-farming.jpg',
      excerpt: 'Learn about the latest organic farming techniques that can improve your yield while maintaining soil health...',
    },
    {
      id: '2',
      title: 'Organic Pest Control Methods',
      category: 'Pest Control',
      image: 'https://example.com/pest-control.jpg',
      excerpt: 'Discover natural ways to keep pests away from your crops without using harmful chemicals...',
    },
    {
      id: '3',
      title: 'Organic Certification Process',
      category: 'Market Trends',
      image: 'https://example.com/certification.jpg',
      excerpt: 'A step-by-step guide to getting your farm certified organic and increasing your market value...',
    },
  ],
  'water': [
    {
      id: '4',
      title: 'Water Conservation Techniques',
      category: 'Water Management',
      image: 'https://example.com/water-conservation.jpg',
      excerpt: 'Innovative methods to reduce water usage while maintaining optimal crop growth...',
    },
    {
      id: '5',
      title: 'Drip Irrigation Systems',
      category: 'Water Management',
      image: 'https://example.com/drip-irrigation.jpg',
      excerpt: 'How to set up and maintain efficient drip irrigation systems for your farm...',
    },
  ],
  'soil': [
    {
      id: '6',
      title: 'Understanding Soil pH',
      category: 'Soil Health',
      image: 'https://example.com/soil-ph.jpg',
      excerpt: 'How soil pH affects plant growth and techniques to optimize it for different crops...',
    },
    {
      id: '7',
      title: 'Natural Soil Amendments',
      category: 'Soil Health',
      image: 'https://example.com/soil-amendments.jpg',
      excerpt: 'Using compost, cover crops, and other natural methods to improve soil fertility...',
    },
    {
      id: '8',
      title: 'Soil Testing Guide',
      category: 'Soil Health',
      image: 'https://example.com/soil-testing.jpg',
      excerpt: 'A comprehensive guide to testing your soil and interpreting the results...',
    },
  ],
};

// Common search suggestions
const SEARCH_SUGGESTIONS = [
  'Organic farming',
  'Pest control',
  'Water management',
  'Soil health',
  'Crop rotation',
  'Seasonal planting',
  'Market prices',
  'Weather forecasting',
];

const AdvisorySearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  
  // Initial query from route params if available
  const initialQuery = route.params?.query || '';
  
  // State variables
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(!initialQuery);
  const [recentSearches, setRecentSearches] = useState([
    'Tomato diseases',
    'Rice cultivation',
    'Organic fertilizers',
  ]);
  
  // Filter suggestions based on current query
  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(suggestion => 
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Search function
  const performSearch = (query) => {
    setIsLoading(true);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    // Simulate API call delay
    setTimeout(() => {
      // Check if we have mock results for this query
      const searchTerms = Object.keys(SEARCH_RESULTS);
      const matchedTerm = searchTerms.find(term => 
        query.toLowerCase().includes(term.toLowerCase())
      );
      
      if (matchedTerm) {
        setResults(SEARCH_RESULTS[matchedTerm]);
      } else {
        setResults([]);
      }
      
      // Add to recent searches if not already there
      if (query.trim() && !recentSearches.includes(query.trim())) {
        setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle search when query is provided from route params
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);
  
  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(true);
    setResults([]);
  };
  
  // Navigate to article detail
  const navigateToDetail = (article) => {
    navigation.navigate('AdvisoryDetail', { article });
  };
  
  // Render search result item
  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.colors.cardBackground }]}
      onPress={() => navigateToDetail(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.resultImage}
        defaultSource={require('../../assets/placeholder-image.png')}
      />
      <View style={styles.resultContent}>
        <Text style={[styles.resultCategory, { color: theme.colors.primary }]}>
          {item.category}
        </Text>
        <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text 
          style={[styles.resultExcerpt, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.excerpt}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render empty result message
  const renderEmptyResult = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={60} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Results Found
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        We couldn't find any articles matching "{searchQuery}".
        Try using different keywords or check out our suggested topics.
      </Text>
    </View>
  );
  
  // Render suggestion item
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { borderBottomColor: theme.colors.border }
      ]}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
      <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );
  
  // Render recent search item
  const renderRecentSearchItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.recentItem,
        { borderBottomColor: theme.colors.border }
      ]}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
      <Text style={[styles.recentText, { color: theme.colors.text }]}>
        {item}
      </Text>
      <TouchableOpacity
        style={styles.recentDeleteButton}
        onPress={() => setRecentSearches(prev => prev.filter(search => search !== item))}
      >
        <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with search bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchBar, { backgroundColor: theme.colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search for advisory topics..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === '') {
                setShowSuggestions(true);
              }
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={!initialQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Search suggestions */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {recentSearches.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={[styles.clearText, { color: theme.colors.primary }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearchItem}
                keyExtractor={(item, index) => `recent-${index}`}
              />
            </>
          )}
          
          {searchQuery.length > 0 && filteredSuggestions.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Suggested Topics
                </Text>
              </View>
              <FlatList
                data={filteredSuggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item, index) => `suggestion-${index}`}
              />
            </>
          )}
        </View>
      )}
      
      {/* Search results */}
      {!showSuggestions && (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Searching...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsText, { color: theme.colors.text }]}>
                  {results.length > 0 
                    ? `Found ${results.length} results for "${searchQuery}"` 
                    : 'No results found'}
                </Text>
              </View>
              
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.resultsList}
                ListEmptyComponent={renderEmptyResult}
                showsVerticalScrollIndicator={false}
              />
            </>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  suggestionText: {
    marginLeft: 15,
    fontSize: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  recentText: {
    marginLeft: 15,
    fontSize: 16,
    flex: 1,
  },
  recentDeleteButton: {
    padding: 5,
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
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsList: {
    padding: 15,
    paddingBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  resultImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  resultContent: {
    flex: 1,
    padding: 12,
  },
  resultCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultExcerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
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

export default AdvisorySearchScreen;