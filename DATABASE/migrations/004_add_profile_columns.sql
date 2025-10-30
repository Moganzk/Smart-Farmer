-- Add missing columns to users table for profile functionality
-- Migration: 004_add_profile_columns

BEGIN;

-- Add profile_image column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Add bio column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add expertise column (for farmers to list their areas of expertise)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS expertise TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_image IS 'Relative path to user profile image';
COMMENT ON COLUMN users.bio IS 'User biography/description';
COMMENT ON COLUMN users.expertise IS 'Areas of farming expertise (for farmers)';

COMMIT;
