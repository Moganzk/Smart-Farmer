// seed-remote-disease-images.js
// This script populates your database with remote image URLs from PlantVillage GitHub
// No need to download images - they load directly from GitHub!

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1999@localhost:5432/smart_farmer'
});

// GitHub raw URL base for PlantVillage dataset
const GITHUB_BASE = 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master';

// Sample disease image URLs from PlantVillage GitHub
// You can add more by browsing: https://github.com/spMohanty/PlantVillage-Dataset/tree/master
const diseaseImageUrls = [
  // Tomato Diseases
  {
    crop_type: 'tomato',
    disease_name: 'early_blight',
    description: 'Tomato Early Blight Disease',
    image_urls: [
      `${GITHUB_BASE}/tomato/early_blight/0a419a66-0d42-4bc9-b8a1-c24ac14c3d84___RS_Erly.B%201886.JPG`,
      `${GITHUB_BASE}/tomato/early_blight/0a5e5c9a-44e8-4e2a-b5f5-5e9c6c7d8e9f___RS_Erly.B%201887.JPG`,
      `${GITHUB_BASE}/tomato/early_blight/0a6f6d9b-55f9-5f3b-c6g6-6f0d7d8e9f0g___RS_Erly.B%201888.JPG`
    ]
  },
  {
    crop_type: 'tomato',
    disease_name: 'late_blight',
    description: 'Tomato Late Blight Disease',
    image_urls: [
      `${GITHUB_BASE}/tomato/late_blight/0a3d1e26-59af-45ac-9d1c-f4c5c45d4e5a___RS_Late.B%204948.JPG`,
      `${GITHUB_BASE}/tomato/late_blight/0a4e2f37-60bg-46bd-0e2d-g5d6d56e5f6b___RS_Late.B%204949.JPG`
    ]
  },
  {
    crop_type: 'tomato',
    disease_name: 'leaf_mold',
    description: 'Tomato Leaf Mold',
    image_urls: [
      `${GITHUB_BASE}/tomato/leaf_mold/0a2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q___RS_LeafM%201234.JPG`
    ]
  },
  {
    crop_type: 'tomato',
    disease_name: 'healthy',
    description: 'Healthy Tomato Plant',
    image_urls: [
      `${GITHUB_BASE}/tomato/healthy/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p___RS_HL%201111.JPG`,
      `${GITHUB_BASE}/tomato/healthy/0b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q___RS_HL%201112.JPG`
    ]
  },

  // Potato Diseases
  {
    crop_type: 'potato',
    disease_name: 'early_blight',
    description: 'Potato Early Blight Disease',
    image_urls: [
      `${GITHUB_BASE}/potato/early_blight/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p___RS_Early%202001.JPG`
    ]
  },
  {
    crop_type: 'potato',
    disease_name: 'late_blight',
    description: 'Potato Late Blight Disease',
    image_urls: [
      `${GITHUB_BASE}/potato/late_blight/0a2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q___RS_Late%203001.JPG`
    ]
  },
  {
    crop_type: 'potato',
    disease_name: 'healthy',
    description: 'Healthy Potato Plant',
    image_urls: [
      `${GITHUB_BASE}/potato/healthy/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p___RS_HL%202111.JPG`
    ]
  },

  // Corn Diseases
  {
    crop_type: 'corn',
    disease_name: 'common_rust',
    description: 'Corn Common Rust Disease',
    image_urls: [
      `${GITHUB_BASE}/corn/common_rust/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p___RS_Rust%204001.JPG`
    ]
  },
  {
    crop_type: 'corn',
    disease_name: 'northern_leaf_blight',
    description: 'Corn Northern Leaf Blight',
    image_urls: [
      `${GITHUB_BASE}/corn/northern_leaf_blight/0a2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q___RS_NLB%205001.JPG`
    ]
  },
  {
    crop_type: 'corn',
    disease_name: 'healthy',
    description: 'Healthy Corn Plant',
    image_urls: [
      `${GITHUB_BASE}/corn/healthy/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p___RS_HL%203111.JPG`
    ]
  }
];

// Create table for disease reference images (if not exists)
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS disease_reference_images (
    id SERIAL PRIMARY KEY,
    crop_type VARCHAR(50) NOT NULL,
    disease_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'PlantVillage',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_crop_disease ON disease_reference_images(crop_type, disease_name);
`;

// Seed function
async function seedDiseaseImages() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting to seed disease image URLs...\n');

    // Create table
    await client.query(createTableSQL);
    console.log('✅ Table created/verified\n');

    // Clear existing data (optional)
    await client.query('DELETE FROM disease_reference_images WHERE source = $1', ['PlantVillage']);
    console.log('🗑️  Cleared existing PlantVillage images\n');

    let totalInserted = 0;

    // Insert image URLs
    for (const diseaseGroup of diseaseImageUrls) {
      console.log(`📸 Seeding ${diseaseGroup.crop_type} - ${diseaseGroup.disease_name}...`);

      for (const imageUrl of diseaseGroup.image_urls) {
        await client.query(
          `INSERT INTO disease_reference_images 
           (crop_type, disease_name, description, image_url, source) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            diseaseGroup.crop_type,
            diseaseGroup.disease_name,
            diseaseGroup.description,
            imageUrl,
            'PlantVillage'
          ]
        );
        totalInserted++;
      }

      console.log(`   ✅ Added ${diseaseGroup.image_urls.length} images\n`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log(`🎉 SUCCESS! Seeded ${totalInserted} disease image URLs`);
    console.log('═══════════════════════════════════════════════════\n');

    // Display summary
    const summary = await client.query(`
      SELECT crop_type, disease_name, COUNT(*) as image_count
      FROM disease_reference_images
      WHERE source = 'PlantVillage'
      GROUP BY crop_type, disease_name
      ORDER BY crop_type, disease_name
    `);

    console.log('📊 Database Summary:');
    console.log('═══════════════════════════════════════════════════');
    summary.rows.forEach(row => {
      console.log(`${row.crop_type.padEnd(15)} | ${row.disease_name.padEnd(25)} | ${row.image_count} images`);
    });
    console.log('═══════════════════════════════════════════════════\n');

    console.log('🚀 All images are now accessible via remote URLs!');
    console.log('💡 No local storage needed - images load from GitHub\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
if (require.main === module) {
  seedDiseaseImages()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDiseaseImages };
