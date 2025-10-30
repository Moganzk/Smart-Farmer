-- Migration: Create user_settings table
-- Description: Store user preferences and settings

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
    settings_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Notification Preferences (JSONB for flexibility)
    notification_preferences JSONB DEFAULT '{
        "push_enabled": true,
        "email_enabled": true,
        "detection_results": true,
        "group_messages": true,
        "system_updates": true,
        "warnings": true
    }'::jsonb,
    
    -- App Preferences
    app_preferences JSONB DEFAULT '{
        "theme": "auto",
        "language": "en",
        "font_size": "medium",
        "high_contrast": false,
        "reduced_motion": false,
        "offline_mode": false
    }'::jsonb,
    
    -- AI Preferences
    ai_preferences JSONB DEFAULT '{
        "auto_analysis": true,
        "save_images": true,
        "data_contribution": false,
        "model_preference": "standard"
    }'::jsonb,
    
    -- Sync Settings
    sync_settings JSONB DEFAULT '{
        "auto_sync": true,
        "sync_over_wifi_only": false,
        "sync_frequency": "daily"
    }'::jsonb,
    
    -- Privacy Settings
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "registered",
        "location_sharing": "none",
        "data_collection": "minimal"
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_settings_timestamp ON user_settings;
CREATE TRIGGER trigger_update_user_settings_timestamp
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_timestamp();

-- Insert default settings for existing users (if any)
INSERT INTO user_settings (user_id)
SELECT user_id FROM users
WHERE user_id NOT IN (SELECT COALESCE(user_id, 0) FROM user_settings WHERE user_id IS NOT NULL);
