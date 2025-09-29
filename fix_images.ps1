$bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\logo.png", $bytes)
Write-Host "Created logo.png"

$bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\onboarding-advisory.png", $bytes)
Write-Host "Created onboarding-advisory.png"

$bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\onboarding-community.png", $bytes)
Write-Host "Created onboarding-community.png"

$bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOAAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\onboarding-offline.png", $bytes)
Write-Host "Created onboarding-offline.png"

$jpegBytes = [System.Convert]::FromBase64String("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\featured-disease-prevention.jpg", $jpegBytes)
Write-Host "Created featured-disease-prevention.jpg"

$jpegBytes = [System.Convert]::FromBase64String("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=")
[System.IO.File]::WriteAllBytes("C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND\src\assets\images\featured-irrigation.jpg", $jpegBytes)
Write-Host "Created featured-irrigation.jpg"

Write-Host "All image files have been fixed!"