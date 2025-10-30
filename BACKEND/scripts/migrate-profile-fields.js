const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');

async function runProfileMigration() {
  try {
    console.log('🔧 Running migration: Add profile fields to users table...\n');
    
    const migrationPath = path.join(__dirname, '../../DATABASE/migrations/002_add_profile_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    console.log('✅ Migration completed successfully\n');
    
    // Verify columns were added
    const checkResult = await db.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('profile_image', 'bio', 'expertise')
      ORDER BY column_name;
    `);
    
    console.log('📋 Verified columns:');
    checkResult.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
    });
    
    console.log('\n✅ Profile fields migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

runProfileMigration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
