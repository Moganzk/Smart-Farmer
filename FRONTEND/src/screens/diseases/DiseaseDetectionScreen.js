import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../contexts/ThemeContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { Typography, Button, Card } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import geminiService from '../../services/geminiService';
import { LIMITS } from '../../constants/config';

const DiseaseDetectionScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { isConnected } = useNetwork();
  
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [selectedImage, setSelectedImage] = useState(null);
  const cameraRef = useRef(null);
  
  useEffect(() => {
    requestPermissions();
  }, []);
  
  const requestPermissions = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(cameraPermission.status === 'granted');
    
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasGalleryPermission(galleryPermission.status === 'granted');
    
    if (!cameraPermission.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to use the disease detection feature.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        setSelectedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };
  
  const pickImage = async () => {
    if (!hasGalleryPermission) {
      Alert.alert(
        'Gallery Permission Required',
        'Please grant gallery permission to select images.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  
  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };
  
  const clearImage = () => {
    setSelectedImage(null);
  };
  
  const validateImage = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (fileInfo.size > LIMITS.MAX_IMAGE_SIZE) {
        Alert.alert(
          'Image Too Large',
          `The selected image exceeds the maximum size of ${LIMITS.MAX_IMAGE_SIZE / (1024 * 1024)}MB. Please select a smaller image.`
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  };
  
  const detectDisease = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take or select a photo first.');
      return;
    }
    
    if (!isConnected) {
      Alert.alert(
        'Offline Mode',
        'You are currently offline. Disease detection requires an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const isValid = await validateImage(selectedImage);
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      // Use Gemini API to analyze the image
      const result = await geminiService.analyzeImage(selectedImage);
      
      // Save detection to history if backend is available
      try {
        // Create form data for the API request
        const formData = new FormData();
        
        // Get the file name from the URI
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri: Platform.OS === 'android' ? selectedImage : selectedImage.replace('file://', ''),
          name: filename,
          type,
        });
        
        formData.append('results', JSON.stringify(result));
        
        // Try to send the results to backend for storage, but don't block the UI
        apiService.diseases.detect(formData).catch(error => {
          console.log('Could not save to backend, but analysis completed:', error);
        });
      } catch (saveError) {
        console.log('Error saving to history:', saveError);
      }
      
      // Navigate to result screen with the detection data
      navigation.navigate('DiseaseResult', { 
        results: result,
        imageUri: selectedImage,
      });
    } catch (error) {
      console.error('Error detecting disease:', error);
      Alert.alert(
        'Detection Failed',
        'We could not analyze this image. Please try again with a clearer photo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (hasCameraPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  const renderCameraView = () => {
    if (hasCameraPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color={theme.colors.error} />
          <Typography variant="subtitle1" style={styles.permissionText}>
            No access to camera
          </Typography>
          <Typography variant="body2" style={styles.permissionSubtext}>
            Please grant camera permission in your device settings to use this feature.
          </Typography>
          <Button
            variant="primary"
            onPress={requestPermissions}
            style={styles.permissionButton}
          >
            Request Permission Again
          </Button>
        </View>
      );
    }
    
    return (
      <View style={styles.cameraContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        ) : (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}
            ratio="4:3"
          >
            <View style={styles.focusOverlay}>
              <View style={[styles.focusFrame, { borderColor: theme.colors.primary }]} />
            </View>
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse-outline" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={[styles.captureButtonInner, { borderColor: theme.colors.primary }]} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flash === Camera.Constants.FlashMode.off ? "flash-off-outline" : "flash-outline"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </Camera>
        )}
      </View>
    );
  };
  
  const renderInstructions = () => {
    return (
      <Card variant="outlined" style={styles.instructionsCard}>
        <Typography variant="subtitle1" color={theme.colors.primary} style={styles.instructionsTitle}>
          How to get the best results
        </Typography>
        
        <View style={styles.instructionItem}>
          <Ionicons name="sunny-outline" size={20} color={theme.colors.text} />
          <Typography variant="body2" style={styles.instructionText}>
            Take photos in good lighting
          </Typography>
        </View>
        
        <View style={styles.instructionItem}>
          <Ionicons name="leaf-outline" size={20} color={theme.colors.text} />
          <Typography variant="body2" style={styles.instructionText}>
            Focus on the affected area of the plant
          </Typography>
        </View>
        
        <View style={styles.instructionItem}>
          <Ionicons name="close-circle-outline" size={20} color={theme.colors.text} />
          <Typography variant="body2" style={styles.instructionText}>
            Avoid shadows and blurry images
          </Typography>
        </View>
      </Card>
    );
  };
  
  const renderActionButtons = () => {
    if (selectedImage) {
      return (
        <View style={styles.actionContainer}>
          <Button
            variant="outline"
            onPress={clearImage}
            style={styles.actionButton}
          >
            Retake Photo
          </Button>
          
          <Button
            variant="primary"
            onPress={detectDisease}
            loading={loading}
            style={styles.actionButton}
          >
            Analyze Photo
          </Button>
        </View>
      );
    }
    
    return (
      <View style={styles.actionContainer}>
        <Button
          variant="outline"
          onPress={pickImage}
          leftIcon={<Ionicons name="image-outline" size={20} color={theme.colors.primary} />}
          style={styles.actionButton}
        >
          Select from Gallery
        </Button>
        
        <Button
          variant="outline"
          onPress={() => navigation.navigate('DiseaseHistory')}
          leftIcon={<Ionicons name="time-outline" size={20} color={theme.colors.primary} />}
          style={styles.actionButton}
        >
          View History
        </Button>
        
        <Button
          variant="outline"
          onPress={() => navigation.navigate('TestGemini')}
          leftIcon={<Ionicons name="flask-outline" size={20} color={theme.colors.primary} />}
          style={styles.actionButton}
        >
          Test Gemini API
        </Button>
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
        <Typography variant="h3">Disease Detection</Typography>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCameraView()}
        {renderInstructions()}
        {renderActionButtons()}
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  cameraContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectedImage: {
    flex: 1,
    borderRadius: 12,
  },
  focusOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderRadius: 12,
    opacity: 0.7,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    backgroundColor: 'white',
  },
  permissionContainer: {
    height: 400,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  permissionText: {
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    marginTop: 16,
  },
  instructionsCard: {
    marginBottom: 24,
  },
  instructionsTitle: {
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    marginLeft: 12,
  },
  actionContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default DiseaseDetectionScreen;