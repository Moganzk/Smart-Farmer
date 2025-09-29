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
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import CustomButton from '../../components/common/CustomButton';

// Mocked data for demonstration purposes
// In a real app, this would come from local storage, context API, or backend
const mockHistoryData = [
  {
    id: '1',
    imageUri: 'https://example.com/plant-image1.jpg',
    disease: 'Late Blight',
    confidence: 92.5,
    date: new Date(Date.now() - 86400000), // 1 day ago
    severity: 'High',
    bookmarked: true,
  },
  {
    id: '2',
    imageUri: 'https://example.com/plant-image2.jpg',
    disease: 'Powdery Mildew',
    confidence: 87.3,
    date: new Date(Date.now() - 172800000), // 2 days ago
    severity: 'Moderate',
    bookmarked: false,
  },
  {
    id: '3',
    imageUri: 'https://example.com/plant-image3.jpg',
    disease: 'Leaf Spot',
    confidence: 78.9,
    date: new Date(Date.now() - 259200000), // 3 days ago
    severity: 'Low',
    bookmarked: true,
  },
  {
    id: '4',
    imageUri: 'https://example.com/plant-image4.jpg',
    disease: 'Healthy Plant',
    confidence: 95.2,
    date: new Date(Date.now() - 345600000), // 4 days ago
    severity: 'None',
    bookmarked: false,
  },
  {
    id: '5',
    imageUri: 'https://example.com/plant-image5.jpg',
    disease: 'Rust',
    confidence: 83.7,
    date: new Date(Date.now() - 432000000), // 5 days ago
    severity: 'Moderate',
    bookmarked: false,
  },
];

const DiseaseHistoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State variables
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'bookmarked'
  
  // Load history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        // In a real app, you would fetch data from storage or API
        // Example: const data = await AsyncStorage.getItem('diseaseHistory');
        
        // Using mock data for demonstration
        setTimeout(() => {
          setHistoryData(mockHistoryData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
        showMessage({
          message: 'Failed to load history',
          description: 'There was a problem loading your detection history.',
          type: 'danger',
        });
      }
    };
    
    fetchHistoryData();
  }, []);
  
  // Filter data based on current filter mode
  const filteredData = filterMode === 'all' 
    ? historyData 
    : historyData.filter(item => item.bookmarked);
    
  // Handle toggling bookmark status
  const toggleBookmark = (id) => {
    setHistoryData(prevData => 
      prevData.map(item => 
        item.id === id 
          ? {...item, bookmarked: !item.bookmarked} 
          : item
      )
    );
  };
  
  // Handle deletion of history item
  const deleteHistoryItem = (id) => {
    setHistoryData(prevData => prevData.filter(item => item.id !== id));
    showMessage({
      message: 'Record deleted',
      description: 'The detection record has been removed from history.',
      type: 'info',
    });
  };
  
  // Navigate to detailed result view
  const viewDetails = (item) => {
    navigation.navigate('DiseaseResult', {
      imageUri: item.imageUri,
      results: {
        disease: item.disease,
        confidence: item.confidence,
        severity: item.severity,
        description: 'This is a historical record of a previously detected disease.',
        treatments: [
          'Refer to the original detection for treatment details',
          'Consider updating the diagnosis if the condition has changed',
        ],
      },
    });
  };
  
  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    }
  };
  
  // Get severity color based on severity level
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return theme.colors.error;
      case 'moderate':
        return theme.colors.warning;
      case 'low':
        return theme.colors.primary;
      case 'none':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };
  
  // Render each history item
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyCard, { backgroundColor: theme.colors.cardBackground }]}
      onPress={() => viewDetails(item)}
    >
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.historyImage}
        defaultSource={require('../../assets/placeholder-image.png')}
      />
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <Text style={[styles.diseaseName, { color: theme.colors.text }]}>
            {item.disease}
          </Text>
          <TouchableOpacity
            onPress={() => toggleBookmark(item.id)}
            style={styles.bookmarkButton}
          >
            <Ionicons 
              name={item.bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={item.bookmarked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {item.confidence.toFixed(1)}% Confidence
            </Text>
          </View>
          <View 
            style={[
              styles.severityBadge, 
              { backgroundColor: getSeverityColor(item.severity) }
            ]}
          >
            <Text style={styles.severityText}>{item.severity}</Text>
          </View>
        </View>
        
        <View style={styles.historyFooter}>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
          <TouchableOpacity
            onPress={() => deleteHistoryItem(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons 
              name="trash-outline"
              size={18}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render empty state when no history is available
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons 
        name="leaf-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
        No Detection History
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
        {filterMode === 'all' 
          ? 'You haven\'t performed any disease detection yet.' 
          : 'You haven\'t bookmarked any detection results yet.'}
      </Text>
      <CustomButton
        title="Start Detection"
        icon={<Ionicons name="camera-outline" size={20} color="white" />}
        onPress={() => navigation.navigate('DiseaseDetection')}
        style={styles.emptyStateButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Detection History
        </Text>
      </View>
      
      {/* Filter Toggle */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMode === 'all' && [styles.activeFilterButton, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilterMode('all')}
        >
          <Text 
            style={[
              styles.filterText, 
              filterMode === 'all' && [styles.activeFilterText, { color: theme.colors.primary }]
            ]}
          >
            All Records
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterMode === 'bookmarked' && [styles.activeFilterButton, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => setFilterMode('bookmarked')}
        >
          <Ionicons 
            name="bookmark" 
            size={16} 
            color={filterMode === 'bookmarked' ? theme.colors.primary : theme.colors.textSecondary} 
            style={styles.filterIcon}
          />
          <Text 
            style={[
              styles.filterText, 
              filterMode === 'bookmarked' && [styles.activeFilterText, { color: theme.colors.primary }]
            ]}
          >
            Bookmarked
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  activeFilterButton: {
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
  },
  activeFilterText: {
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  historyContent: {
    flex: 1,
    padding: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  bookmarkButton: {
    padding: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '500',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
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
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  emptyStateButton: {
    width: 200,
  },
});

export default DiseaseHistoryScreen;