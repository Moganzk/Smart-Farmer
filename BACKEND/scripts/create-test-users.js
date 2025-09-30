const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

const createTestUsers = async () => {
  try {
    console.log('Creating test users...');
    
    // Test user credentials
    const testUsers = [
      {
        username: 'farmer_test',
        email: 'farmer@test.com',
        password: 'password123',
        role: 'farmer',
        fullName: 'Test Farmer',
        phoneNumber: '+1234567890',
        location: 'Test Farm, Kenya',
        preferredLanguage: 'en'
      },
      {
        username: 'admin_test',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        fullName: 'Test Admin',
        phoneNumber: '+1234567891',
        location: 'Admin Office, Kenya',
        preferredLanguage: 'en'
      },
      {
        username: 'john_farmer',
        email: 'john@farmer.com',
        password: 'farmerjohn123',
        role: 'farmer',
        fullName: 'John Farmer',
        phoneNumber: '+1234567892',
        location: 'Nairobi, Kenya',
        preferredLanguage: 'en'
      }
    ];

    // Hash passwords and insert users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.query(
          'SELECT user_id FROM users WHERE email = $1 OR username = $2',
          [userData.email, userData.username]
        );

        if (existingUser.rows.length > 0) {
          console.log(`User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        // Insert user
        const result = await db.query(
          `INSERT INTO users (
            username, 
            email, 
            password_hash, 
            role, 
            full_name, 
            phone_number, 
            location, 
            preferred_language,
            is_active,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING user_id, username, email, role`,
          [
            userData.username,
            userData.email,
            passwordHash,
            userData.role,
            userData.fullName,
            userData.phoneNumber,
            userData.location,
            userData.preferredLanguage,
            true
          ]
        );

        console.log('✅ Created user:', result.rows[0]);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Test users creation completed!');
    console.log('\n📱 Login Credentials:');
    console.log('================================');
    console.log('Farmer Account:');
    console.log('  Email: farmer@test.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Admin Account:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('John Farmer Account:');
    console.log('  Email: john@farmer.com');
    console.log('  Password: farmerjohn123');
    console.log('================================');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    process.exit(0);
  }
};

createTestUsers();