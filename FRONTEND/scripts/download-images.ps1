# Smart Farmer Image Downloader
# This script downloads free agriculture-related images for the Smart Farmer app

# Configuration
$outputFolder = ".\images"
$imageSources = @(
    @{
        Name = "Splash Backgrounds"
        Keywords = "agriculture+field+farm+landscape"
        Count = 5
        Width = 1080
        Height = 1920
        Folder = "splash"
    },
    @{
        Name = "Farm Crops"
        Keywords = "crop+farm+growing+plants"
        Count = 10
        Width = 800
        Height = 600
        Folder = "crops"
    },
    @{
        Name = "Common Plant Diseases"
        Keywords = "plant+disease+leaf+agriculture"
        Count = 10
        Width = 800
        Height = 600
        Folder = "diseases"
    },
    @{
        Name = "Farmer Portraits"
        Keywords = "farmer+portrait+agriculture+working"
        Count = 6
        Width = 500
        Height = 500
        Folder = "farmers"
    },
    @{
        Name = "Farm Tools and Equipment"
        Keywords = "farm+tools+equipment+agriculture"
        Count = 8
        Width = 800
        Height = 600
        Folder = "equipment"
    },
    @{
        Name = "UI Icons"
        Keywords = "agriculture+icon+simple+minimal"
        Count = 10
        Width = 200
        Height = 200
        Folder = "icons"
    }
)

# Create output directory if it doesn't exist
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
    Write-Host "Created output directory: $outputFolder" -ForegroundColor Cyan
}

# Create a function to download images from Unsplash API
function Get-UnsplashImages {
    param (
        [string]$Keywords,
        [int]$Count,
        [string]$Category,
        [string]$OutputPath,
        [int]$Width = 800,
        [int]$Height = 600
    )
    
    Write-Host "`nDownloading $Count $Category images..." -ForegroundColor Cyan
    
    # Create category subfolder
    $categoryPath = Join-Path -Path $OutputPath -ChildPath $Category
    if (-not (Test-Path $categoryPath)) {
        New-Item -ItemType Directory -Path $categoryPath | Out-Null
        Write-Host "Created directory: $categoryPath" -ForegroundColor Cyan
    }
    
    # Use Unsplash Source API (no API key required for this simple approach)
    for ($i = 1; $i -le $Count; $i++) {
        $randomSeed = Get-Random -Minimum 1 -Maximum 1000
        $fileName = "$Category-$i.jpg"
        $filePath = Join-Path -Path $categoryPath -ChildPath $fileName
        $url = "https://source.unsplash.com/${Width}x${Height}/?$Keywords&sig=$randomSeed"
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $filePath
            Write-Host "Downloaded: $fileName" -ForegroundColor Green
            # Wait a bit to avoid rate limiting
            Start-Sleep -Milliseconds 500
        }
        catch {
            Write-Host "Failed to download $fileName. Error: $_" -ForegroundColor Red
        }
    }
}

# Create a manifest file to track all downloaded images
$manifestPath = Join-Path -Path $outputFolder -ChildPath "image-manifest.json"
$manifest = @{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    images = @{}
}

# Download images for each category
foreach ($source in $imageSources) {
    $categoryFolder = Join-Path -Path $outputFolder -ChildPath $source.Folder
    
    Get-UnsplashImages -Keywords $source.Keywords -Count $source.Count `
                      -Category $source.Folder -OutputPath $outputFolder `
                      -Width $source.Width -Height $source.Height
                      
    # Add to manifest
    $manifest.images[$source.Folder] = @{
        description = $source.Name
        count = $source.Count
        resolution = "$($source.Width)x$($source.Height)"
        keywords = $source.Keywords -split '\+'
    }
}

# Save manifest to JSON
$manifest | ConvertTo-Json -Depth 4 | Out-File -FilePath $manifestPath -Encoding utf8
Write-Host "`nImage manifest saved to: $manifestPath" -ForegroundColor Cyan

# Create a SQL script to import these images into the database
$sqlScriptPath = Join-Path -Path $outputFolder -ChildPath "import-images.sql"

$sqlHeader = @"
-- Image Import Script
-- Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- This script imports the downloaded images into the database

-- Make sure to adjust the file paths to match your server environment

"@

$sqlContent = $sqlHeader

foreach ($source in $imageSources) {
    $categoryFolder = Join-Path -Path $outputFolder -ChildPath $source.Folder
    $sqlContent += "`n-- Importing $($source.Name)`n"
    
    $imageFiles = Get-ChildItem -Path $categoryFolder -Filter "*.jpg"
    foreach ($image in $imageFiles) {
        $imageKey = [System.IO.Path]::GetFileNameWithoutExtension($image.Name)
        $imageDescription = "$($source.Name) - $imageKey"
        $filePath = $image.FullName.Replace('\', '/')
        
        $sqlContent += @"
CALL insert_default_app_image('$imageKey', '$filePath', '$imageDescription', 1);

"@
    }
}

# Save SQL script
$sqlContent | Out-File -FilePath $sqlScriptPath -Encoding utf8
Write-Host "SQL import script saved to: $sqlScriptPath" -ForegroundColor Cyan

Write-Host "`nImage download complete!" -ForegroundColor Green
Write-Host "Downloaded images are ready for import to the database." -ForegroundColor Cyan
Write-Host "To import the images, run the generated SQL script using PostgreSQL." -ForegroundColor Cyan
Write-Host "`nNote: The script uses Unsplash Source API for demo purposes." -ForegroundColor Yellow
Write-Host "For production use, consider using properly licensed images or an API with attribution." -ForegroundColor Yellow