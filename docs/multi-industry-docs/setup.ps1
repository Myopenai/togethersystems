param(
    [switch]$RunDev,
    [switch]$RunProd,
    [switch]$RunTests
)

# Set Error Action
$ErrorActionPreference = "Stop"

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Function to install Node.js if not present
function Install-NodeJS {
    if (-not (Test-CommandExists "node")) {
        Write-Host "Node.js not found. Installing Node.js..." -ForegroundColor Yellow
        winget install --id OpenJS.NodeJS.LTS -e --accept-package-licenses --accept-source-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } else {
        Write-Host "Node.js is already installed." -ForegroundColor Green
    }
}

# Function to create necessary directories
function Initialize-Directories {
    $directories = @("dist", "dist/css", "dist/js", "dist/images", "logs")
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Green
        }
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "Installing project dependencies..." -ForegroundColor Cyan
    npm install
}

# Function to set up environment
function Set-Environment {
    if (-not (Test-Path ".env")) {
        @"
# Environment Configuration
NODE_ENV=development
PORT=3000
# Add other environment variables here
"@ | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "Created .env file" -ForegroundColor Green
    }
}

# Function to show menu
function Show-Menu {
    Clear-Host
    Write-Host "=== Project Setup Menu ===" -ForegroundColor Cyan
    Write-Host "1. Install Dependencies"
    Write-Host "2. Run in Development Mode"
    Write-Host "3. Run in Production Mode"
    Write-Host "4. Run Tests"
    Write-Host "5. Create Backup"
    Write-Host "6. Monitor Files"
    Write-Host "7. Add Sample Content"
    Write-Host "Q. Quit"
    Write-Host "==========================" -ForegroundColor Cyan
}

# Main execution
Write-Host "=== Project Setup ===" -ForegroundColor Cyan

# Check and install Node.js
Install-NodeJS

# Initialize directories
Initialize-Directories

# Install dependencies
Install-Dependencies

# Set up environment
Set-Environment

# Handle command line arguments
if ($RunDev) {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
    exit
}

if ($RunProd) {
    Write-Host "Starting production server..." -ForegroundColor Green
    npm start
    exit
}

if ($RunTests) {
    Write-Host "Running tests..." -ForegroundColor Green
    npm test
    exit
}

# Show interactive menu if no parameters provided
$menu = $true
while ($menu) {
    Show-Menu
    $selection = Read-Host "Please make a selection"
    
    switch ($selection) {
        '1' { 
            Install-Dependencies
            Pause
        }
        '2' { 
            Write-Host "Starting development server..." -ForegroundColor Green
            npm run dev
            $menu = $false
        }
        '3' { 
            Write-Host "Starting production server..." -ForegroundColor Green
            npm start
            $menu = $false
        }
        '4' { 
            Write-Host "Running tests..." -ForegroundColor Green
            npm test
            Pause
        }
        '5' { 
            & ".\scripts\backup.ps1"
            Pause
        }
        '6' { 
            & ".\scripts\monitor.ps1"
            $menu = $false
        }
        '7' { 
            & ".\scripts\add-sample-content.ps1"
            Pause
        }
        'Q' { 
            $menu = $false
        }
        default {
            Write-Host "Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}

Write-Host "Setup completed successfully!" -ForegroundColor Green
