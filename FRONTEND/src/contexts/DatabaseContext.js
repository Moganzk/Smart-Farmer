import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { setupDatabase } from '../db/setup';
import { migrationManager } from '../db/migrations';

const DatabaseContext = createContext({
  db: null,
  isDbReady: false,
  executeQuery: async () => {},
  executeBatch: async () => {},
  transaction: async () => {},
  resetDatabase: async () => {},
  getDbInfo: () => ({}),
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Function to open the database with proper directory handling for iOS
  const openDatabase = async () => {
    if (Platform.OS === 'web') {
      // SQLite isn't supported on web
      console.warn('SQLite is not available on web platform');
      return null;
    }

    // Ensure directory exists for iOS
    if (Platform.OS === 'ios') {
      const directory = FileSystem.documentDirectory + 'SQLite';
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
    }

    // Open database
    return SQLite.openDatabase('smartfarmer.db');
  };

  // Initialize database and run migrations on app start
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Open database
        const database = await openDatabase();
        if (!database) return;

        setDb(database);

        // Run initial setup to create tables
        await setupDatabase(database);

        // Check and run any necessary migrations
        await migrationManager.runMigrations(database);

        setIsDbReady(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  // Execute a single SQL query with optional parameters
  const executeQuery = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            console.error('SQL Error:', error, 'Query:', sql, 'Params:', params);
            reject(error);
            return false;
          }
        );
      });
    });
  };

  // Execute multiple SQL queries in one transaction
  const executeBatch = async (queries) => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction(
        tx => {
          queries.forEach(({ sql, params = [] }) => {
            tx.executeSql(sql, params);
          });
        },
        error => {
          console.error('Batch transaction error:', error);
          reject(error);
        },
        () => resolve(true)
      );
    });
  };

  // Custom transaction function
  const transaction = async (callback) => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      db.transaction(
        tx => callback(tx),
        error => {
          console.error('Transaction error:', error);
          reject(error);
        },
        () => resolve(true)
      );
    });
  };

  // Reset the database (for testing or serious issues)
  const resetDatabase = async () => {
    if (!db) return false;

    try {
      // Drop all tables
      const tables = await executeQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%';"
      );

      const dropQueries = Array.from({ length: tables.rows.length }, (_, i) => ({
        sql: `DROP TABLE IF EXISTS ${tables.rows.item(i).name};`,
      }));

      await executeBatch(dropQueries);

      // Recreate database structure
      await setupDatabase(db);
      
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      return false;
    }
  };

  // Get database info
  const getDbInfo = () => {
    if (!db) return { ready: false };

    return {
      ready: isDbReady,
      name: db.name,
      version: db.version,
    };
  };

  return (
    <DatabaseContext.Provider
      value={{
        db,
        isDbReady,
        executeQuery,
        executeBatch,
        transaction,
        resetDatabase,
        getDbInfo,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};