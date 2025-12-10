# FABRIKAGE UPDATE BRANDING WITH LOGO AND URL
# Aktualisiert Branding mit TTT-Logo und GitHub-URL
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# URL: https://github.com/Myopenai

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE UPDATE BRANDING WITH LOGO AND URL" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$branding = ".T. TogetherSystems - ModularFlux Architecture"
$githubUrl = "https://github.com/Myopenai"
$tagline = "Fabriquations Software Automatizations Productions Industrial Software Products"

# ============================================
# UPDATE HTML FILES WITH LOGO AND URL
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  UPDATE HTML FILES WITH LOGO AND URL" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$htmlFiles = @(
    "fabrikage-scripts-dashboard.html",
    "portal-start-nebula.html",
    "uae-enterprises-presentation.html",
    "uae-enterprises-presentation-en.html",
    "uae-enterprises-presentation-nl.html"
)

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  → Update $file..." -ForegroundColor Yellow
        
        $content = Get-Content -Path $filePath -Raw
        
        # Füge GitHub-URL zum Branding hinzu
        if ($content -notmatch $githubUrl) {
            # Suche nach Branding-Text und füge URL hinzu
            $content = $content -replace "($branding)", "`$1`n            <div style=`"font-size: 0.9rem; color: #f565ff; margin-top: 5px;`"><a href=`"$githubUrl`" target=`"_blank`" style=`"color: #f565ff; text-decoration: none;`">$githubUrl</a></div>"
        }
        
        # Füge Tagline hinzu
        if ($content -notmatch $tagline) {
            $content = $content -replace "($branding)", "`$1`n            <div style=`"font-size: 0.85rem; color: #aaa; margin-top: 5px; font-style: italic;`">$tagline</div>"
        }
        
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "    ✅ $file aktualisiert" -ForegroundColor Green
    }
}

# ============================================
# UPDATE README FILES
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  UPDATE README FILES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$readmeFiles = Get-ChildItem -Path $rootDir -Filter "README.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|reports|backup|fabrikage-standalone-fabrik"
}

foreach ($file in $readmeFiles) {
    Write-Host "  → Update $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Füge GitHub-URL hinzu
    if ($content -notmatch $githubUrl) {
        $content = $content -replace "(BRANDING.*TogetherSystems.*ModularFlux Architecture)", "`$1`n**URL:** $githubUrl"
    }
    
    # Füge Tagline hinzu
    if ($content -notmatch $tagline) {
        $content = $content -replace "(BRANDING.*TogetherSystems.*ModularFlux Architecture)", "`$1`n**Tagline:** $tagline"
    }
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "    ✅ $($file.Name) aktualisiert" -ForegroundColor Green
}

# ============================================
# UPDATE EXPORT SCRIPT
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  UPDATE EXPORT SCRIPT" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$exportScript = Join-Path $rootDir "FABRIKAGE-EXPORT-STANDALONE-FABRIK.ps1"
if (Test-Path $exportScript) {
    Write-Host "  → Update Export Script..." -ForegroundColor Yellow
    
    $content = Get-Content -Path $exportScript -Raw
    
    # Füge assets/logo zu Include hinzu
    if ($content -notmatch "assets") {
        $content = $content -replace '(\$includeDirs = @\([^)]+)', "`$1`n    `"assets`","
    }
    
    Set-Content -Path $exportScript -Value $content -Encoding UTF8 -NoNewline
    Write-Host "    ✅ Export Script aktualisiert" -ForegroundColor Green
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ BRANDING AKTUALISIERT" -ForegroundColor Green
Write-Host ""
Write-Host "Branding:" -ForegroundColor Cyan
Write-Host "  → $branding" -ForegroundColor Gray
Write-Host "  → URL: $githubUrl" -ForegroundColor Gray
Write-Host "  → Tagline: $tagline" -ForegroundColor Gray
Write-Host ""
Write-Host "Logo:" -ForegroundColor Cyan
Write-Host "  → assets/logo/ttt-logo.css" -ForegroundColor Gray
Write-Host "  → assets/logo/ttt-logo.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Aktualisierte Dateien:" -ForegroundColor Cyan
Write-Host "  → HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor Gray
Write-Host "  → README-Dateien: $($readmeFiles.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: $branding" -ForegroundColor Cyan
Write-Host "URL: $githubUrl" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan



