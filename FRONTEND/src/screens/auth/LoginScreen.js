import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Button, Input } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { ERROR_MESSAGES } from '../../constants/config';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();
  
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
    
    // Clear error when typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }
    
    if (!form.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(form.email, form.password);
    } catch (error) {
      Alert.alert('Login Failed', error.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Typography variant="h1" color={theme.colors.primary} style={styles.title}>
            Smart Farmer
          </Typography>
          <Typography variant="subtitle2" style={styles.subtitle}>
            Login to your account
          </Typography>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
            }
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChangeText={(value) => handleChange('password', value)}
            secure
            leftIcon={
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
            }
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Typography
              variant="body2"
              color={theme.colors.primary}
              align="right"
            >
              Forgot Password?
            </Typography>
          </TouchableOpacity>

          <Button
            variant="primary"
            fullWidth
            loading={isLoading}
            onPress={handleLogin}
            style={styles.loginButton}
          >
            Login
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Typography variant="body2" style={styles.dividerText}>
              OR
            </Typography>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.phoneContainer}>
            <Button
              variant="outline"
              fullWidth
              onPress={() => navigation.navigate('VerifyPhone')}
              leftIcon={
                <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.primary} />
              }
            >
              Login with Phone Number
            </Button>
          </View>
        </View>

        <View style={styles.footer}>
          <Typography variant="body2">Don't have an account? </Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Typography variant="subtitle2" color={theme.colors.primary}>
              Sign Up
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  phoneContainer: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
});

export default LoginScreen;