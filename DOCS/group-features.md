# Group Creation and Search Features

This document outlines the implementation of group creation and search features for the Smart Farmer application.

## Features Implemented

### Group Creation

- Users can create new groups with name and description
- Group names must be between 3-50 characters
- Optional description field with up to 500 characters
- Support for adding tags to categorize groups
- Creators automatically become group admins

### Group Search

- Full-text search across group names, descriptions, and tags
- Search results with relevance ranking
- Pagination support for large result sets
- Featured groups are prioritized in search results

### Group Management

- Join/leave functionality with proper validation
- Member count limits (100 per group)
- Admin role assignment and removal
- Member listing with admin status indicators

### Group Discovery

- "My Groups" listing for groups the user belongs to
- "Popular Groups" based on member count and activity
- Featured groups highlighted in the interface
- Tag-based filtering and categorization

## Architecture

### Backend Components

1. **Database Schema**
   - Enhanced groups table with search indexing
   - Group tags for improved categorization and search
   - Group activity tracking (view count, last activity)
   - Optimized queries with proper indexing

2. **Group Model**
   - Core CRUD operations for groups
   - Advanced search using PostgreSQL full-text search
   - Member management with validation
   - Admin permission handling

3. **Group Service**
   - Business logic for group operations
   - Validation and error handling
   - Proper permission checking
   - Special operations (featured groups, popularity)

4. **Group Controller**
   - RESTful API endpoints
   - Request validation
   - Response formatting
   - Error handling with appropriate status codes

5. **API Routes**
   - Group CRUD operations
   - Search and filtering endpoints
   - Member management endpoints
   - Admin operations endpoints

### Frontend Components

1. **Group Search Screen**
   - Search bar with instant results
   - Tabbed interface (My Groups, Popular, Search Results)
   - Empty state handling
   - Create group button

2. **Group List Item Component**
   - Clean display of group information
   - Tag badges
   - Member and message counts
   - Admin indicators
   - Featured badges

3. **Create Group Screen**
   - Form validation
   - Character counting
   - Tag management interface
   - Error handling and feedback

4. **Group Service**
   - API integration
   - Error handling
   - Data transformation
   - Cached responses for better performance

## Database Optimizations

1. **Search Indexing**
   ```sql
   CREATE INDEX idx_groups_name_tsvector ON groups USING GIN (to_tsvector('english', name));
   CREATE INDEX idx_groups_description_tsvector ON groups USING GIN (to_tsvector('english', description));
   ```

2. **Activity Tracking**
   ```sql
   -- Automatically update last_activity_at when a new message is posted
   CREATE TRIGGER update_group_activity
   AFTER INSERT ON messages
   FOR EACH ROW
   EXECUTE FUNCTION update_group_last_activity();
   ```

3. **Tag-Based Search**
   ```sql
   CREATE TABLE group_tags (
       tag_id SERIAL PRIMARY KEY,
       group_id INTEGER NOT NULL,
       tag_name VARCHAR(50) NOT NULL,
       FOREIGN KEY (group_id) REFERENCES groups(group_id),
       UNIQUE (group_id, tag_name)
   );
   
   CREATE INDEX idx_group_tags_name ON group_tags(tag_name);
   ```

## API Endpoints

| Method | Endpoint                    | Description                   |
|--------|----------------------------|-------------------------------|
| POST   | /api/groups                | Create a new group            |
| GET    | /api/groups                | Get user's groups             |
| GET    | /api/groups/search         | Search for groups             |
| GET    | /api/groups/popular        | Get popular groups            |
| GET    | /api/groups/:id            | Get a specific group          |
| POST   | /api/groups/:id/join       | Join a group                  |
| DELETE | /api/groups/:id/leave      | Leave a group                 |
| GET    | /api/groups/:id/members    | Get group members             |
| POST   | /api/groups/:id/admins     | Make a user an admin          |
| DELETE | /api/groups/:id/admins     | Remove admin role             |

## Technical Constraints

- Maximum 100 members per group (as per project requirements)
- Group names must be between 3-50 characters
- Group descriptions limited to 500 characters
- Tags limited to 50 characters each
- Search results paginated (default: 20 per page)
- Proper indexing for efficient search operations
- Authorization checks for admin operations

## Future Enhancements

1. **Group Invitations**
   - Direct invitations to specific users
   - Invitation links for sharing
   - Invitation management for admins

2. **Enhanced Search Filters**
   - Filter by crop type
   - Filter by location/region
   - Filter by activity level
   - Filter by member count

3. **Group Analytics**
   - Member growth over time
   - Message activity trends
   - Most active members
   - Popular discussion topics

4. **Content Moderation**
   - Admin tools to manage inappropriate content
   - Report functionality for users
   - Content guidelines enforcement

5. **Group Privacy Settings**
   - Public vs. private groups
   - Approval-required groups
   - Hidden groups for sensitive topics