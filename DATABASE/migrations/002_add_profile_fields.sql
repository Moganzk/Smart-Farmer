-- Migration: Add profile fields to users table
-- Date: 2025-10-07

-- Add profile_image column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Add bio column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add expertise column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);

-- Add comments to new columns
COMMENT ON COLUMN users.profile_image IS 'URL or path to user profile image';
COMMENT ON COLUMN users.bio IS 'User biography or about me text';
COMMENT ON COLUMN users.expertise IS 'User areas of expertise (comma-separated)';
