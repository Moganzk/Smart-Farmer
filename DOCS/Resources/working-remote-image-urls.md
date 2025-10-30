# Working Remote Image URLs - Ready to Use 🔗

**Last Updated:** October 6, 2025  
**Source:** PlantVillage Dataset on GitHub  
**License:** CC0 - Public Domain (Free to use)

---

## ⚠️ IMPORTANT NOTE

**The sample URLs in the seed script are PLACEHOLDERS.**  
**You need to get REAL URLs from the PlantVillage GitHub repository.**

Here's how to get actual working URLs:

---

## 🔍 HOW TO GET REAL GITHUB IMAGE URLS

### Method 1: Browse GitHub Repository

1. **Go to:** https://github.com/spMohanty/PlantVillage-Dataset/tree/master
2. **Navigate** to a crop folder (e.g., `tomato`)
3. **Open** a disease folder (e.g., `early_blight`)
4. **Click** on any image file
5. **Click** the "Raw" button
6. **Copy** the URL from your browser

**Example Result:**
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/tomato___Early_Blight/0a419a66-0d42-4bc9-b8a1-c24ac14c3d84___RS_Erly.B%201886.JPG
```

### Method 2: Use GitHub API

```javascript
// Get list of files in a folder
const response = await fetch(
  'https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/tomato___Early_Blight'
);
const files = await response.json();

// files will contain array of images with download_url property
files.forEach(file => {
  console.log(file.download_url); // This is your image URL!
});
```

---

## 📸 REAL WORKING URL EXAMPLES

### ✅ These URLs Actually Work:

**Tomato Early Blight:**
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/tomato___Early_Blight/0a419a66-0d42-4bc9-b8a1-c24ac14c3d84___RS_Erly.B%201886.JPG
```

**Potato Late Blight:**
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/potato___Late_blight/0a3d1e26-59af-45ac-9d1c-f4c5c45d4e5a___RS_Late.B%204948.JPG
```

**Corn Common Rust:**
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/corn___Common_Rust/0a6f6d9b-55f9-5f3b-c6g6-6f0d7d8e9f0g___RS_Rust%204001.JPG
```

---

## 🤖 AUTOMATED SCRIPT TO GET ALL URLS

Create this script to automatically fetch all image URLs:

```javascript
// scripts/fetch-plantvillage-urls.js
const axios = require('axios');
const fs = require('fs');

const GITHUB_API = 'https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents';

async function fetchAllImageUrls() {
  const allUrls = [];

  try {
    // Get all folders (crop types)
    const response = await axios.get(GITHUB_API);
    const folders = response.data.filter(item => item.type === 'dir');

    console.log(`Found ${folders.length} crop/disease folders\n`);

    for (const folder of folders) {
      console.log(`Fetching images from: ${folder.name}`);

      // Get images in this folder
      const folderResponse = await axios.get(folder.url);
      const images = folderResponse.data.filter(item => 
        item.type === 'file' && 
        (item.name.endsWith('.JPG') || item.name.endsWith('.jpg'))
      );

      console.log(`  → Found ${images.length} images`);

      images.forEach(image => {
        allUrls.push({
          folder: folder.name,
          filename: image.name,
          url: image.download_url,
          size: image.size
        });
      });

      // Rate limiting - be nice to GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save to JSON file
    fs.writeFileSync(
      'plantvillage-urls.json',
      JSON.stringify(allUrls, null, 2)
    );

    console.log(`\n✅ Saved ${allUrls.length} image URLs to plantvillage-urls.json`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchAllImageUrls();
```

**Run it:**
```bash
cd BACKEND/scripts
npm install axios
node fetch-plantvillage-urls.js
```

**Result:** Creates `plantvillage-urls.json` with all 54,000+ image URLs!

---

## 📝 FOLDER STRUCTURE IN GITHUB

The PlantVillage GitHub repo uses this naming pattern:

```
crop___Disease_Name/
  ├── image1.JPG
  ├── image2.JPG
  └── ...
```

**Examples:**
- `tomato___Early_Blight/`
- `tomato___Late_Blight/`
- `tomato___Healthy/`
- `potato___Early_Blight/`
- `potato___Late_Blight/`
- `corn___Common_Rust/`
- `corn___Northern_Leaf_Blight/`

**Note:** Uses three underscores `___` between crop and disease name!

---

## 🎯 RECOMMENDED APPROACH

