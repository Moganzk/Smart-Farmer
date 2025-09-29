import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const GroupEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Get group data from route params
  const { groupId } = route.params || {};
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [topics, setTopics] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [imageUri, setImageUri] = useState(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        const { data } = await apiService.groups.getDetails(groupId);
        
        setGroupName(data.name || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setTopics(data.topics ? data.topics.join(', ') : '');
        setVisibility(data.visibility || 'public');
        setImageUri(data.image || null);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching group details:', error);
        showMessage({
          message: 'Failed to load group details',
          description: error.response?.data?.message || 'Please try again later',
          type: 'danger',
        });
        navigation.goBack();
      }
    };
    
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);
  
  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setIsImageChanged(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showMessage({
        message: 'Image Selection Failed',
        description: 'There was a problem selecting the image',
        type: 'danger',
      });
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    try {
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
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setIsImageChanged(true);
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
  
  // Remove current image
  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove the group image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setImageUri(null);
            setIsImageChanged(true);
          }
        },
      ]
    );
  };
  
  // Show image options
  const showImageOptions = () => {
    Alert.alert(
      'Group Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        imageUri ? { text: 'Remove Image', style: 'destructive', onPress: removeImage } : null,
      ].filter(Boolean)
    );
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Group description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save group changes
  const handleSave = async () => {
    if (!validateForm()) {
      showMessage({
        message: 'Validation Error',
        description: 'Please fix the errors in the form',
        type: 'warning',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', groupName.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      
      // Handle topics (convert comma-separated string to array)
      const topicsArray = topics
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);
        
      formData.append('topics', JSON.stringify(topicsArray));
      formData.append('visibility', visibility);
      
      // Add image if changed
      if (isImageChanged) {
        if (imageUri) {
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
          });
        } else {
          formData.append('removeImage', 'true');
        }
      }
      
      // Update group
      await apiService.groups.update(groupId, formData);
      
      showMessage({
        message: 'Group Updated',
        description: 'Group details saved successfully',
        type: 'success',
      });
      
      // Navigate back to group details
      navigation.navigate('GroupDetail', { groupId, refresh: true });
    } catch (error) {
      console.error('Error updating group:', error);
      showMessage({
        message: 'Update Failed',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Confirm discard changes
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };
  
  // Delete group confirmation
  const confirmDelete = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to permanently delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: handleDelete 
        },
      ]
    );
  };
  
  // Delete group
  const handleDelete = async () => {
    setIsSaving(true);
    
    try {
      await apiService.groups.delete(groupId);
      
      showMessage({
        message: 'Group Deleted',
        description: 'The group has been permanently deleted',
        type: 'success',
      });
      
      // Navigate back to groups list
      navigation.navigate('Groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      showMessage({
        message: 'Delete Failed',
        description: error.response?.data?.message || 'Please try again later',
        type: 'danger',
      });
      setIsSaving(false);
    }
  };
  
  // Render loading indicator
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Edit Group
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading group details...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Edit Group
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveButton, { color: theme.colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Group Image */}
        <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.groupImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.border }]}>
              <Ionicons name="people" size={60} color={theme.colors.textSecondary} />
              <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                Add Group Image
              </Text>
            </View>
          )}
          <View style={styles.imageOverlay}>
            <View style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="camera" size={18} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Group Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Group Name*
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: errors.groupName ? theme.colors.error : theme.colors.inputBackground
                }
              ]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
            {errors.groupName && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.groupName}
              </Text>
            )}
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {groupName.length}/50
            </Text>
          </View>
          
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Description*
            </Text>
            <TextInput
              style={[
                styles.textarea, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: errors.description ? theme.colors.error : theme.colors.inputBackground
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what your group is about"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.description}
              </Text>
            )}
            <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
              {description.length}/500
            </Text>
          </View>
          
          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Location
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                }
              ]}
              value={location}
              onChangeText={setLocation}
              placeholder="Add a location (optional)"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          
          {/* Topics */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Topics
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                }
              ]}
              value={topics}
              onChangeText={setTopics}
              placeholder="Add topics separated by commas (optional)"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Example: Farming, Livestock, Organic Crops
            </Text>
          </View>
          
          {/* Visibility */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Group Visibility
            </Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  { 
                    backgroundColor: visibility === 'public' 
                      ? theme.colors.primaryLight 
                      : theme.colors.inputBackground
                  }
                ]}
                onPress={() => setVisibility('public')}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={24} 
                  color={visibility === 'public' ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <View style={styles.visibilityTextContainer}>
                  <Text 
                    style={[
                      styles.visibilityTitle, 
                      { 
                        color: visibility === 'public' 
                          ? theme.colors.primary 
                          : theme.colors.text 
                      }
                    ]}
                  >
                    Public
                  </Text>
                  <Text 
                    style={[styles.visibilityDescription, { color: theme.colors.textSecondary }]}
                  >
                    Anyone can find and join
                  </Text>
                </View>
                {visibility === 'public' && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  { 
                    backgroundColor: visibility === 'private' 
                      ? theme.colors.primaryLight 
                      : theme.colors.inputBackground
                  }
                ]}
                onPress={() => setVisibility('private')}
              >
                <Ionicons 
                  name="lock-closed-outline" 
                  size={24} 
                  color={visibility === 'private' ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <View style={styles.visibilityTextContainer}>
                  <Text 
                    style={[
                      styles.visibilityTitle, 
                      { 
                        color: visibility === 'private' 
                          ? theme.colors.primary 
                          : theme.colors.text 
                      }
                    ]}
                  >
                    Private
                  </Text>
                  <Text 
                    style={[styles.visibilityDescription, { color: theme.colors.textSecondary }]}
                  >
                    Only invited members can join
                  </Text>
                </View>
                {visibility === 'private' && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Delete Group */}
          <View style={styles.dangerZone}>
            <Text style={[styles.dangerZoneTitle, { color: theme.colors.error }]}>
              Danger Zone
            </Text>
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: theme.colors.errorLight }]}
              onPress={confirmDelete}
              disabled={isSaving}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>
                Delete This Group
              </Text>
            </TouchableOpacity>
            <Text style={[styles.dangerZoneText, { color: theme.colors.textSecondary }]}>
              This action cannot be undone. All group data, posts, and messages will be permanently deleted.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    marginBottom: 20,
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textarea: {
    height: 120,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  visibilityOptions: {
    marginTop: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  visibilityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  visibilityDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerZoneText: {
    fontSize: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default GroupEditScreen;