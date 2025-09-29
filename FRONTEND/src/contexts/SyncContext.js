import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useNetwork } from './NetworkContext';
import { useDatabase } from './DatabaseContext';
import { useAuth } from './AuthContext';

// Sync status types
export const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
};

const SyncContext = createContext({
  syncStatus: SYNC_STATUS.IDLE,
  lastSyncTime: null,
  pendingSyncItems: 0,
  syncNow: async () => {},
  syncStatusDetails: {},
  resetSyncStatus: () => {},
  updateSyncItem: async () => {},
});

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const { isConnected, isInternetReachable, connectionQuality } = useNetwork();
  const { executeQuery, transaction, isDbReady } = useDatabase();
  const { isAuthenticated } = useAuth();
  
  const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.IDLE);
  const [syncStatusDetails, setSyncStatusDetails] = useState({});
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSyncItems, setPendingSyncItems] = useState(0);
  const [syncInterval, setSyncInterval] = useState(3600000); // 1 hour default
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncOnWifiOnly, setSyncOnWifiOnly] = useState(false);
  
  // Load sync settings
  useEffect(() => {
    if (isDbReady) {
      loadSyncSettings();
      countPendingSyncItems();
    }
  }, [isDbReady]);

  // Load last sync time and other settings from the database
  const loadSyncSettings = useCallback(async () => {
    try {
      // Get sync settings from the database
      const result = await executeQuery(
        "SELECT key, value FROM settings WHERE key IN ('last_sync', 'sync_interval', 'sync_wifi_only');"
      );
      
      if (result?.rows?.length > 0) {
        // Process each setting
        for (let i = 0; i < result.rows.length; i++) {
          const item = result.rows.item(i);
          
          switch (item.key) {
            case 'last_sync':
              setLastSyncTime(parseInt(item.value, 10) || null);
              break;
            case 'sync_interval':
              setSyncInterval(parseInt(item.value, 10) || 3600000);
              break;
            case 'sync_wifi_only':
              setSyncOnWifiOnly(item.value === 'true');
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  }, [executeQuery, isDbReady]);

  // Count pending sync items
  const countPendingSyncItems = useCallback(async () => {
    if (!isDbReady) return;
    
    try {
      const pendingItemsCount = await AsyncStorage.getItem('@pending_sync_count');
      
      if (pendingItemsCount) {
        setPendingSyncItems(parseInt(pendingItemsCount, 10));
      } else {
        // Count from database
        const result = await executeQuery(
          "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending';"
        );
        
        if (result?.rows?.length > 0) {
          const count = result.rows.item(0).count;
          setPendingSyncItems(count);
          await AsyncStorage.setItem('@pending_sync_count', count.toString());
        }
      }
    } catch (error) {
      console.error('Error counting pending sync items:', error);
    }
  }, [executeQuery, isDbReady]);

  // Update sync count when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        countPendingSyncItems();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      appStateSubscription.remove();
    };
  }, [countPendingSyncItems]);

  // Main sync function
  const syncNow = useCallback(async () => {
    if (syncInProgress || !isDbReady || !isAuthenticated) return false;
    
    // Check if we should sync based on connection
    if (syncOnWifiOnly && connectionQuality !== 'excellent') {
      console.log('Sync aborted: WiFi-only mode is active and not on WiFi');
      setSyncStatusDetails({
        message: 'Sync requires WiFi connection',
        error: 'wifi_required'
      });
      return false;
    }
    
    if (!isConnected || !isInternetReachable) {
      console.log('Sync aborted: No internet connection');
      setSyncStatusDetails({
        message: 'No internet connection',
        error: 'no_connection'
      });
      return false;
    }
    
    try {
      setSyncInProgress(true);
      setSyncStatus(SYNC_STATUS.SYNCING);
      setSyncStatusDetails({ message: 'Starting synchronization...' });
      
      // Get all pending sync items
      const pendingItems = await executeQuery(
        "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100;"
      );
      
      if (pendingItems?.rows?.length === 0) {
        // No items to sync
        const now = Date.now();
        await executeQuery(
          "UPDATE settings SET value = ?, updated_at = ? WHERE key = 'last_sync';",
          [now.toString(), now]
        );
        setLastSyncTime(now);
        setSyncStatus(SYNC_STATUS.SUCCESS);
        setSyncStatusDetails({ message: 'Sync completed successfully (no changes)' });
        return true;
      }
      
      // Process each item
      let successCount = 0;
      let errorCount = 0;
      
      // Process items based on type
      for (let i = 0; i < pendingItems.rows.length; i++) {
        const item = pendingItems.rows.item(i);
        setSyncStatusDetails({ message: `Syncing item ${i + 1} of ${pendingItems.rows.length}` });
        
        try {
          // In a real app, this would call the appropriate API endpoint
          // This is a simplified placeholder for the actual sync logic
          const syncResult = await mockSyncItem(item);
          
          if (syncResult.success) {
            // Update item status to 'synced'
            await executeQuery(
              "UPDATE sync_queue SET status = 'synced', updated_at = ? WHERE id = ?;",
              [Date.now(), item.id]
            );
            successCount++;
          } else {
            // Update attempts count
            await executeQuery(
              "UPDATE sync_queue SET attempts = attempts + 1, updated_at = ? WHERE id = ?;",
              [Date.now(), item.id]
            );
            errorCount++;
          }
        } catch (error) {
          console.error('Error syncing item:', item.id, error);
          errorCount++;
        }
      }
      
      // Update last sync time
      const now = Date.now();
      await executeQuery(
        "UPDATE settings SET value = ?, updated_at = ? WHERE key = 'last_sync';",
        [now.toString(), now]
      );
      
      // Update counters
      setLastSyncTime(now);
      await countPendingSyncItems();
      
      // Set final status
      if (errorCount > 0) {
        setSyncStatus(SYNC_STATUS.ERROR);
        setSyncStatusDetails({
          message: `Sync completed with ${errorCount} errors. ${successCount} items synced successfully.`,
          successCount,
          errorCount
        });
      } else {
        setSyncStatus(SYNC_STATUS.SUCCESS);
        setSyncStatusDetails({
          message: 'Sync completed successfully',
          successCount
        });
      }
      
      return errorCount === 0;
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(SYNC_STATUS.ERROR);
      setSyncStatusDetails({
        message: 'Sync failed',
        error: error.message
      });
      return false;
    } finally {
      setSyncInProgress(false);
    }
  }, [
    connectionQuality,
    executeQuery,
    isAuthenticated,
    isConnected,
    isDbReady,
    isInternetReachable,
    syncInProgress,
    syncOnWifiOnly
  ]);

  // Reset sync status
  const resetSyncStatus = useCallback(() => {
    setSyncStatus(SYNC_STATUS.IDLE);
    setSyncStatusDetails({});
  }, []);

  // Add an item to the sync queue
  const updateSyncItem = useCallback(async (tableName, recordId, operation, data = null) => {
    if (!isDbReady) return false;
    
    try {
      const now = Date.now();
      await executeQuery(
        `INSERT INTO sync_queue (table_name, record_id, operation, data, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', ?, ?);`,
        [tableName, recordId, operation, data ? JSON.stringify(data) : null, now, now]
      );
      
      // Update pending count
      const newCount = pendingSyncItems + 1;
      setPendingSyncItems(newCount);
      await AsyncStorage.setItem('@pending_sync_count', newCount.toString());
      
      return true;
    } catch (error) {
      console.error('Error adding sync item:', error);
      return false;
    }
  }, [executeQuery, isDbReady, pendingSyncItems]);

  // Auto sync based on interval
  useEffect(() => {
    if (!isDbReady || !isAuthenticated) return;
    
    const autoSync = async () => {
      // Don't auto-sync if manual sync is in progress
      if (syncInProgress) return;
      
      // Check if we should sync based on last sync time
      const shouldSync = lastSyncTime === null || 
                        (Date.now() - lastSyncTime) > syncInterval;
      
      if (shouldSync && pendingSyncItems > 0) {
        await syncNow();
      }
    };
    
    // Run initial check
    autoSync();
    
    // Set up interval
    const intervalId = setInterval(autoSync, Math.max(60000, syncInterval / 10)); // Check at most once per minute
    
    return () => clearInterval(intervalId);
  }, [isDbReady, isAuthenticated, lastSyncTime, pendingSyncItems, syncInterval, syncInProgress, syncNow]);

  // Mock function to simulate syncing with server
  const mockSyncItem = async (item) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate 90% success rate
    const success = Math.random() < 0.9;
    
    return { success };
  };

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        lastSyncTime,
        pendingSyncItems,
        syncNow,
        syncStatusDetails,
        resetSyncStatus,
        updateSyncItem,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};