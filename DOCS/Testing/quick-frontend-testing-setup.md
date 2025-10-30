# Quick Frontend Testing Setup

## ⚡ IMMEDIATE SETUP (5 minutes)

### Step 1: Run Database Migration
```cmd
psql -U postgres -d smart_farmer -f "c:\Users\eacha\OneDrive\Desktop\SMART FARMER\DATABASE\migrations\004_create_disease_reference_images.sql"
```

### Step 2: Seed Disease Images
```cmd
cd "c:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
node scripts/seed-disease-images-remote.js
```

### Step 3: Restart Backend Server
```cmd
cd "c:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start
```

### Step 4: Test API Endpoints
Open browser or use curl:
- http://192.168.100.22:3001/api/disease-images
- http://192.168.100.22:3001/api/disease-images/crops/list
- http://192.168.100.22:3001/api/disease-images/crop/tomato

## 📡 Available API Endpoints

### Get All Disease Images
```
GET /api/disease-images
GET /api/disease-images?crop_type=tomato
GET /api/disease-images?disease_name=early_blight
```

**Response Example:**
```json
{
  "success": true,
  "count": 11,
  "data": [
    {
      "id": 1,
      "crop_type": "tomato",
      "disease_name": "early_blight",
      "display_name": "Tomato Early Blight",
      "image_url": "https://raw.githubusercontent.com/...",
      "symptoms": "Dark brown spots...",
      "treatment": "Apply fungicide...",
      "severity_level": "high"
    }
  ]
}
```

### Get Images by Crop
```
GET /api/disease-images/crop/tomato
GET /api/disease-images/crop/potato
GET /api/disease-images/crop/corn
```

### Get Available Crops
```
GET /api/disease-images/crops/list
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "crop_type": "tomato", "disease_count": "5" },
    { "crop_type": "potato", "disease_count": "3" },
    { "crop_type": "corn", "disease_count": "3" }
  ]
}
```

### Search Disease Images
```
GET /api/disease-images/search?q=blight
GET /api/disease-images/search?q=fungal
```

### Get Random Image (for learning)
```
GET /api/disease-images/random
GET /api/disease-images/random?crop_type=tomato
```

### Get Specific Image
```
GET /api/disease-images/1
```

## 📱 Frontend Integration Example

### React Native Service (create in FRONTEND)

```javascript
// services/diseaseImageService.js
import axios from 'axios';

const API_URL = 'http://192.168.100.22:3001/api';

export const diseaseImageService = {
  // Get all images for a crop
  getImagesByCrop: async (cropType) => {
    const response = await axios.get(`${API_URL}/disease-images/crop/${cropType}`);
    return response.data;
  },

  // Get available crops
  getAvailableCrops: async () => {
    const response = await axios.get(`${API_URL}/disease-images/crops/list`);
    return response.data;
  },

  // Search images
  searchImages: async (query) => {
    const response = await axios.get(`${API_URL}/disease-images/search?q=${query}`);
    return response.data;
  },

  // Get random image
  getRandomImage: async (cropType) => {
    const url = cropType 
      ? `${API_URL}/disease-images/random?crop_type=${cropType}`
      : `${API_URL}/disease-images/random`;
    const response = await axios.get(url);
    return response.data;
  }
};
```

### React Native Component Example

```javascript
// screens/DiseaseLibraryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { diseaseImageService } from '../services/diseaseImageService';

export default function DiseaseLibraryScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const result = await diseaseImageService.getImagesByCrop('tomato');
      setImages(result.data);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>{item.display_name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.symptoms}>Symptoms: {item.symptoms}</Text>
    </View>
  );

  return (
    <FlatList
      data={images}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  symptoms: {
    fontSize: 12,
    color: '#999',
  },
});
```

## 🎯 Testing Checklist

- [ ] Database migration completed
- [ ] Seed script executed successfully (11 diseases seeded)
- [ ] Backend server running on port 3001
- [ ] API endpoint accessible: http://192.168.100.22:3001/api/disease-images
- [ ] Images returned with valid GitHub URLs
- [ ] Images load in browser
- [ ] Frontend service created
- [ ] Frontend component displays images
- [ ] Mobile app loads images from remote URLs

## 🚀 What's Ready Now

✅ **Database Structure**: `disease_reference_images` table with all fields
✅ **Seed Data**: 11 diseases (5 tomato, 3 potato, 3 corn) with real GitHub URLs
✅ **API Controller**: Full CRUD operations + search + random
✅ **API Routes**: 6 endpoints registered and ready
✅ **Backend Integration**: Routes registered in app.js
✅ **Uploads Folder**: Reserved for future user uploads

## 📋 What You Need to Do

1. Run the 3 commands above
2. Test the API in browser
3. Create frontend service file (copy code above)
4. Create/update frontend screen to display images
5. Test on mobile device

## 💡 Benefits of This Approach

- **No Downloads**: 0 bytes to download, instant access to 54,000+ images
- **Always Updated**: GitHub repository gets updated, you get latest images
- **No Storage**: Saves 2-5GB on your server
- **Fast Setup**: 5 minutes vs 2-3 hours downloading
- **Scalable**: Can add more diseases without storage concerns

## 🔧 Troubleshooting

### If API returns empty data:
```cmd
# Check if seed script ran
node scripts/seed-disease-images-remote.js

# Check database
psql -U postgres -d smart_farmer -c "SELECT COUNT(*) FROM disease_reference_images;"
```

### If images don't load:
- Check internet connection (images are on GitHub)
- Check if URLs are valid in database
- Check CORS settings in backend
- Test URL directly in browser

## 📞 Need Help?
Check the API response in browser first, then debug from there.
