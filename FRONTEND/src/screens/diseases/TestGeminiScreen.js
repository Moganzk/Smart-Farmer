import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import geminiService from '../../services/geminiService';
import { Button } from '../../components/common';

const TestGeminiScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };
  
  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await geminiService.analyzeImage(image);
      console.log('Gemini Response:', response);
      setResult(response);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'There was an error analyzing the image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const renderResult = () => {
    if (!result) return null;
    
    return (
      <View style={styles.resultContainer}>
        <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
          Analysis Result:
        </Text>
        
        <View style={[styles.resultCard, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.diseaseTitle, { color: theme.colors.primary }]}>
            {result.disease}
          </Text>
          
          {result.confidence !== undefined && (
            <Text style={{ color: theme.colors.text }}>
              Confidence: {result.confidence}%
            </Text>
          )}
          
          {result.severity && (
            <Text style={{ color: theme.colors.text, marginTop: 5 }}>
              Severity: {result.severity}
            </Text>
          )}
          
          <Text style={[styles.description, { color: theme.colors.text, marginTop: 15 }]}>
            {result.description}
          </Text>
          
          {Array.isArray(result.treatments) && result.treatments.length > 0 && (
            <View style={styles.treatmentsContainer}>
              <Text style={[styles.treatmentsTitle, { color: theme.colors.text }]}>
                Treatment Recommendations:
              </Text>
              {result.treatments.map((treatment, index) => (
                <View key={index} style={styles.treatmentItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={[styles.treatmentText, { color: theme.colors.text }]}>
                    {treatment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
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
          Test Gemini API
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity 
          style={[styles.imageContainer, { borderColor: theme.colors.border }]}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
                Select an image to analyze
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Button
          variant="primary"
          onPress={analyzeImage}
          loading={loading}
          style={styles.analyzeButton}
        >
          Analyze with Gemini API
        </Button>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: 10 }}>
              Analyzing image...
            </Text>
          </View>
        ) : renderResult()}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  analyzeButton: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  resultContainer: {
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  treatmentsContainer: {
    marginTop: 20,
  },
  treatmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default TestGeminiScreen;