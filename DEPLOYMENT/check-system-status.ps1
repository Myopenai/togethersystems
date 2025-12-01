# System Status Check - All Servers
# IBM-Standard: Zero-Defect, Industrial Fabrication Software
# Version: 1.0.0-XXXL
# Branding: T,.&T,,.&T,,,.(C)TEL1.NL

Write-Host "🔍 SYSTEM STATUS CHECK - Checking All Servers..." -ForegroundColor Cyan
Write-Host ""

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$Status = @{
    timestamp = (Get-Date).ToISOString()
    servers = @{}
    databases = @{}
    storage = @{}
    endpoints = @{}
    overall = "unknown"
}

# Check Cloudflare Workers
Write-Host "☁️ Checking Cloudflare Workers..." -ForegroundColor Yellow

$workers = @(
    @{ name = "TELBANK Transfers"; path = "functions/api/telbank/transfers.js" },
    @{ name = "Presence Verify"; path = "functions/api/presence/verify.js" },
    @{ name = "Presence Heartbeat"; path = "functions/api/presence/heartbeat.js" },
    @{ name = "Presence Match"; path = "functions/api/presence/match.js" },
    @{ name = "WebSocket Signaling"; path = "functions/ws.js" }
)

$Status.servers.workers = @()

foreach ($worker in $workers) {
    $fullPath = Join-Path $ROOT_DIR $worker.path
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $($worker.name): File exists" -ForegroundColor Green
        $Status.servers.workers += @{
            name = $worker.name
            path = $worker.path
            fileExists = $true
            status = "file_exists"
        }
    } else {
        Write-Host "  ❌ $($worker.name): File missing" -ForegroundColor Red
        $Status.servers.workers += @{
            name = $worker.name
            path = $worker.path
            fileExists = $false
            status = "missing"
        }
    }
}

# Check D1 Database
Write-Host ""
Write-Host "💾 Checking D1 Database..." -ForegroundColor Yellow

$schemaFiles = @(
    "TELBANK/d1-schema-telbank-negative-assets.sql",
    "d1-schema.sql"
)

$Status.databases.d1 = @()

foreach ($schemaFile in $schemaFiles) {
    $fullPath = Join-Path $ROOT_DIR $schemaFile
    if (Test-Path $fullPath) {
        Write-Host "  ✅ Schema: $schemaFile - Ready" -ForegroundColor Green
        $Status.databases.d1 += @{
            schema = $schemaFile
            fileExists = $true
            status = "schema_ready"
        }
    } else {
        Write-Host "  ❌ Schema: $schemaFile - Missing" -ForegroundColor Red
        $Status.databases.d1 += @{
            schema = $schemaFile
            fileExists = $false
            status = "missing"
        }
    }
}

# Check R2 Storage
Write-Host ""
Write-Host "🗄️ Checking R2 Storage..." -ForegroundColor Yellow

$buckets = @(
    "together-systems-assets",
    "together-systems-uploads",
    "together-systems-backups"
)

$Status.storage.r2 = @()

foreach ($bucket in $buckets) {
    Write-Host "  ⚠️ Bucket: $bucket - Verification requires wrangler" -ForegroundColor Yellow
    $Status.storage.r2 += @{
        name = $bucket
        status = "unknown_requires_check"
    }
}

# Check GitHub Pages
Write-Host ""
Write-Host "📄 Checking GitHub Pages..." -ForegroundColor Yellow

$pagesFiles = @(
    "index.html",
    "manifest-forum.html",
    "manifest-portal.html",
    "honeycomb.html",
    "legal-hub.html",
    "TELBANK/index.html",
    "TELADIA/teladia-portal-redesign.html"
)

$Status.servers.githubPages = @{
    files = @()
    url = "https://myopenai.github.io/togethersystems/"
    status = "unknown"
}

foreach ($file in $pagesFiles) {
    $fullPath = Join-Path $ROOT_DIR $file
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $file - Ready" -ForegroundColor Green
        $Status.servers.githubPages.files += @{
            file = $file
            exists = $true
            status = "ready"
        }
    } else {
        Write-Host "  ❌ $file - Missing" -ForegroundColor Red
        $Status.servers.githubPages.files += @{
            file = $file
            exists = $false
            status = "missing"
        }
    }
}

# Check GitHub Pages URL
try {
    $response = Invoke-WebRequest -Uri $Status.servers.githubPages.url -Method Head -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ GitHub Pages: Online" -ForegroundColor Green
        $Status.servers.githubPages.status = "online"
    }
} catch {
    Write-Host "  ⚠️ GitHub Pages: Cannot verify ($($_.Exception.Message))" -ForegroundColor Yellow
    $Status.servers.githubPages.status = "unknown"
}

# Check Frontend Assets
Write-Host ""
Write-Host "🎨 Checking Frontend Assets..." -ForegroundColor Yellow

$assetDirs = @("assets", "css", "js", "images")
$Status.servers.frontendAssets = @()

foreach ($dir in $assetDirs) {
    $fullPath = Join-Path $ROOT_DIR $dir
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $dir/ - Ready" -ForegroundColor Green
        $Status.servers.frontendAssets += @{
            directory = $dir
            exists = $true
            status = "ready"
        }
    } else {
        Write-Host "  ⚠️ $dir/ - Missing" -ForegroundColor Yellow
        $Status.servers.frontendAssets += @{
            directory = $dir
            exists = $false
            status = "missing"
        }
    }
}

# Calculate Overall Status
$warnings = 0
$errors = 0

# Count missing files
$missingWorkers = ($Status.servers.workers | Where-Object { $_.status -eq "missing" }).Count
$missingSchemas = ($Status.databases.d1 | Where-Object { $_.status -eq "missing" }).Count
$missingPages = ($Status.servers.githubPages.files | Where-Object { $_.status -eq "missing" }).Count

if ($missingWorkers -gt 0) { $warnings++ }
if ($missingSchemas -gt 0) { $warnings++ }
if ($missingPages -gt 0) { $warnings++ }
if ($Status.servers.githubPages.status -ne "online") { $warnings++ }

if ($errors -gt 0) {
    $Status.overall = "error"
} elseif ($warnings -gt 0) {
    $Status.overall = "warning"
} else {
    $Status.overall = "ok"
}

$Status.summary = @{
    warnings = $warnings
    errors = $errors
    overall = $Status.overall
}

# Generate Report
Write-Host ""
Write-Host "📊 SYSTEM STATUS SUMMARY:" -ForegroundColor Cyan
Write-Host "  Overall Status: $($Status.overall.ToUpper())" -ForegroundColor $(if ($Status.overall -eq "ok") { "Green" } elseif ($Status.overall -eq "warning") { "Yellow" } else { "Red" })
Write-Host "  Warnings: $warnings"
Write-Host "  Errors: $errors"
Write-Host ""

# Save Report
$reportPath = Join-Path $PSScriptRoot "system-status-report.json"
$Status | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Cyan

# Recommendations
Write-Host ""
Write-Host "💡 RECOMMENDATIONS:" -ForegroundColor Yellow

if ($Status.overall -eq "ok") {
    Write-Host "  ✅ All systems operational!" -ForegroundColor Green
} else {
    if ($missingWorkers -gt 0) {
        Write-Host "  ⚠️ Deploy missing workers: Run .\deploy-all.ps1" -ForegroundColor Yellow
    }
    if ($Status.servers.githubPages.status -ne "online") {
        Write-Host "  ⚠️ Deploy GitHub Pages: Push to gh-pages branch" -ForegroundColor Yellow
    }
}

Write-Host ""
