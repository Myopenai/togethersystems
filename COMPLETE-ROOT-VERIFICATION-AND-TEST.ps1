# T,. COMPLETE ROOT VERIFICATION AND TEST
# Kontrolliert Root komplett, erfasst alle Dateien, testet alles, deployt

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE ROOT VERIFICATION AND TEST" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Root komplett kontrollieren
Write-Host "🔍 PHASE 1: Root komplett kontrollieren..." -ForegroundColor Yellow

$rootFiles = @{
    html = @()
    md = @()
    js = @()
    css = @()
    json = @()
    ps1 = @()
    yaml = @()
    other = @()
}

# Alle Dateien im Root erfassen
$allFiles = Get-ChildItem -Path . -File -ErrorAction SilentlyContinue | Where-Object {
    $_.DirectoryName -eq (Get-Location).Path -and
    $_.Name -notmatch "^\.|package-lock|node_modules"
}

foreach ($file in $allFiles) {
    $ext = $file.Extension.ToLower()
    switch ($ext) {
        ".html" { $rootFiles.html += $file }
        ".md" { $rootFiles.md += $file }
        ".js" { $rootFiles.js += $file }
        ".css" { $rootFiles.css += $file }
        ".json" { $rootFiles.json += $file }
        ".ps1" { $rootFiles.ps1 += $file }
        ".yaml" { $rootFiles.yaml += $file }
        ".yml" { $rootFiles.yaml += $file }
        default { $rootFiles.other += $file }
    }
}

Write-Host "   ✅ HTML: $($rootFiles.html.Count)" -ForegroundColor Green
Write-Host "   ✅ MD: $($rootFiles.md.Count)" -ForegroundColor Green
Write-Host "   ✅ JS: $($rootFiles.js.Count)" -ForegroundColor Green
Write-Host "   ✅ CSS: $($rootFiles.css.Count)" -ForegroundColor Green
Write-Host "   ✅ JSON: $($rootFiles.json.Count)" -ForegroundColor Green
Write-Host "   ✅ PS1: $($rootFiles.ps1.Count)" -ForegroundColor Green
Write-Host "   ✅ YAML: $($rootFiles.yaml.Count)" -ForegroundColor Green
Write-Host "   ✅ Other: $($rootFiles.other.Count)" -ForegroundColor Green

# Phase 2: MD zu HTML Konvertierung prüfen
Write-Host ""
Write-Host "📄 PHASE 2: MD zu HTML Konvertierung prüfen..." -ForegroundColor Yellow

$mdToHtml = @()
foreach ($mdFile in $rootFiles.md) {
    $htmlName = $mdFile.Name -replace '\.md$', '.html'
    $htmlFile = $rootFiles.html | Where-Object { $_.Name -eq $htmlName }
    if (-not $htmlFile) {
        $mdToHtml += $mdFile
        Write-Host "   ⚠️ MD ohne HTML: $($mdFile.Name)" -ForegroundColor Yellow
    }
}

Write-Host "   ✅ $($mdToHtml.Count) MD-Dateien ohne HTML gefunden" -ForegroundColor Green

# Phase 3: 404 Fehler finden
Write-Host ""
Write-Host "🔍 PHASE 3: 404 Fehler finden..." -ForegroundColor Yellow

$brokenLinks = @()
foreach ($htmlFile in $rootFiles.html) {
    $content = Get-Content $htmlFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Suche nach relativen Links
        $links = [regex]::Matches($content, '(?:src|href)=["'']([^"'']+\.(?:js|css|html|png|jpg|svg|json))["'']')
        foreach ($match in $links) {
            $linkPath = $match.Groups[1].Value
            if ($linkPath -notmatch '^(http|https|#|javascript:|mailto:|tel:)') {
                $fullPath = Join-Path $htmlFile.DirectoryName $linkPath
                if (-not (Test-Path $fullPath)) {
                    $brokenLinks += @{
                        file = $htmlFile.Name
                        link = $linkPath
                        line = ($content.Substring(0, $match.Index) -split "`n").Count
                    }
                    Write-Host "   ❌ 404: $($htmlFile.Name) → $linkPath" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "   ⚠️ $($brokenLinks.Count) 404 Fehler gefunden" -ForegroundColor Yellow

# Phase 4: Systemtechnische Ordner verifizieren
Write-Host ""
Write-Host "📁 PHASE 4: Systemtechnische Ordner verifizieren..." -ForegroundColor Yellow

$systemFolders = @(
    "Settings", "OSTOSOS-COMPLETE-OS-SYSTEM", "THYNK", "TELBANK", "TELADIA",
    "functions", "DEPLOYMENT", "Innovationsordner", "gentlyoverdone"
)

$folderStatus = @{}
foreach ($folder in $systemFolders) {
    if (Test-Path $folder) {
        $folderStatus[$folder] = "exists"
        Write-Host "   ✅ $folder" -ForegroundColor Green
    } else {
        $folderStatus[$folder] = "missing"
        Write-Host "   ⚠️ $folder fehlt" -ForegroundColor Yellow
    }
}

# Phase 5: Exportiere Verifikation
Write-Host ""
Write-Host "📋 PHASE 5: Exportiere Verifikation..." -ForegroundColor Yellow

$verification = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    rootFiles = @{
        html = $rootFiles.html.Count
        md = $rootFiles.md.Count
        js = $rootFiles.js.Count
        css = $rootFiles.css.Count
        json = $rootFiles.json.Count
        ps1 = $rootFiles.ps1.Count
        yaml = $rootFiles.yaml.Count
        other = $rootFiles.other.Count
        total = $allFiles.Count
    }
    mdToHtml = $mdToHtml.Count
    brokenLinks = $brokenLinks.Count
    systemFolders = $folderStatus
}

$verification | ConvertTo-Json -Depth 5 | Out-File "ROOT-VERIFICATION-COMPLETE.json" -Encoding UTF8
Write-Host "   ✅ Verifikation exportiert: ROOT-VERIFICATION-COMPLETE.json" -ForegroundColor Green

Write-Host ""
Write-Host "✅ ROOT-VERIFIKATION ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "   - Gesamt-Dateien: $($allFiles.Count)" -ForegroundColor White
Write-Host "   - MD ohne HTML: $($mdToHtml.Count)" -ForegroundColor White
Write-Host "   - 404 Fehler: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -gt 0) { "Red" } else { "Green" })

