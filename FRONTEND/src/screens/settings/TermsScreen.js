import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import { WebView } from 'react-native-webview';

const TermsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [termsContent, setTermsContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUsingWebView, setIsUsingWebView] = useState(false);
  
  // Fetch terms of service content
  useEffect(() => {
    fetchTermsOfService();
  }, []);
  
  const fetchTermsOfService = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Call API to get terms of service content
      // For now we'll use dummy content since API isn't implemented
      
      // const response = await apiService.legal.getTermsOfService();
      // setTermsContent(response.data.content);
      
      // Simulate API call
      setTimeout(() => {
        setTermsContent(dummyTermsContent);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching terms of service:', error);
      setIsError(true);
      setIsLoading(false);
      
      showMessage({
        message: 'Error',
        description: 'Failed to load terms of service. Please try again.',
        type: 'danger',
      });
    }
  };
  
  // Toggle between WebView and Text rendering
  const toggleViewMode = () => {
    setIsUsingWebView(!isUsingWebView);
  };
  
  // Render HTML content in WebView
  const renderWebView = () => {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 15px;
              color: ${theme.mode === 'dark' ? '#FFFFFF' : '#000000'};
              background-color: ${theme.colors.background};
              font-size: 16px;
              line-height: 1.5;
            }
            h2 {
              font-size: 20px;
              margin-top: 25px;
              margin-bottom: 15px;
              color: ${theme.colors.primary};
            }
            h3 {
              font-size: 18px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 15px;
            }
            ul, ol {
              padding-left: 20px;
              margin-bottom: 15px;
            }
            li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          ${termsContent}
        </body>
      </html>
    `;
    
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        showsVerticalScrollIndicator={false}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.loadingWebView, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      />
    );
  };
  
  return (
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
          Terms of Service
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleViewMode}
        >
          <Ionicons 
            name={isUsingWebView ? "document-text-outline" : "globe-outline"} 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading terms of service...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Failed to load terms of service
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchTermsOfService}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : isUsingWebView ? (
        renderWebView()
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.termsContainer}>
            {/* Terms of Service is rendered as text */}
            <Text style={[styles.termsContent, { color: theme.colors.text }]}>
              {termsContent.replace(/<[^>]*>?/gm, '')}
            </Text>
          </View>
        </ScrollView>
      )}
      
      {/* Last Updated Info */}
      <View style={[styles.lastUpdatedContainer, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.lastUpdatedText, { color: theme.colors.textSecondary }]}>
          Last Updated: September 15, 2023
        </Text>
      </View>
    </View>
  );
};

// Dummy terms of service HTML content
const dummyTermsContent = `
  <h2>Terms of Service</h2>
  
  <p>Effective date: September 15, 2023</p>
  
  <p>Welcome to Smart Farmer. Please read these terms of service ("Terms") carefully as they contain important information about your legal rights, remedies and obligations. By accessing or using the Smart Farmer application, you agree to comply with and be bound by these Terms.</p>
  
  <h3>1. Acceptance of Terms</h3>
  
  <p>By creating a Smart Farmer account or by using any of our Services (as defined below), you agree to comply with and be bound by these Terms, as well as our Privacy Policy. If you do not agree to these Terms, you should not access or use our Services.</p>
  
  <h3>2. Description of Services</h3>
  
  <p>Smart Farmer provides a mobile application platform that offers various services ("Services") including but not limited to:</p>
  
  <ul>
    <li>Plant disease detection and analysis</li>
    <li>Agricultural advisory content and information</li>
    <li>Farming community groups and communication</li>
    <li>Weather forecasting and alerts relevant to agricultural activities</li>
    <li>Market information and pricing data</li>
  </ul>
  
  <h3>3. Registration and Account Security</h3>
  
  <p>To access certain features of the Services, you may be required to register for an account. When registering for an account, you agree to:</p>
  
  <ul>
    <li>Provide accurate, current, and complete information</li>
    <li>Maintain and promptly update your account information</li>
    <li>Keep your account credentials secure and confidential</li>
    <li>Notify Smart Farmer immediately of any unauthorized use of your account</li>
    <li>Accept responsibility for all activities that occur under your account</li>
  </ul>
  
  <h3>4. User Content</h3>
  
  <p>Our Services may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("User Content"). You are responsible for the User Content that you post to the Services, including its legality, reliability, and appropriateness.</p>
  
  <p>By posting User Content to the Services, you grant us the right and license to use, modify, perform, display, reproduce, and distribute such content on and through the Services. You retain any and all of your rights to any User Content you submit, post or display on or through the Services and you are responsible for protecting those rights.</p>
  
  <h3>5. Acceptable Use</h3>
  
  <p>You agree not to use the Services to:</p>
  
  <ul>
    <li>Violate any applicable law or regulation</li>
    <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
    <li>Transmit any material that is defamatory, offensive, or otherwise objectionable</li>
    <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity</li>
    <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
    <li>Harvest or collect email addresses or other contact information of other users from the Services by electronic or other means</li>
    <li>Engage in any conduct that restricts or inhibits any other person from using or enjoying the Services</li>
  </ul>
  
  <h3>6. Intellectual Property</h3>
  
  <p>The Services and their original content (excluding User Content), features and functionality are and will remain the exclusive property of Smart Farmer and its licensors. The Services are protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Smart Farmer.</p>
  
  <h3>7. Termination</h3>
  
  <p>We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
  
  <h3>8. Limitation of Liability</h3>
  
  <p>In no event shall Smart Farmer, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>
  
  <h3>9. Disclaimer</h3>
  
  <p>Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
  
  <p>Smart Farmer does not warrant that a) the Services will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Services are free of viruses or other harmful components; or d) the results of using the Services will meet your requirements.</p>
  
  <p>While Smart Farmer strives to provide accurate agricultural advice and disease detection services, we cannot guarantee 100% accuracy. Users should exercise their own judgment and consult with agricultural experts when making farming decisions.</p>
  
  <h3>10. Governing Law</h3>
  
  <p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
  
  <h3>11. Changes to Terms</h3>
  
  <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
  
  <h3>12. Contact Us</h3>
  
  <p>If you have any questions about these Terms, please contact us:</p>
  
  <ul>
    <li>By email: terms@smartfarmer.com</li>
    <li>By phone number: +1 (234) 567-890</li>
  </ul>
`;

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
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  termsContainer: {
    padding: 20,
  },
  termsContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  lastUpdatedContainer: {
    padding: 15,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 14,
  },
  webView: {
    flex: 1,
  },
  loadingWebView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TermsScreen;