import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { GroupService } from '../services/groupService';

/**
 * Create Group Screen
 * 
 * Form to create a new farmer group
 */
const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Check if tag already exists
    if (formData.tags.includes(tagInput.trim().toLowerCase())) {
      setErrors({
        ...errors,
        tags: 'Tag already added'
      });
      return;
    }
    
    // Add tag
    const newTags = [...formData.tags, tagInput.trim().toLowerCase()];
    setFormData({
      ...formData,
      tags: newTags
    });
    setTagInput('');
    
    // Clear tag error if exists
    if (errors.tags) {
      setErrors({
        ...errors,
        tags: null
      });
    }
  };

  // Remove tag
  const handleRemoveTag = (index) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Group name cannot exceed 50 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    return newErrors;
  };

  // Submit form
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to create group
      const newGroup = await GroupService.createGroup({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      // Add tags if any
      if (formData.tags.length > 0) {
        await GroupService.addTags(newGroup.group_id, formData.tags);
      }
      
      // Navigate to group detail
      navigation.replace('GroupDetail', { groupId: newGroup.group_id });
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Group Name*
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: errors.name ? theme.colors.error : theme.colors.border
              }
            ]}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter group name (3-50 characters)"
            placeholderTextColor={theme.colors.textLight}
            maxLength={50}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.name}
            </Text>
          )}
          <Text style={[styles.characterCount, { color: theme.colors.textLight }]}>
            {formData.name.length}/50
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: errors.description ? theme.colors.error : theme.colors.border
              }
            ]}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Describe your group (optional)"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          {errors.description && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.description}
            </Text>
          )}
          <Text style={[styles.characterCount, { color: theme.colors.textLight }]}>
            {formData.description.length}/500
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Tags
          </Text>
          <View style={[
            styles.tagInputContainer,
            { 
              backgroundColor: theme.colors.card,
              borderColor: errors.tags ? theme.colors.error : theme.colors.border
            }
          ]}>
            <TextInput
              style={[styles.tagInput, { color: theme.colors.text }]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tags (e.g., maize, irrigation)"
              placeholderTextColor={theme.colors.textLight}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {errors.tags && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.tags}
            </Text>
          )}
          
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <View 
                key={index}
                style={[styles.tag, { backgroundColor: theme.colors.tagBackground }]}
              >
                <Text style={[styles.tagText, { color: theme.colors.tagText }]}>
                  {tag}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveTag(index)} style={styles.removeTagButton}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.tagText} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  tagInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  addTagButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CreateGroupScreen;