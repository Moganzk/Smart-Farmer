// Script to create user_settings table
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔧 Running migration: Create user_settings table...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../../DATABASE/migrations/003_create_user_settings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully');
    
    // Verify the table was created
    const verifyResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Verified columns in user_settings table:');
    verifyResult.rows.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type})`);
    });
    
    // Check if default settings were created for existing users
    const countResult = await pool.query('SELECT COUNT(*) as count FROM user_settings');
    console.log(`\n📊 Settings records created: ${countResult.rows[0].count}`);
    
    console.log('\n✅ User settings migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
