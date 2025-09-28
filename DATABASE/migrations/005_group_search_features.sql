/**
 * Database migration for group search and additional features
 */

-- Make sure we're using our database
SET search_path TO public;

-- Add a search index on groups table
CREATE INDEX IF NOT EXISTS idx_groups_name_tsvector ON groups USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_groups_description_tsvector ON groups USING GIN (to_tsvector('english', description));

-- Add is_featured column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add view count and last activity columns to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update last_activity_at whenever a message is created
CREATE OR REPLACE FUNCTION update_group_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups 
    SET last_activity_at = NOW() 
    WHERE group_id = NEW.group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_activity_at
DROP TRIGGER IF EXISTS update_group_activity ON messages;
CREATE TRIGGER update_group_activity
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_group_last_activity();

-- Add function to increment group view count
CREATE OR REPLACE FUNCTION increment_group_view_count(p_group_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE groups 
    SET view_count = view_count + 1 
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- Add group tags for improved search
CREATE TABLE IF NOT EXISTS group_tags (
    tag_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    UNIQUE (group_id, tag_name)
);

-- Create index for better tag search
CREATE INDEX IF NOT EXISTS idx_group_tags_name ON group_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_group_tags_group_id ON group_tags(group_id);

-- Sample data for testing
INSERT INTO group_tags (group_id, tag_name)
VALUES 
    (1, 'maize'),
    (1, 'corn'),
    (1, 'cereals'),
    (2, 'tomato'),
    (2, 'vegetables'),
    (2, 'greenhouse'),
    (3, 'coffee')
ON CONFLICT DO NOTHING;

-- Update some groups to be featured
UPDATE groups SET is_featured = true WHERE group_id IN (1, 2);