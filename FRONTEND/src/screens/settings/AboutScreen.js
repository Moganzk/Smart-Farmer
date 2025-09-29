import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

const AboutScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Handle link press
  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };
  
  // Handle email press
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`).catch((err) => console.error('Error opening email:', err));
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
          About
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View style={styles.appInfoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.appLogo} 
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            Smart Farmer
          </Text>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appTagline, { color: theme.colors.textSecondary }]}>
            Your digital companion for sustainable farming
          </Text>
        </View>
        
        {/* App Description */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About Smart Farmer
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            Smart Farmer is a comprehensive mobile application designed to empower farmers with modern agricultural knowledge and tools. Our app combines advanced plant disease detection, expert farming advice, weather forecasting, and community collaboration features to help farmers improve their yields and adopt sustainable farming practices.
          </Text>
        </View>
        
        {/* Features */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Key Features
          </Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="leaf-outline" size={24} color={theme.colors.primary} style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                Disease Detection
              </Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Identify plant diseases instantly with our AI-powered image analysis.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="book-outline" size={24} color={theme.colors.primary} style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                Farming Advisory
              </Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Access expert advice on crop management, pest control, and soil health.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary} style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                Farmer Groups
              </Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Join communities to share knowledge and collaborate with other farmers.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cloud-outline" size={24} color={theme.colors.primary} style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                Offline Mode
              </Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                Access critical information even without internet connectivity.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Development Team */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Development Team
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            Smart Farmer was developed by a dedicated team of agricultural experts, software engineers, and UI/UX designers passionate about leveraging technology to solve challenges in agriculture.
          </Text>
          
          <View style={styles.teamContainer}>
            <View style={styles.teamMember}>
              <Image 
                source={require('../../assets/team/dev1.png')} 
                style={styles.teamMemberImage} 
                defaultSource={require('../../assets/default-avatar.png')}
              />
              <Text style={[styles.teamMemberName, { color: theme.colors.text }]}>
                Jane Doe
              </Text>
              <Text style={[styles.teamMemberRole, { color: theme.colors.textSecondary }]}>
                Lead Developer
              </Text>
            </View>
            
            <View style={styles.teamMember}>
              <Image 
                source={require('../../assets/team/dev2.png')} 
                style={styles.teamMemberImage} 
                defaultSource={require('../../assets/default-avatar.png')}
              />
              <Text style={[styles.teamMemberName, { color: theme.colors.text }]}>
                John Smith
              </Text>
              <Text style={[styles.teamMemberRole, { color: theme.colors.textSecondary }]}>
                UI/UX Designer
              </Text>
            </View>
            
            <View style={styles.teamMember}>
              <Image 
                source={require('../../assets/team/dev3.png')} 
                style={styles.teamMemberImage} 
                defaultSource={require('../../assets/default-avatar.png')}
              />
              <Text style={[styles.teamMemberName, { color: theme.colors.text }]}>
                Sarah Johnson
              </Text>
              <Text style={[styles.teamMemberRole, { color: theme.colors.textSecondary }]}>
                Agricultural Expert
              </Text>
            </View>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Us
          </Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleEmailPress('support@smartfarmer.com')}
          >
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} style={styles.contactIcon} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              support@smartfarmer.com
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('https://www.smartfarmer.com')}
          >
            <Ionicons name="globe-outline" size={24} color={theme.colors.primary} style={styles.contactIcon} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              www.smartfarmer.com
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('tel:+1234567890')}
          >
            <Ionicons name="call-outline" size={24} color={theme.colors.primary} style={styles.contactIcon} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>
              +1 (234) 567-890
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Social Media */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Follow Us
          </Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={() => handleLinkPress('https://www.facebook.com/smartfarmer')}
            >
              <Ionicons name="logo-facebook" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={() => handleLinkPress('https://www.twitter.com/smartfarmer')}
            >
              <Ionicons name="logo-twitter" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={() => handleLinkPress('https://www.instagram.com/smartfarmer')}
            >
              <Ionicons name="logo-instagram" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={() => handleLinkPress('https://www.youtube.com/smartfarmer')}
            >
              <Ionicons name="logo-youtube" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Acknowledgments */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Acknowledgments
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            We would like to thank our partners, contributors, and the farming communities whose feedback has been invaluable in developing this application. Special thanks to agricultural research institutions for sharing their expertise and knowledge.
          </Text>
        </View>
        
        {/* Copyright */}
        <View style={styles.copyrightContainer}>
          <Text style={[styles.copyrightText, { color: theme.colors.textTertiary }]}>
            © 2023 Smart Farmer. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appLogo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 10,
  },
  appTagline: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  teamMember: {
    alignItems: 'center',
    marginBottom: 15,
    width: '30%',
  },
  teamMemberImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  teamMemberName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  teamMemberRole: {
    fontSize: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  contactIcon: {
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyrightContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  copyrightText: {
    fontSize: 14,
  },
});

export default AboutScreen;