-- Migration: Add image storage in database
-- Date: October 20, 2025

-- Add profile_image column to users table as BYTEA (PostgreSQL's binary data type)
ALTER TABLE users 
ADD COLUMN profile_image BYTEA,
ADD COLUMN profile_image_content_type VARCHAR(50),
ADD COLUMN profile_image_updated_at TIMESTAMP;

-- Add a column for splash screen background for users who want to customize it
ALTER TABLE users
ADD COLUMN custom_splash_background BYTEA,
ADD COLUMN splash_background_content_type VARCHAR(50);

-- Modify disease_detections table to store image data in database
ALTER TABLE disease_detections
ADD COLUMN image_data BYTEA,
ADD COLUMN image_content_type VARCHAR(50);

-- Create a new table for app images (splash screens, defaults, etc.)
CREATE TABLE app_images (
    image_id SERIAL PRIMARY KEY,
    image_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'default_splash', 'logo', etc.
    image_data BYTEA NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    description TEXT,
    width INT,
    height INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_app_images_key ON app_images(image_key);

-- Create functions to convert between file paths and database storage
CREATE OR REPLACE FUNCTION import_image_to_db(file_path TEXT) 
RETURNS BYTEA AS $$
DECLARE
    content BYTEA;
BEGIN
    SELECT pg_read_binary_file(file_path) INTO content;
    RETURN content;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error importing image: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to determine content type from file extension
CREATE OR REPLACE FUNCTION get_content_type(file_path TEXT)
RETURNS TEXT AS $$
DECLARE
    extension TEXT;
BEGIN
    extension := lower(substring(file_path FROM '\.([^\.]+)$'));
    
    CASE extension
        WHEN 'jpg' THEN RETURN 'image/jpeg';
        WHEN 'jpeg' THEN RETURN 'image/jpeg';
        WHEN 'png' THEN RETURN 'image/png';
        WHEN 'gif' THEN RETURN 'image/gif';
        WHEN 'webp' THEN RETURN 'image/webp';
        ELSE RETURN 'application/octet-stream';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create a procedure to insert default app images
CREATE OR REPLACE PROCEDURE insert_default_app_image(
    p_key TEXT,
    p_file_path TEXT,
    p_description TEXT,
    p_admin_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_content_type TEXT;
    v_image_data BYTEA;
BEGIN
    -- Get content type from file extension
    v_content_type := get_content_type(p_file_path);
    
    -- Read image data
    v_image_data := import_image_to_db(p_file_path);
    
    -- Insert image
    INSERT INTO app_images (
        image_key,
        image_data,
        content_type,
        description,
        created_by
    ) VALUES (
        p_key,
        v_image_data,
        v_content_type,
        p_description,
        p_admin_id
    )
    ON CONFLICT (image_key) 
    DO UPDATE SET 
        image_data = v_image_data,
        content_type = v_content_type,
        description = p_description,
        updated_at = CURRENT_TIMESTAMP;
        
    RAISE NOTICE 'Inserted image: %', p_key;
END;
$$;

-- Create API for retrieving images
CREATE OR REPLACE FUNCTION get_app_image(p_key TEXT)
RETURNS TABLE(image_data BYTEA, content_type TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT a.image_data, a.content_type
    FROM app_images a
    WHERE a.image_key = p_key;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to update the updated_at timestamp
CREATE TRIGGER update_app_images_timestamp
    BEFORE UPDATE ON app_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create comments explaining the changes
COMMENT ON COLUMN users.profile_image IS 'Binary storage for user profile images';
COMMENT ON COLUMN users.custom_splash_background IS 'Optional custom splash screen background image';
COMMENT ON COLUMN disease_detections.image_data IS 'Binary storage for disease detection images';
COMMENT ON TABLE app_images IS 'Stores application images like splash screens, logos, and default backgrounds';