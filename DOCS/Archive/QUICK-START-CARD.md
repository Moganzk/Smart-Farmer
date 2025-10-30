# 🚀 Quick Start Card - Disease Images API

## Backend Status: ✅ LIVE
**URL**: http://192.168.100.22:3001

## Database: ✅ READY
- **Table**: disease_reference_images
- **Records**: 11 diseases
- **Crops**: Tomato (5), Potato (3), Corn (3)

## API Endpoints

```
GET /api/disease-images/crops/list          → Get all crops
GET /api/disease-images                     → Get all images
GET /api/disease-images/crop/tomato         → Get tomato diseases
GET /api/disease-images/search?q=blight     → Search diseases
GET /api/disease-images/random              → Get random image
GET /api/disease-images/1                   → Get image by ID
```

## Quick Test
```powershell
(Invoke-WebRequest -Uri "http://192.168.100.22:3001/api/disease-images/crops/list").Content
```

Expected Result:
```json
{
  "success": true,
  "data": [
    {"crop_type": "corn", "disease_count": "3"},
    {"crop_type": "potato", "disease_count": "3"},
    {"crop_type": "tomato", "disease_count": "5"}
  ]
}
```

## Frontend Integration (3 steps)

### 1. Create Service File
```javascript
// FRONTEND/services/diseaseImageService.js
import axios from 'axios';
const API_URL = 'http://192.168.100.22:3001/api';

export const diseaseImageService = {
  getAvailableCrops: async () => {
    const res = await axios.get(`${API_URL}/disease-images/crops/list`);
    return res.data;
  },
  getImagesByCrop: async (cropType) => {
    const res = await axios.get(`${API_URL}/disease-images/crop/${cropType}`);
    return res.data;
  }
};
```

### 2. Use in Component
```javascript
import { diseaseImageService } from '../services/diseaseImageService';

const [images, setImages] = useState([]);

useEffect(() => {
  const load = async () => {
    const result = await diseaseImageService.getImagesByCrop('tomato');
    setImages(result.data);
  };
  load();
}, []);
```

### 3. Display Image
```javascript
<Image 
  source={{ uri: item.image_url }}
  style={{ width: '100%', height: 200 }}
/>
```

## Image URLs Format
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/
master/raw/color/[Crop]___[Disease]/[filename].JPG
```

## Response Structure
```javascript
{
  id: 1,
  crop_type: "tomato",
  disease_name: "early_blight",
  display_name: "Tomato Early Blight",
  description: "Early blight is a common...",
  image_url: "https://raw.githubusercontent.com/...",
  symptoms: "Dark spots with concentric rings...",
  treatment: "Remove infected leaves, apply fungicide...",
  prevention: "Crop rotation, resistant varieties...",
  severity_level: "high",
  source: "PlantVillage",
  is_active: true,
  view_count: 0,
  created_at: "2025-10-06T12:17:59.769Z",
  updated_at: "2025-10-06T12:17:59.769Z"
}
```

## Restart Backend (if needed)
```powershell
Set-Location "c:\Users\eacha\OneDrive\Desktop\SMART FARMER\BACKEND"
npm start
```

## Check Backend Status
```powershell
(Invoke-WebRequest -Uri "http://192.168.100.22:3001/health").Content
```

## Documentation Files
- 📄 `DOCS/FRONTEND-TESTING-READY.md` - Complete guide
- 📄 `DOCS/quick-frontend-testing-setup.md` - Setup instructions
- 📄 `DOCS/using-remote-images-vs-local.md` - Architecture decisions
- 📄 `DATABASE/migrations/004_create_disease_reference_images.sql` - Schema
- 📄 `BACKEND/scripts/seed-disease-images-remote.js` - Seed data

## You're Ready! 🎉
Start building your frontend now. All endpoints are tested and working!
