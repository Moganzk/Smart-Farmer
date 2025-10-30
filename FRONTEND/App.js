import React, { useEffect, useState } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { DatabaseProvider } from './src/contexts/DatabaseContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import { SyncProvider } from './src/contexts/SyncContext';
import { AuthProvider } from './src/contexts/AuthContext';
import LoadingScreen from './src/components/common/LoadingScreen';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Non-serializable values were found in the navigation state',
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Navigation wrapper that has access to theme
const NavigationWrapper = () => {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer theme={theme.navigation}>
      <AppNavigator />
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await Font.loadAsync({
          // Load additional fonts if needed
        });
      } catch (e) {
        console.warn('Error loading resources:', e);
      } finally {
        if (fontsLoaded) {
          setAppIsReady(true);
        }
      }
    }

    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    if (appIsReady) {
      // Hide splash screen once everything is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider>
          <LocalizationProvider>
            <NetworkProvider>
              <DatabaseProvider>
                <SyncProvider>
                  <SafeAreaProvider>
                    <AuthProvider>
                      <NavigationWrapper />
                    </AuthProvider>
                  </SafeAreaProvider>
                </SyncProvider>
              </DatabaseProvider>
            </NetworkProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}