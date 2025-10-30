# Smart Farmer - Backend Testing & Image Storage

## Backend Testing

The Smart Farmer backend can be thoroughly tested using the provided PowerShell test script. This script tests all major API endpoints including authentication, user management, groups, disease detection, and advisory content.

### Prerequisites

1. Make sure the backend server is running on port 3001
2. PowerShell 5.1 or higher

### Running the Test Script

1. Open PowerShell
2. Navigate to the backend directory:
   ```
   cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
   ```
3. Run the test script:
   ```
   .\test-api.ps1
   ```

### What the Test Script Does

The test script performs the following operations:

1. Checks if the backend is running and accessible
2. Tests database connection
3. Tests authentication endpoints (register, login, verify token)
4. Tests user profile endpoints (get profile, update profile)
5. Tests group endpoints (create group, update group, send messages)
6. Tests disease detection endpoints (list detections, get disease info)
7. Tests advisory content endpoints (get all advisory, get featured, get categories)

### Interpreting Test Results

- Green text indicates successful tests
- Red text indicates failed tests
- Yellow text indicates warnings or notes
- Cyan text is used for information and section headers

## Image Storage in Database

We've implemented a new system to store images directly in the database instead of storing file paths. This approach offers several benefits:

1. Simplified deployment (no need to manage file system permissions)
2. Easier backup and restore (all data in one place)
3. Better data consistency (no broken file links)
4. Improved security (images aren't publicly accessible via file system)

### Database Migration

A migration script has been created to add the necessary columns and tables:

1. Navigate to the database directory:
   ```
   cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\DATABASE"
   ```

2. Apply the migration script using your PostgreSQL client:
   ```
   psql -U your_username -d smart_farmer -f migrations/005_add_image_storage.sql
   ```

### Database Schema Changes

The migration adds:

1. `profile_image` column to the `users` table (BYTEA type)
2. `image_data` column to the `disease_detections` table (BYTEA type)
3. New `app_images` table for storing application images (splash screens, logos, etc.)
4. Helper functions for importing and retrieving images

### Backend Image API

New endpoints have been added to the backend:

- `POST /api/images` - Store an application image
- `GET /api/images/:imageKey` - Get an image by key
- `GET /api/images` - List all app images
- `POST /api/images/profile` - Update user's profile image
- `GET /api/images/profile/:userId` - Get a user profile image
- `POST /api/images/detection` - Upload a disease detection image
- `GET /api/images/detection/:detectionId` - Get a detection image

### Frontend Integration

A new `imageService.js` has been created in the frontend to work with these new endpoints:

```javascript
import imageService from '../services/imageService';

// Get image URIs
const logoUri = imageService.getAppImageUri('logo');
const profileUri = imageService.getProfileImageUri(userId);
const detectionUri = imageService.getDetectionImageUri(detectionId);

// Upload profile image
const result = await imageService.uploadProfileImage(imageUri);

// Upload disease detection image
const detection = await imageService.uploadDetectionImage(imageUri);

// Select image from gallery
const selectedImageUri = await imageService.pickImage();

// Take photo with camera
const photoUri = await imageService.takePhoto();

// Preload app images
const imageCache = await imageService.preloadAppImages(['logo', 'splash']);
```

## Finding and Adding Images for Frontend

To download free agriculture-related images for the app:

1. Navigate to the frontend scripts directory:
   ```
   cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\scripts"
   ```

2. Run the image downloader script:
   ```
   .\download-images.ps1
   ```

3. This will:
   - Download free images from Unsplash for various categories
   - Create a JSON manifest of all downloaded images
   - Generate a SQL script to import these images into the database

4. Run the generated SQL script to import the images:
   ```
   psql -U your_username -d smart_farmer -f .\images\import-images.sql
   ```

### Image Categories

The script downloads images for:

1. Splash backgrounds (5 images)
2. Farm crops (10 images)
3. Common plant diseases (10 images)
4. Farmer portraits (6 images)
5. Farm tools and equipment (8 images)
6. UI icons (10 images)

## Testing the Image System

After implementing all components, you can test the image system using:

1. The backend test script (tests image endpoints)
2. Postman or another API testing tool to upload and retrieve images
3. The React Native app with the updated imageService

## Next Steps

1. Update all frontend components to use the new image service
2. Test the image upload and retrieval functionality thoroughly
3. Consider adding image compression or resizing to optimize storage
4. Implement caching strategies for frequently accessed images