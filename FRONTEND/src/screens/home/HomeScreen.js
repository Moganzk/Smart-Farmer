import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNetwork } from '../../contexts/NetworkContext';
import { Card, Typography, Button, Avatar } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [recentDetections, setRecentDetections] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFeaturedContent(),
        loadRecentDetections(),
        loadWeatherData(),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFeaturedContent = async () => {
    try {
      if (isConnected) {
        const response = await apiService.advisory.getFeatured();
        const data = response.data?.data || response.data || [];
        setFeaturedContent(Array.isArray(data) ? data.slice(0, 5) : []);
      } else {
        // Load from local storage/database if offline
        setFeaturedContent([
          {
            id: '1',
            title: 'How to Prevent Common Crop Diseases',
            image: require('../../assets/images/featured-disease-prevention.jpg'),
            category: 'Disease Prevention',
            date: '2023-07-15',
          },
          {
            id: '2',
            title: 'Effective Irrigation Techniques',
            image: require('../../assets/images/featured-irrigation.jpg'),
            category: 'Water Management',
            date: '2023-07-12',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading featured content:', error);
      // Fallback data on network error
      setFeaturedContent([]);
    }
  };
  
  const loadRecentDetections = async () => {
    try {
      if (isConnected) {
        const response = await apiService.diseases.getHistory({ limit: 3 });
        const data = response.data?.data || response.data || [];
        setRecentDetections(Array.isArray(data) ? data : []);
      } else {
        // Load from local database if offline
        setRecentDetections([]);
      }
    } catch (error) {
      console.error('Error loading recent detections:', error);
      setRecentDetections([]);
    }
  };
  
  const loadWeatherData = async () => {
    try {
      // Mock weather data (would typically come from a weather API)
      setWeatherData({
        current: {
          temp: 28,
          condition: 'Partly Cloudy',
          icon: 'partly-sunny',
        },
        forecast: [
          { day: 'Today', temp: 28, icon: 'partly-sunny' },
          { day: 'Tomorrow', temp: 30, icon: 'sunny' },
          { day: 'Wed', temp: 27, icon: 'rainy' },
        ],
      });
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu-outline" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Typography variant="h3">Smart Farmer</Typography>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar source={user?.profile_pic} label={user?.name?.charAt(0) || 'U'} size="small" />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderGreeting = () => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    
    return (
      <View style={styles.greetingContainer}>
        <Typography variant="h2" style={styles.greeting}>
          {getGreeting()},
        </Typography>
        <Typography variant="h2" color={theme.colors.primary} style={styles.userName}>
          {user?.name?.split(' ')[0] || 'Farmer'}
        </Typography>
      </View>
    );
  };
  
  const renderWeatherCard = () => {
    if (!weatherData) return null;
    
    return (
      <Card variant="elevated" style={styles.weatherCard}>
        <View style={styles.weatherContent}>
          <View style={styles.currentWeather}>
            <Ionicons 
              name={weatherData.current.icon} 
              size={40} 
              color={theme.colors.primary} 
            />
            <Typography variant="h2" style={styles.temperature}>
              {weatherData.current.temp}°C
            </Typography>
            <Typography variant="body2">{weatherData.current.condition}</Typography>
          </View>
          
          <View style={styles.weatherDivider} />
          
          <View style={styles.forecast}>
            {weatherData.forecast.map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Typography variant="caption">{day.day}</Typography>
                <Ionicons name={day.icon} size={24} color={theme.colors.text} />
                <Typography variant="body2">{day.temp}°</Typography>
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  };
  
  const renderQuickActions = () => {
    const actions = [
      {
        id: '1',
        title: 'Disease Detection',
        icon: 'leaf-outline',
        color: theme.colors.success,
        onPress: () => navigation.navigate('DiseaseTab'),
      },
      {
        id: '2',
        title: 'Advisory',
        icon: 'book-outline',
        color: theme.colors.info,
        onPress: () => navigation.navigate('AdvisoryTab'),
      },
      {
        id: '3',
        title: 'Community',
        icon: 'people-outline',
        color: theme.colors.warning,
        onPress: () => navigation.navigate('GroupsTab'),
      },
      {
        id: '4',
        title: 'Help',
        icon: 'help-circle-outline',
        color: theme.colors.error,
        onPress: () => navigation.navigate('AdvisoryTab', { screen: 'AdvisorySearch' }),
      },
    ];
    
    return (
      <View style={styles.quickActionsContainer}>
        <Typography variant="subtitle1" style={styles.sectionTitle}>
          Quick Actions
        </Typography>
        
        <View style={styles.quickActions}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={action.onPress}
            >
              <View 
                style={[
                  styles.quickActionIcon, 
                  { backgroundColor: action.color + '20' }, // Add transparency
                ]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Typography variant="caption" style={styles.quickActionTitle}>
                {action.title}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderFeaturedContent = () => {
    if (featuredContent.length === 0) return null;
    
    return (
      <View style={styles.featuredContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="subtitle1" style={styles.sectionTitle}>
            Featured Content
          </Typography>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AdvisoryTab')}
          >
            <Typography variant="body2" color={theme.colors.primary}>
              See All
            </Typography>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => 
                navigation.navigate('AdvisoryTab', { 
                  screen: 'AdvisoryDetail', 
                  params: { id: item.id } 
                })
              }
            >
              <Card 
                variant="elevated" 
                padding="none" 
                style={styles.featuredCard}
              >
                <Image 
                  source={
                    typeof item.image === 'string' 
                      ? { uri: item.image } 
                      : item.image
                  }
                  style={styles.featuredImage}
                />
                <View style={styles.featuredContent}>
                  <Typography variant="overline" color={theme.colors.primary}>
                    {item.category}
                  </Typography>
                  <Typography variant="subtitle2" numberOfLines={2} style={styles.featuredTitle}>
                    {item.title}
                  </Typography>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredListContainer}
        />
      </View>
    );
  };
  
  const renderRecentDetections = () => {
    if (recentDetections.length === 0) return null;
    
    return (
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="subtitle1" style={styles.sectionTitle}>
            Recent Detections
          </Typography>
          <TouchableOpacity 
            onPress={() => navigation.navigate('DiseaseTab', { screen: 'DiseaseHistory' })}
          >
            <Typography variant="body2" color={theme.colors.primary}>
              See All
            </Typography>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentList}>
          {recentDetections.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => 
                navigation.navigate('DiseaseTab', { 
                  screen: 'DiseaseResult', 
                  params: { id: item.id } 
                })
              }
            >
              <Card variant="elevated" style={styles.recentCard}>
                <View style={styles.recentCardContent}>
                  <Image 
                    source={{ uri: item.image }}
                    style={styles.recentImage}
                  />
                  <View style={styles.recentInfo}>
                    <Typography variant="subtitle2">{item.disease}</Typography>
                    <Typography variant="caption" color={theme.colors.placeholder}>
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                    <View 
                      style={[
                        styles.confidenceTag, 
                        { 
                          backgroundColor: 
                            item.confidence > 0.7
                              ? theme.colors.success + '20'
                              : theme.colors.warning + '20'
                        }
                      ]}
                    >
                      <Typography 
                        variant="caption" 
                        color={
                          item.confidence > 0.7
                            ? theme.colors.success
                            : theme.colors.warning
                        }
                      >
                        {Math.round(item.confidence * 100)}% Confidence
                      </Typography>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        {recentDetections.length === 0 && (
          <Button 
            variant="outline"
            onPress={() => navigation.navigate('DiseaseTab')}
          >
            Scan Your First Plant
          </Button>
        )}
      </View>
    );
  };
  
  const renderOfflineNotice = () => {
    if (isConnected) return null;
    
    return (
      <View 
        style={[
          styles.offlineNotice, 
          { backgroundColor: theme.colors.warning + '20' }
        ]}
      >
        <Ionicons name="cloud-offline-outline" size={20} color={theme.colors.warning} />
        <Typography 
          variant="body2" 
          color={theme.colors.warning}
          style={styles.offlineText}
        >
          You are currently offline. Some features may be limited.
        </Typography>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {renderHeader()}
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderOfflineNotice()}
        {renderGreeting()}
        {renderWeatherCard()}
        {renderQuickActions()}
        {renderFeaturedContent()}
        {renderRecentDetections()}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  greetingContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 26,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  weatherCard: {
    marginBottom: 24,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentWeather: {
    flex: 1,
    alignItems: 'center',
  },
  temperature: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  weatherDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  forecast: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastDay: {
    alignItems: 'center',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    textAlign: 'center',
  },
  featuredContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredListContainer: {
    paddingRight: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    marginTop: 4,
  },
  recentContainer: {
    marginBottom: 24,
  },
  recentList: {
    marginBottom: 16,
  },
  recentCard: {
    marginBottom: 12,
  },
  recentCardContent: {
    flexDirection: 'row',
  },
  recentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  confidenceTag: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    marginLeft: 8,
  },
});

export default HomeScreen;