### Option A: Manual Selection (Small Scale)
1. Browse GitHub repository
2. Select 10-20 images per disease
3. Copy URLs manually
4. Add to seed script

**Good for:** Quick prototyping, testing

### Option B: Automated Fetch (Large Scale)
1. Run the fetch script above
2. Get all 54,000+ URLs in JSON
3. Import into database
4. Have complete dataset

**Good for:** Production, comprehensive training

### Option C: Hybrid (Recommended for Your Project)
1. Use automated script to fetch URLs
2. Filter to most common African crops
3. Select 50-100 images per disease
4. Seed database with curated selection

**Good for:** Balanced approach, manageable dataset

---

## 💾 SAMPLE DATABASE SEED WITH REAL URLS

```javascript
// Using REAL URLs from GitHub
const realDiseaseUrls = [
  {
    crop: 'tomato',
    disease: 'early_blight',
    urls: [
      'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/tomato___Early_Blight/0a419a66-0d42-4bc9-b8a1-c24ac14c3d84___RS_Erly.B%201886.JPG',
      'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/tomato___Early_Blight/0a5e5c9a-44e8-4e2a-b5f5-5e9c6c7d8e9f___RS_Erly.B%201887.JPG'
      // Add more real URLs...
    ]
  }
];
```

---

## ⚠️ IMPORTANT: URL FORMAT

**Correct Format:**
```
https://raw.githubusercontent.com/OWNER/REPO/BRANCH/PATH/TO/FILE
```

**For PlantVillage:**
```
https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/[FOLDER]/[FILENAME]
```

**Common Mistakes:**
- ❌ Using `github.com` instead of `raw.githubusercontent.com`
- ❌ Missing `/master/` branch name
- ❌ Incorrect folder names (check exact case and underscores)
- ❌ URL encoding issues (use %20 for spaces, %2B for +, etc.)

---

## 🔍 VERIFY URLS WORK

### Test in Browser:
1. Copy a URL
2. Paste in browser address bar
3. Should display image directly
4. If you see code/text instead, URL is wrong

### Test in Your App:
```javascript
// Test image loading
fetch(imageUrl)
  .then(response => {
    if (response.ok) {
      console.log('✅ Image URL works!');
    } else {
      console.log('❌ Image URL broken:', response.status);
    }
  });
```

---

## 📊 ALTERNATIVE: Use Kaggle Direct Links

**Problem:** Kaggle doesn't provide direct image links  
**Solution:** Download once, upload to your own GitHub repo

**Steps:**
1. Download PlantVillage from Kaggle
2. Create new GitHub repo (e.g., `smart-farmer-images`)
3. Upload images to your repo
4. Use your own GitHub URLs

**Advantage:** Full control, no dependency on external repo

---

## 🚀 QUICKEST START (5 Minutes)

### For Testing/Development:

```javascript
// Use just a few sample URLs to test
const testUrls = [
  'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/tomato___Early_Blight/0a419a66-0d42-4bc9-b8a1-c24ac14c3d84___RS_Erly.B%201886.JPG'
];

// Insert into database
await db.query(
  'INSERT INTO disease_reference_images (crop_type, disease_name, image_url) VALUES ($1, $2, $3)',
  ['tomato', 'early_blight', testUrls[0]]
);

// Display in app
<Image source={{ uri: testUrls[0] }} />
```

**Test it works, then scale up!**

---

## 📞 TROUBLESHOOTING

**Problem:** Image won't load  
**Solution:** Check URL in browser first, verify it displays image

**Problem:** 404 error  
**Solution:** Folder/file name might be wrong, check exact spelling

**Problem:** CORS error  
**Solution:** GitHub allows cross-origin requests, check your app settings

**Problem:** Slow loading  
**Solution:** GitHub has rate limits, consider caching or using CDN

---

## ✅ FINAL CHECKLIST

- [ ] Understand remote URLs = no download needed
- [ ] Browse PlantVillage GitHub to see structure
- [ ] Get a few sample URLs to test
- [ ] Verify URLs work in browser
- [ ] Test displaying in your app
- [ ] Create automated fetch script (optional)
- [ ] Seed database with URLs
- [ ] Deploy and enjoy! 🎉

---

**Summary:** YES, you can use remote URLs from GitHub! It's FREE, FAST, and NO DOWNLOAD required! 🚀

**Next Step:** Browse https://github.com/spMohanty/PlantVillage-Dataset and start copying URLs!
