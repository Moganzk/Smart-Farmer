# Admin Moderation Tools

This document outlines the implementation of admin moderation tools for the Smart Farmer application.

## Features Implemented

### Content Moderation

- Flag and review inappropriate messages
- Block and unblock users from groups
- Delete inappropriate content
- Issue warnings to users
- Review user reports

### User Management

- View user activity and message history
- Temporarily suspend users from groups
- Permanently ban users for serious violations
- Review user profile information
- Manage group admin assignments

### Report Management

- View and respond to content reports from users
- Categorize reports by severity and type
- Track resolution status of reports
- Generate moderation activity reports
- Set automated moderation rules

### Group Management

- Ability to join any group for monitoring purposes
- Monitor group activity metrics and health
- Archive inactive or problematic groups
- Feature high-quality groups
- Send announcements to group members

## Architecture

### Backend Components

1. **Moderation Service**
   - Handle report creation and processing
   - Implement user suspension and banning logic
   - Track moderation actions and history
   - Integrate with notification system

2. **Report Model**
   - Store user-submitted reports
   - Track report status and resolution
   - Link to reported content
   - Include moderator actions

3. **Admin Controller**
   - Expose moderation APIs
   - Implement authorization for admin-only actions
   - Process content deletion requests
   - Handle user suspension actions

4. **Message Archive**
   - Store deleted messages for audit purposes
   - Implement retention policies
   - Secure access control for admins only
   - Support for restoring incorrectly deleted content

### Frontend Components

1. **Admin Dashboard**
   - Overview of reported content
   - Moderation queue with priority markers
   - Actionable items and pending reports
   - Moderation activity metrics

2. **Report Review Screen**
   - Display reported content in context
   - Show reporter information and reason
   - Provide moderation action buttons
   - Track resolution status

3. **User Management Panel**
   - Search and filter users
   - View user activity and reported content
   - Apply suspension or ban actions
   - Review user group memberships

4. **Content Audit Screen**
   - Search through message archives
   - Filter by group, user, date, or content type
   - Restore incorrectly deleted content
   - Export audit logs for compliance

## Database Schema

```sql
-- Reports table
CREATE TABLE public.content_reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(user_id),
    reported_user_id INTEGER NOT NULL REFERENCES users(user_id),
    message_id INTEGER REFERENCES messages(message_id),
    group_id INTEGER REFERENCES groups(group_id),
    report_reason VARCHAR(255) NOT NULL,
    report_description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'rejected'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    resolved_by_id INTEGER REFERENCES users(user_id),
    resolution_notes TEXT,
    severity VARCHAR(10) DEFAULT 'medium' -- 'low', 'medium', 'high', 'critical'
);

-- User suspension table
CREATE TABLE public.user_suspensions (
    suspension_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    group_id INTEGER REFERENCES groups(group_id), -- NULL means platform-wide suspension
    admin_id INTEGER NOT NULL REFERENCES users(user_id),
    reason TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP, -- NULL means permanent ban
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Deleted message archive
CREATE TABLE public.message_archive (
    archive_id SERIAL PRIMARY KEY,
    original_message_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    group_id INTEGER NOT NULL REFERENCES groups(group_id),
    content TEXT NOT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_by_id INTEGER NOT NULL REFERENCES users(user_id),
    deletion_reason VARCHAR(255) NOT NULL
);

-- User warnings
CREATE TABLE public.user_warnings (
    warning_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    admin_id INTEGER NOT NULL REFERENCES users(user_id),
    warning_message TEXT NOT NULL,
    group_id INTEGER REFERENCES groups(group_id), -- NULL means platform-wide warning
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE public.admin_activity_log (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(user_id),
    action_type VARCHAR(50) NOT NULL, -- 'delete_message', 'suspend_user', 'ban_user', 'restore_message', etc.
    target_user_id INTEGER REFERENCES users(user_id),
    target_group_id INTEGER REFERENCES groups(group_id),
    target_message_id INTEGER,
    target_report_id INTEGER REFERENCES content_reports(report_id),
    action_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Indexes
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_reported_user ON public.content_reports(reported_user_id);
CREATE INDEX idx_user_suspensions_user_id ON public.user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_active ON public.user_suspensions(is_active);
CREATE INDEX idx_admin_activity_log_admin ON public.admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_log_action_type ON public.admin_activity_log(action_type);
```

## API Endpoints

