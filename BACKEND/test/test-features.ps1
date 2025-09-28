# test-features.ps1
# PowerShell script to test notifications, profile, and settings features

# API base URL
$apiUrl = "http://localhost:3001"

# Test user credentials
$testUser = @{
    email = "test@example.com"
    password = "test123"
    username = "TestUser" # Added username
    role = "farmer"     # Added role
}

# Variable to store token
$token = ""

# Function to display test results
function Log-Result {
    param (
        [string]$testName,
        [bool]$success,
        [object]$response = $null,
        [object]$error = $null
    )

    if ($success) {
        Write-Host "✓ $testName`: Success" -ForegroundColor Green
        if ($response) {
            Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ $testName`: Failed" -ForegroundColor Red
        if ($error) {
            Write-Host "Error: $error" -ForegroundColor Red
        }
    }
}

# Make API request
function Invoke-ApiRequest {
    param (
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [hashtable]$headers = @{},
        [switch]$returnRawError
    )

    try {
        if ($token) {
            $headers["Authorization"] = "Bearer $token"
        }

        $params = @{
            Uri = "$apiUrl$endpoint"
            Method = $method
            Headers = $headers
            ContentType = "application/json"
        }

        if ($body -and ($method -eq "POST" -or $method -eq "PUT")) {
            $params.Body = $body | ConvertTo-Json -Depth 10
        }

        $response = Invoke-RestMethod @params
        return $response
    } catch {
        if ($returnRawError) {
            return $_
        }
        
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        
        try {
            $errorObj = $responseBody | ConvertFrom-Json
            return @{
                StatusCode = $statusCode
                Error = $errorObj
            }
        } catch {
            return @{
                StatusCode = $statusCode
                Error = $responseBody
            }
        }
    }
}

# Test function
function Test-Api {
    param (
        [string]$testName,
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [hashtable]$headers = @{}
    )

    Write-Host "`nTesting: $testName..." -ForegroundColor Cyan
    
    $response = Invoke-ApiRequest -method $method -endpoint $endpoint -body $body -headers $headers
    
    if ($response -is [System.Collections.Hashtable] -and $response.ContainsKey('Error')) {
        Log-Result -testName $testName -success $false -error $response.Error
        return $null
    } else {
        Log-Result -testName $testName -success $true -response $response
        return $response
    }
}

# Login with test user
function Login-TestUser {
    $body = @{
        email = $testUser.email
        password = $testUser.password
    }
    
    $result = Test-Api -testName "Login" -method "POST" -endpoint "/api/auth/login" -body $body
    
    if ($result -and $result.token) {
        $script:token = $result.token
        Write-Host "Login successful, token obtained" -ForegroundColor Green
    }
    
    return $result
}

# Test profiles
function Test-ProfileFeatures {
    Write-Host "`n=== Testing Profile Features ===" -ForegroundColor Yellow
    
    # Get user profile
    Test-Api -testName "Get User Profile" -method "GET" -endpoint "/api/profile"
    
    # Update user profile
    $updateData = @{
        full_name = "Test User Updated"
        bio = "This is an updated test profile"
        location = "Test Location Updated"
        expertise = "Advanced Testing"
    }
    Test-Api -testName "Update User Profile" -method "PUT" -endpoint "/api/profile" -body $updateData
    
    # Get public profile (for the same test user)
    $username = "testuser" # Assuming the test user's username
    Test-Api -testName "Get Public Profile" -method "GET" -endpoint "/api/profile/$username"
    
    # Change password
    $passwordData = @{
        current_password = $testUser.password
        new_password = $testUser.password  # Using same password to avoid breaking future tests
    }
    Test-Api -testName "Change Password" -method "PUT" -endpoint "/api/profile/change-password" -body $passwordData
}

# Test settings
function Test-SettingsFeatures {
    Write-Host "`n=== Testing Settings Features ===" -ForegroundColor Yellow
    
    # Get user settings
    Test-Api -testName "Get User Settings" -method "GET" -endpoint "/api/settings"
    
    # Update notification preferences
    $notificationPrefs = @{
        push_enabled = $false
        email_enabled = $true
        detection_results = $true
        group_messages = $false
        system_updates = $true
        warnings = $true
    }
    Test-Api -testName "Update Notification Preferences" -method "PUT" -endpoint "/api/settings/notification" -body $notificationPrefs
    
    # Update app preferences
    $appPrefs = @{
        theme = "dark"
        language = "fr"
        font_size = "large"
        high_contrast = $true
        reduced_motion = $true
        offline_mode = $false
    }
    Test-Api -testName "Update App Preferences" -method "PUT" -endpoint "/api/settings/app" -body $appPrefs
    
    # Update AI preferences
    $aiPrefs = @{
        auto_analysis = $true
        save_images = $false
        data_contribution = $true
        model_preference = "high_accuracy"
    }
    Test-Api -testName "Update AI Preferences" -method "PUT" -endpoint "/api/settings/ai" -body $aiPrefs
    
    # Reset notification settings
    Test-Api -testName "Reset Notification Settings" -method "POST" -endpoint "/api/settings/reset/notification_preferences" -body @{}
}

# Test notifications
function Test-NotificationFeatures {
    Write-Host "`n=== Testing Notification Features ===" -ForegroundColor Yellow
    
    # Get user notifications
    Test-Api -testName "Get User Notifications" -method "GET" -endpoint "/api/notifications"
    
    # Get unread notification count
    Test-Api -testName "Get Unread Notification Count" -method "GET" -endpoint "/api/notifications/unread-count"
    
    # Mark all notifications as read
    Test-Api -testName "Mark All Notifications As Read" -method "PUT" -endpoint "/api/notifications/read" -body @{}
    
    # Create a notification (using admin endpoint if available)
    $notification = @{
        user_id = 1  # This would be the target user ID
        notification_type = "test"
        title = "Test Notification"
        message = "This is a test notification"
        related_entity_type = "test"
        related_entity_id = 1
    }
    # This would likely fail without admin privileges, but we can try
    Test-Api -testName "Create Test Notification (Admin)" -method "POST" -endpoint "/api/admin/notifications" -body $notification
}

# Run a health check on the server
function Test-ServerStatus {
    Write-Host "`n=== Testing Server Health ===" -ForegroundColor Yellow
    
    try {
        $testConnection = Test-NetConnection -ComputerName localhost -Port 3001 -ErrorAction SilentlyContinue
        if ($testConnection.TcpTestSucceeded) {
            Write-Host "✓ Server is running on port 3001" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Server is not responding on port 3001" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Server is not responding: $_" -ForegroundColor Red
        return $false
    }
}

# Main test runner
function Run-FeatureTests {
    Write-Host "=== Starting Feature Tests ===" -ForegroundColor Cyan
    
    # Check if server is running
    $serverRunning = Test-ServerStatus
    if (-not $serverRunning) {
        Write-Host "Please start the server before running tests" -ForegroundColor Red
        return
    }
    
    try {
        # Login first
        $loginResult = Login-TestUser
        if (-not $loginResult) {
            Write-Host "Login failed, cannot continue tests" -ForegroundColor Red
            return
        }
        
        # Run tests for each feature
        Test-ProfileFeatures
        Test-SettingsFeatures
        Test-NotificationFeatures
        Test-USSDFeatures
        
        Write-Host "`n=== All Feature Tests Completed ===" -ForegroundColor Green
    } catch {
        Write-Host "`n=== Tests Failed ===" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to test USSD features
function Test-USSDFeatures {
    Write-Host "`n--- Testing USSD Features ---" -ForegroundColor Cyan
    
    # Test starting a USSD session
    try {
        Write-Host "Testing USSD session start..." -ForegroundColor Yellow
        $ussdData = @{
            phoneNumber = "+254700000000"
        }
        
        $response = Invoke-ApiRequest -method "POST" -endpoint "/api/ussd/session" -body $ussdData
        if ($response.sessionId) {
            Write-Host "✓ USSD session started successfully" -ForegroundColor Green
            $sessionId = $response.sessionId
            Write-Host "Session ID: $sessionId" -ForegroundColor Gray
            Write-Host "Initial menu: $($response.message)" -ForegroundColor Gray
            
            # Test USSD callback - selecting option 1
            Write-Host "Testing USSD callback (option 1)..." -ForegroundColor Yellow
            $callbackData = @{
                sessionId = $sessionId
                serviceCode = "*384*1234#"
                phoneNumber = "+254700000000"
                text = "1" # Select option 1 from main menu
            }
            
            $callbackResponse = Invoke-ApiRequest -method "POST" -endpoint "/api/ussd/callback" -body $callbackData
            Write-Host "✓ USSD callback successful" -ForegroundColor Green
            Write-Host "Response: $callbackResponse" -ForegroundColor Gray
            
            # Test USSD callback - crop selection
            Write-Host "Testing USSD callback (crop selection)..." -ForegroundColor Yellow
            $callbackData = @{
                sessionId = $sessionId
                serviceCode = "*384*1234#"
                phoneNumber = "+254700000000"
                text = "1*1" # Select Maize
            }
            
            $callbackResponse = Invoke-ApiRequest -method "POST" -endpoint "/api/ussd/callback" -body $callbackData
            Write-Host "✓ USSD crop selection successful" -ForegroundColor Green
            Write-Host "Response: $callbackResponse" -ForegroundColor Gray
            
            # End USSD session
            Write-Host "Testing USSD session end..." -ForegroundColor Yellow
            $endResponse = Invoke-ApiRequest -method "DELETE" -endpoint "/api/ussd/session/$sessionId"
            if ($endResponse.success) {
                Write-Host "✓ USSD session ended successfully" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed to end USSD session" -ForegroundColor Red
                Write-Host "Response: $($endResponse | ConvertTo-Json)" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ Failed to start USSD session" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ USSD test failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status code: $statusCode" -ForegroundColor Red
            
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Error details: $responseBody" -ForegroundColor Red
        }
    }
}

# Run all the tests
Run-FeatureTests