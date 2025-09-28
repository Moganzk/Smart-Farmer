// Simple test server script
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Test registration endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Register request received:', req.body);
  res.status(201).json({ 
    success: true, 
    message: 'User registered successfully',
    user: {
      id: 1,
      username: req.body.username,
      email: req.body.email,
      role: req.body.role
    }
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.status(200).json({ 
    success: true, 
    token: 'test-token-for-testing-purposes-only',
    user: {
      id: 1,
      username: 'TestUser',
      email: req.body.email,
      role: 'farmer'
    }
  });
});

// Test profile endpoint
app.get('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    id: 1,
    username: 'TestUser',
    email: 'test@example.com',
    role: 'farmer',
    location: 'Nairobi',
    phoneNumber: '+254700000000',
    farmSize: '2 acres',
    primaryCrops: ['Maize', 'Beans']
  });
});

// Test notifications endpoint
app.get('/api/notifications', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    total: 2,
    notifications: [
      {
        id: 1,
        title: 'Welcome to Smart Farmer!',
        message: 'Thank you for joining our platform.',
        type: 'info',
        created_at: new Date(),
        is_read: false
      },
      {
        id: 2,
        title: 'New Feature Available',
        message: 'Try our new crop disease detection feature.',
        type: 'info',
        created_at: new Date(),
        is_read: true
      }
    ]
  });
});

// Mock analytics endpoints
app.get('/api/analytics/dashboard', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    success: true,
    data: {
      userActivity: {
        activeUsers: {
          daily_active_users: 45,
          weekly_active_users: 120,
          monthly_active_users: 350,
          total_users: 500
        },
        featureUsage: {
          disease_detections: 187,
          advisory_requests: 234,
          messages_sent: 1250,
          group_joins: 56
        }
      },
      userGrowth: [
        { period: "2023-01", new_users: 25 },
        { period: "2023-02", new_users: 30 },
        { period: "2023-03", new_users: 45 },
        { period: "2023-04", new_users: 38 },
        { period: "2023-05", new_users: 42 },
        { period: "2023-06", new_users: 50 }
      ],
      topDiseases: [
        { disease_name: "Late Blight", detection_count: 45 },
        { disease_name: "Early Blight", detection_count: 32 },
        { disease_name: "Powdery Mildew", detection_count: 28 },
        { disease_name: "Downy Mildew", detection_count: 25 },
        { disease_name: "Leaf Spot", detection_count: 20 }
      ],
      diseaseTrends: [
        { period: "2023-01", detection_count: 42 },
        { period: "2023-02", detection_count: 50 },
        { period: "2023-03", detection_count: 65 },
        { period: "2023-04", detection_count: 58 },
        { period: "2023-05", detection_count: 70 },
        { period: "2023-06", detection_count: 75 }
      ]
    }
  });
});

app.get('/api/analytics/users/growth', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    success: true,
    data: [
      { period: "2023-01", new_users: 25 },
      { period: "2023-02", new_users: 30 },
      { period: "2023-03", new_users: 45 },
      { period: "2023-04", new_users: 38 },
      { period: "2023-05", new_users: 42 },
      { period: "2023-06", new_users: 50 }
    ]
  });
});

app.get('/api/analytics/users/activity', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    success: true,
    data: {
      activeUsers: {
        daily_active_users: 45,
        weekly_active_users: 120,
        monthly_active_users: 350,
        total_users: 500
      },
      featureUsage: {
        disease_detections: 187,
        advisory_requests: 234,
        messages_sent: 1250,
        group_joins: 56
      }
    }
  });
});

app.get('/api/analytics/diseases', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    success: true,
    data: {
      commonDiseases: [
        { disease_name: "Late Blight", detection_count: 45 },
        { disease_name: "Early Blight", detection_count: 32 },
        { disease_name: "Powdery Mildew", detection_count: 28 },
        { disease_name: "Downy Mildew", detection_count: 25 },
        { disease_name: "Leaf Spot", detection_count: 20 }
      ],
      trends: [
        { period: "2023-01", detection_count: 42 },
        { period: "2023-02", detection_count: 50 },
        { period: "2023-03", detection_count: 65 },
        { period: "2023-04", detection_count: 58 },
        { period: "2023-05", detection_count: 70 },
        { period: "2023-06", detection_count: 75 }
      ]
    }
  });
});

app.get('/api/analytics/groups', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(200).json({
    success: true,
    data: [
      {
        id: 1,
        name: "Nairobi Tomato Farmers",
        created_at: "2023-01-15T10:30:00Z",
        member_count: 45,
        message_count: 1250,
        last_activity: "2023-06-25T14:20:00Z"
      },
      {
        id: 2,
        name: "Maize Growers Association",
        created_at: "2023-02-10T08:45:00Z",
        member_count: 38,
        message_count: 980,
        last_activity: "2023-06-24T16:35:00Z"
      }
    ]
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});