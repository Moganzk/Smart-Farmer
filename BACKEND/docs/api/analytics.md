# Admin Analytics API Documentation

This document outlines the admin analytics API endpoints for the Smart Farmer application.

## Authentication

All analytics endpoints require administrator privileges. Include the JWT token in the request header:

```
Authorization: Bearer <token>
```

## Base URL

```
/api/analytics
```

## Endpoints

### Dashboard Summary

Get a comprehensive summary of key metrics for the admin dashboard.

**Endpoint:** `GET /dashboard`

**Response Example:**
```json
{
  "success": true,
  "data": {
    "userActivity": {
      "activeUsers": {
        "daily_active_users": 45,
        "weekly_active_users": 120,
        "monthly_active_users": 350,
        "total_users": 500
      },
      "featureUsage": {
        "disease_detections": 187,
        "advisory_requests": 234,
        "messages_sent": 1250,
        "group_joins": 56
      }
    },
    "userGrowth": [
      { "period": "2023-01", "new_users": 25 },
      { "period": "2023-02", "new_users": 30 },
      { "period": "2023-03", "new_users": 45 },
      { "period": "2023-04", "new_users": 38 },
      { "period": "2023-05", "new_users": 42 },
      { "period": "2023-06", "new_users": 50 }
    ],
    "topDiseases": [
      { "disease_name": "Late Blight", "detection_count": 45 },
      { "disease_name": "Early Blight", "detection_count": 32 },
      { "disease_name": "Powdery Mildew", "detection_count": 28 },
      { "disease_name": "Downy Mildew", "detection_count": 25 },
      { "disease_name": "Leaf Spot", "detection_count": 20 }
    ],
    "diseaseTrends": [
      { "period": "2023-01", "detection_count": 42 },
      { "period": "2023-02", "detection_count": 50 },
      { "period": "2023-03", "detection_count": 65 },
      { "period": "2023-04", "detection_count": 58 },
      { "period": "2023-05", "detection_count": 70 },
      { "period": "2023-06", "detection_count": 75 }
    ]
  }
}
```

### User Growth

Get user registration statistics over time.

**Endpoint:** `GET /users/growth`

**Query Parameters:**
- `timeframe` (string, optional): Time interval for data points - 'daily', 'weekly', 'monthly', or 'yearly'. Default is 'monthly'.
- `limit` (number, optional): Number of data points to return. Default is 12. Maximum is 50.

**Response Example:**
```json
{
  "success": true,
  "data": [
    { "period": "2023-01", "new_users": 25 },
    { "period": "2023-02", "new_users": 30 },
    { "period": "2023-03", "new_users": 45 },
    { "period": "2023-04", "new_users": 38 },
    { "period": "2023-05", "new_users": 42 },
    { "period": "2023-06", "new_users": 50 },
    { "period": "2023-07", "new_users": 35 },
    { "period": "2023-08", "new_users": 40 },
    { "period": "2023-09", "new_users": 48 },
    { "period": "2023-10", "new_users": 52 },
    { "period": "2023-11", "new_users": 55 },
    { "period": "2023-12", "new_users": 60 }
  ]
}
```

### User Activity

Get metrics on user engagement and feature usage.

**Endpoint:** `GET /users/activity`

**Response Example:**
```json
{
  "success": true,
  "data": {
    "activeUsers": {
      "daily_active_users": 45,
      "weekly_active_users": 120,
      "monthly_active_users": 350,
      "total_users": 500
    },
    "featureUsage": {
      "disease_detections": 187,
      "advisory_requests": 234,
      "messages_sent": 1250,
      "group_joins": 56
    }
  }
}
```

### Disease Statistics

Get statistics about disease detections.

**Endpoint:** `GET /diseases`

**Query Parameters:**
- `timeframe` (string, optional): Time interval for trend data - 'daily', 'weekly', 'monthly', or 'yearly'. Default is 'monthly'.
- `limit` (number, optional): Number of data points to return for trends. Default is 12.
- `cropType` (string, optional): Filter statistics by crop type.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "commonDiseases": [
      { "disease_name": "Late Blight", "detection_count": 45 },
      { "disease_name": "Early Blight", "detection_count": 32 },
      { "disease_name": "Powdery Mildew", "detection_count": 28 },
      { "disease_name": "Downy Mildew", "detection_count": 25 },
      { "disease_name": "Leaf Spot", "detection_count": 20 },
      { "disease_name": "Rust", "detection_count": 18 },
      { "disease_name": "Bacterial Spot", "detection_count": 15 },
      { "disease_name": "Black Rot", "detection_count": 12 },
      { "disease_name": "Mosaic Virus", "detection_count": 10 },
      { "disease_name": "Septoria Leaf Spot", "detection_count": 8 }
    ],
    "trends": [
      { "period": "2023-01", "detection_count": 42 },
      { "period": "2023-02", "detection_count": 50 },
      { "period": "2023-03", "detection_count": 65 },
      { "period": "2023-04", "detection_count": 58 },
      { "period": "2023-05", "detection_count": 70 },
      { "period": "2023-06", "detection_count": 75 },
      { "period": "2023-07", "detection_count": 80 },
      { "period": "2023-08", "detection_count": 72 },
      { "period": "2023-09", "detection_count": 68 },
      { "period": "2023-10", "detection_count": 75 },
      { "period": "2023-11", "detection_count": 85 },
      { "period": "2023-12", "detection_count": 90 }
    ]
  }
}
```

### Group Statistics

Get statistics about farmer groups.

**Endpoint:** `GET /groups`

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nairobi Tomato Farmers",
      "created_at": "2023-01-15T10:30:00Z",
      "member_count": 45,
      "message_count": 1250,
      "last_activity": "2023-06-25T14:20:00Z"
    },
    {
      "id": 2,
      "name": "Maize Growers Association",
      "created_at": "2023-02-10T08:45:00Z",
      "member_count": 38,
      "message_count": 980,
      "last_activity": "2023-06-24T16:35:00Z"
    }
  ]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

Common error codes:
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Valid authentication but insufficient permissions
- `500 Internal Server Error`: Server-side error

## Rate Limiting

Analytics endpoints are subject to rate limiting:
- 100 requests per minute per admin user