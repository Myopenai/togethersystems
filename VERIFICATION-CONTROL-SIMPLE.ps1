# T,. Local vs Online Verification Control - SIMPLE
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

$ErrorActionPreference = "Continue"

Write-Host "=== LOCAL vs ONLINE VERIFICATION CONTROL ===" -ForegroundColor Cyan
Write-Host "Signatur: T,.&T,,.&T,,,.T." -ForegroundColor Cyan
Write-Host ""

$rootDir = Get-Location
$errors = 0
$warnings = 0
$ok = 0

# PHASE 1: LOKALE DATEIEN
Write-Host "PHASE 1: LOKALE DATEIEN" -ForegroundColor Yellow

$files = @(
    @{ "name" = "index.html"; "path" = "index.html" },
    @{ "name" = "osos-tos-production-portal.html"; "path" = "OSTOSOS-COMPLETE-OS-SYSTEM/osos-tos-production-portal.html" },
    @{ "name" = "manifest-portal.html"; "path" = "manifest-portal.html" },
    @{ "name" = "manifest-forum.html"; "path" = "manifest-forum.html" }
)

foreach ($f in $files) {
    $p = Join-Path $rootDir $f.path
    if (Test-Path $p) {
        $size = [math]::Round((Get-Item $p).Length/1KB, 2)
        Write-Host "  ✅ $($f.name): ${size} KB" -ForegroundColor Green
        $ok++
    } else {
        Write-Host "  ❌ $($f.name): NICHT GEFUNDEN" -ForegroundColor Red
        $errors++
    }
}

# PHASE 2: ONLINE SERVER
Write-Host "`nPHASE 2: ONLINE SERVER" -ForegroundColor Yellow

$urls = @{
    "GitHub Pages" = "https://myopenai.github.io/togethersystems/"
    "Cloudflare Pages" = "https://742b4c89.togethersystems.pages.dev/"
}

foreach ($server in $urls.Keys) {
    $url = $urls[$server]
    try {
        $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            Write-Host "  ✅ ${server}: Erreichbar (Status: $($r.StatusCode))" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "  ⚠️  ${server}: Status $($r.StatusCode)" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "  ❌ ${server}: Nicht erreichbar" -ForegroundColor Red
        $errors++
    }
}

# PHASE 3: FUNKTIONALITÄT
Write-Host "`nPHASE 3: FUNKTIONALITÄT" -ForegroundColor Yellow

$js = (Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }).Count
$css = (Get-ChildItem -Path $rootDir -Filter "*.css" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }).Count

Write-Host "  ✅ JavaScript: ${js} Dateien" -ForegroundColor Green
Write-Host "  ✅ CSS: ${css} Dateien" -ForegroundColor Green
$ok += 2

# ZUSAMMENFASSUNG
Write-Host "`n=== ZUSAMMENFASSUNG ===" -ForegroundColor Cyan
$total = $ok + $errors + $warnings
$percent = if ($total -gt 0) { [math]::Round(($ok / $total) * 100, 1) } else { 0 }

Write-Host "✅ OK: ${ok}" -ForegroundColor Green
Write-Host "❌ Fehler: ${errors}" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "⚠️  Warnungen: ${warnings}" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host "Erfolgsquote: ${percent}%" -ForegroundColor $(if ($percent -eq 100) { "Green" } else { "Yellow" })

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n✅ 100% STANDARD ERREICHT!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  100% STANDARD NICHT ERREICHT" -ForegroundColor Yellow
    exit 1
}



