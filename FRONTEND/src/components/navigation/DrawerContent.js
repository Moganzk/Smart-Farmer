import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Avatar } from '../common';

const DrawerContent = (props) => {
  const { theme } = useTheme();
  const { user, logout } = props;
  
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header/Profile Section */}
        <View style={styles.headerContainer}>
          <View style={[styles.headerBackground, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.headerContent}>
              <Avatar 
                source={user?.profile_pic} 
                label={user?.name?.charAt(0) || 'U'} 
                size="large"
              />
              <View style={styles.headerTextContainer}>
                <Typography 
                  variant="subtitle1"
                  color="#FFFFFF"
                  style={styles.userName}
                >
                  {user?.name || 'Guest User'}
                </Typography>
                <Typography 
                  variant="body2"
                  color="#FFFFFF"
                  style={styles.userEmail}
                >
                  {user?.email || 'Sign in to access all features'}
                </Typography>
              </View>
            </View>
          </View>
        </View>
        
        {/* Drawer Items */}
        <ScrollView style={styles.drawerItemsContainer}>
          <DrawerItemList {...props} />
        </ScrollView>
        
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.logoutButton, { borderTopColor: theme.colors.border }]}
            onPress={logout}
          >
            <Ionicons 
              name="log-out-outline" 
              size={22} 
              color={theme.colors.error} 
            />
            <Typography 
              variant="subtitle2"
              style={[styles.logoutText, { color: theme.colors.error }]}
            >
              Logout
            </Typography>
          </TouchableOpacity>
          
          <View style={styles.versionContainer}>
            <Typography 
              variant="caption" 
              color={theme.colors.placeholder}
              align="center"
            >
              Smart Farmer v1.0.0
            </Typography>
          </View>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 180,
    width: '100%',
    marginBottom: 10,
  },
  headerBackground: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  headerBackgroundImage: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.4,
  },
  headerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  headerTextContainer: {
    marginTop: 12,
  },
  userName: {
    fontWeight: '700',
  },
  userEmail: {
    opacity: 0.8,
    marginTop: 4,
  },
  drawerItemsContainer: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  logoutText: {
    marginLeft: 32,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default DrawerContent;