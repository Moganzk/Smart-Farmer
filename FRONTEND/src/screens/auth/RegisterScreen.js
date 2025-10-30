import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { showMessage } from 'react-native-flash-message';

// Validation schema
const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Name too short')
    .max(50, 'Name too long')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,14}$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Za-z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*#?&]/, 'Password must contain at least one special character (@$!%*#?&)')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleRegister = async (values) => {
    setIsSubmitting(true);
    try {
      // Generate unique username from email
      const emailPrefix = values.email.split('@')[0];
      const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
      const username = `${emailPrefix}${timestamp}`; // e.g., john1234
      
      // Format phone number to international format (Kenyan +254)
      const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        // Remove all spaces, dashes, and parentheses
        let cleaned = phone.replace(/[\s\-\(\)]/g, '');
        // If starts with 0, replace with +254
        if (cleaned.startsWith('0')) {
          cleaned = '+254' + cleaned.substring(1);
        }
        // If doesn't start with +, add +254
        else if (!cleaned.startsWith('+')) {
          cleaned = '+254' + cleaned;
        }
        return cleaned;
      };
      
      // Format the data for the backend API
      const userData = {
        username: username,
        email: values.email,
        password: values.password,
        role: 'farmer',
        fullName: values.fullName,
        phoneNumber: formatPhoneNumber(values.phone),
        location: '', // Can be added later in profile
        preferredLanguage: 'en'
      };

      const result = await register(userData);
      
      if (result.success) {
        showMessage({
          message: 'Registration Successful',
          description: 'Welcome to Smart Farmer!',
          type: 'success',
        });
        // Navigation will be handled by AppNavigator based on auth state
      } else {
        showMessage({
          message: 'Registration Failed',
          description: result.error || 'Something went wrong. Please try again.',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Registration Failed',
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create an Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Join Smart Farmer and start farming smarter
        </Text>

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
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
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
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
                icon="lock-closed-outline"
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password}
                secureTextEntry={!passwordVisible}
                rightIcon={
                  passwordVisible ? 'eye-outline' : 'eye-off-outline'
                }
                onRightIconPress={() => setPasswordVisible(!passwordVisible)}
              />

              {values.password ? (
                <PasswordStrengthIndicator password={values.password} />
              ) : null}

              {values.password ? (
                <PasswordRequirements password={values.password} />
              ) : null}

              <CustomTextInput
                icon="lock-closed-outline"
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword}
                secureTextEntry={!confirmPasswordVisible}
                rightIcon={
                  confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'
                }
                onRightIconPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              />

              <CustomButton
                title="Register"
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={{ marginTop: 15 }}
              />
            </View>
          )}
        </Formik>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;