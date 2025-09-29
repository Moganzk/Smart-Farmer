/**
 * Database Setup
 * 
 * Initializes SQLite database tables and initial data
 */

// Create all necessary tables in the database
export const setupDatabase = async (db) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Users table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            profile_image TEXT,
            role TEXT NOT NULL,
            last_sync INTEGER,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        // Disease detections table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS disease_detections (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            crop_name TEXT NOT NULL,
            image_path TEXT NOT NULL,
            description TEXT,
            confidence REAL,
            advice TEXT,
            treatment TEXT,
            prevention TEXT,
            location TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          );
        `);

        // Groups table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            image_path TEXT,
            join_code TEXT,
            member_count INTEGER DEFAULT 0,
            created_by TEXT,
            is_public INTEGER DEFAULT 1,
            sync_status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
          );
        `);

        // Group members table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS group_members (
            id TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            joined_at INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE (group_id, user_id)
          );
        `);

        // Messages table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            has_attachment INTEGER DEFAULT 0,
            attachment_type TEXT,
            attachment_url TEXT,
            is_read INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          );
        `);

        // Advisory content table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS advisory_content (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            image_path TEXT,
            source TEXT,
            is_favorite INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'synced',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        // Settings table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        // Sync queue table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            record_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT,
            attempts INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        // Disease categories reference table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS disease_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            updated_at INTEGER NOT NULL
          );
        `);

        // Crop types reference table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS crop_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            common_diseases TEXT,
            updated_at INTEGER NOT NULL
          );
        `);

        // Create indexes for better performance
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_disease_detections_user_id ON disease_detections(user_id);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);");
        tx.executeSql("CREATE INDEX IF NOT EXISTS idx_disease_detections_sync_status ON disease_detections(sync_status);");

        // Insert default settings
        tx.executeSql(
          "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["language", "en", Date.now()]
        );
        tx.executeSql(
          "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["sync_interval", "3600000", Date.now()]
        );
        tx.executeSql(
          "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["notifications_enabled", "true", Date.now()]
        );
        tx.executeSql(
          "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["last_sync", "0", Date.now()]
        );
        tx.executeSql(
          "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["data_saver_mode", "false", Date.now()]
        );
      },
      error => {
        console.error('Error setting up database:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};