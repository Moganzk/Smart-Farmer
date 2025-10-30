import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import { showMessage } from 'react-native-flash-message';

// Validation schema
const ProfileEditSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Name too short')
    .max(50, 'Name too long')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,14}$/, 'Invalid phone number')
    .nullable()
    .notRequired(),
  location: Yup.string().nullable().notRequired(),
  farmSize: Yup.string().nullable().notRequired(),
  preferredCrops: Yup.string().nullable().notRequired(),
});

const ProfileEditScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock user data if needed - handle both 'name' and 'fullName' fields
  const userData = {
    fullName: user?.name || user?.fullName || 'John Doe',
    email: user?.email || 'user@example.com',
    phone: user?.phone || '',
    profileImage: user?.profileImage || user?.profile_image || null,
    location: user?.location || '',
    joinedDate: user?.joinedDate || user?.created_at || new Date().toISOString(),
    farmSize: user?.farmSize || user?.farm_size || '',
    preferredCrops: user?.preferredCrops || user?.preferred_crops || '',
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need camera roll permissions to update your profile image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showMessage({
        message: 'Image Selection Failed',
        description: 'There was a problem selecting your image. Please try again.',
        type: 'danger',
      });
    }
  };

  const handleUpdateProfile = async (values) => {
    setIsSubmitting(true);
    try {
      // Split the comma-separated crops string into an array
      const preferredCropsArray = values.preferredCrops && values.preferredCrops.trim()
        ? values.preferredCrops
            .split(',')
            .map(crop => crop.trim())
            .filter(crop => crop)
        : [];

      // Prepare updated user data
      const updatedUserData = {
        ...values,
        profileImage,
        preferredCrops: preferredCropsArray,
      };

      // Call updateProfile function from AuthContext
      await updateProfile(updatedUserData);
      
      showMessage({
        message: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        type: 'success',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage({
        message: 'Update Failed',
        description: error.message || 'Something went wrong. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.profileImageSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.profileImagePlaceholderText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {userData.fullName && userData.fullName.trim()
                    ? userData.fullName
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.cameraIcon,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
            Change Photo
          </Text>
        </View>

        <Formik
          initialValues={{
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            location: userData.location || '',
            farmSize: userData.farmSize || '',
            preferredCrops: Array.isArray(userData.preferredCrops) 
              ? userData.preferredCrops.join(', ')
              : (userData.preferredCrops || ''),
          }}
          validationSchema={ProfileEditSchema}
          onSubmit={handleUpdateProfile}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.formContainer}>
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Personal Information
                </Text>

                <CustomTextInput
                  icon="person-outline"
                  placeholder="Full Name"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName && errors.fullName}
                  autoCapitalize="words"
                />

                <CustomTextInput
                  icon="mail-outline"
                  placeholder="Email Address"
                  value={userData.email}
                  editable={false}
                  style={{ opacity: 0.7 }}
                />

                <CustomTextInput
                  icon="call-outline"
                  placeholder="Phone Number"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone && errors.phone}
                  keyboardType="phone-pad"
                />

                <CustomTextInput
                  icon="location-outline"
                  placeholder="Location"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  error={touched.location && errors.location}
                />
              </View>

              <View
                style={[
                  styles.formCard,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Farm Information
                </Text>

                <CustomTextInput
                  icon="resize-outline"
                  placeholder="Farm Size (e.g., 5 acres)"
                  value={values.farmSize}
                  onChangeText={handleChange('farmSize')}
                  onBlur={handleBlur('farmSize')}
                  error={touched.farmSize && errors.farmSize}
                />

                <CustomTextInput
                  icon="leaf-outline"
                  placeholder="Preferred Crops (comma separated)"
                  value={values.preferredCrops}
                  onChangeText={handleChange('preferredCrops')}
                  onBlur={handleBlur('preferredCrops')}
                  error={touched.preferredCrops && errors.preferredCrops}
                />
              </View>

              <CustomButton
                title="Update Profile"
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={{ marginTop: 20, marginHorizontal: 20 }}
              />
            </View>
          )}
        </Formik>
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
  placeholder: {
    width: 34,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 30,
  },
  formCard: {
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default ProfileEditScreen;