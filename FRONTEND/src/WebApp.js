import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// A simple navigation system for the web version
const WebNavigation = ({ activeScreen, setActiveScreen }) => {
  return (
    <View style={styles.navigation}>
      <TouchableOpacity 
        style={[styles.navItem, activeScreen === 'home' && styles.navItemActive]} 
        onPress={() => setActiveScreen('home')}
      >
        <Text style={[styles.navText, activeScreen === 'home' && styles.navTextActive]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeScreen === 'diseases' && styles.navItemActive]} 
        onPress={() => setActiveScreen('diseases')}
      >
        <Text style={[styles.navText, activeScreen === 'diseases' && styles.navTextActive]}>Diseases</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeScreen === 'advisory' && styles.navItemActive]} 
        onPress={() => setActiveScreen('advisory')}
      >
        <Text style={[styles.navText, activeScreen === 'advisory' && styles.navTextActive]}>Advisory</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeScreen === 'about' && styles.navItemActive]} 
        onPress={() => setActiveScreen('about')}
      >
        <Text style={[styles.navText, activeScreen === 'about' && styles.navTextActive]}>About</Text>
      </TouchableOpacity>
    </View>
  );
};

// Home Screen
const HomeScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Welcome to Smart Farmer</Text>
      <Text style={styles.cardText}>
        Smart Farmer is a comprehensive mobile application designed to help farmers 
        detect crop diseases, access expert agricultural advice, and connect with 
        fellow farmers. This is a simplified web preview.
      </Text>
    </View>
    
    <View style={styles.featuresContainer}>
      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>🌱 Disease Detection</Text>
        <Text style={styles.featureText}>AI-powered crop disease identification</Text>
      </View>
      
      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>📚 Expert Advisory</Text>
        <Text style={styles.featureText}>Access to agricultural advice and resources</Text>
      </View>
      
      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>👨‍🌾 Farmer Community</Text>
        <Text style={styles.featureText}>Connect with other farmers and share knowledge</Text>
      </View>
      
      <View style={styles.featureItem}>
        <Text style={styles.featureTitle}>📱 Offline Access</Text>
        <Text style={styles.featureText}>Use core features without internet connection</Text>
      </View>
    </View>
  </View>
);

// Disease Screen
const DiseaseScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Disease Detection</Text>
      <Text style={styles.cardText}>
        The Smart Farmer app uses machine learning to identify crop diseases from photos.
        This feature requires access to your device's camera and is available in the mobile app.
      </Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Common Crop Diseases</Text>
      <Text style={styles.cardSubtitle}>Tomato Leaf Spot</Text>
      <Text style={styles.cardText}>
        Characterized by brown spots with yellow halos on leaves. Treat with fungicides
        and ensure proper spacing between plants for air circulation.
      </Text>
      
      <Text style={styles.cardSubtitle}>Maize Rust</Text>
      <Text style={styles.cardText}>
        Orange-brown pustules on leaves and stems. Control with resistant varieties
        and rotation with non-host crops.
      </Text>
      
      <Text style={styles.cardSubtitle}>Rice Blast</Text>
      <Text style={styles.cardText}>
        Diamond-shaped lesions on leaves. Manage with balanced fertilization
        and resistant varieties.
      </Text>
    </View>
  </View>
);

// Advisory Screen
const AdvisoryScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Expert Advisory</Text>
      <Text style={styles.cardText}>
        Get personalized recommendations and advice from agricultural experts.
        Browse our knowledge base or connect with experts through the mobile app.
      </Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Farming Tips</Text>
      <Text style={styles.cardSubtitle}>Soil Health Management</Text>
      <Text style={styles.cardText}>
        Maintain soil health by rotating crops, using cover crops, and applying
        organic matter to improve soil structure and fertility.
      </Text>
      
      <Text style={styles.cardSubtitle}>Water Conservation</Text>
      <Text style={styles.cardText}>
        Implement efficient irrigation techniques such as drip irrigation and 
        rainwater harvesting to conserve water.
      </Text>
      
      <Text style={styles.cardSubtitle}>Integrated Pest Management</Text>
      <Text style={styles.cardText}>
        Use a combination of cultural, biological, and chemical controls to manage
        pests while minimizing environmental impact.
      </Text>
    </View>
  </View>
);

// About Screen
const AboutScreen = () => (
  <View style={styles.screenContainer}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>About Smart Farmer</Text>
      <Text style={styles.cardText}>
        Smart Farmer is designed to empower farmers with technology and knowledge
        to improve productivity and sustainability. Our mission is to make modern
        agricultural practices accessible to all farmers.
      </Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>App Features</Text>
      <Text style={styles.featureTitle}>Disease Detection</Text>
      <Text style={styles.cardText}>Identify crop diseases using AI technology</Text>
      
      <Text style={styles.featureTitle}>Expert Advisory</Text>
      <Text style={styles.cardText}>Get personalized recommendations from agricultural experts</Text>
      
      <Text style={styles.featureTitle}>Community Groups</Text>
      <Text style={styles.cardText}>Connect with other farmers to share knowledge</Text>
      
      <Text style={styles.featureTitle}>Offline Access</Text>
      <Text style={styles.cardText}>Access key features even without internet connection</Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Development</Text>
      <Text style={styles.cardText}>
        Smart Farmer is built using React Native and Expo, allowing it to run on both
        Android and iOS devices. This web version is a simplified preview of the mobile app.
      </Text>
    </View>
  </View>
);

export default function WebApp() {
  const [activeScreen, setActiveScreen] = useState('home');
  
  const renderScreen = () => {
    switch (activeScreen) {
      case 'diseases':
        return <DiseaseScreen />;
      case 'advisory':
        return <AdvisoryScreen />;
      case 'about':
        return <AboutScreen />;
      default:
        return <HomeScreen />;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Farmer</Text>
        <Text style={styles.subtitle}>Web Preview</Text>
      </View>
      
      <WebNavigation 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
      />
        
        <ScrollView contentContainerStyle={styles.scrollView}>
          {renderScreen()}
          
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>⚠️ Web Preview Note</Text>
            <Text style={styles.noteText}>
              This is a limited web preview of the Smart Farmer mobile application. The full 
              experience with disease detection, offline capabilities, and community features 
              is available on Android and iOS devices.
            </Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Smart Farmer © 2025 | Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#4CAF50',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#E8F5E9',
    marginTop: 5,
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  navItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  navText: {
    fontSize: 16,
    color: '#666',
  },
  navTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  screenContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#4CAF50',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 10,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureItem: {
    marginBottom: 15,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noteText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});