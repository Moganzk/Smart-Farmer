# Smart Farmer - Test Login Credentials

## 🔑 Working Login Accounts

### Farmer Account
```
Email: farmer@test.com
Password: password123
Role: Farmer
```

### Admin Account  
```
Email: admin@test.com
Password: admin123
Role: Admin
```

### John Farmer Account
```
Email: john@farmer.com
Password: farmerjohn123
Role: Farmer
```

## 🧪 How to Test

### On Mobile App:
1. Start the app and complete onboarding (tap "Get Started" or "Skip")
2. On the login screen, use any of the credentials above
3. The app should authenticate and take you to the main dashboard

### Via API (for testing):
```bash
# Test farmer login
curl -X POST http://192.168.100.22:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@test.com","password":"password123"}'

# Test admin login
curl -X POST http://192.168.100.22:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Expected Response:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 6,
      "username": "farmer_test",
      "email": "farmer@test.com",
      "role": "farmer",
      "full_name": "Test Farmer",
      "phone_number": "+1234567890",
      "location": "Test Farm, Kenya"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔧 Database Info
- All accounts are active (`is_active: true`)
- Passwords are properly hashed with bcrypt
- Users created with IDs: 6, 7, 8
- All accounts have proper role permissions

## 📱 Features Available After Login
- **Farmers**: Disease detection, advisory, groups, profile management
- **Admins**: All farmer features + admin dashboard, user management, analytics

---
*These are test accounts for development and testing purposes.*