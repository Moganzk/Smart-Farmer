import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useDatabase } from './DatabaseContext';

// Import translations
import englishTranslation from '../localization/en.json';
import swahiliTranslation from '../localization/sw.json';

// Available languages
const resources = {
  en: {
    translation: englishTranslation,
  },
  sw: {
    translation: swahiliTranslation,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3', // React Native compatibility
  });

const LocalizationContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  isRTL: false,
  locales: [],
});

export const useLocalization = () => useContext(LocalizationContext);

export const LocalizationProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const { executeQuery, isDbReady } = useDatabase();
  
  // Available locales with metadata
  const locales = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  ];

  // Load saved locale or get device locale
  useEffect(() => {
    const loadLocale = async () => {
      try {
        // Try to get locale from AsyncStorage first
        const savedLocale = await AsyncStorage.getItem('@user_locale');
        
        if (savedLocale) {
          changeLocale(savedLocale);
        } else if (isDbReady) {
          // Try to get locale from database settings
          const result = await executeQuery(
            "SELECT value FROM settings WHERE key = 'language';"
          );
          
          if (result?.rows?.length > 0) {
            changeLocale(result.rows.item(0).value);
          } else {
            // Use device locale as fallback, defaulting to 'en' if not supported
            const deviceLocale = Localization.locale.split('-')[0];
            const supportedLocale = resources[deviceLocale] ? deviceLocale : 'en';
            changeLocale(supportedLocale);
          }
        }
      } catch (error) {
        console.error('Error loading locale:', error);
        // Default to English if there's an error
        changeLocale('en');
      }
    };
    
    loadLocale();
  }, [isDbReady]);

  // Change language and save preference
  const changeLocale = async (newLocale) => {
    if (resources[newLocale]) {
      setLocale(newLocale);
      i18n.changeLanguage(newLocale);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem('@user_locale', newLocale);
        
        // Save to database if ready
        if (isDbReady) {
          executeQuery(
            "UPDATE settings SET value = ?, updated_at = ? WHERE key = 'language';",
            [newLocale, Date.now()]
          ).catch(error => 
            console.error('Failed to save locale to database:', error)
          );
        }
      } catch (error) {
        console.error('Failed to save locale preference:', error);
      }
    }
  };

  // Check if the current locale is RTL
  const isRTL = ['ar', 'he', 'ur'].includes(locale);

  return (
    <LocalizationContext.Provider
      value={{
        locale,
        setLocale: changeLocale,
        t: i18n.t,
        isRTL,
        locales,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};