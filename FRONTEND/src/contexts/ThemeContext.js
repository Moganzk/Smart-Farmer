import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define our light and dark themes
const lightTheme = {
  mode: 'light',
  colors: {
    // Primary colors
    primary: '#2E7D32', // Deep green for main actions
    primaryLight: '#60ad5e',
    primaryDark: '#005005',
    secondary: '#FFA000', // Amber for accents
    secondaryLight: '#ffd149',
    secondaryDark: '#c67100',
    
    // Background colors
    background: '#FFFFFF',
    surfaceBackground: '#F5F5F5',
    cardBackground: '#FFFFFF',
    inputBackground: '#F0F4F0',
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    textMuted: '#9E9E9E',
    textInverted: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Utility colors
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    divider: '#EEEEEE',
    highlight: '#E8F5E9',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Tab icons
    tabIconInactive: '#757575',
  },
  navigation: {
    dark: false,
    colors: {
      primary: '#2E7D32',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#212121',
      border: '#E0E0E0',
      notification: '#F44336',
    },
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'Poppins_400Regular',
      medium: 'Poppins_500Medium',
      semiBold: 'Poppins_600SemiBold',
      bold: 'Poppins_700Bold',
    },
    fontSize: {
      caption: 12,
      body: 14,
      subheading: 16,
      title: 18,
      h3: 20,
      h2: 24,
      h1: 28,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.20,
      shadowRadius: 3.0,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 5.0,
      elevation: 6,
    },
  },
};

// Dark theme with appropriate contrast
const darkTheme = {
  mode: 'dark',
  colors: {
    // Primary colors
    primary: '#4CAF50', // Brighter green for dark mode
    primaryLight: '#80e27e',
    primaryDark: '#087f23',
    secondary: '#FFB74D', // Brighter amber for dark mode
    secondaryLight: '#ffe97d',
    secondaryDark: '#c88719',
    
    // Background colors
    background: '#121212',
    surfaceBackground: '#1E1E1E',
    cardBackground: '#2C2C2C',
    inputBackground: '#333333',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#999999',
    textInverted: '#212121',
    
    // Status colors
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Utility colors
    border: '#444444',
    borderLight: '#555555',
    divider: '#333333',
    highlight: '#1B5E20',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Tab icons
    tabIconInactive: '#999999',
  },
  navigation: {
    dark: true,
    colors: {
      primary: '#4CAF50',
      background: '#121212',
      card: '#2C2C2C',
      text: '#FFFFFF',
      border: '#444444',
      notification: '#EF5350',
    },
  },
  // The rest remains the same
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  shadows: lightTheme.shadows,
};

// Create theme context
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(lightTheme);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('@theme_mode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Update theme when theme mode or device color scheme changes
  useEffect(() => {
    const calculateTheme = () => {
      if (themeMode === 'system') {
        return deviceColorScheme === 'dark' ? darkTheme : lightTheme;
      }
      return themeMode === 'dark' ? darkTheme : lightTheme;
    };
    
    setTheme(calculateTheme());
  }, [themeMode, deviceColorScheme]);

  // Save theme preference
  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // Toggle between light and dark modes
  const toggleTheme = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    saveThemePreference(newThemeMode);
  };

  // Explicitly set theme mode
  const setExplicitThemeMode = (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeMode(mode);
      saveThemePreference(mode);
    }
  };

  const isDarkMode = theme.mode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        setThemeMode: setExplicitThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};