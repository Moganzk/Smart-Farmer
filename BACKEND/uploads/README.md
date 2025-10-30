# Uploads Folder

## Purpose
This folder is reserved for **user-uploaded images** from farmers using the mobile app.

## Current Usage
- **Status**: Currently empty (not in use)
- **Future Use**: Will store farmer-submitted disease photos for diagnosis

## Image Strategy

### Reference Images (Disease Library)
- **Storage**: Remote URLs from GitHub/PlantVillage dataset
- **Database**: `disease_reference_images` table
- **Location**: NOT stored in this folder
- **Purpose**: Educational/reference materials for disease identification

### User Uploads (Farmer Photos)
- **Storage**: Will be stored in THIS folder when implemented
- **Purpose**: Farmer-submitted crop photos for AI diagnosis
- **Implementation**: Pending (Phase 2)

## Directory Structure (Future)
```
uploads/
├── farmer-photos/
│   ├── tomato/
│   ├── potato/
│   └── corn/
└── thumbnails/
```

## Why Keep This Folder?
1. **Future Feature**: Farmers will upload photos for diagnosis
2. **Separation of Concerns**: User content separate from reference images
3. **Security**: Isolated storage for user-generated content
4. **Scalability**: Can implement image processing pipeline here

## Implementation Notes
- Add file size limits (max 5MB per image)
- Add image validation (JPEG/PNG only)
- Add automatic thumbnail generation
- Add virus scanning for uploaded files
- Add rate limiting to prevent abuse

## Related Files
- Database: `DATABASE/migrations/004_create_disease_reference_images.sql`
- Seed Script: `BACKEND/scripts/seed-disease-images-remote.js`
- API Controller: `BACKEND/src/controllers/diseaseImagesController.js`
- API Routes: `BACKEND/src/routes/diseaseImages.js`

## Decision: KEEP THIS FOLDER
**Status**: Reserved for future user uploads
**Action**: No deletion needed
