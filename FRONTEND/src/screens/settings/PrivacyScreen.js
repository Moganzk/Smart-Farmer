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

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [privacyContent, setPrivacyContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUsingWebView, setIsUsingWebView] = useState(false);
  
  // Fetch privacy policy content
  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);
  
  const fetchPrivacyPolicy = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Call API to get privacy policy content
      // For now we'll use dummy content since API isn't implemented
      
      // const response = await apiService.legal.getPrivacyPolicy();
      // setPrivacyContent(response.data.content);
      
      // Simulate API call
      setTimeout(() => {
        setPrivacyContent(dummyPrivacyPolicy);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      setIsError(true);
      setIsLoading(false);
      
      showMessage({
        message: 'Error',
        description: 'Failed to load privacy policy. Please try again.',
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
          ${privacyContent}
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
          Privacy Policy
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
            Loading privacy policy...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Failed to load privacy policy
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchPrivacyPolicy}
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
          <View style={styles.policyContainer}>
            {/* Privacy Policy is rendered as text */}
            <Text style={[styles.policyContent, { color: theme.colors.text }]}>
              {privacyContent.replace(/<[^>]*>?/gm, '')}
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

// Dummy privacy policy HTML content
const dummyPrivacyPolicy = `
  <h2>Privacy Policy</h2>
  
  <p>Effective date: September 15, 2023</p>
  
  <p>Smart Farmer ("us", "we", or "our") operates the Smart Farmer mobile application (hereinafter referred to as the "Service").</p>
  
  <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
  
  <h3>1. Information Collection and Use</h3>
  
  <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
  
  <h4>1.1 Personal Data</h4>
  
  <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
  
  <ul>
    <li>Email address</li>
    <li>First name and last name</li>
    <li>Phone number</li>
    <li>Address, State, Province, ZIP/Postal code, City</li>
    <li>Cookies and Usage Data</li>
    <li>Location data</li>
  </ul>
  
  <h4>1.2 Usage Data</h4>
  
  <p>We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data").</p>
  
  <h3>2. Use of Data</h3>
  
  <p>Smart Farmer uses the collected data for various purposes:</p>
  
  <ul>
    <li>To provide and maintain our Service</li>
    <li>To notify you about changes to our Service</li>
    <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
    <li>To provide customer support</li>
    <li>To gather analysis or valuable information so that we can improve our Service</li>
    <li>To monitor the usage of our Service</li>
    <li>To detect, prevent and address technical issues</li>
    <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
  </ul>
  
  <h3>3. Data Retention</h3>
  
  <p>We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
  
  <h3>4. Transfer Of Data</h3>
  
  <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
  
  <h3>5. Disclosure Of Data</h3>
  
  <h4>5.1 Legal Requirements</h4>
  
  <p>Smart Farmer may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
  
  <ul>
    <li>To comply with a legal obligation</li>
    <li>To protect and defend the rights or property of Smart Farmer</li>
    <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
    <li>To protect the personal safety of users of the Service or the public</li>
    <li>To protect against legal liability</li>
  </ul>
  
  <h3>6. Security of Data</h3>
  
  <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
  
  <h3>7. Your Data Protection Rights</h3>
  
  <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
  
  <ul>
    <li>The right to access – You have the right to request copies of your personal data.</li>
    <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
    <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
    <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
    <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
    <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
  </ul>
  
  <h3>8. Changes to This Privacy Policy</h3>
  
  <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
  
  <p>We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
  
  <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
  
  <h3>9. Contact Us</h3>
  
  <p>If you have any questions about this Privacy Policy, please contact us:</p>
  
  <ul>
    <li>By email: privacy@smartfarmer.com</li>
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
  policyContainer: {
    padding: 20,
  },
  policyContent: {
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

export default PrivacyScreen;