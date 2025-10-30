// Quick script to test database connection
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📝 DATABASE_URL:', process.env.DATABASE_URL);
    
    // Test connection
    const result1 = await pool.query('SELECT current_database()');
    console.log('✅ Connected to database:', result1.rows[0].current_database);
    
    // Check if users table exists
    const result2 = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log('📊 Users table exists:', result2.rows[0].exists);
    
    // List all tables
    const result3 = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log('📋 Tables in database:');
    result3.rows.forEach(row => {
      console.log('   -', row.tablename);
    });
    
    // Try to count users
    try {
      const result4 = await pool.query('SELECT COUNT(*) FROM users');
      console.log('👥 Number of users:', result4.rows[0].count);
    } catch (err) {
      console.log('❌ Error querying users table:', err.message);
    }
    
    await pool.end();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
