# api-test.ps1
# PowerShell script to test the Smart Farmer API endpoints

# API base URL
$apiUrl = "http://localhost:3001"

# Test user credentials
$testUser = @{
    email = "test@example.com"
    password = "test123"
}

# Variable to store token
$token = ""

# Utility function to display test results
function Log-Result {
    param (
        [string]$testName,
        [bool]$success,
        [object]$response = $null,
        [object]$error = $null
    )

    if ($success) {
        Write-Host "✓ $testName`: Success" -ForegroundColor Green
        if ($response -and $env:DEBUG) {
            Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ $testName`: Failed" -ForegroundColor Red
        if ($error) {
            Write-Host "Error: $error" -ForegroundColor Red
        }
    }
}

# Test function for API requests
function Test-Api {
    param (
        [string]$testName,
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [hashtable]$headers = @{}
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
            $params.Body = $body | ConvertTo-Json
        }

        $response = Invoke-RestMethod @params
        Log-Result -testName $testName -success $true -response $response
        return $response
    } catch {
        $errorDetails = $_.Exception.Response
        if ($errorDetails) {
            $reader = New-Object System.IO.StreamReader($errorDetails.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $errorContent = $reader.ReadToEnd()
        } else {
            $errorContent = $_.Exception.Message
        }
        
        Log-Result -testName $testName -success $false -error $errorContent
        return $null
    }
}

# Create a test user
function Register-TestUser {
    $body = @{
        username = "testuser"
        email = $testUser.email
        password = $testUser.password
        role = "farmer"
    }
    
    $result = Test-Api -testName "Create Test User" -method "POST" -endpoint "/api/auth/register" -body $body
    
    # If user already exists, it's not an error for our testing
    if (!$result) {
        Write-Host "Test user might already exist, proceeding with login" -ForegroundColor Yellow
    }
    
    return $result
}

# Login with test user
function Login-TestUser {
    $body = @{
        email = $testUser.email
        password = $testUser.password
    }
    
    $result = Test-Api -testName "Login" -method "POST" -endpoint "/api/auth/login" -body $body
    
    if ($result) {
        $script:token = $result.token
        Write-Host "Login successful, token obtained" -ForegroundColor Green
    }
    
    return $result
}

# Test get user profile
function Test-GetProfile {
    return Test-Api -testName "Get Profile" -method "GET" -endpoint "/api/profile"
}

# Test update user profile
function Test-UpdateProfile {
    $body = @{
        full_name = "Test User"
        bio = "This is a test profile"
        location = "Test Location"
        expertise = "Testing"
    }
    
    return Test-Api -testName "Update Profile" -method "PUT" -endpoint "/api/profile" -body $body
}

# Test get user settings
function Test-GetSettings {
    return Test-Api -testName "Get Settings" -method "GET" -endpoint "/api/settings"
}

# Test update notification preferences
function Test-UpdateNotificationSettings {
    $body = @{
        push_enabled = $false
        email_enabled = $true
        detection_results = $true
        group_messages = $false
        system_updates = $true
        warnings = $true
    }
    
    return Test-Api -testName "Update Notification Settings" -method "PUT" -endpoint "/api/settings/notification" -body $body
}

# Test reset settings
function Test-ResetSettings {
    return Test-Api -testName "Reset Settings" -method "POST" -endpoint "/api/settings/reset/notification_preferences" -body @{}
}

# Test get notifications
function Test-GetNotifications {
    return Test-Api -testName "Get Notifications" -method "GET" -endpoint "/api/notifications"
}

# Test mark notifications as read
function Test-MarkNotificationsAsRead {
    return Test-Api -testName "Mark Notifications As Read" -method "PUT" -endpoint "/api/notifications/read" -body @{}
}

# Main test runner
function Run-AllTests {
    Write-Host "=== Starting API Tests ===" -ForegroundColor Cyan
    
    try {
        Register-TestUser
        Login-TestUser
        Test-GetProfile
        Test-UpdateProfile
        Test-GetSettings
        Test-UpdateNotificationSettings
        Test-ResetSettings
        Test-GetNotifications
        Test-MarkNotificationsAsRead
        
        Write-Host "`n=== All Tests Completed ===" -ForegroundColor Green
    } catch {
        Write-Host "`n=== Tests Failed ===" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Run tests
Run-AllTests