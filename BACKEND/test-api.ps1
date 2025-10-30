# Smart Farmer Backend API Test Script
# This script tests various backend API endpoints

# Configuration
$baseUrl = "http://localhost:3001"
$testUser = @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
}
$authToken = ""

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"
$warningColor = "Yellow"

# Helper Functions
function Test-Endpoint {
    param (
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$Description,
        [switch]$SuppressOutput = $false
    )
    
    $fullUrl = "$baseUrl$Endpoint"
    Write-Host "`n[$Method] Testing: $Description ($fullUrl)" -ForegroundColor $infoColor
    
    $params = @{
        Method = $Method
        Uri = $fullUrl
        Headers = $Headers
        ContentType = "application/json"
        ErrorAction = "SilentlyContinue"
    }
    
    if ($Body -and ($Method -ne "GET")) {
        $params.Body = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params
        Write-Host "SUCCESS: $Description" -ForegroundColor $successColor
        if (-not $SuppressOutput) {
            Write-Host "Response:" -ForegroundColor $infoColor
            $response | ConvertTo-Json -Depth 4
        }
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.ErrorDetails.Message
        Write-Host "FAILED: $Description (Status Code: $statusCode)" -ForegroundColor $errorColor
        
        try {
            $errorBody = $errorMessage | ConvertFrom-Json
            Write-Host "Error Details: $($errorBody.message)" -ForegroundColor $errorColor
        }
        catch {
            Write-Host "Error Details: $errorMessage" -ForegroundColor $errorColor
        }
        
        return @{
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
        }
    }
}

function Get-AuthToken {
    Write-Host "`n=== Authenticating Test User ===`n" -ForegroundColor $infoColor
    
    # First try to register the user (will fail if already exists, that's fine)
    $registerResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $testUser -Description "Register Test User" -SuppressOutput
    
    # Then login to get the token
    $loginResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body @{
        email = $testUser.email
        password = $testUser.password
    } -Description "Login Test User"
    
    if ($loginResult.Success) {
        $global:authToken = $loginResult.Data.token
        Write-Host "Authentication successful!" -ForegroundColor $successColor
        return $true
    } else {
        Write-Host "Authentication failed. Cannot proceed with authenticated tests." -ForegroundColor $errorColor
        return $false
    }
}

function Test-AuthEndpoints {
    Write-Host "`n=== Testing Auth Endpoints ===`n" -ForegroundColor $infoColor
    
    # Test registration with a new random email
    $randomEmail = "test_$([guid]::NewGuid().ToString().Substring(0, 8))@example.com"
    $newUser = @{
        email = $randomEmail
        password = "Test123!"
        firstName = "Random"
        lastName = "User"
    }
    
    Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $newUser -Description "Register New User"
    
    # Test login with new user
    $loginResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body @{
        email = $newUser.email
        password = $newUser.password
    } -Description "Login New User"
    
    # Test invalid login
    Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body @{
        email = $randomEmail
        password = "WrongPassword!"
    } -Description "Login with Invalid Password (should fail)"
    
    # Test verify token
    if ($loginResult.Success -and $loginResult.Data.token) {
        $tempToken = $loginResult.Data.token
        $authHeaders = @{
            "Authorization" = "Bearer $tempToken"
        }
        Test-Endpoint -Method "GET" -Endpoint "/api/auth/verify" -Headers $authHeaders -Description "Verify Token"
    }
}

function Test-UserEndpoints {
    Write-Host "`n=== Testing User Endpoints ===`n" -ForegroundColor $infoColor
    
    $authHeaders = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # Get user profile
    Test-Endpoint -Method "GET" -Endpoint "/api/users/profile" -Headers $authHeaders -Description "Get User Profile"
    
    # Update user profile
    $updateData = @{
        firstName = "Updated"
        lastName = "User"
        phoneNumber = "1234567890"
    }
    Test-Endpoint -Method "PUT" -Endpoint "/api/users/profile" -Headers $authHeaders -Body $updateData -Description "Update User Profile"
    
    # Get updated profile to verify changes
    Test-Endpoint -Method "GET" -Endpoint "/api/users/profile" -Headers $authHeaders -Description "Get Updated User Profile"
}

