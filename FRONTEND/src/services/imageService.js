/**
 * Image Service for Smart Farmer App
 * Handles fetching and uploading images to/from the database
 */
import api from './api';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Get image URI for an app image
 * @param {String} imageKey - The unique key for the image
 * @returns {String} - The URI to access the image
 */
export const getAppImageUri = (imageKey) => {
  return `${api.defaults.baseURL}/api/images/${imageKey}`;
};

/**
 * Get profile image URI for a user
 * @param {Number} userId - The user ID
 * @returns {String} - The URI to access the profile image
 */
export const getProfileImageUri = (userId) => {
  return `${api.defaults.baseURL}/api/images/profile/${userId}`;
};

/**
 * Get disease detection image URI
 * @param {Number} detectionId - The detection ID
 * @returns {String} - The URI to access the detection image
 */
export const getDetectionImageUri = (detectionId) => {
  return `${api.defaults.baseURL}/api/images/detection/${detectionId}`;
};

/**
 * Upload a profile image to the database
 * @param {String} imageUri - Local URI to the image file
 * @returns {Promise} - Result of the upload operation
 */
export const uploadProfileImage = async (imageUri) => {
  try {
    // Resize image before upload to reduce size
    const resizedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 500, height: 500 } }],
      { compress: 0.7, format: 'jpeg' }
    );
    
    // Create form data for the upload
    const formData = new FormData();
    
    // Get file name and type
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append the image to the form
    formData.append('profileImage', {
      uri: resizedImage.uri,
      name: filename,
      type
    });
    
    // Upload the image
    const response = await api.post('/api/images/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Upload a disease detection image
 * @param {String} imageUri - Local URI to the image file
 * @returns {Promise} - Result of the upload with detection ID
 */
export const uploadDetectionImage = async (imageUri) => {
  try {
    // Create form data for the upload
    const formData = new FormData();
    
    // Get file name and type
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append the image to the form
    formData.append('detectionImage', {
      uri: imageUri,
      name: filename,
      type
    });
    
    // Upload the image
    const response = await api.post('/api/images/detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading detection image:', error);
    throw error;
  }
};

/**
 * Pick an image from the device gallery
 * @returns {Promise<String>} - URI to the selected image
 */
export const pickImage = async () => {
  try {
    // Request permission to access the gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }
    
    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (result.canceled) {
      throw new Error('Image picking was cancelled');
    }
    
    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Take a photo with the camera
 * @returns {Promise<String>} - URI to the captured photo
 */
export const takePhoto = async () => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access camera was denied');
    }
    
    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (result.canceled) {
      throw new Error('Photo capture was cancelled');
    }
    
    return result.assets[0].uri;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
};

/**
 * Preload app images for better user experience
 * @param {Array} imageKeys - List of image keys to preload
 * @returns {Promise<Object>} - Object mapping keys to local URIs
 */
export const preloadAppImages = async (imageKeys = []) => {
  const imageCache = {};
  
  try {
    // Create cache directory if it doesn't exist
    const cacheDir = `${FileSystem.cacheDirectory}app-images/`;
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }
    
    // Preload each image
    await Promise.all(
      imageKeys.map(async (key) => {
        const cacheFilePath = `${cacheDir}${key}.jpg`;
        const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
        
        // If not cached, download it
        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(
            getAppImageUri(key),
            cacheFilePath
          );
        }
        
        // Store local URI in cache object
        imageCache[key] = cacheFilePath;
      })
    );
    
    return imageCache;
  } catch (error) {
    console.error('Error preloading app images:', error);
    return {};
  }
};

export default {
  getAppImageUri,
  getProfileImageUri,
  getDetectionImageUri,
  uploadProfileImage,
  uploadDetectionImage,
  pickImage,
  takePhoto,
  preloadAppImages
};