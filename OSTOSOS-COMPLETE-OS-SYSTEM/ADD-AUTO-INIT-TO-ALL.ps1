# T,. OSOTOSOS - Add Auto-Init to All HTML Files
# Fügt universal-auto-init.js zu allen HTML-Dateien hinzu

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Add Auto-Init to All HTML ===" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV|backup'
}

$fixed = 0
$skipped = 0

$autoInitScripts = @(
    '<script src="./fix-popup-errors.js" onerror="console.warn(''fix-popup-errors.js nicht gefunden'')"></script>',
    '<script src="./universal-auto-init.js" onerror="console.warn(''universal-auto-init.js nicht gefunden'')"></script>',
    '<script src="./universal-dummy-help.js" onerror="console.warn(''universal-dummy-help.js nicht gefunden'')"></script>',
    '<script src="./dashboard-auto-start.js" onerror="console.warn(''dashboard-auto-start.js nicht gefunden'')"></script>'
)

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { 
        $skipped++
        continue 
    }
    
    $modified = $false
    
    # Prüfe ob bereits Auto-Init vorhanden
    $hasAutoInit = $content -match 'universal-auto-init\.js|fix-popup-errors\.js'
    
    if (-not $hasAutoInit) {
        # Füge vor </body> hinzu
        if ($content -match '</body>') {
            $scriptsToAdd = $autoInitScripts -join "`n"
            $content = $content -replace '</body>', "$scriptsToAdd`n</body>"
            $modified = $true
        } elseif ($content -match '</html>') {
            $scriptsToAdd = $autoInitScripts -join "`n"
            $content = $content -replace '</html>', "$scriptsToAdd`n</html>"
            $modified = $true
        }
    }
    
    if ($modified) {
        try {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
            $fixed++
            Write-Host "✅ $($file.Name)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($file.Name): $_" -ForegroundColor Red
            $skipped++
        }
    } else {
        $skipped++
    }
}

Write-Host ""
Write-Host "Dateien gefixt: $fixed" -ForegroundColor Cyan
Write-Host "Dateien übersprungen: $skipped" -ForegroundColor Yellow
Write-Host "=== Abgeschlossen ===" -ForegroundColor Green
Write-Host ""

