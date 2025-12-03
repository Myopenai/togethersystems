# Integrate Da Vinci XXXXXXL Enterprise Standard into all HTML files
# Together Systems - Auto-Integration Script (PowerShell)
# Version: 1.0.0

Write-Host "🔍 Searching for HTML files..." -ForegroundColor Cyan

$rootDir = Get-Location
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object {
    $_.FullName -notmatch 'node_modules' -and 
    $_.FullName -notmatch '\.git' -and
    $_.FullName -notmatch 'backup'
}

Write-Host "📄 Found $($htmlFiles.Count) HTML files" -ForegroundColor Yellow
Write-Host ""

$cssLink = '  <link rel="stylesheet" href="./css/da-vinci-xxxxxl-enterprise-standard.css">'
$jsScript = '  <script src="./css/da-vinci-enterprise-standard-init.js"></script>'

$integratedCount = 0
$skippedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Skip if already integrated
    if ($content -match 'da-vinci-xxxxxl-enterprise-standard\.css') {
        Write-Host "⏭️  Skipped (already integrated): $($file.Name)" -ForegroundColor Gray
        $skippedCount++
        continue
    }
    
    $modified = $false
    
    # Add CSS link before </head>
    if ($content -notmatch 'da-vinci-xxxxxl-enterprise-standard\.css') {
        if ($content -match '</head>') {
            $content = $content -replace '</head>', "$cssLink`n</head>"
            $modified = $true
        }
    }
    
    # Add JS script before </body>
    if ($content -notmatch 'da-vinci-enterprise-standard-init\.js') {
        if ($content -match '</body>') {
            $content = $content -replace '</body>', "$jsScript`n</body>"
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Integrated: $($file.Name)" -ForegroundColor Green
        $integratedCount++
    } else {
        Write-Host "⚠️  Could not integrate: $($file.Name)" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host ""
Write-Host "✅ Integration complete!" -ForegroundColor Green
Write-Host "📊 Integrated: $integratedCount files" -ForegroundColor Cyan
Write-Host "⏭️  Skipped: $skippedCount files" -ForegroundColor Gray

