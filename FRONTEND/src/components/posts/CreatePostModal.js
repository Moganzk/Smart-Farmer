import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { showMessage } from 'react-native-flash-message';

const CreatePostModal = ({ visible, onClose, onSubmit, groupId }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // State variables
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when modal is opened or closed
  useEffect(() => {
    if (!visible) {
      // Small delay to avoid visual glitches when closing
      setTimeout(() => {
        setContent('');
        setSelectedImages([]);
        setIsSubmitting(false);
      }, 300);
    }
  }, [visible]);
  
  // Pick images from gallery
  const pickImages = async () => {
    try {
      // Limit the number of selected images
      if (selectedImages.length >= 5) {
        showMessage({
          message: 'Image limit reached',
          description: 'You can upload a maximum of 5 images',
          type: 'warning',
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedImages.length,
      });
      
      if (!result.canceled && result.assets) {
        // Add new selected images while respecting the limit
        const newImages = result.assets.map(asset => asset.uri);
        const combinedImages = [...selectedImages, ...newImages];
        
        if (combinedImages.length > 5) {
          const limitedImages = combinedImages.slice(0, 5);
          setSelectedImages(limitedImages);
          showMessage({
            message: 'Image limit reached',
            description: 'Only the first 5 images have been added',
            type: 'info',
          });
        } else {
          setSelectedImages(combinedImages);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      showMessage({
        message: 'Image Selection Failed',
        description: 'There was a problem selecting images',
        type: 'danger',
      });
    }
  };
  
  // Take a photo with camera
  const takePhoto = async () => {
    try {
      // Limit the number of selected images
      if (selectedImages.length >= 5) {
        showMessage({
          message: 'Image limit reached',
          description: 'You can upload a maximum of 5 images',
          type: 'warning',
        });
        return;
      }
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        showMessage({
          message: 'Permission Required',
          description: 'Camera permission is needed to take photos',
          type: 'warning',
        });
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showMessage({
        message: 'Camera Error',
        description: 'There was a problem taking the photo',
        type: 'danger',
      });
    }
  };
  
  // Remove image
  const removeImage = (indexToRemove) => {
    setSelectedImages(selectedImages.filter((_, index) => index !== indexToRemove));
  };
  
  // Show media options
  const showMediaOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheet.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) {
            takePhoto();
          } else if (index === 2) {
            pickImages();
          }
        }
      );
    } else {
      // Android
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImages },
        ]
      );
    }
  };
  
  // Handle submit
  const handleSubmit = async () => {
    // Validate content
    if (!content.trim() && selectedImages.length === 0) {
      showMessage({
        message: 'Empty Post',
        description: 'Please add some text or images to your post',
        type: 'warning',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('content', content.trim());
      
      if (groupId) {
        formData.append('group_id', groupId);
      }
      
      // Add images if any
      selectedImages.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type,
        });
      });
      
      // Submit the post
      await onSubmit(formData);
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      showMessage({
        message: 'Failed to Create Post',
        description: error.message || 'Please try again later',
        type: 'danger',
      });
      setIsSubmitting(false);
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Create Post
          </Text>
          <TouchableOpacity 
            style={[
              styles.postButton,
              { 
                backgroundColor: 
                  (!content.trim() && selectedImages.length === 0) || isSubmitting
                    ? theme.colors.disabled
                    : theme.colors.primary
              }
            ]}
            onPress={handleSubmit}
            disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* User info */}
          <View style={styles.userInfo}>
            <Image
              source={{ uri: user.profile_image || 'https://via.placeholder.com/150' }}
              style={styles.userAvatar}
            />
            <View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user.full_name || user.username}
              </Text>
              {groupId && (
                <View style={[styles.postVisibility, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="people" size={12} color={theme.colors.primary} />
                  <Text style={[styles.postVisibilityText, { color: theme.colors.primary }]}>
                    Group Post
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Post content */}
          <TextInput
            style={[styles.contentInput, { color: theme.colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            maxLength={2000}
            textAlignVertical="top"
          />
          
          {/* Character count */}
          {content.length > 0 && (
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {content.length}/2000
            </Text>
          )}
          
          {/* Image preview */}
          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagePreviewScroll}
              >
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
        
        {/* Action buttons */}
        <View style={[styles.actionBar, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.addToPostText, { color: theme.colors.text }]}>
            Add to your post
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={pickImages}
              disabled={isSubmitting}
            >
              <Ionicons name="images" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={takePhoto}
              disabled={isSubmitting}
            >
              <Ionicons name="camera" size={24} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postVisibility: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  postVisibilityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  imagePreviewContainer: {
    marginTop: 16,
  },
  imagePreviewScroll: {
    paddingVertical: 8,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  addToPostText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default CreatePostModal;