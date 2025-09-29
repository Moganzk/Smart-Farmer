import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Hook for handling Android back button presses
 * @param {Function} callback Function to call on back press, should return true to prevent default behavior
 * @returns {void}
 */
const useBackHandler = (callback) => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If callback returns true, prevent default behavior
        if (callback && callback()) {
          return true;
        }

        // If we can go back in the navigation stack, do it
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }

        // Default behavior (exit app)
        return false;
      }
    );

    return () => backHandler.remove();
  }, [callback, navigation]);
};

export default useBackHandler;