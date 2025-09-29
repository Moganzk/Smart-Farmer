import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import CustomButton from '../../components/common/CustomButton';

const DiseaseResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Get data from navigation params
  const { imageUri, results } = route.params || {};
  
  // Ensure treatments is always an array
  const treatments = Array.isArray(results?.treatments) 
    ? results.treatments 
    : (results?.treatments ? [results.treatments] : []);

  // State for UI interactions
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Save result to history
  useEffect(() => {
    // In a real app, you would save to local storage or database
    // This would be handled by a context or redux action
    const saveToHistory = async () => {
      try {
        // Example: saveResultToHistory(imageUri, results, new Date())
        console.log('Result saved to history');
      } catch (error) {
        console.error('Error saving result to history:', error);
      }
    };
    
    saveToHistory();
  }, [imageUri, results]);
  
  // Handle bookmark toggle
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
      const shareResult = await Share.share({
        message: `I've detected ${results.disease} on my plant using Smart Farmer. Here's what I found: ${results.description}`,
        url: imageUri,
      });
      
      if (shareResult.action === Share.sharedAction) {
        if (shareResult.activityType) {
          console.log('Shared with activity type:', shareResult.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      showMessage({
        message: 'Failed to share',
        description: 'There was a problem sharing this result.',
        type: 'danger',
      });
    }
  };
  
  // Handle learning more about the disease
  const learnMore = () => {
    // In a real app, you might navigate to a detailed article or open a web link
    Linking.openURL(`https://www.example.com/plant-diseases/${results.disease.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Detection Results
        </Text>
        <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? theme.colors.primary : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.resultImage} />
          ) : (
            <View 
              style={[
                styles.imagePlaceholder, 
                { backgroundColor: theme.colors.cardBackground }
              ]}
            >
              <Ionicons name="image-outline" size={60} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Result Summary Card */}
        <View 
          style={[
            styles.resultCard, 
            { backgroundColor: theme.colors.cardBackground }
          ]}
        >
          <View style={styles.resultHeader}>
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseTitle, { color: theme.colors.text }]}>
                {results?.disease || 'Unknown Disease'}
              </Text>
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                  Confidence:
                </Text>
                <View 
                  style={[
                    styles.confidenceBar, 
                    { backgroundColor: theme.colors.border }
                  ]}
                >
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { 
                        width: `${results?.confidence || 0}%`, 
                        backgroundColor: getConfidenceColor(results?.confidence || 0, theme) 
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.confidenceValue, { color: theme.colors.text }]}>
                  {results?.confidence?.toFixed(1) || 0}%
                </Text>
              </View>
            </View>
            <View 
              style={[
                styles.severityBadge, 
                { backgroundColor: getSeverityColor(results?.severity || 'Unknown', theme) }
              ]}
            >
              <Text style={styles.severityText}>
                {results?.severity || 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Disease Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
              {results?.description || 'No description available for this disease.'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Treatment Recommendations */}
          <View style={styles.treatmentSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommended Treatments
            </Text>
            {treatments && treatments.length > 0 ? (
              <View style={styles.treatmentList}>
                {treatments.map((treatment, index) => (
                  <View key={index} style={styles.treatmentItem}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={theme.colors.success} 
                    />
                    <Text 
                      style={[
                        styles.treatmentText, 
                        { color: theme.colors.text }
                      ]}
                    >
                      {treatment}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                No treatment recommendations available.
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <CustomButton
            title="Share Results"
            icon={<Ionicons name="share-social-outline" size={20} color="white" />}
            onPress={handleShare}
            style={{ marginBottom: 15 }}
          />
          <CustomButton
            title="Learn More"
            icon={<Ionicons name="information-circle-outline" size={20} color="white" />}
            type="secondary"
            onPress={learnMore}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Helper functions to get colors based on values
const getConfidenceColor = (confidence, theme) => {
  if (confidence >= 90) return theme.colors.success;
  if (confidence >= 70) return theme.colors.primary;
  if (confidence >= 50) return theme.colors.warning;
  return theme.colors.error;
};

const getSeverityColor = (severity, theme) => {
  switch (severity.toLowerCase()) {
    case 'low':
      return theme.colors.success;
    case 'moderate':
      return theme.colors.warning;
    case 'high':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageSection: {
    marginBottom: 20,
  },
  resultImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    width: 100,
    marginRight: 8,
  },
  confidenceFill: {
    height: 8,
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  severityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  severityText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  descriptionSection: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  treatmentSection: {
    marginBottom: 5,
  },
  treatmentList: {
    marginTop: 5,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  treatmentText: {
    fontSize: 16,
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    marginTop: 10,
  },
});

export default DiseaseResultScreen;