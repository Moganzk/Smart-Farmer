-- migrations/006_add_user_settings.sql

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  settings_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "push_enabled": true,
    "email_enabled": true,
    "detection_results": true,
    "group_messages": true,
    "system_updates": true,
    "warnings": true
  }',
  app_preferences JSONB NOT NULL DEFAULT '{
    "theme": "auto",
    "language": "en",
    "font_size": "medium",
    "high_contrast": false,
    "reduced_motion": false,
    "offline_mode": false
  }',
  ai_preferences JSONB NOT NULL DEFAULT '{
    "auto_analysis": true,
    "save_images": true,
    "data_contribution": false,
    "model_preference": "standard"
  }',
  sync_settings JSONB NOT NULL DEFAULT '{
    "auto_sync": true,
    "sync_over_wifi_only": false,
    "sync_frequency": "daily"
  }',
  privacy_settings JSONB NOT NULL DEFAULT '{
    "profile_visibility": "registered",
    "location_sharing": "none",
    "data_collection": "minimal"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add columns to users table for profile if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sync_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;