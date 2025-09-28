# simple-test.ps1
# Simple test script to check if the API is working

# API base URL
$apiUrl = "http://localhost:3001"

# Try to access a simple endpoint
try {
    Write-Host "Testing connection to server at $apiUrl..." -ForegroundColor Yellow
    
    # First check if the server is responding
    $tcpTest = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "TCP connection successful. Testing API endpoint..." -ForegroundColor Green
        
        try {
            # Try to access /api endpoint or health check
            $response = Invoke-RestMethod -Uri "$apiUrl/api" -Method GET -TimeoutSec 5
            Write-Host "API test successful!" -ForegroundColor Green
            Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
        } catch {
            Write-Host "API request failed:" -ForegroundColor Red
            if ($_.Exception.Response) {
                $statusCode = $_.Exception.Response.StatusCode.value__
                Write-Host "Status Code: $statusCode" -ForegroundColor Red
                
                if ($statusCode -ne 404) {  # 404 means endpoint doesn't exist but server is running
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $reader.BaseStream.Position = 0
                    $reader.DiscardBufferedData()
                    $responseBody = $reader.ReadToEnd()
                    Write-Host "Response Body: $responseBody" -ForegroundColor Red
                } else {
                    Write-Host "Server is running but the endpoint was not found. Try another endpoint." -ForegroundColor Yellow
                }
            } else {
                Write-Host $_.Exception.Message -ForegroundColor Red
            }
        }
    } else {
        Write-Host "TCP connection failed. The server is not running on port 3001." -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Try to register a test user
try {
    Write-Host "`nTesting user registration..." -ForegroundColor Yellow
    
    $userData = @{
        username = "testuser"
        email = "test@example.com"
        password = "test123"
        role = "farmer"
    }
    
    $jsonBody = $userData | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $jsonBody
    
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "Registration failed:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        
        if ($responseBody -match "already exists") {
            Write-Host "Test user already exists, this is fine for testing" -ForegroundColor Green
        }
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Try to login
try {
    Write-Host "`nTesting user login..." -ForegroundColor Yellow
    
    $loginData = @{
        email = "test@example.com"
        password = "test123"
    }
    
    $jsonBody = $loginData | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $jsonBody
    
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Token received: $($response.token)" -ForegroundColor Cyan
    
    # Save token for further tests
    $token = $response.token
    
    # Test profile endpoint with token
    Write-Host "`nTesting profile endpoint..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$apiUrl/api/profile" -Method GET -Headers $headers
    
    Write-Host "Profile fetch successful!" -ForegroundColor Green
    Write-Host "Profile Data: $($profileResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Login or profile test failed:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}