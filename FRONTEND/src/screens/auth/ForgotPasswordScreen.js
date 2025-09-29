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
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import { showMessage } from 'react-native-flash-message';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { requestPasswordReset } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (values) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      showMessage({
        message: 'Reset Link Sent',
        description: 'Please check your email for password reset instructions.',
        type: 'success',
      });
      navigation.navigate('Login');
    } catch (error) {
      showMessage({
        message: 'Request Failed',
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
          Forgot Password
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your email address to receive a password reset link
        </Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
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
                icon="mail-outline"
                placeholder="Email Address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomButton
                title="Send Reset Link"
                onPress={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={{ marginTop: 20 }}
              />
            </View>
          )}
        </Formik>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Remember your password?{' '}
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
    marginTop: 80,
    marginBottom: 30,
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

export default ForgotPasswordScreen;