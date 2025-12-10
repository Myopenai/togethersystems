# Deployment Script for TogetherSystems

# Stop on first error
$ErrorActionPreference = "Stop"

# Configuration
$projectRoot = "d:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
$deploymentLog = "$projectRoot\deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Start logging
Start-Transcript -Path $deploymentLog -Append
Write-Host "🚀 Starting Deployment Process - $(Get-Date)" -ForegroundColor Cyan

# Function to log messages
function Log-Info {
    param([string]$message)
    Write-Host "[INFO] $message" -ForegroundColor Cyan
    Add-Content -Path $deploymentLog -Value "[$(Get-Date)] [INFO] $message"
}

function Log-Success {
    param([string]$message)
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
    Add-Content -Path $deploymentLog -Value "[$(Get-Date)] [SUCCESS] $message"
}

function Log-Error {
    param([string]$message, [bool]$fatal = $true)
    Write-Host "[ERROR] $message" -ForegroundColor Red
    Add-Content -Path $deploymentLog -Value "[$(Get-Date)] [ERROR] $message"
    if ($fatal) {
        Write-Host "❌ Deployment failed. Check $deploymentLog for details." -ForegroundColor Red
        Stop-Transcript
        exit 1
    }
}

# 1. Update Dependencies
try {
    Log-Info "Step 1/6: Updating dependencies..."
    Set-Location $projectRoot
    npm install
    npm update
    Log-Success "Dependencies updated successfully"
}
catch {
    Log-Error "Failed to update dependencies: $_"
}

# 2. Run Tests
try {
    Log-Info "Step 2/6: Running tests..."
    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }
    Log-Success "All tests passed"
}
catch {
    Log-Error "Tests failed: $_"
}

# 3. Build Project
try {
    Log-Info "Step 3/6: Building project..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Log-Success "Project built successfully"
}
catch {
    Log-Error "Build failed: $_"
}

# 4. Deploy to Cloudflare Pages
try {
    Log-Info "Step 4/6: Deploying to Cloudflare Pages..."
    wrangler pages deploy . --project-name togethersystems
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment to Cloudflare Pages failed"
    }
    Log-Success "Successfully deployed to Cloudflare Pages"
}
catch {
    Log-Error "Deployment failed: $_"
}

# 5. Verify Deployment
try {
    Log-Info "Step 5/6: Verifying deployment..."
    $deploymentUrl = "https://togethersystems.pages.dev" # Update with your actual URL
    $response = Invoke-WebRequest -Uri $deploymentUrl -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Log-Success "Deployment verified successfully at $deploymentUrl"
    } else {
        throw "Deployment verification failed with status code: $($response.StatusCode)"
    }
    
    # Check critical files
    $filesToCheck = @("index.html", "main.js", "main.css")
    foreach ($file in $filesToCheck) {
        $fileUrl = "$deploymentUrl/$file"
        $fileResponse = Invoke-WebRequest -Uri $fileUrl -UseBasicParsing -ErrorAction Stop
        if ($fileResponse.StatusCode -ne 200) {
            throw "File $file not found in deployment"
        }
        Log-Success "File verified: $file"
    }
}
catch {
    Log-Error "Deployment verification failed: $_" -fatal $false
}

# 6. Check Localhost
try {
    Log-Info "Step 6/6: Testing localhost..."
    
    # Start local server in background
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow
    
    # Give it time to start
    Start-Sleep -Seconds 5
    
    # Test localhost
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -ErrorAction Stop
    if ($localResponse.StatusCode -eq 200) {
        Log-Success "Local server is running correctly"
    } else {
        throw "Local server returned status code: $($localResponse.StatusCode)"
    }
    
    # Stop the server
    Stop-Process -Id $serverProcess.Id -Force
}
catch {
    Log-Error "Local server test failed: $_" -fatal $false
}

# Final status
Log-Success "✅ Deployment process completed successfully!"
Write-Host "Deployment log: $deploymentLog" -ForegroundColor Cyan
Stop-Transcript
