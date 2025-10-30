# Start backend script
Write-Host "Setting up environment variables..."
$env:DATABASE_URL = "postgresql://postgres:1999@localhost:5432/smart_farmer"
$env:JWT_SECRET = "smartfarmersecretkey2025"
$env:JWT_EXPIRES_IN = "1d"

Write-Host "Starting backend server..."
npm start
