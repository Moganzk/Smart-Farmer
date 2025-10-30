-- Migration: Add image_url field to advisory_content table
-- Date: 2025-10-07

-- Add image_url column to advisory_content
ALTER TABLE advisory_content 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add comment to new column
COMMENT ON COLUMN advisory_content.image_url IS 'URL or path to the advisory content cover image';
