# Deployment Script for TogetherSystems v2

# Configuration
$projectRoot = "d:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
$deploymentLog = "$projectRoot\deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Function to log messages
function Log-Info {
    param([string]$message)
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [INFO] $message"
    Write-Host $logMessage -ForegroundColor Cyan
    try {
        Add-Content -Path $deploymentLog -Value $logMessage -ErrorAction Stop
    } catch {
        Write-Host "Warning: Could not write to log file: $_" -ForegroundColor Yellow
    }
}

function Log-Success {
    param([string]$message)
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [SUCCESS] $message"
    Write-Host $logMessage -ForegroundColor Green
    try {
        Add-Content -Path $deploymentLog -Value $logMessage -ErrorAction Stop
    } catch {
        Write-Host "Warning: Could not write to log file: $_" -ForegroundColor Yellow
    }
}

function Log-Error {
    param([string]$message, [bool]$fatal = $true)
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ERROR] $message"
    Write-Host $logMessage -ForegroundColor Red
    try {
        Add-Content -Path $deploymentLog -Value $logMessage -ErrorAction Stop
    } catch {
        Write-Host "Warning: Could not write to log file: $_" -ForegroundColor Yellow
    }
    if ($fatal) {
        Write-Host "❌ Deployment failed. Check $deploymentLog for details." -ForegroundColor Red
        exit 1
    }
}

# Start deployment
Write-Host "🚀 Starting Deployment Process - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Log-Info "Deployment log: $deploymentLog"

# 1. Update Dependencies
try {
    Log-Info "Step 1/6: Updating dependencies..."
    Set-Location $projectRoot
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        throw "package.json not found in $projectRoot"
    }
    
    Log-Info "Running npm install..."
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
    
    Log-Info "Running npm update..."
    npm update --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) { throw "npm update failed with exit code $LASTEXITCODE" }
    
    Log-Success "Dependencies updated successfully"
}
catch {
    Log-Error "Failed to update dependencies: $_"
}

# 2. Run Tests
try {
    Log-Info "Step 2/6: Running tests..."
    
    # Check if test script exists in package.json
    $packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
    if (-not ($packageJson.scripts.PSObject.Properties['test'])) {
        Log-Info "No test script found in package.json, skipping tests"
    } else {
        npm test
        if ($LASTEXITCODE -ne 0) {
            throw "Tests failed with exit code $LASTEXITCODE"
        }
        Log-Success "All tests passed"
    }
}
catch {
    Log-Error "Tests failed: $_"
}

# 3. Build Project
try {
    Log-Info "Step 3/6: Building project..."
    
    # Check if build script exists in package.json
    if (-not ($packageJson.scripts.PSObject.Properties['build'])) {
        Log-Info "No build script found in package.json, skipping build step"
    } else {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        Log-Success "Project built successfully"
    }
}
catch {
    Log-Error "Build failed: $_"
}

# 4. Deploy to Cloudflare Pages
try {
    Log-Info "Step 4/6: Deploying to Cloudflare Pages..."
    
    # Check if wrangler is installed
    $wranglerCheck = Get-Command wrangler -ErrorAction SilentlyContinue
    if (-not $wranglerCheck) {
        Log-Info "Wrangler CLI not found, installing globally..."
        npm install -g wrangler
    }
    
    # Check if already logged in to Cloudflare
    $wranglerWhoami = wrangler whoami 2>&1
    if ($wranglerWhoami -match "Not logged in") {
        Log-Info "Please log in to Cloudflare..."
        wrangler login
    }
    
    Log-Info "Starting deployment..."
    wrangler pages deploy . --project-name togethersystems
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment to Cloudflare Pages failed with exit code $LASTEXITCODE"
    }
    Log-Success "Successfully deployed to Cloudflare Pages"
}
catch {
    Log-Error "Deployment failed: $_"
}

# 5. Verify Deployment
try {
    Log-Info "Step 5/6: Verifying deployment..."
    $deploymentUrl = "https://togethersystems.pages.dev"
    
    Log-Info "Checking if $deploymentUrl is accessible..."
    try { 
        $response = Invoke-WebRequest -Uri $deploymentUrl -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Log-Success "Deployment verified successfully at $deploymentUrl"
        } else {
            throw "Unexpected status code: $($response.StatusCode)"
        }
    } catch {
        throw "Could not reach $deploymentUrl : $_"
    }
    
    # Check critical files
    $filesToCheck = @("index.html", "main.js", "main.css")
    foreach ($file in $filesToCheck) {
        $fileUrl = "$deploymentUrl/$file"
        try {
            Log-Info "Verifying file: $file"
            $fileResponse = Invoke-WebRequest -Uri $fileUrl -UseBasicParsing -ErrorAction Stop
            if ($fileResponse.StatusCode -ne 200) {
                throw "Status code: $($fileResponse.StatusCode)"
            }
            Log-Success "File verified: $file"
        } catch {
            Log-Error "File $file verification failed: $_" -fatal $false
        }
    }
}
catch {
    Log-Error "Deployment verification failed: $_" -fatal $false
}

# 6. Check Localhost
try {
    Log-Info "Step 6/6: Testing localhost..."
    
    # Check if server.js exists
    if (-not (Test-Path "server.js")) {
        Log-Info "No server.js found, skipping local server test"
    } else {
        # Start local server in background
        Log-Info "Starting local server..."
        $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow -ErrorAction Stop
        
        # Give it time to start
        Start-Sleep -Seconds 5
        
        # Test localhost
        $localUrl = "http://localhost:8080"
        try {
            Log-Info "Testing local server at $localUrl..."
            $localResponse = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -ErrorAction Stop
            if ($localResponse.StatusCode -eq 200) {
                Log-Success "Local server is running correctly"
            } else {
                throw "Status code: $($localResponse.StatusCode)"
            }
        } catch {
            throw "Local server test failed: $_"
        } finally {
            # Stop the server if it was started
            if ($serverProcess -and -not $serverProcess.HasExited) {
                try {
                    Log-Info "Stopping local server..."
                    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
                } catch {
                    Log-Error "Failed to stop local server: $_" -fatal $false
                }
            }
        }
    }
}
catch {
    Log-Error "Local server test failed: $_" -fatal $false
}

# Final status
Log-Success "✅ Deployment process completed successfully!"
Write-Host "Deployment log: $deploymentLog" -ForegroundColor Cyan
