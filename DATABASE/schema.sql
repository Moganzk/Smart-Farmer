-- Drop tables if they exist (useful for development)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS disease_detections CASCADE;
DROP TABLE IF EXISTS advisory_content CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('farmer', 'admin')),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    location VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    failed_login_attempts INT DEFAULT 0,
    last_login_attempt TIMESTAMP,
    storage_used BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_sync_time TIMESTAMP
);

-- Create advisory_content table
CREATE TABLE advisory_content (
    content_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'disease', 'treatment', 'prevention', etc.
    content TEXT NOT NULL,
    crop_type VARCHAR(100),
    disease_name VARCHAR(100),
    severity_level VARCHAR(20),
    image_url VARCHAR(500), -- URL or path to advisory content cover image
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1
);

-- Create disease_detections table
CREATE TABLE disease_detections (
    detection_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    image_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_size INT NOT NULL, -- in bytes
    image_resolution VARCHAR(20),
    detection_result JSONB NOT NULL, -- Stores Gemini API response
    advisory_content_id INT REFERENCES advisory_content(content_id),
    confidence_score FLOAT,
    is_offline_detection BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP,
    retention_expires_at TIMESTAMP, -- 90 days from creation
    notes TEXT
);

-- Create groups table
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(user_id),
    crop_focus VARCHAR(100),
    max_members INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create group_members table
CREATE TABLE group_members (
    group_id INT REFERENCES groups(group_id),
    user_id INT REFERENCES users(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    PRIMARY KEY (group_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id),
    user_id INT REFERENCES users(user_id),
    content TEXT NOT NULL,
    has_attachment BOOLEAN DEFAULT false,
    attachment_type VARCHAR(20),
    attachment_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    action_details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_advisory_crop_disease ON advisory_content(crop_type, disease_name);
CREATE INDEX idx_detections_user_date ON disease_detections(user_id, created_at);
CREATE INDEX idx_messages_group_date ON messages(group_id, created_at);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisory_content_timestamp
    BEFORE UPDATE ON advisory_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_timestamp
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW active_farmers AS
SELECT user_id, username, full_name, location, storage_used
FROM users
WHERE role = 'farmer' AND is_active = true;

CREATE VIEW group_statistics AS
SELECT 
    g.group_id,
    g.name,
    COUNT(DISTINCT gm.user_id) as member_count,
    COUNT(DISTINCT m.message_id) as message_count,
    MAX(m.created_at) as last_activity
FROM groups g
LEFT JOIN group_members gm ON g.group_id = gm.group_id
LEFT JOIN messages m ON g.group_id = m.group_id
WHERE g.is_active = true
GROUP BY g.group_id, g.name;

CREATE VIEW disease_detection_stats AS
SELECT 
    u.location,
    ac.crop_type,
    ac.disease_name,
    COUNT(*) as detection_count,
    AVG(dd.confidence_score) as avg_confidence
FROM disease_detections dd
JOIN users u ON dd.user_id = u.user_id
JOIN advisory_content ac ON dd.advisory_content_id = ac.content_id
GROUP BY u.location, ac.crop_type, ac.disease_name;

-- Add comments to tables
COMMENT ON TABLE users IS 'Stores all user accounts including farmers and admins';
COMMENT ON TABLE advisory_content IS 'Stores disease and treatment information';
COMMENT ON TABLE disease_detections IS 'Records of all disease detection attempts';
COMMENT ON TABLE groups IS 'Farmer discussion groups';
COMMENT ON TABLE messages IS 'Group chat messages';
COMMENT ON TABLE audit_logs IS 'System audit trail';

-- Set retention policy function
CREATE OR REPLACE FUNCTION set_retention_expiry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.retention_expires_at := NEW.created_at + INTERVAL '90 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for retention policy
CREATE TRIGGER set_detection_retention
    BEFORE INSERT ON disease_detections
    FOR EACH ROW
    EXECUTE FUNCTION set_retention_expiry();
