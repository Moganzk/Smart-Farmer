-- migrations/007_disease_detections.sql

-- Create disease_detections table if it doesn't exist
CREATE TABLE IF NOT EXISTS disease_detections (
  detection_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  disease_name VARCHAR(100) NOT NULL,
  disease_scientific_name VARCHAR(150),
  confidence DECIMAL(4,3) NOT NULL, -- Range from 0.000 to 1.000
  description TEXT,
  symptoms TEXT,
  treatment TEXT,
  prevention TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_detection_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_detection_user_id ON disease_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_crop_type ON disease_detections(crop_type);
CREATE INDEX IF NOT EXISTS idx_detection_disease_name ON disease_detections(disease_name);
CREATE INDEX IF NOT EXISTS idx_detection_created_at ON disease_detections(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_detection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
DROP TRIGGER IF EXISTS update_detection_updated_at_trigger ON disease_detections;
CREATE TRIGGER update_detection_updated_at_trigger
BEFORE UPDATE ON disease_detections
FOR EACH ROW
EXECUTE FUNCTION update_detection_updated_at();