function Test-GroupEndpoints {
    Write-Host "`n=== Testing Group Endpoints ===`n" -ForegroundColor $infoColor
    
    $authHeaders = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # Create a group
    $groupName = "Test Group $([guid]::NewGuid().ToString().Substring(0, 5))"
    $createGroupResult = Test-Endpoint -Method "POST" -Endpoint "/api/groups" -Headers $authHeaders -Body @{
        name = $groupName
        description = "A test group created by the test script"
        location = "Test Location"
        isPublic = $true
    } -Description "Create New Group"
    
    if (-not $createGroupResult.Success) {
        Write-Host "Failed to create group. Skipping remaining group tests." -ForegroundColor $warningColor
        return
    }
    
    $groupId = $createGroupResult.Data.groupId
    
    # Get all groups
    Test-Endpoint -Method "GET" -Endpoint "/api/groups" -Headers $authHeaders -Description "Get All Groups"
    
    # Get specific group
    Test-Endpoint -Method "GET" -Endpoint "/api/groups/$groupId" -Headers $authHeaders -Description "Get Group Details"
    
    # Update group
    Test-Endpoint -Method "PUT" -Endpoint "/api/groups/$groupId" -Headers $authHeaders -Body @{
        name = "$groupName - Updated"
        description = "Updated description"
        isPublic = $false
    } -Description "Update Group"
    
    # Send a message to the group
    $messageResult = Test-Endpoint -Method "POST" -Endpoint "/api/groups/$groupId/messages" -Headers $authHeaders -Body @{
        content = "This is a test message from the API test script"
    } -Description "Send Group Message"
    
    # Get group messages
    Test-Endpoint -Method "GET" -Endpoint "/api/groups/$groupId/messages" -Headers $authHeaders -Description "Get Group Messages"
}

function Test-DiseaseDetectionEndpoints {
    Write-Host "`n=== Testing Disease Detection Endpoints ===`n" -ForegroundColor $infoColor
    
    $authHeaders = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # List all disease detections for user
    Test-Endpoint -Method "GET" -Endpoint "/api/diseases/detections" -Headers $authHeaders -Description "List User's Disease Detections"
    
    # Note: We can't fully test uploading an image without a real file, but we can test the endpoint existence
    Write-Host "NOTE: Disease detection image upload test is skipped as it requires a real image file." -ForegroundColor $warningColor
    
    # Get disease information
    Test-Endpoint -Method "GET" -Endpoint "/api/diseases/info" -Headers $authHeaders -Description "Get Disease Information"
}

function Test-AdvisoryEndpoints {
    Write-Host "`n=== Testing Advisory Content Endpoints ===`n" -ForegroundColor $infoColor
    
    $authHeaders = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # Get all advisory content
    Test-Endpoint -Method "GET" -Endpoint "/api/advisory" -Headers $authHeaders -Description "Get All Advisory Content"
    
    # Get featured advisory content
    Test-Endpoint -Method "GET" -Endpoint "/api/advisory/featured" -Headers $authHeaders -Description "Get Featured Advisory Content"
    
    # Get advisory categories
    Test-Endpoint -Method "GET" -Endpoint "/api/advisory/categories" -Headers $authHeaders -Description "Get Advisory Categories"
}

function Test-DatabaseConnection {
    Write-Host "`n=== Testing Database Connection ===`n" -ForegroundColor $infoColor
    
    Test-Endpoint -Method "GET" -Endpoint "/api/health/db" -Description "Test Database Connection"
}

# Main Script
Write-Host "===========================" -ForegroundColor $infoColor
Write-Host "Smart Farmer API Test Script" -ForegroundColor $infoColor
Write-Host "===========================" -ForegroundColor $infoColor

# Check if backend is running
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET -ErrorAction Stop
    Write-Host "Backend is running and reachable!" -ForegroundColor $successColor
    Write-Host "Version: $($healthCheck.version)" -ForegroundColor $infoColor
    Write-Host "Environment: $($healthCheck.environment)" -ForegroundColor $infoColor
}
catch {
    Write-Host "ERROR: Cannot reach backend at $baseUrl" -ForegroundColor $errorColor
    Write-Host "Make sure the backend server is running before executing this script." -ForegroundColor $errorColor
    exit
}

# Test database connection
Test-DatabaseConnection

# Test public endpoints first
Test-AuthEndpoints

# Get auth token for authenticated endpoints
$authenticated = Get-AuthToken

if ($authenticated) {
    Test-UserEndpoints
    Test-GroupEndpoints
    Test-DiseaseDetectionEndpoints
    Test-AdvisoryEndpoints
}

Write-Host "`n===========================" -ForegroundColor $infoColor
Write-Host "API Testing Complete!" -ForegroundColor $infoColor
Write-Host "===========================" -ForegroundColor $infoColor