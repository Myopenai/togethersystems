# Bootstrap script for Fabrikage Platform

# Check if Node.js is installed
$nodeVersion = node --version
if (-not $nodeVersion) {
    Write-Host "Node.js is not installed. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
$npmVersion = npm --version
if (-not $npmVersion) {
    Write-Host "npm is not installed. Please install npm and try again." -ForegroundColor Red
    exit 1
}

# Navigate to the project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Install Lerna globally if not already installed
if (-not (Get-Command lerna -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Lerna globally..." -ForegroundColor Cyan
    npm install -g lerna
}

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Bootstrap packages with Lerna
Write-Host "Bootstrapping packages with Lerna..." -ForegroundColor Cyan
lerna bootstrap

# Install dependencies for each package
$packages = @(
    "Fabrikage.CoreProtocols",
    "Fabrikage.AutoExecution",
    "Fabrikage.IntelligenceMatrix",
    "Fabrikage.ProvenanceLedger",
    "Fabrikage.ObservabilityAtlas",
    "Portal"
)

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $projectRoot $pkg
    if (Test-Path $pkgPath) {
        Write-Host "`nInstalling dependencies for $pkg..." -ForegroundColor Cyan
        Set-Location $pkgPath
        npm install
    }
}

# Install CoreProtocols dependencies
Write-Host "`nInstalling CoreProtocols dependencies..." -ForegroundColor Cyan
$coreProtocolsPath = Join-Path $projectRoot "Fabrikage.CoreProtocols"
Set-Location $coreProtocolsPath
npm install ajv ajv-formats @types/ajv @types/json-schema

# Build all packages
Write-Host "`nBuilding all packages..." -ForegroundColor Cyan
Set-Location $projectRoot
lerna run build

Write-Host "`n✅ Bootstrap completed successfully!" -ForegroundColor Green
Write-Host "You can now start developing the Fabrikage Platform." -ForegroundColor Green
