/**
 * Database Migrations Manager
 * 
 * Handles database schema migrations as the app evolves
 */

// Example migration: Add a new field to disease_detections
const migration_001 = {
  version: 1,
  description: 'Add severity_level to disease_detections',
  up: (tx) => {
    tx.executeSql(
      'ALTER TABLE disease_detections ADD COLUMN severity_level TEXT;'
    );
  }
};

// Example migration: Create a new table for notification preferences
const migration_002 = {
  version: 2,
  description: 'Add notification_preferences table',
  up: (tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id TEXT PRIMARY KEY,
        disease_alerts BOOLEAN DEFAULT 1,
        group_messages BOOLEAN DEFAULT 1,
        advisory_updates BOOLEAN DEFAULT 1,
        quiet_hours_start INTEGER,
        quiet_hours_end INTEGER,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }
};

// All migrations in order
const migrations = [
  migration_001,
  migration_002,
  // Add new migrations here as the app evolves
];

// Migrations manager
export const migrationManager = {
  // Get current database version
  getCurrentVersion: (db) => {
    return new Promise((resolve, reject) => {
      // First check if the migrations table exists
      db.transaction(tx => {
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='migrations';`,
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              // Migrations table doesn't exist yet, create it
              tx.executeSql(
                `CREATE TABLE migrations (
                  version INTEGER PRIMARY KEY,
                  applied_at INTEGER NOT NULL
                );`,
                [],
                () => resolve(0), // No migrations applied yet
                (_, error) => reject(error)
              );
            } else {
              // Get the highest migration version
              tx.executeSql(
                'SELECT MAX(version) as version FROM migrations;',
                [],
                (_, { rows }) => {
                  const version = rows.item(0).version || 0;
                  resolve(version);
                },
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },

  // Record a migration as applied
  recordMigration: (db, version) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO migrations (version, applied_at) VALUES (?, ?);',
          [version, Date.now()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Run all pending migrations
  runMigrations: async (db) => {
    try {
      const currentVersion = await migrationManager.getCurrentVersion(db);
      
      // Find migrations that need to be applied
      const pendingMigrations = migrations.filter(
        migration => migration.version > currentVersion
      );
      
      if (pendingMigrations.length === 0) {
        console.log('Database is up to date, no migrations needed');
        return;
      }
      
      console.log(`Applying ${pendingMigrations.length} migrations...`);
      
      // Apply each migration in a transaction
      for (const migration of pendingMigrations) {
        console.log(`Applying migration ${migration.version}: ${migration.description}`);
        
        await new Promise((resolve, reject) => {
          db.transaction(
            tx => {
              migration.up(tx);
            },
            error => {
              console.error(`Migration ${migration.version} failed:`, error);
              reject(error);
            },
            async () => {
              // Record successful migration
              await migrationManager.recordMigration(db, migration.version);
              console.log(`Migration ${migration.version} applied successfully`);
              resolve();
            }
          );
        });
      }
      
      console.log('All migrations applied successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }
};