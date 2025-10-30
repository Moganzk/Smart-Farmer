# Group Invitation System

## Overview

The Group Invitation System allows group admins to invite other users to join their farmer groups. It supports inviting users by user ID or by email address, manages invitation states, and provides endpoints for accepting, declining, and cancelling invitations.

## Database Structure

The system uses a `group_invitations` table with the following structure:

```sql
CREATE TABLE group_invitations (
    invitation_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(group_id),
    inviter_id INT NOT NULL REFERENCES users(user_id),
    invitee_id INT REFERENCES users(user_id),
    invitation_email VARCHAR(255),
    token VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE (group_id, invitee_id, status) 
);
```

## API Endpoints

### Send Invitation

`POST /api/groups/:groupId/invitations`

**Request body:**
```json
{
  "userId": 123  // Required if inviting by user ID
}
```

OR

```json
{
  "email": "user@example.com"  // Required if inviting by email
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "data": {
    "invitation": {
      "invitation_id": 1,
      "group_id": 42,
      "inviter_id": 100,
      "invitee_id": 123,
      "invitation_email": null,
      "token": "abcdef123456...",
      "status": "pending",
      "created_at": "2023-05-01T12:00:00Z",
      "expires_at": "2023-05-02T12:00:00Z"
    }
  }
}
```

### List Group Invitations

`GET /api/groups/:groupId/invitations`

**Response:**
```json
{
  "data": {
    "invitations": [
      {
        "invitation_id": 1,
        "group_id": 42,
        "inviter_name": "admin_user",
        "invitee_identifier": "test_user",
        "status": "pending",
        "created_at": "2023-05-01T12:00:00Z",
        "expires_at": "2023-05-02T12:00:00Z"
      }
    ]
  }
}
```

### Get User's Pending Invitations

`GET /api/groups/invitations/pending`

**Response:**
```json
{
  "data": {
    "invitations": [
      {
        "invitation_id": 1,
        "group_id": 42,
        "group_name": "Tomato Growers",
        "inviter_name": "admin_user",
        "status": "pending",
        "created_at": "2023-05-01T12:00:00Z",
        "expires_at": "2023-05-02T12:00:00Z"
      }
    ]
  }
}
```

### Accept Invitation

`POST /api/groups/invitations/:invitationId/accept`

**Response:**
```json
{
  "message": "Invitation accepted successfully",
  "data": {
    "member": {
      "group_id": 42,
      "user_id": 123,
      "joined_at": "2023-05-01T15:30:00Z",
      "is_admin": false
    }
  }
}
```

### Decline Invitation

`POST /api/groups/invitations/:invitationId/decline`

**Response:**
```json
{
  "message": "Invitation declined successfully"
}
```

### Cancel Invitation

`DELETE /api/groups/invitations/:invitationId`

**Response:**
```json
{
  "message": "Invitation cancelled successfully"
}
```

### Get Invitation by Token (Public)

`GET /api/groups/invitations/token/:token`

**Response:**
```json
{
  "data": {
    "invitation": {
      "invitation_id": 1,
      "group_id": 42,
      "inviter_id": 100,
      "invitee_id": null,
      "invitation_email": "user@example.com",
      "token": "abcdef123456...",
      "status": "pending",
      "created_at": "2023-05-01T12:00:00Z",
      "expires_at": "2023-05-02T12:00:00Z"
    },
    "group": {
      "group_id": 42,
      "name": "Tomato Growers",
      "description": "A group for tomato farmers",
      "crop_focus": "Tomatoes",
      "member_count": "15",
      "message_count": "150"
    }
  }
}
```

## Frontend Components

Two React components are provided:

1. `GroupInvitations.jsx` - For group admins to manage invitations
2. `UserInvitations.jsx` - For users to view and respond to invitations

## Invitation Flow

1. Group admin sends invitation to a user (by ID or email)
2. Invited user receives notification (via UI or email)
3. User can accept or decline the invitation
4. If accepted, user is added to the group
5. If declined, invitation is marked as declined
6. Admin can cancel pending invitations
7. Invitations expire after 24 hours

## Security Considerations

- Only group admins can send invitations
- Users can only accept/decline invitations addressed to them
- Invitations use secure random tokens
- Invitations expire after 24 hours
- Each endpoint checks appropriate permissions