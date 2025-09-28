# very-simple-test.ps1
# A very simple test script to check the API

try {
    # Test connection
    Write-Host "Testing connection to server..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✅ Server is running: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
    
    # Test registration
    Write-Host "`nTesting registration..." -ForegroundColor Yellow
    $registerData = @{
        username = "testuser"
        email = "test@example.com"
        password = "test123"
        role = "farmer"
    }
    $registerJson = $registerData | ConvertTo-Json
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerJson -ContentType "application/json"
    Write-Host "✅ Registration successful: $($registerResponse | ConvertTo-Json)" -ForegroundColor Green
    
    # Test login
    Write-Host "`nTesting login..." -ForegroundColor Yellow
    $loginData = @{
        email = "test@example.com"
        password = "test123"
    }
    $loginJson = $loginData | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginJson -ContentType "application/json"
    Write-Host "✅ Login successful: $($loginResponse | ConvertTo-Json)" -ForegroundColor Green
    
    # Save token
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Test profile
    Write-Host "`nTesting profile..." -ForegroundColor Yellow
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/profile" -Method GET -Headers $headers
    Write-Host "✅ Profile fetch successful: $($profileResponse | ConvertTo-Json)" -ForegroundColor Green
    
    # Test notifications
    Write-Host "`nTesting notifications..." -ForegroundColor Yellow
    $notificationsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/notifications" -Method GET -Headers $headers
    Write-Host "✅ Notifications fetch successful: $($notificationsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    
    Write-Host "`n✅ All tests passed! The API is working correctly." -ForegroundColor Green
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}