| Method | Endpoint                                  | Description                           |
|--------|------------------------------------------|---------------------------------------|
| GET    | /api/admin/reports                       | Get all content reports               |
| GET    | /api/admin/reports/:id                   | Get a specific report                 |
| PUT    | /api/admin/reports/:id/status            | Update report status                  |
| POST   | /api/admin/users/:id/suspend             | Suspend a user                        |
| POST   | /api/admin/users/:id/ban                 | Permanently ban a user                |
| DELETE | /api/admin/users/:id/suspension          | Remove a user suspension              |
| POST   | /api/admin/users/:id/warn                | Issue a warning to a user             |
| GET    | /api/admin/users/:id/reports             | Get reports involving a user          |
| GET    | /api/admin/groups/:id/reports            | Get reports from a group              |
| GET    | /api/admin/messages/archived             | Get archived (deleted) messages       |
| POST   | /api/admin/messages/:id/delete           | Delete a message                      |
| POST   | /api/admin/messages/:id/restore          | Restore a deleted message             |
| POST   | /api/admin/groups/:id/join               | Join a group as an admin              |
| POST   | /api/admin/groups/:id/feature            | Mark a group as featured              |
| DELETE | /api/admin/groups/:id/feature            | Remove featured status from group     |
| GET    | /api/admin/activity-log                  | Get admin activity logs               |
| GET    | /api/admin/metrics                       | Get moderation metrics and statistics |

## Admin Roles and Permissions

### Super Admin
- Full access to all moderation features
- Manage admin users and permissions
- Configure system-wide moderation settings
- Access audit logs and all deleted content
- Cannot be suspended or banned

### Content Moderator
- Review and act on reported content
- Issue warnings and temporary suspensions
- Delete inappropriate messages
- Join groups for monitoring
- View limited user information

### Group Moderator
- Moderate specific assigned groups
- Manage group membership
- Review reports from assigned groups
- Issue warnings to group members
- Escalate serious violations to Super Admin

## Implementation Guidelines

### Report Processing Workflow

1. **Report Creation**
   - User submits report through app
   - System assigns severity based on keywords
   - High-severity reports flagged for immediate review

2. **Review Process**
   - Admin reviews reported content in context
   - Checks user history for previous violations
   - Makes determination on appropriate action

3. **Action Taken**
   - Warning, suspension, ban, or content deletion
   - Feedback provided to reporting user
   - All actions logged for audit purposes

4. **Follow-up**
   - Monitor user behavior post-warning
   - Review appeal requests if applicable
   - Update report status based on resolution

### User Suspension Levels

1. **Warning**
   - No restrictions, but noted on user record
   - Multiple warnings may lead to suspension
   - Expires after 90 days

2. **Temporary Group Suspension**
   - Banned from specific group for 1-30 days
   - Can still access other platform features
   - Receives notification of suspension reason

3. **Platform Suspension**
   - Restricted from all interactive features
   - Duration based on violation severity
   - Requires admin approval to lift

4. **Permanent Ban**
   - Account deactivated
   - No access to platform features
   - Requires appeal process for reinstatement

### Audit and Compliance

1. **Activity Logging**
   - All admin actions recorded with timestamp
   - IP address logged for security
   - Regular audit of admin activities

2. **Content Preservation**
   - Deleted content stored in archive
   - Limited access to archived content
   - 90-day retention policy with option to extend

3. **Reporting**
   - Weekly moderation activity reports
   - Monthly trend analysis
   - Identification of problematic users/groups

## Integration with Existing Features

The admin moderation tools integrate with:

1. **Messaging System**
   - Real-time monitoring of flagged keywords
   - Ability to delete messages platform-wide
   - Integration with message archive

2. **Group Management**
   - Ability to monitor group activity
   - Tools to manage group membership
   - Option to archive problematic groups

3. **User Management**
   - Extended user profiles with violation history
   - Suspension and ban management
   - Warning notification system

4. **Notification System**
   - Alerts for high-priority reports
   - Notifications to users about moderation actions
   - Reminders for pending moderation tasks

## Security Considerations

1. **Access Control**
   - Role-based permissions strictly enforced
   - Two-factor authentication for admin actions
   - IP restrictions for admin panel access

2. **Data Protection**
   - Encryption of sensitive moderation data
   - Limited access to user conversation history
   - Secure storage of deleted content

3. **Audit Trail**
   - Comprehensive logging of all admin actions
   - Immutable audit records
   - Regular review of admin activity

## Performance Considerations

1. **Queue Management**
   - Prioritization of reports based on severity
   - Load balancing for review tasks
   - Optimized database queries for report listing

2. **Caching Strategy**
   - Cache frequently accessed moderation data
   - Reduce database load for common queries
   - Real-time updates for critical information

3. **Batch Processing**
   - Bulk actions for efficient moderation
   - Scheduled tasks for routine maintenance
   - Asynchronous processing for non-critical operations