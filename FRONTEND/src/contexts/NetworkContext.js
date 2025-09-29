import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  connectionType: null,
  connectionQuality: 'unknown',
  lastChecked: null,
  checkConnection: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
    connectionQuality: 'unknown', // 'poor', 'fair', 'good', 'excellent', or 'unknown'
    lastChecked: Date.now(),
  });

  // Determine connection quality based on network type
  const determineConnectionQuality = (type, isInternetReachable) => {
    if (!isInternetReachable) return 'poor';
    
    switch (type) {
      case 'none':
        return 'poor';
      case 'cellular':
        return 'fair';
      case 'wifi':
        return 'excellent';
      case 'ethernet':
        return 'excellent';
      default:
        return 'unknown';
    }
  };

  const checkConnection = useCallback(async () => {
    try {
      const networkInfo = await NetInfo.fetch();
      
      const quality = determineConnectionQuality(
        networkInfo.type,
        networkInfo.isInternetReachable
      );
      
      setNetworkState({
        isConnected: networkInfo.isConnected,
        isInternetReachable: networkInfo.isInternetReachable,
        connectionType: networkInfo.type,
        connectionQuality: quality,
        lastChecked: Date.now(),
      });
      
      return networkInfo.isConnected && networkInfo.isInternetReachable;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }, []);

  // Monitor network changes
  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network info changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const quality = determineConnectionQuality(
        state.type, 
        state.isInternetReachable
      );
      
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
        connectionQuality: quality,
        lastChecked: Date.now(),
      });
    });

    // Check connection when app comes to foreground
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        checkConnection();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [checkConnection]);

  return (
    <NetworkContext.Provider
      value={{
        ...networkState,
        checkConnection,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};