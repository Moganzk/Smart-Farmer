// Setup script to run before the group invitation tests
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('Setting up database for group invitation tests...');
  
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the table already exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'group_invitations'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      // Read the migration SQL file
      const migrationPath = path.join(__dirname, '..', '..', '..', 'DATABASE', 'migrations', '03_add_group_invitations.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      // Execute the migration SQL
      await client.query(migrationSql);
      console.log('Migration applied successfully');
    } else {
      console.log('group_invitations table already exists, skipping migration');
    }

    // Test if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'group_invitations'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('group_invitations table exists');
    } else {
      console.error('group_invitations table does not exist');
      process.exit(1);
    }

  } catch (err) {
    console.error('Error in setup:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
setupDatabase();