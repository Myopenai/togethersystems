# FABRIKAGE ADD CONSOLE ERROR CONTROLLER
# Fügt Console Error Controller zu allen HTML-Dateien hinzu
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE ADD CONSOLE ERROR CONTROLLER" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|backup|Fixpatch" 
}

$updated = 0
$skipped = 0

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) {
            $skipped++
            continue
        }
        
        $needsUpdate = $false
        $newContent = $content
        
        # Prüfe ob console-error-controller.js fehlt
        if ($content -notmatch "console-error-controller\.js") {
            # Versuche nach error-fix-system.js einzufügen
            if ($content -match "error-fix-system\.js") {
                $newContent = $content -replace "(<script[^>]*error-fix-system\.js[^>]*>)", "`$1`n  <script src=`"js/console-error-controller.js`"></script>"
                $needsUpdate = $true
            }
            # Oder nach </body> einfügen
            elseif ($content -match "</body>") {
                $newContent = $content -replace "(</body>)", "  <script src=`"js/console-error-controller.js`"></script>`n`$1"
                $needsUpdate = $true
            }
            # Oder nach </head> einfügen
            elseif ($content -match "</head>") {
                $newContent = $content -replace "(</head>)", "  <script src=`"js/console-error-controller.js`"></script>`n`$1"
                $needsUpdate = $true
            }
        }
        
        if ($needsUpdate) {
            Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
            Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
            $updated++
        } else {
            $skipped++
        }
    } catch {
        Write-Host "  ⚠️ Fehler bei $($file.Name): $_" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Aktualisiert: $updated Dateien" -ForegroundColor Green
Write-Host "⏭️ Übersprungen: $skipped Dateien" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan



