# Group Features Testing Guide

This document provides guidance for testing the group creation and search features in the Smart Farmer application.

## Prerequisites

1. Backend server running
2. Database migrations applied
3. Frontend application running
4. At least 2 test user accounts created

## Test Cases

### Group Creation Tests

1. **Basic Group Creation**
   - Navigate to the Group Search screen
   - Tap "Create Group" button
   - Enter valid name and description
   - Submit form
   - **Expected Result**: New group created, redirected to group view

2. **Group Creation Validation**
   - Attempt to create a group with:
     - Empty name
     - Name less than 3 characters
     - Name more than 50 characters
     - Description more than 500 characters
   - **Expected Result**: Appropriate validation errors shown

3. **Group Creation with Tags**
   - Create a group with 2-3 tags
   - **Expected Result**: Group created with tags visible in group details

4. **Duplicate Group Name**
   - Create a group with name "Test Group"
   - Try to create another group with the exact same name
   - **Expected Result**: Error message indicating duplicate group name

### Group Search Tests

1. **Basic Search**
   - Create groups with names: "Tomato Farmers", "Potato Growers", "Organic Farming"
   - Search for "Tomato"
   - **Expected Result**: "Tomato Farmers" appears in results

2. **Description Search**
   - Create a group with description containing "sustainable practices"
   - Search for "sustainable"
   - **Expected Result**: Group appears in search results

3. **Tag Search**
   - Create a group with tag "organic"
   - Search for "organic"
   - **Expected Result**: Group appears in search results

4. **Empty Search Results**
   - Search for "xyzabc123" (unlikely to match anything)
   - **Expected Result**: "No groups found" message displayed

5. **Search Pagination**
   - Create more than 20 groups (if pagination limit is 20)
   - Perform a generic search that would match many groups
   - **Expected Result**: First page of results shown with pagination controls

### Group Management Tests

1. **Join Group**
   - As User A, create a group
   - As User B, search for the group and tap "Join"
   - **Expected Result**: User B successfully joins group

2. **Leave Group**
   - As User B (from previous test), tap "Leave Group"
   - **Expected Result**: User B successfully leaves group

3. **Member Count Limit**
   - Create a test where group reaches member limit (simulated)
   - Try to join the group
   - **Expected Result**: Error message about group being at capacity

4. **Admin Assignment**
   - As group creator, navigate to group members
   - Make another user an admin
   - **Expected Result**: User is marked as admin in member list

5. **Admin Removal**
   - As group creator, navigate to group members
   - Remove admin status from another user
   - **Expected Result**: User's admin status is removed

### Group Discovery Tests

1. **My Groups Tab**
   - Join several groups
   - Navigate to "My Groups" tab
   - **Expected Result**: All joined groups are displayed

2. **Popular Groups**
   - Create groups with varying member counts
   - Navigate to "Popular" tab
   - **Expected Result**: Groups displayed in order of popularity

3. **Featured Groups**
   - Create a featured group (might require backend admin access)
   - Navigate to group search
   - **Expected Result**: Featured groups appear with featured indicator

## Error Scenarios to Test

1. **Network Failures**
   - Put device in airplane mode
   - Attempt to create/search groups
   - **Expected Result**: Appropriate offline error message

2. **Server Errors**
   - Configure backend to return 500 error for group creation (if possible)
   - Attempt to create a group
   - **Expected Result**: User-friendly error message displayed

3. **Database Consistency**
   - Create a group and immediately search for it
   - **Expected Result**: New group appears in search results

4. **Performance Under Load**
   - Create 100+ groups
   - Perform searches
   - **Expected Result**: Search remains responsive with minimal delay

## Test Environment Setup

### Database Seed Data
```sql
-- Create test groups
INSERT INTO groups (name, description, created_by_id, created_at)
VALUES 
('Tomato Farmers', 'Group for farmers specializing in tomato cultivation', 1, NOW()),
('Potato Growers', 'Discussion forum for potato farming techniques', 1, NOW()),
('Organic Farming', 'Focus on sustainable and organic farming practices', 2, NOW()),
('Smart Irrigation', 'Technologies for efficient water usage', 2, NOW()),
('Market Access', 'Connecting farmers with buyers and markets', 3, NOW());

-- Add tags
INSERT INTO group_tags (group_id, tag_name)
VALUES
(1, 'tomatoes'),
(1, 'vegetables'),
(2, 'potatoes'),
(2, 'vegetables'),
(3, 'organic'),
(3, 'sustainable'),
(4, 'technology'),
(4, 'water'),
(5, 'business'),
(5, 'marketing');
```

## Test Documentation

For each test:
1. Document test name and description
2. Record test steps taken
3. Note expected vs. actual results
4. Document any issues found
5. Include screenshots if visual issues occur

## Regression Testing

After fixing any bugs, re-test:
1. Basic group creation
2. Search functionality
3. Join/leave operations
4. Admin operations

## Performance Metrics

Track and document:
- Time to create a group
- Search response time
- Time to load "My Groups" tab
- Time to join/leave a group