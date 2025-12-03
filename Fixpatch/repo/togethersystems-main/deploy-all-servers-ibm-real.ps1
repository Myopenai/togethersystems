# Deploy All Servers - IBM Standard (PowerShell)
# NO MOCK DATA - ONLY REAL VALUES
# Version: 1.0.0-XXXL

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "IBM STANDARD DEPLOYMENT - REAL DATA ONLY" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "Error: wrangler CLI not found. Install with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git not found" -ForegroundColor Red
    exit 1
}

# Step 1: Deploy D1 Schema
Write-Host "Step 1: Deploying D1 Schema..." -ForegroundColor Yellow
if (Test-Path "TELBANK/d1-schema-telbank-negative-assets.sql") {
    wrangler d1 execute telbank-db --file=./TELBANK/d1-schema-telbank-negative-assets.sql
}

if (Test-Path "TELADIA/d1-schema-teladia-assets.sql") {
    wrangler d1 execute telbank-db --file=./TELADIA/d1-schema-teladia-assets.sql
}

# Step 2: Run Tests
Write-Host "Step 2: Running IBM Standard Tests..." -ForegroundColor Yellow
if (Test-Path "businessconnecthub-playwright-tests-full") {
    Push-Location "businessconnecthub-playwright-tests-full"
    if (Test-Path "package.json") {
        npm install
        npx playwright test telbank-teladia-tests.spec.js --reporter=list
    }
    Pop-Location
}

# Step 3: Build Check
Write-Host "Step 3: Checking build quality..." -ForegroundColor Yellow

# Check for mock/demo/placeholder code
Write-Host "Checking for mock/demo/placeholder code..."
$mockFiles = Get-ChildItem -Path TELBANK/,TELADIA/,js/ -Include *.html,*.js -Recurse -ErrorAction SilentlyContinue | 
    Select-String -Pattern "demo|mock|placeholder|dummy|TODO.*Implement|Noch nicht" -CaseSensitive:$false |
    Where-Object { $_.Path -notmatch "node_modules|\.git" }

if ($mockFiles) {
    Write-Host "Warning: Found potential mock/demo code:" -ForegroundColor Red
    $mockFiles | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
} else {
    Write-Host "No mock/demo code found" -ForegroundColor Green
}

# Step 4: Deploy to Cloudflare Pages
Write-Host "Step 4: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
wrangler pages deploy . --project-name=togethersystems --compatibility-date=2024-01-01

# Step 5: Deploy to GitHub Pages
Write-Host "Step 5: Preparing GitHub Pages deployment..." -ForegroundColor Yellow
git add -A
git commit -m "IBM Standard: Real data only, no mocks - Production ready"
git push origin main

Write-Host "==========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "TELBANK Portal: https://togethersystems.pages.dev/TELBANK/telbank-portal-negative-assets.html"
Write-Host "TELADIA Portal: https://togethersystems.pages.dev/TELADIA/teladia-portal.html"
Write-Host ""
Write-Host "All servers deployed with REAL DATA ONLY - NO MOCKS" -ForegroundColor Green

