# 📱 SMART FARMER: COMPLETE DOCUMENTATION

**Date:** October 20, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 📑 TABLE OF CONTENTS

1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [Setup Instructions](#setup-instructions)
5. [Backend Documentation](#backend-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [Database Documentation](#database-documentation)
8. [Testing Documentation](#testing-documentation)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Admin Guide](#admin-guide)
11. [User Guide](#user-guide)
12. [API Reference](#api-reference)
13. [Deployment Guide](#deployment-guide)

---

## 📚 INTRODUCTION <a name="introduction"></a>

Smart Farmer is a mobile application designed to help farmers in Kenya connect, share knowledge, and access disease detection and advisory services. The app includes user authentication, profile management, group messaging, disease detection using AI, and advisory content.

### Core Features:

- 👤 **User Authentication** - Secure registration and login
- 👨‍🌾 **Profile Management** - Edit profile, change settings
- 👥 **Farmer Groups** - Create, join, and manage groups
- 💬 **Messaging System** - Group chats and direct messages
- 🌿 **Disease Detection** - Upload plant images for analysis
- 📊 **Advisory Content** - Browse farming tips and guidance
- 🌐 **Offline Support** - Basic functionality without internet
- 🔔 **Notifications** - Stay updated about important events

### Supported Languages:
- 🇬🇧 English (Primary)
- 🇰🇪 Swahili (Secondary)

---

## 🌟 PROJECT OVERVIEW <a name="project-overview"></a>

### Project Goal

Smart Farmer aims to connect Kenyan farmers, provide access to agricultural knowledge, and help detect plant diseases using AI-powered image recognition. The app focuses on:

1. **Community Building** - Farmers can join groups based on crop types or regions
2. **Knowledge Sharing** - Easy communication for farming advice
3. **Disease Detection** - Early identification of crop diseases
4. **Advisory Content** - Expert recommendations for farming practices

### Technology Stack

- **Frontend**: React Native / Expo
- **Backend**: Node.js / Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth
- **Image Processing**: TensorFlow.js / AI Models
- **Real-time Communication**: Socket.io
- **Storage**: Local + Cloud (for images)
- **Internationalization**: i18n for multi-language support
- **Mapping**: Location services for regional groups

### System Requirements

- **Mobile**: Android 7.0+ / iOS 12.0+
- **Backend Server**: Node.js 18+
- **Database**: PostgreSQL 15+
- **Storage**: Min 5GB for image storage
- **Memory**: 2GB+ RAM for backend
- **Network**: Internet connection for full functionality

---

## 🔧 TECHNICAL ARCHITECTURE <a name="technical-architecture"></a>

### High-Level Architecture

```
┌─────────────────┐       ┌───────────────┐       ┌─────────────────┐
│                 │       │               │       │                 │
│  Mobile Client  │◄─────►│  API Server   │◄─────►│    Database     │
│  (React Native) │       │  (Node.js)    │       │  (PostgreSQL)   │
│                 │       │               │       │                 │
└─────────────────┘       └───────┬───────┘       └─────────────────┘
                                  │
                                  ▼
                          ┌───────────────┐       ┌─────────────────┐
                          │               │       │                 │
                          │  AI Services  │◄─────►│  Image Storage  │
                          │  (TensorFlow) │       │                 │
                          │               │       │                 │
                          └───────────────┘       └─────────────────┘
```

### Backend Architecture

The backend follows a modular architecture with these key components:

1. **API Layer** - RESTful endpoints for client communication
2. **Service Layer** - Business logic and data processing
3. **Data Access Layer** - Database interactions and caching
4. **Authentication** - JWT-based user authentication system
5. **Websockets** - Real-time messaging and notifications
6. **External Services** - AI model integration, SMS services

### Frontend Architecture

The React Native app follows this architecture:

1. **Navigation** - React Navigation for screen management
2. **State Management** - Context API + hooks for app state
3. **UI Components** - Reusable component library
4. **API Services** - Axios for API communication
5. **Local Storage** - AsyncStorage for offline data
6. **Theming** - Light/dark mode support
7. **Localization** - Multi-language support system

### Database Schema

The database consists of these primary entities:

- **Users** - User accounts and profiles
- **Groups** - Farmer communities
- **Messages** - Group and direct communications
- **DetectionHistory** - Plant disease detection records
- **AdvisoryContent** - Farming tips and recommendations
- **UserSettings** - User preferences
- **Notifications** - User alert system

---

## 📥 SETUP INSTRUCTIONS <a name="setup-instructions"></a>

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)
- Git

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Moganzk/Smart-Farmer.git
   cd Smart-Farmer/BACKEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file with the following content:
   ```properties
   # Database connection
   DATABASE_URL=postgresql://postgres:1999@localhost:5432/smart_farmer
   DB_NAME=smart_farmer
   DB_USER=postgres
   DB_PASSWORD=1999
   DB_PORT=5432
   DB_HOST=localhost

   # JWT Authentication
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # AI Services
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # SMS Services
   AFRICA_TALKING_KEY=your_africa_talking_key
   ```

4. **Initialize the database:**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE smart_farmer;"
   
   # Run schema creation and migrations
   psql -U postgres -d smart_farmer -f "../DATABASE/schema.sql"
   
   # Run seeders if needed for development
   node src/seeders/seed.js
   ```

5. **Start the backend server:**
   ```bash
   # Use the start script to ensure correct database connection
   ./start-backend.ps1  # On Windows
   # OR
   npm start  # If environment variables are set correctly
   ```
   
   The server will be available at `http://localhost:3001`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../FRONTEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file with the following content:
   ```properties
   API_URL=http://localhost:3001/api
   SOCKET_URL=http://localhost:3001
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on mobile device:**
   - Scan QR code with Expo Go app (easiest)
   - Run on emulator: Press 'a' for Android or 'i' for iOS
   - For physical device via ADB:
     ```bash
     # Connect device via ADB
     adb devices
     
     # Set up port forwarding
     adb reverse tcp:3001 tcp:3001
     
     # Then run the app
     npx expo start --clear
     ```

---

## 💻 BACKEND DOCUMENTATION <a name="backend-documentation"></a>

### Directory Structure

```
BACKEND/
├── src/
│   ├── app.js              # Main application entry point
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── socket/             # Websocket handlers
│   └── seeders/            # Database seeders
├── tests/                  # Test suites
├── uploads/                # File upload storage
├── .env                    # Environment variables
├── package.json            # Dependencies
└── start-backend.ps1       # Startup script
```

### Key Features

#### Authentication System

- JWT-based authentication
- Secure password hashing with bcrypt
- Login attempt tracking and prevention of brute force attacks
- Token refresh mechanism
- Role-based authorization (farmer, admin)

#### User Management

- User registration with validation
- Profile management
- Settings and preferences
- Phone number verification

#### Groups System

- Group creation and management
- Membership control
- Public and private groups
- Group discovery and search

#### Messaging System

- Real-time group messages
- Message history and search
- Message reactions and reporting
- Offline message queuing

#### Disease Detection

- Image upload and processing
- Integration with AI models
- Detection history
- Recommendations based on detections

#### Advisory Content

- Crop-specific recommendations
- Seasonal farming tips
- Searchable content library
- Expert-created content management

### API Documentation

The API follows RESTful principles with these base endpoints:

- `/api/auth` - Authentication routes
- `/api/profile` - User profile management
- `/api/settings` - User settings management
- `/api/groups` - Group management
- `/api/messages` - Messaging system
- `/api/diseases` - Disease detection
- `/api/advisory` - Advisory content
- `/api/admin` - Admin-only routes

For detailed API documentation, see the [API Reference](#api-reference) section.

---

## 📱 FRONTEND DOCUMENTATION <a name="frontend-documentation"></a>

### Directory Structure

```
FRONTEND/
├── assets/                # Static assets (images, fonts)
├── src/
│   ├── api/               # API service functions
│   ├── components/        # Reusable UI components
│   ├── constants/         # Application constants
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # App screens
│   ├── services/          # Business logic services
│   ├── theme/             # UI theming
│   ├── translations/      # Internationalization files
│   └── utils/             # Helper functions
├── .env                   # Environment variables
└── app.json               # Expo configuration
```

### Key Components

#### Navigation Structure

- **AuthNavigator** - Login, registration, verification screens
- **MainNavigator** - Main app tabs and screens
- **AppNavigator** - Root navigator that handles authentication state

#### Core Screens

- **Authentication** - Login, Registration, Verify Phone
- **Home** - Dashboard with recent activity and quick actions
- **Groups** - Group listings and group screens
- **Messaging** - Conversation views
- **Disease Detection** - Camera and image upload UI
- **Advisory** - Content browsing interface
- **Profile** - User profile and settings

#### State Management

The app uses React Context for global state management:

- **AuthContext** - User authentication state
- **ThemeContext** - App theme (light/dark)
- **LanguageContext** - App language
- **GroupsContext** - Group data
- **MessagingContext** - Messaging state
- **NetworkContext** - Online/offline status

#### Offline Support

- AsyncStorage for data caching
- Queue system for actions performed offline
- Sync mechanism when connection returns

---

## 🗄️ DATABASE DOCUMENTATION <a name="database-documentation"></a>

### Database Schema

The PostgreSQL database includes these primary tables:

#### Core Tables

- **users** - User accounts and authentication
- **user_settings** - User preferences
- **groups** - Farmer communities
- **group_members** - Group membership records
- **messages** - Communication records
- **disease_detections** - Plant disease analysis records
- **advisory_content** - Farming knowledge base

#### Support Tables

- **group_invitations** - Group join requests
- **disease_reference_images** - Images for AI training
- **user_suspensions** - Banned user records
- **message_reactions** - User reactions to messages
- **content_reports** - Reported inappropriate content
- **offline_message_tracking** - Message sync status

### Relationships

- One user can belong to many groups (many-to-many)
- One group can have many messages (one-to-many)
- One user can have many disease detections (one-to-many)
- One user can have one settings record (one-to-one)

### Migrations

Database migrations are stored in `DATABASE/migrations/` and should be run in sequence:

1. `001_initial_schema.sql` - Base tables
2. `002_add_messaging_features.sql` - Messaging enhancements
3. `003_add_offline_support.sql` - Offline functionality
4. `004_add_profile_columns.sql` - Profile enhancements

---

## 🧪 TESTING DOCUMENTATION <a name="testing-documentation"></a>

### Backend Testing

The backend includes comprehensive test suites:

- **Unit Tests** - Testing individual functions and models
- **Integration Tests** - Testing API endpoints
- **Frontend-Backend Integration** - Testing full communication flow

#### Running Backend Tests

```bash
# Run all tests
cd BACKEND
npm test

# Run comprehensive integration tests
node tests/comprehensive-frontend-backend.test.js

# Run a specific test suite
npm test -- --grep "Auth Tests"
```

### Frontend Testing

The frontend includes:

- **Component Tests** - Testing UI components
- **Navigation Tests** - Testing navigation flows
- **Integration Tests** - Testing API integration
- **End-to-End Tests** - Complete user flows

#### Running Frontend Tests

```bash
# Run all tests
cd FRONTEND
npm test

# Run specific component tests
npm test -- --grep "Button Component"
```

### Manual Testing Checklist

A comprehensive testing checklist is available for manual verification:

1. **Authentication Tests**
   - Registration with validation
   - Login with credentials
   - Password reset flow

2. **Profile Management Tests**
   - View profile data
   - Update profile fields
   - Upload profile image

3. **Groups Tests**
   - Create group
   - Join group
   - Post messages
   - Leave group

4. **Messaging Tests**
   - Send group messages
   - View message history
   - React to messages
   - Report inappropriate content

5. **Disease Detection Tests**
   - Upload plant images
   - Receive disease diagnosis
   - View detection history

6. **Advisory Content Tests**
   - Browse content categories
   - Search for specific topics
   - Save favorite articles

---

## ⚠️ COMMON ISSUES & SOLUTIONS <a name="common-issues--solutions"></a>

### Network Connection Issues

#### Problem: Frontend can't connect to backend
**Error:** "Network Error" in API calls

**Solutions:**
1. **Check Backend Server**
   ```bash
   # Verify server is running
   netstat -ano | findstr :3001
   ```

2. **Check IP Address Configuration**
   - Ensure frontend config has correct backend IP
   - For WiFi networks, use computer's IP address
   - For ADB connections, use localhost with port forwarding

3. **ADB Port Forwarding Setup**
   ```bash
   adb reverse tcp:3001 tcp:3001
   ```

4. **Update Frontend Config**
   ```javascript
   // For ADB connections
   API_URL = 'http://localhost:3001/api'
   
   // For WiFi connections
   API_URL = 'http://YOUR_IP_ADDRESS:3001/api'
   ```

### Database Connection Issues

#### Problem: Backend can't connect to database
**Error:** "relation does not exist" or "connection refused"

**Solutions:**
1. **Check Database Service**
   ```bash
   # On Windows
   net start postgresql
   
   # On Linux/Mac
   sudo service postgresql status
   ```

2. **Check Environment Variables**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://postgres:1999@localhost:5432/smart_farmer
   ```

3. **Use Start Script**
   ```bash
   # Use the provided script to ensure correct DB connection
   ./start-backend.ps1
   ```

4. **Verify Database Tables**
   ```bash
   psql -U postgres -d smart_farmer -c "\dt"
   ```

### Phone Number Validation

#### Problem: Registration fails with phone validation error
**Error:** "Please provide a valid phone number"

**Solution:**
- Format phone numbers to international format
- Add Kenyan country code (+254)
- Frontend automatically formats local numbers (0712345678 → +254712345678)

### Image Upload Issues

#### Problem: Cannot upload images for disease detection
**Error:** "Upload failed" or timeout

**Solutions:**
1. **Check Storage Permissions**
   - Ensure app has camera and storage permissions

2. **Check File Size**
   - Reduce image size if larger than 5MB

3. **Check Network Connection**
   - Ensure stable connection for uploads

4. **Use Offline Mode**
   - Save locally and sync later

---

## 👑 ADMIN GUIDE <a name="admin-guide"></a>

### Admin Features

The Smart Farmer application includes admin-only features for platform management:

- User management (suspend/ban users)
- Content moderation (review reported messages)
- Advisory content creation and publishing
- System statistics and analytics
- Disease detection model management

### Accessing Admin Features

1. **Create admin account**:
   ```sql
   UPDATE users SET role = 'admin' WHERE user_id = YOUR_USER_ID;
   ```

2. **Access admin dashboard**:
   - Login with admin credentials
   - Go to Profile → Admin Panel

### Admin API Endpoints

Admin-only endpoints are available at `/api/admin/*` and require an admin role:

- `/api/admin/users` - User management
- `/api/admin/reports` - Content reports
- `/api/admin/advisory` - Content management
- `/api/admin/analytics` - System statistics
- `/api/admin/detection` - AI model management

### User Management

Admins can:
- View all user accounts
- Suspend users temporarily
- Ban users permanently
- Reset user passwords
- View user activity logs

### Content Moderation

Admins can:
- Review reported messages
- Delete inappropriate content
- Issue warnings to users
- View content moderation history

---

## 👨‍🌾 USER GUIDE <a name="user-guide"></a>

### Getting Started

1. **Registration**
   - Download the Smart Farmer app
   - Create an account with email, phone, and password
   - Complete your farmer profile

2. **Home Dashboard**
   - View recent activity
   - Access quick actions
   - See weather information for your region

### Using Groups

1. **Join a Group**
   - Browse available groups
   - Request to join or use invitation code
   - Wait for approval (for private groups)

2. **Create a Group**
   - Go to Groups → Create New
   - Set group name, description, and crop focus
   - Choose public or private visibility
   - Invite other farmers

3. **Group Activities**
   - Post messages and questions
   - Share photos of your farm
   - Respond to other farmers
   - Create events and meetings

### Disease Detection

1. **Upload Plant Images**
   - Take clear photos of affected plants
   - Ensure good lighting and focus
   - Upload single or multiple images

2. **View Results**
   - Get disease identification
   - See confidence percentage
   - Read treatment recommendations
   - Save to detection history

3. **Offline Detection**
   - Take photos even without internet
   - Images are queued for analysis
   - Results appear when connection returns

### Advisory Content

1. **Browse Categories**
   - Crops (maize, beans, tomatoes, etc.)
   - Techniques (irrigation, fertilization, etc.)
   - Seasons (planting, harvesting, etc.)

2. **Search for Topics**
   - Use search bar for specific topics
   - Filter by relevance or date
   - Save favorite articles for offline access

---

## 📡 API REFERENCE <a name="api-reference"></a>

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Profile Endpoints

```
GET  /api/profile
PUT  /api/profile
POST /api/profile/upload-image
DELETE /api/profile/image
PUT  /api/profile/change-password
GET  /api/profile/:username
```

### Settings Endpoints

```
GET  /api/settings
PUT  /api/settings
PUT  /api/settings/notifications
PUT  /api/settings/app-preferences
GET  /api/settings/sync
```

### Groups Endpoints

```
GET  /api/groups
POST /api/groups
GET  /api/groups/:id
PUT  /api/groups/:id
DELETE /api/groups/:id
GET  /api/groups/:id/members
POST /api/groups/:id/members
DELETE /api/groups/:id/members/:userId
GET  /api/groups/search
```

### Messaging Endpoints

```
GET  /api/messages/:groupId
POST /api/messages/:groupId
PUT  /api/messages/:id
DELETE /api/messages/:id
GET  /api/messages/search
POST /api/messages/:id/reaction
POST /api/messages/:id/report
GET  /api/messages/sync
```

### Disease Detection Endpoints

```
POST /api/diseases/detect
GET  /api/diseases/history
POST /api/diseases/sync
GET  /api/diseases/stats
GET  /api/diseases/:detectionId
```

### Advisory Endpoints

```
GET  /api/advisory/featured
GET  /api/advisory/search
GET  /api/advisory/crops
GET  /api/advisory/:id
```

### Admin Endpoints

```
GET  /api/admin/users
PUT  /api/admin/users/:id/suspend
PUT  /api/admin/users/:id/ban
GET  /api/admin/reports
PUT  /api/admin/reports/:id/resolve
POST /api/admin/advisory
PUT  /api/admin/advisory/:id
DELETE /api/admin/advisory/:id
GET  /api/admin/analytics
```

---

## 🚀 DEPLOYMENT GUIDE <a name="deployment-guide"></a>

### Backend Deployment

#### Server Requirements
- Node.js 18+
- PostgreSQL 15+
- 2GB+ RAM
- 10GB+ Storage
- HTTPS support

#### Deployment Steps

1. **Prepare Production Environment**
   - Set up a server (AWS, DigitalOcean, etc.)
   - Install Node.js, PostgreSQL, and PM2

2. **Configure Environment Variables**
   - Create production `.env` file
   - Set `NODE_ENV=production`
   - Configure secure database credentials
   - Set up proper JWT secrets

3. **Database Setup**
   ```bash
   # Create production database
   psql -U postgres -c "CREATE DATABASE smart_farmer_prod;"
   
   # Run migrations
   psql -U postgres -d smart_farmer_prod -f "schema.sql"
   ```

4. **Deploy Code**
   ```bash
   # Clone repository
   git clone https://github.com/Moganzk/Smart-Farmer.git
   cd Smart-Farmer/BACKEND
   
   # Install dependencies
   npm ci --production
   
   # Start with PM2
   pm2 start src/app.js --name "smart-farmer-backend"
   ```

5. **Configure Reverse Proxy**
   - Set up Nginx or Apache
   - Configure for HTTPS
   - Set up proper headers and security

### Frontend Deployment

#### Option 1: Expo Publishing

1. **Configure Production API**
   ```javascript
   // Update API URL to production
   API_URL = 'https://api.smartfarmer.com/api'
   ```

2. **Build and Publish**
   ```bash
   # Build for production
   cd FRONTEND
   npx expo build:android
   # OR
   npx expo build:ios
   ```

3. **Distribute**
   - Upload to Google Play Store
   - Upload to Apple App Store

#### Option 2: Self-hosted Distribution

1. **Build APK/IPA**
   ```bash
   # For Android
   npx expo build:android -t apk
   
   # For iOS
   npx expo build:ios -t archive
   ```

2. **Host Installation Page**
   - Create a simple website
   - Provide download links
   - Include QR codes for easy installation

### Monitoring & Maintenance

- Set up logging with Winston/Loggly
- Configure monitoring with PM2/Prometheus
- Schedule regular database backups
- Implement automated testing

---

*This comprehensive documentation combines all the essential information about the Smart Farmer application. For questions or support, contact the development team.*

**Last Updated:** October 20, 2025  
**Author:** Smart Farmer Development Team