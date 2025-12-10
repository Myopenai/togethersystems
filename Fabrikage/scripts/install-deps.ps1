# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Install CoreProtocols dependencies
$coreProtocolsPath = Join-Path $PSScriptRoot "..\Fabrikage.CoreProtocols"
Set-Location $coreProtocolsPath

Write-Host "Installing CoreProtocols dependencies..." -ForegroundColor Cyan
npm install ajv ajv-formats @types/ajv @types/json-schema --save

# Install remaining package dependencies
Set-Location $PSScriptRoot\..

$packages = @(
    "Fabrikage.AutoExecution",
    "Fabrikage.IntelligenceMatrix",
    "Fabrikage.ProvenanceLedger",
    "Fabrikage.ObservabilityAtlas",
    "Portal"
)

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $PSScriptRoot "..\$pkg"
    if (Test-Path $pkgPath) {
        Write-Host "Installing dependencies for $pkg..." -ForegroundColor Cyan
        Set-Location $pkgPath
        npm install
    }
}

# Return to root directory
Set-Location $PSScriptRoot\..

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
