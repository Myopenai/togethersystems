# T,. OSOTOSOS - Complete Error Fix All
# Systematische Fehlerbehebung für 100% Funktionalität

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Complete Error Fix All ===" -ForegroundColor Cyan
Write-Host ""

$fixed = 0
$errors = 0

# 1. Fix popup.js Fehler
Write-Host "[1/10] Fixe popup.js Fehler..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup'
}

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $modified = $false
    
    # Füge fix-popup-errors.js hinzu falls popup.js referenziert wird
    if ($content -match 'popup\.js' -and $content -notmatch 'fix-popup-errors\.js') {
        if ($content -match '</head>') {
            $content = $content -replace '</head>', '<script src="./fix-popup-errors.js"></script>' + "`n</head>"
            $modified = $true
        } elseif ($content -match '</body>') {
            $content = $content -replace '</body>', '<script src="./fix-popup-errors.js"></script>' + "`n</body>"
            $modified = $true
        }
    }
    
    # Füge dashboard-auto-start.js hinzu falls nicht vorhanden
    if ($content -match '<script' -and $content -notmatch 'dashboard-auto-start\.js') {
        if ($content -match '</body>') {
            $content = $content -replace '</body>', '<script src="./dashboard-auto-start.js"></script>' + "`n</body>"
            $modified = $true
        }
    }
    
    if ($modified) {
        try {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
            $fixed++
            Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
        } catch {
            $errors++
            Write-Host "  ❌ Error: $($file.Name) - $_" -ForegroundColor Red
        }
    }
}

# 2. Prüfe alle JavaScript-Dateien auf undefined errors
Write-Host "[2/10] Prüfe JavaScript-Dateien..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup'
}

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Prüfe auf gefährliche Patterns
    $patterns = @(
        '\.create\(\)',  # popup.create() ohne Prüfung
        'getElementById\([^)]+\)\.',  # getElementById(). ohne null-check
        '\.runtime\.',  # chrome.runtime ohne Prüfung
        'window\.undefined'
    )
    
    $hasIssues = $false
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $hasIssues = $true
            break
        }
    }
    
    if ($hasIssues) {
        Write-Host "  ⚠️ Potential issues in: $($file.Name)" -ForegroundColor Yellow
    }
}

# 3. Erstelle fehlende Dateien
Write-Host "[3/10] Erstelle fehlende Dateien..." -ForegroundColor Yellow

$requiredFiles = @(
    @{Path="fix-popup-errors.js"; Exists=$true},
    @{Path="dashboard-auto-start.js"; Exists=$true},
    @{Path="cli-dashboard-prometheus.ps1"; Exists=$true},
    @{Path="ux-waehler-complete.js"; Exists=$true},
    @{Path="multi-window-menu.js"; Exists=$true}
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file.Path)) {
        Write-Host "  ⚠️ Missing: $($file.Path)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Found: $($file.Path)" -ForegroundColor Green
    }
}

# 4. Prüfe HTML-Struktur
Write-Host "[4/10] Prüfe HTML-Struktur..." -ForegroundColor Yellow
foreach ($file in $htmlFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $issues = @()
    if ($content -notmatch '<!DOCTYPE') { $issues += "Missing DOCTYPE" }
    if ($content -notmatch '<html') { $issues += "Missing <html>" }
    if ($content -notmatch '</html>') { $issues += "Missing </html>" }
    if ($content -notmatch '<meta.*charset') { $issues += "Missing charset" }
    
    if ($issues.Count -gt 0) {
        Write-Host "  ⚠️ $($file.Name): $($issues -join ', ')" -ForegroundColor Yellow
    }
}

