-- Migration: Create disease_reference_images table for remote URLs
-- Run this file: psql -U postgres -d smart_farmer -f DATABASE/migrations/004_create_disease_reference_images.sql

-- Drop existing table if exists
DROP TABLE IF EXISTS disease_reference_images CASCADE;

-- Create disease reference images table
CREATE TABLE disease_reference_images (
  id SERIAL PRIMARY KEY,
  crop_type VARCHAR(50) NOT NULL,
  disease_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  severity_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  symptoms TEXT,
  treatment TEXT,
  prevention TEXT,
  source VARCHAR(50) DEFAULT 'PlantVillage',
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast queries
CREATE INDEX idx_crop_disease ON disease_reference_images(crop_type, disease_name);
CREATE INDEX idx_crop_type ON disease_reference_images(crop_type);
CREATE INDEX idx_disease_name ON disease_reference_images(disease_name);
CREATE INDEX idx_is_active ON disease_reference_images(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disease_reference_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_disease_reference_images_timestamp
  BEFORE UPDATE ON disease_reference_images
  FOR EACH ROW
  EXECUTE FUNCTION update_disease_reference_images_updated_at();

-- Insert sample data with working URLs
-- These are example URLs - you'll populate with real ones from the seed script

COMMENT ON TABLE disease_reference_images IS 'Stores remote URLs to disease reference images from PlantVillage and other sources';
COMMENT ON COLUMN disease_reference_images.image_url IS 'Full size image URL from GitHub or CDN';
COMMENT ON COLUMN disease_reference_images.thumbnail_url IS 'Optional smaller version for list views';
COMMENT ON COLUMN disease_reference_images.severity_level IS 'Disease severity: low, medium, high';

-- Grant permissions
GRANT ALL PRIVILEGES ON disease_reference_images TO postgres;
GRANT ALL PRIVILEGES ON SEQUENCE disease_reference_images_id_seq TO postgres;

-- Success message
SELECT 'disease_reference_images table created successfully!' AS status;
