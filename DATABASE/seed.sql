-- Initial seed data for smart_farmer database
-- Note: Passwords are hashed versions of 'Password123!' - in real app, they'll be properly hashed with bcrypt

-- Admin Users
INSERT INTO users (username, email, password_hash, role, full_name, phone_number, location, preferred_language)
VALUES 
    ('admin1', 'admin1@smartfarmer.co.ke', '$2a$12$LQVyYQktL5X1p6CyqkAkE.cssXkGlwEEHD3rosZ9CZK', 'admin', 'John Admin', '+254700000001', 'Nairobi', 'en'),
    ('admin2', 'admin2@smartfarmer.co.ke', '$2a$12$LQVyYQktL5X1p6CyqkAkE.cssXkGlwEEHD3rosZ9CZK', 'admin', 'Mary Admin', '+254700000002', 'Mombasa', 'en');

-- Farmer Users
INSERT INTO users (username, email, password_hash, role, full_name, phone_number, location, preferred_language)
VALUES 
    ('farmer1', 'farmer1@gmail.com', '$2a$12$LQVyYQktL5X1p6CyqkAkE.cssXkGlwEEHD3rosZ9CZK', 'farmer', 'Alice Farmer', '+254700000003', 'Nakuru', 'en'),
    ('farmer2', 'farmer2@gmail.com', '$2a$12$LQVyYQktL5X1p6CyqkAkE.cssXkGlwEEHD3rosZ9CZK', 'farmer', 'Bob Farmer', '+254700000004', 'Kisumu', 'sw'),
    ('farmer3', 'farmer3@gmail.com', '$2a$12$LQVyYQktL5X1p6CyqkAkE.cssXkGlwEEHD3rosZ9CZK', 'farmer', 'Carol Farmer', '+254700000005', 'Eldoret', 'en');

-- Advisory Content
INSERT INTO advisory_content (title, content_type, content, crop_type, disease_name, severity_level, created_by)
VALUES
    ('Maize Leaf Blight', 'disease', 'Northern corn leaf blight is characterized by long, cigar-shaped lesions that are grayish-green to tan in color.', 'Maize', 'Northern Leaf Blight', 'high', 1),
    ('Tomato Late Blight', 'disease', 'Dark brown spots on leaves and stems, white fungal growth on leaf undersides in humid conditions.', 'Tomato', 'Late Blight', 'severe', 1),
    ('Coffee Rust Treatment', 'treatment', 'Apply copper-based fungicide early in the season. Ensure good air circulation between plants.', 'Coffee', 'Coffee Rust', 'moderate', 2),
    ('Bean Anthracnose Prevention', 'prevention', 'Use disease-free seeds, rotate crops, and avoid working with wet plants.', 'Beans', 'Anthracnose', 'moderate', 2);

-- Groups
INSERT INTO groups (name, description, created_by, crop_focus, max_members)
VALUES
    ('Maize Growers Kenya', 'Discussion group for maize farmers in Kenya', 1, 'Maize', 100),
    ('Tomato Experts', 'Knowledge sharing for tomato diseases and prevention', 2, 'Tomato', 100),
    ('Coffee Farmers Network', 'Support group for coffee farmers', 1, 'Coffee', 100);

-- Group Members
INSERT INTO group_members (group_id, user_id, is_admin)
VALUES
    (1, 3, true),  -- farmer1 in Maize group as admin
    (1, 4, false), -- farmer2 in Maize group
    (2, 4, true),  -- farmer2 in Tomato group as admin
    (2, 5, false), -- farmer3 in Tomato group
    (3, 3, false), -- farmer1 in Coffee group
    (3, 5, true);  -- farmer3 in Coffee group as admin

-- Sample Messages
INSERT INTO messages (group_id, user_id, content)
VALUES
    (1, 3, 'Has anyone noticed unusual spots on their maize leaves this season?'),
    (1, 4, 'Yes, I''ve seen some grey-green lesions. Could be leaf blight.'),
    (2, 4, 'Best practices for preventing late blight in tomatoes?'),
    (2, 5, 'Regular fungicide application and proper spacing has worked well for me.'),
    (3, 5, 'New coffee rust prevention techniques discussion this Saturday!');

-- Sample Disease Detections
INSERT INTO disease_detections (user_id, image_path, original_filename, file_size, image_resolution, detection_result, advisory_content_id, confidence_score)
VALUES
    (3, '/images/2025/09/detection1.jpg', 'maize_leaf.jpg', 2097152, '1920x1080', 
    '{"disease": "Northern Leaf Blight", "confidence": 0.92}', 1, 0.92),
    (4, '/images/2025/09/detection2.jpg', 'tomato_plant.jpg', 1048576, '1280x720',
    '{"disease": "Late Blight", "confidence": 0.89}', 2, 0.89),
    (5, '/images/2025/09/detection3.jpg', 'coffee_leaf.jpg', 3145728, '1920x1080',
    '{"disease": "Coffee Rust", "confidence": 0.95}', 3, 0.95);

-- Sample Audit Logs
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, action_details)
VALUES
    (1, 'CREATE', 'advisory_content', 1, '{"action": "Added new disease entry", "disease": "Maize Leaf Blight"}'),
    (2, 'UPDATE', 'users', 3, '{"action": "Updated user status", "status": "active"}'),
    (1, 'DELETE', 'messages', 1, '{"action": "Removed inappropriate content"}');