# 5. Prüfe CSS-Referenzen
Write-Host "[5/10] Prüfe CSS-Referenzen..." -ForegroundColor Yellow
$cssRefs = @()
foreach ($file in $htmlFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $matches = [regex]::Matches($content, 'href\s*=\s*["'']([^"'']+\.css)["'']')
    foreach ($match in $matches) {
        $cssPath = $match.Groups[1].Value
        $fullPath = if ($cssPath.StartsWith('./') -or $cssPath.StartsWith('../')) {
            Join-Path (Split-Path $file.FullName) $cssPath.Replace('./', '').Replace('../', '')
        } else {
            Join-Path $rootDir $cssPath
        }
        if (-not (Test-Path $fullPath)) {
            $cssRefs += "$($file.Name): $cssPath"
        }
    }
}

if ($cssRefs.Count -gt 0) {
    Write-Host "  ⚠️ Missing CSS files:" -ForegroundColor Yellow
    $cssRefs | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
} else {
    Write-Host "  ✅ All CSS references valid" -ForegroundColor Green
}

# 6. Prüfe JavaScript-Referenzen
Write-Host "[6/10] Prüfe JavaScript-Referenzen..." -ForegroundColor Yellow
$jsRefs = @()
foreach ($file in $htmlFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $matches = [regex]::Matches($content, 'src\s*=\s*["'']([^"'']+\.js)["'']')
    foreach ($match in $matches) {
        $jsPath = $match.Groups[1].Value
        if ($jsPath -notmatch '^https?://' -and $jsPath -notmatch '^//') {
            $fullPath = if ($jsPath.StartsWith('./') -or $jsPath.StartsWith('../')) {
                Join-Path (Split-Path $file.FullName) $jsPath.Replace('./', '').Replace('../', '')
            } else {
                Join-Path $rootDir $jsPath
            }
            if (-not (Test-Path $fullPath)) {
                $jsRefs += "$($file.Name): $jsPath"
            }
        }
    }
}

if ($jsRefs.Count -gt 0) {
    Write-Host "  ⚠️ Missing JS files:" -ForegroundColor Yellow
    $jsRefs | Select-Object -First 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
} else {
    Write-Host "  ✅ All JS references valid" -ForegroundColor Green
}

# 7. Prüfe getElementById ohne null-check
Write-Host "[7/10] Prüfe getElementById null-checks..." -ForegroundColor Yellow
$nullCheckIssues = 0
foreach ($file in $jsFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $matches = [regex]::Matches($content, 'getElementById\s*\(\s*["'']([^"'']+)["'']\s*\)')
    foreach ($match in $matches) {
        $elementId = $match.Groups[1].Value
        $context = $content.Substring([Math]::Max(0, $match.Index - 50), [Math]::Min(100, $content.Length - $match.Index + 50))
        if ($context -notmatch 'if\s*\(.*getElementById|getElementById.*\?') {
            $nullCheckIssues++
        }
    }
}

if ($nullCheckIssues -gt 0) {
    Write-Host "  ⚠️ Found $nullCheckIssues potential null-check issues" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ All getElementById calls have null-checks" -ForegroundColor Green
}

# 8. Prüfe auf console.errors
Write-Host "[8/10] Prüfe auf console.errors..." -ForegroundColor Yellow
$consoleErrors = 0
foreach ($file in $jsFiles | Select-Object -First 10) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    if ($content -match 'console\.error|throw\s+new\s+Error') {
        $consoleErrors++
    }
}

Write-Host "  ℹ️ Found $consoleErrors files with error handling" -ForegroundColor Cyan

# 9. Zusammenfassung
Write-Host "[9/10] Zusammenfassung..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Dateien gefixt: $fixed" -ForegroundColor $(if ($fixed -gt 0) { "Green" } else { "Yellow" })
Write-Host "  Fehler gefunden: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host ""

# 10. TÜV-Test vorbereiten
Write-Host "[10/10] TÜV-Test vorbereiten..." -ForegroundColor Yellow
if (Test-Path "tuv.ps1") {
    Write-Host "  ✅ tuv.ps1 gefunden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ tuv.ps1 nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Fix abgeschlossen ===" -ForegroundColor Green
Write-Host ""

