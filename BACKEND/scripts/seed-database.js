const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');
const bcrypt = require('bcryptjs');

async function runMigration() {
  try {
    console.log('Running migration: Add image_url to advisory_content...');
    
    const migrationPath = path.join(__dirname, '../../DATABASE/migrations/001_add_image_url_to_advisory.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('\n📦 Starting database seeding...\n');
    
    // First, create an admin user if it doesn't exist
    console.log('1. Checking for admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminResult = await db.query(
      `INSERT INTO users (username, email, password_hash, role, full_name, phone_number, location, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (username) DO NOTHING
       RETURNING user_id`,
      ['admin', 'admin@smartfarmer.com', hashedPassword, 'admin', 'Smart Farmer Admin', '+1234567890', 'Global', 'en']
    );
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Get admin user ID
    const adminUser = await db.query('SELECT user_id FROM users WHERE username = $1', ['admin']);
    const adminId = adminUser.rows[0].user_id;
    
    console.log('2. Inserting advisory content...');
    
    // Advisory content array
    const advisoryContent = [
      {
        title: 'Early Blight Prevention in Tomatoes',
        contentType: 'disease',
        content: `Early blight is a common fungal disease affecting tomatoes. Key prevention strategies include:

1. **Crop Rotation**: Rotate tomatoes with non-solanaceous crops every 2-3 years
2. **Proper Spacing**: Ensure adequate air circulation between plants (18-24 inches apart)
3. **Mulching**: Apply organic mulch to prevent soil splash onto lower leaves
4. **Watering Practices**: Water at the base of plants in the morning to minimize leaf wetness
5. **Sanitation**: Remove and destroy infected plant debris immediately
6. **Resistant Varieties**: Choose varieties with genetic resistance when available

**Early Detection Signs:**
- Dark brown spots with concentric rings on older leaves
- Yellowing around the spots
- Premature leaf drop starting from the bottom of the plant

**Organic Treatment Options:**
- Copper-based fungicides
- Neem oil spray (apply weekly during humid periods)
- Baking soda solution (1 tablespoon per gallon of water)

**Chemical Control (if necessary):**
Use chlorothalonil or mancozeb-based products following label instructions. Apply at first sign of disease and repeat every 7-10 days during wet weather.`,
        cropType: 'Tomato',
        diseaseName: 'Early Blight',
        severityLevel: 'high',
        imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80'
      },
      {
        title: 'Powdery Mildew Control in Cucurbits',
        contentType: 'disease',
        content: `Powdery mildew is one of the most common diseases affecting cucumbers, melons, squash, and pumpkins.

**Identification:**
- White, powdery fungal growth on leaves
- Starts on older leaves and spreads upward
- Leaves may yellow and die prematurely
- Can reduce fruit quality and yield

**Cultural Control Methods:**
1. **Variety Selection**: Plant resistant varieties when available
2. **Site Selection**: Choose locations with good air circulation and full sun
3. **Spacing**: Provide adequate spacing between plants
4. **Irrigation**: Use drip irrigation; avoid overhead watering
5. **Pruning**: Remove infected leaves immediately

**Organic Treatments:**
- **Milk Spray**: Mix 1 part milk with 9 parts water, spray weekly
- **Potassium Bicarbonate**: More effective than baking soda
- **Sulfur Dust**: Apply when temperatures are below 90°F
- **Neem Oil**: Apply early morning or late evening`,
        cropType: 'Cucumber',
        diseaseName: 'Powdery Mildew',
        severityLevel: 'medium',
        imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80'
      },
      {
        title: 'Late Blight in Potatoes: Recognition and Management',
        contentType: 'disease',
        content: `Late blight is the most destructive disease of potatoes and can cause total crop loss within 2 weeks under favorable conditions.

**Symptoms:**
- Water-soaked spots on leaves that quickly turn brown/black
- White fungal growth on undersides of leaves in humid conditions
- Brown lesions on stems
- Firm brown rot in tubers with reddish-brown discoloration

**Management Strategies:**
1. Use certified disease-free seed potatoes
2. Hill soil around plants to protect developing tubers
3. Destroy volunteer potatoes and infected tomatoes nearby
4. Avoid overhead irrigation
5. Apply protective fungicides before disease appears
6. Harvest on dry days when vines are completely dead

**Resistant Varieties:**
- Defender, Jacqueline Lee, King Edward, Sarpo Mira (highly resistant)`,
        cropType: 'Potato',
        diseaseName: 'Late Blight',
        severityLevel: 'critical',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80'
      },
      {
        title: 'Integrated Pest Management for Aphids',
        contentType: 'pest',
        content: `Aphids are small, soft-bodied insects that suck plant sap and can transmit viral diseases.

**Natural Control Methods:**
1. **Beneficial Insects**: Ladybugs, lacewings, parasitic wasps
2. **Companion Planting**: Nasturtiums, garlic, marigolds
3. **Physical Control**: Strong water spray, yellow sticky traps
4. **Organic Sprays**: Insecticidal soap, neem oil, garlic spray

**Prevention:**
- Inspect new plants before introducing to garden
- Control ants (they farm aphids for honeydew)
- Avoid excess nitrogen fertilization
- Maintain plant health through proper watering`,
        cropType: 'Multiple Crops',
        diseaseName: 'Aphid Infestation',
        severityLevel: 'medium',
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80'
      },
      {
        title: 'Organic Control of Tomato Hornworms',
        contentType: 'pest',
        content: `Tomato hornworms are large caterpillars that can defoliate tomato plants rapidly.

**Organic Control Methods:**
1. **Handpicking**: Inspect plants daily, drop into soapy water
2. **Beneficial Insects**: Braconid wasps lay eggs inside hornworm
3. **Biological Control**: Bt (Bacillus thuringiensis) spray
4. **Preventive Measures**: Till soil in fall, use row covers

**Important Note:**
If you find hornworms covered with white cocoons (braconid wasp eggs), DO NOT DESTROY them. These parasitized hornworms will produce beneficial wasps that control future populations.`,
        cropType: 'Tomato',
        diseaseName: 'Hornworm',
        severityLevel: 'high',
        imageUrl: 'https://images.unsplash.com/photo-1597150509830-cc4bf0e44d67?w=800&q=80'
      },
      {
        title: 'Building Healthy Soil: The Foundation of Productive Farming',
        contentType: 'soil_management',
        content: `Healthy soil is the foundation of successful farming.

**Components of Soil Health:**
1. Soil Structure and aggregation
2. Soil Biology (bacteria, fungi, earthworms)
3. Organic Matter (5% ideal)
4. pH Balance (6.0-7.0 for most vegetables)

**How to Improve Your Soil:**
- Apply 1-2 inches of compost annually
- Plant cover crops in off-season
- Minimize tillage to preserve structure
- Use crop rotation to prevent disease
- Mulch heavily to retain moisture and add organic matter

Remember: "Feed the soil, not the plant" - healthy soil creates healthy plants.`,
        cropType: 'All Crops',
        diseaseName: null,
        severityLevel: null,
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80'
      },
      {
        title: 'Water-Efficient Irrigation Techniques for Maximum Yield',
        contentType: 'water_management',
        content: `Efficient irrigation saves water, reduces costs, and can increase crop yields.

**Best Irrigation Methods:**
1. **Drip Irrigation** (90-95% efficiency): Delivers water directly to root zone
2. **Soaker Hoses** (80-85% efficiency): Good for dense plantings
3. **Mulching**: Reduces evaporation by 70%

**Timing Your Irrigation:**
- Best: Early morning (4-8 AM)
- Avoid: Midday (high evaporation)
- Deep watering 1-2x per week is better than frequent shallow watering

**Water-Saving Techniques:**
- Rainwater harvesting
- Soil moisture sensors
- Weather-based controllers
- Heavy mulching (2-4 inches)`,
        cropType: 'All Crops',
        diseaseName: null,
        severityLevel: null,
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'
      },
      {
        title: 'Seasonal Crop Planning for Year-Round Production',
        contentType: 'crop_planning',
        content: `Strategic crop planning ensures continuous harvests and maximizes profits.

**Planning Principles:**
1. Know your climate zone and frost dates
2. Use succession planting (same crop every 2-3 weeks)
3. Practice companion planting for pest control
4. Implement 4-year crop rotation

**Season Extension Methods:**
- Cold frames: Add 4-6 weeks spring/fall
- Row covers: Protect from frost (3-5°F)
- Hoop houses: Extend season 8-12 weeks

**High-Value Crops:**
- Specialty lettuce, heirloom tomatoes, herbs
- Early and late season produce commands premium prices

Keep detailed records of planting dates, varieties, yields, and problems for continuous improvement.`,
        cropType: 'All Crops',
        diseaseName: null,
        severityLevel: null,
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80'
      },
      {
        title: 'Managing Blossom End Rot in Tomatoes and Peppers',
        contentType: 'prevention',
        content: `Blossom end rot is a physiological disorder caused by calcium deficiency in developing fruit.

**Prevention Strategies:**
1. **Consistent Watering** (MOST IMPORTANT): Deep watering 1-2x per week
2. **Calcium Application**: Foliar spray or gypsum in soil
3. **Soil pH Management**: Maintain pH 6.2-6.8
4. **Balanced Fertilization**: Avoid excessive nitrogen
5. **Heavy Mulching**: Maintains even soil moisture

**Treatment:**
- Remove affected fruit
- Ensure consistent watering schedule
- Apply calcium foliar spray
- Add mulch if not present

It's NOT a disease and requires no chemical treatment!`,
        cropType: 'Tomato',
        diseaseName: 'Blossom End Rot',
        severityLevel: 'medium',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80'
      },
      {
        title: 'Composting Guide: From Kitchen Scraps to Black Gold',
        contentType: 'soil_management',
        content: `Learn how to create nutrient-rich compost that transforms garden soil.

**Basic Requirements:**
- 60-70% Carbon (browns): dry leaves, straw, paper
- 30-40% Nitrogen (greens): kitchen scraps, grass clippings
- Air, water, and proper surface area

**Hot Composting (4-8 weeks):**
1. Build 3'x3'x3' pile minimum
2. Monitor temperature (130-160°F)
3. Turn every 3-5 days
4. Keep moist as wrung-out sponge

**What to Compost:**
✅ Vegetable scraps, coffee grounds, eggshells, grass, leaves
❌ Meat, dairy, fats, pet waste, diseased plants

Finished compost is dark, crumbly, and smells earthy. Use it everywhere!`,
        cropType: 'All Crops',
        diseaseName: null,
        severityLevel: null,
        imageUrl: 'https://images.unsplash.com/photo-1616429007084-33bb2323c3d0?w=800&q=80'
      }
    ];
    
    // Insert each advisory content
    for (let i = 0; i < advisoryContent.length; i++) {
      const content = advisoryContent[i];
      await db.query(
        `INSERT INTO advisory_content (
          title, content_type, content, crop_type, disease_name, 
          severity_level, image_url, created_by, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          content.title,
          content.contentType,
          content.content,
          content.cropType,
          content.diseaseName,
          content.severityLevel,
          content.imageUrl,
          adminId,
          true
        ]
      );
      console.log(`   ✅ Added: ${content.title}`);
    }
    
    console.log(`\n✅ Successfully seeded ${advisoryContent.length} advisory articles`);
    
    // Display summary
    const stats = await db.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(DISTINCT content_type)::int as content_types,
        COUNT(DISTINCT crop_type)::int as crop_types
      FROM advisory_content
      WHERE is_active = true
    `);
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total advisory articles: ${stats.rows[0].total}`);
    console.log(`   Content types: ${stats.rows[0].content_types}`);
    console.log(`   Crop types covered: ${stats.rows[0].crop_types}`);
    
    console.log('\n🎉 Database seeding completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🌱 Smart Farmer Database Seeder\n');
    console.log('================================\n');
    
    // Run migration first
    await runMigration();
    
    // Then seed the database
    await seedDatabase();
    
    // Close database connection
    await db.end();
    
    console.log('✅ All done! You can now start using the app.\n');
    console.log('📝 Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
