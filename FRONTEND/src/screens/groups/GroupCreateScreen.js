import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const GroupCreateScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [groupImage, setGroupImage] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Handle image picker
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload a group image.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setGroupImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showMessage({
        message: 'Image Selection Failed',
        description: 'There was a problem selecting your image',
        type: 'danger',
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      const formErrors = {};
      
      if (!name.trim()) {
        formErrors.name = 'Group name is required';
      } else if (name.length < 3) {
        formErrors.name = 'Group name must be at least 3 characters';
      }
      
      if (!description.trim()) {
        formErrors.description = 'Description is required';
      }
      
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }
      
      setIsLoading(true);
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('is_public', isPublic);
      
      if (location) {
        formData.append('location', location);
      }
      
      if (groupImage) {
        const filename = groupImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('image', {
          uri: groupImage,
          name: filename,
          type,
        });
      }
      
      // Create group
      const response = await apiService.groups.create(formData);
      
      setIsLoading(false);
      
      // Show success message
      showMessage({
        message: 'Group Created!',
        description: 'Your group has been created successfully',
        type: 'success',
      });
      
      // Navigate to the new group
      navigation.navigate('GroupDetail', { 
        groupId: response.data.id,
        group: response.data
      });
      
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating group:', error);
      
      // Show error message
      showMessage({
        message: 'Failed to Create Group',
        description: error.response?.data?.message || 'Please check your inputs and try again',
        type: 'danger',
      });
    }
  };
  
  // Reset form
  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setName('');
            setDescription('');
            setLocation('');
            setIsPublic(true);
            setGroupImage(null);
            setErrors({});
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
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
            Create Group
          </Text>
          <View style={styles.placeholderView} />
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Group Image Picker */}
          <TouchableOpacity 
            style={[styles.imagePickerContainer, { backgroundColor: theme.colors.cardBackground }]}
            onPress={pickImage}
          >
            {groupImage ? (
              <Image source={{ uri: groupImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={50} color={theme.colors.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
                  Tap to add a group image
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Group Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Group Name*
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: errors.name ? theme.colors.error : theme.colors.border
                  }
                ]}
                placeholder="Enter group name"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({...errors, name: null});
                  }
                }}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.name}
                </Text>
              )}
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Description*
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: errors.description ? theme.colors.error : theme.colors.border
                  }
                ]}
                placeholder="Describe what your group is about"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) {
                    setErrors({...errors, description: null});
                  }
                }}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.description}
                </Text>
              )}
            </View>
            
            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Location (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                placeholder="Enter location (e.g., district, region)"
                placeholderTextColor={theme.colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            
            {/* Privacy Setting */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Privacy Setting
              </Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    isPublic && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => setIsPublic(true)}
                >
                  <Ionicons
                    name="globe-outline"
                    size={24}
                    color={isPublic ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text 
                    style={[
                      styles.optionText,
                      { color: isPublic ? theme.colors.primary : theme.colors.text }
                    ]}
                  >
                    Public
                  </Text>
                  <Text 
                    style={[
                      styles.optionDescription,
                      { color: theme.colors.textSecondary }
                    ]}
                  >
                    Anyone can find and join
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.optionButton,
                    !isPublic && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => setIsPublic(false)}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color={!isPublic ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text 
                    style={[
                      styles.optionText,
                      { color: !isPublic ? theme.colors.primary : theme.colors.text }
                    ]}
                  >
                    Private
                  </Text>
                  <Text 
                    style={[
                      styles.optionDescription,
                      { color: theme.colors.textSecondary }
                    ]}
                  >
                    Invitation only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[
                  styles.resetButton,
                  { borderColor: theme.colors.border }
                ]}
                onPress={handleReset}
              >
                <Text style={[styles.resetButtonText, { color: theme.colors.text }]}>
                  Reset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>
                    Create Group
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Guidelines */}
            <View style={[styles.guidelinesContainer, { backgroundColor: theme.colors.infoLight }]}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.info} />
              <Text style={[styles.guidelinesText, { color: theme.colors.info }]}>
                Groups must follow community guidelines. Inappropriate content may result in group removal.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderView: {
    width: 34, // Same as backButton width
  },
  scrollView: {
    flex: 1,
  },
  imagePickerContainer: {
    height: 180,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 5,
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guidelinesContainer: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  guidelinesText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default GroupCreateScreen;