import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomTextInput from '../../components/common/CustomTextInput';
import CustomButton from '../../components/common/CustomButton';
import OTPInputView from '../../components/auth/OTPInputView'; // You may need to create this component
import { showMessage } from 'react-native-flash-message';

const VerifyPhoneScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { verifyPhone, resendCode } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [code, setCode] = useState('');
  
  const phoneNumber = route.params?.phone || '';

  // Countdown timer for resend code option
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      showMessage({
        message: 'Invalid Code',
        description: 'Please enter the 6-digit verification code.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyPhone(phoneNumber, code);
      showMessage({
        message: 'Verification Successful',
        description: 'Your phone number has been verified.',
        type: 'success',
      });
      // Navigate to login or home screen depending on your flow
      navigation.navigate('Login');
    } catch (error) {
      showMessage({
        message: 'Verification Failed',
        description: error.message || 'Invalid verification code. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCode(phoneNumber);
      setResendDisabled(true);
      setCountdown(60);
      showMessage({
        message: 'Code Resent',
        description: 'A new verification code has been sent to your phone.',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Failed to Resend Code',
        description: error.message || 'Something went wrong. Please try again.',
        type: 'danger',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          Verify Your Phone
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter the 6-digit code sent to {phoneNumber}
        </Text>

        <View style={styles.formContainer}>
          {/* Simple OTP input implementation */}
          <View style={styles.otpContainer}>
            <CustomTextInput
              placeholder="Enter 6-digit code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoFocus
            />
          </View>

          <CustomButton
            title="Verify"
            onPress={handleVerify}
            disabled={isSubmitting || code.length !== 6}
            loading={isSubmitting}
            style={{ marginTop: 20 }}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
              Didn't receive a code?{' '}
            </Text>
            {resendDisabled ? (
              <Text style={[styles.countdownText, { color: theme.colors.primary }]}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={[styles.resendLink, { color: theme.colors.primary }]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    marginTop: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 16,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 16,
  },
});

export default VerifyPhoneScreen;