-- Admin Moderation Tools Migration

-- Reports table
CREATE TABLE IF NOT EXISTS public.content_reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES public.users(user_id),
    reported_user_id INTEGER NOT NULL REFERENCES public.users(user_id),
    message_id INTEGER REFERENCES public.messages(message_id),
    group_id INTEGER REFERENCES public.groups(group_id),
    report_reason VARCHAR(255) NOT NULL,
    report_description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'rejected'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    resolved_by_id INTEGER REFERENCES public.users(user_id),
    resolution_notes TEXT,
    severity VARCHAR(10) DEFAULT 'medium' -- 'low', 'medium', 'high', 'critical'
);

-- User suspension table
CREATE TABLE IF NOT EXISTS public.user_suspensions (
    suspension_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(user_id),
    group_id INTEGER REFERENCES public.groups(group_id), -- NULL means platform-wide suspension
    admin_id INTEGER NOT NULL REFERENCES public.users(user_id),
    reason TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP, -- NULL means permanent ban
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Deleted message archive
CREATE TABLE IF NOT EXISTS public.message_archive (
    archive_id SERIAL PRIMARY KEY,
    original_message_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES public.users(user_id),
    group_id INTEGER NOT NULL REFERENCES public.groups(group_id),
    content TEXT NOT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_by_id INTEGER NOT NULL REFERENCES public.users(user_id),
    deletion_reason VARCHAR(255) NOT NULL
);

-- User warnings
CREATE TABLE IF NOT EXISTS public.user_warnings (
    warning_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(user_id),
    admin_id INTEGER NOT NULL REFERENCES public.users(user_id),
    warning_message TEXT NOT NULL,
    group_id INTEGER REFERENCES public.groups(group_id), -- NULL means platform-wide warning
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES public.users(user_id),
    action_type VARCHAR(50) NOT NULL, -- 'delete_message', 'suspend_user', 'ban_user', 'restore_message', etc.
    target_user_id INTEGER REFERENCES public.users(user_id),
    target_group_id INTEGER REFERENCES public.groups(group_id),
    target_message_id INTEGER,
    target_report_id INTEGER REFERENCES public.content_reports(report_id),
    action_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Add admin role to users table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('farmer', 'admin', 'super_admin', 'content_moderator', 'group_moderator');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Type already exists, try to alter it
        ALTER TYPE public.user_role ADD VALUE 'super_admin' IF NOT EXISTS;
        ALTER TYPE public.user_role ADD VALUE 'content_moderator' IF NOT EXISTS;
        ALTER TYPE public.user_role ADD VALUE 'group_moderator' IF NOT EXISTS;
END$$;

-- Add role column to users table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role public.user_role DEFAULT 'farmer';
    END IF;
END$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user ON public.content_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON public.user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_active ON public.user_suspensions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON public.admin_activity_log(action_type);

-- Create trigger function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_activity_log(
        admin_id,
        action_type,
        target_user_id,
        target_group_id,
        target_message_id,
        target_report_id,
        action_details,
        ip_address
    ) VALUES (
        NEW.admin_id,
        TG_ARGV[0],
        NEW.user_id,
        NEW.group_id,
        NULL,
        NULL,
        'Automated log entry',
        '0.0.0.0'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for user suspensions
CREATE TRIGGER log_user_suspension
AFTER INSERT ON public.user_suspensions
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_activity('suspend_user');

-- Create triggers for user warnings
CREATE TRIGGER log_user_warning
AFTER INSERT ON public.user_warnings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_activity('warn_user');

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(p_user_id INTEGER, p_group_id INTEGER DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    is_suspended BOOLEAN;
BEGIN
    -- Check for platform-wide suspension
    SELECT EXISTS(
        SELECT 1 
        FROM public.user_suspensions 
        WHERE user_id = p_user_id 
          AND group_id IS NULL 
          AND is_active = TRUE 
          AND (end_date IS NULL OR end_date > NOW())
    ) INTO is_suspended;
    
    IF is_suspended THEN
        RETURN TRUE;
    END IF;
    
    -- Check for group-specific suspension if group_id provided
    IF p_group_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 
            FROM public.user_suspensions 
            WHERE user_id = p_user_id 
              AND group_id = p_group_id 
              AND is_active = TRUE 
              AND (end_date IS NULL OR end_date > NOW())
        ) INTO is_suspended;
        
        RETURN is_suspended;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add function to automatically expire suspensions
CREATE OR REPLACE FUNCTION public.expire_suspensions()
RETURNS void AS $$
BEGIN
    UPDATE public.user_suspensions
    SET is_active = FALSE
    WHERE is_active = TRUE
      AND end_date IS NOT NULL
      AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run expire_suspensions (needs pg_cron extension)
-- This is commented out as it requires superuser privileges
-- SELECT cron.schedule('0 0 * * *', 'SELECT public.expire_suspensions()');

-- Create view for active reports
CREATE OR REPLACE VIEW public.active_reports AS
SELECT 
    cr.*,
    u_reporter.username as reporter_username,
    u_reported.username as reported_username,
    CASE 
        WHEN cr.message_id IS NOT NULL THEN m.content
        ELSE NULL
    END as message_content,
    g.name as group_name
FROM public.content_reports cr
JOIN public.users u_reporter ON cr.reporter_id = u_reporter.user_id
JOIN public.users u_reported ON cr.reported_user_id = u_reported.user_id
LEFT JOIN public.messages m ON cr.message_id = m.message_id
LEFT JOIN public.groups g ON cr.group_id = g.group_id
WHERE cr.status IN ('pending', 'under_review');

-- Create view for moderation metrics
CREATE OR REPLACE VIEW public.moderation_metrics AS
SELECT
    (SELECT COUNT(*) FROM public.content_reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*) FROM public.content_reports WHERE status = 'under_review') as in_review_reports,
    (SELECT COUNT(*) FROM public.content_reports WHERE status = 'resolved' AND created_at > (NOW() - INTERVAL '7 days')) as resolved_last_7_days,
    (SELECT COUNT(*) FROM public.user_suspensions WHERE is_active = TRUE) as active_suspensions,
    (SELECT COUNT(*) FROM public.user_suspensions WHERE is_active = TRUE AND end_date IS NULL) as permanent_bans,
    (SELECT COUNT(*) FROM public.user_warnings WHERE created_at > (NOW() - INTERVAL '30 days')) as warnings_last_30_days,
    (SELECT COUNT(*) FROM public.message_archive WHERE deleted_at > (NOW() - INTERVAL '7 days')) as deleted_messages_last_7_days;