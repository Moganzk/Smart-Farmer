# Smart Farmer Deployment Guide

This guide provides step-by-step instructions for deploying the Smart Farmer application to a production environment.

## Prerequisites

- GitHub account (for source control)
- Railway.app, Render.com or similar account (for hosting)
- Cloudinary account (for image storage)
- Gemini API key (for disease detection)
- Groq API key (for advisory services)

## Step 1: Prepare Your Application

### Environment Variables

Create a `.env.production` file with the following variables:

```
# Server
NODE_ENV=production
PORT=3001

# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=smartfarmer
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Database Preparation

Create a production-ready database migration:

```bash
cd DATABASE
psql -U postgres -f schema.sql
```

## Step 2: Host Your Backend on Railway.app

1. **Create a Railway.app account**
   - Go to [Railway.app](https://railway.app) and sign up

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select your repository

3. **Add a PostgreSQL database**
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically create the database

4. **Configure environment variables**
   - Go to your deployed service
   - Click "Variables" tab
   - Add all variables from your `.env.production` file
   - Update the database connection variables to use Railway's provided values

5. **Deploy your application**
   - Railway will automatically deploy when you push to your GitHub repository
   - Verify the deployment logs for any errors

## Step 3: Set Up Cloudinary for Image Storage

1. **Create a Cloudinary account**
   - Go to [Cloudinary](https://cloudinary.com/) and sign up

2. **Create a new Media Library folder**
   - Name it "smart-farmer"
   - Set up sub-folders for "diseases", "profiles", etc.

3. **Update environment variables**
   - Add your Cloudinary credentials to Railway environment variables

## Step 4: Set Up Monitoring and Logging

1. **Configure application logging**
   - Ensure Winston logger is properly set up
   - Consider adding Sentry.io for error tracking

2. **Set up health checks**
   - Ensure the `/health` endpoint is working
   - Set up uptime monitoring with UptimeRobot (free tier)

## Step 5: Database Backup

1. **Configure automated backups**
   - Railway.app provides automatic backups
   - Set up a script to download backups periodically

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y-%m-%d)
railway connect --environment production
pg_dump -U postgres -d smartfarmer > "backup-$DATE.sql"
```

## Step 6: Frontend Deployment

### Expo App

1. **Configure production API endpoint**
   - Update your API base URL in the mobile app config

2. **Build the app for distribution**
   ```bash
   cd FRONTEND
   npx expo build:android
   # Or for iOS
   npx expo build:ios
   ```

3. **Test the built application**
   - Install on test devices
   - Verify all features work with production backend

## Step 7: Post-Deployment Verification

1. **Test all critical paths**
   - Authentication flow
   - Disease detection
   - Advisory services
   - Group messaging

2. **Verify performance**
   - Check response times
   - Monitor database query performance
   - Test image upload and retrieval speeds

## Future Integration: Africa's Talking (After Hosting)

Once your application is stable in production, follow these steps to add USSD and SMS:

1. Register for an Africa's Talking account
2. Request a shortcode for your service
3. Set up callback URLs pointing to your hosted backend
4. Implement the integration using the Africa's Talking Node.js SDK
5. Test in sandbox environment before going live

## Troubleshooting Common Issues

### Database Connection Issues
- Verify connection string format
- Check network access and firewall settings

### Image Upload Problems
- Verify Cloudinary credentials
- Check upload size limits

### Performance Issues
- Implement caching for frequent queries
- Add database indexes for common lookups
- Compress images before upload