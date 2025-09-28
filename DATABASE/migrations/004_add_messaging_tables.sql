-- Add message-related tables to database schema

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    message_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    has_attachment BOOLEAN DEFAULT FALSE,
    attachment_type VARCHAR(50),
    attachment_path TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (group_id) REFERENCES public.groups(group_id),
    FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    reaction_id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction_type VARCHAR(20) NOT NULL, -- e.g., 'like', 'love', 'thumbs_up'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (message_id) REFERENCES public.messages(message_id),
    FOREIGN KEY (user_id) REFERENCES public.users(user_id),
    UNIQUE (message_id, user_id, reaction_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);

-- Offline message status tracking table
CREATE TABLE IF NOT EXISTS public.offline_message_tracking (
    tracking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    client_message_id VARCHAR(100) NOT NULL, -- Client-generated ID for tracking
    server_message_id INTEGER,               -- Server message ID once processed
    status VARCHAR(20) NOT NULL,             -- 'pending', 'processed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES public.users(user_id),
    FOREIGN KEY (server_message_id) REFERENCES public.messages(message_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_offline_message_tracking_user_id ON offline_message_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_message_tracking_client_id ON public.offline_message_tracking(client_message_id);

-- Profanity filter words table
CREATE TABLE IF NOT EXISTS public.profanity_filter_words (
    word_id SERIAL PRIMARY KEY,
    word VARCHAR(50) NOT NULL UNIQUE,
    severity INTEGER DEFAULT 1, -- 1 = mild, 2 = medium, 3 = severe
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample profanity words
INSERT INTO public.profanity_filter_words (word, severity)
VALUES 
    ('badword1', 1),
    ('badword2', 2),
    ('badword3', 3)
ON CONFLICT (word) DO NOTHING;

-- Comment if you don't want to add these sample messages
INSERT INTO public.messages (group_id, user_id, content)
VALUES 
    (1, 1, 'This is a sample message in group 1'),
    (1, 2, 'Hello everyone in group 1!'),
    (2, 1, 'This is a sample message in group 2'),
    (2, 3, 'Hello farmers in group 2!')
ON CONFLICT DO NOTHING;