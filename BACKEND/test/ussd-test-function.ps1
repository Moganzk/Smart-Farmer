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