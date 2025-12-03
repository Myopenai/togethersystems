# ================================================================
# GENERIERE EINGEBETTETE DOKUMENTATIONS-DATENBANK
# ================================================================
# Baut die docs-database.json direkt ins HTML ein
# CORS-frei - keine fetch() nötig
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$portalFile = Join-Path $baseDir "DOKU-PORTAL-VOLLSTAENDIG.html"
$docsDbFile = Join-Path $baseDir "docs-database.json"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📖 GENERIERE EINGEBETTETE DOKUMENTATIONS-DATENBANK" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $docsDbFile)) {
    Write-Host "❌ Dokumentations-Datenbank nicht gefunden: $docsDbFile" -ForegroundColor Red
    Write-Host "💡 Führen Sie zuerst das Script aus, das docs-database.json erstellt." -ForegroundColor Yellow
    exit 1
}

Write-Host "📖 Lade Dokumentations-Datenbank..." -ForegroundColor Yellow
$docsDbJson = Get-Content -Path $docsDbFile -Raw -Encoding UTF8
$docsDb = $docsDbJson | ConvertFrom-Json

Write-Host "✅ ${docsDb.Count} Dokumentationen geladen" -ForegroundColor Green

if (-not (Test-Path $portalFile)) {
    Write-Host "❌ Portal-Datei nicht gefunden: $portalFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Lese Portal-Datei..." -ForegroundColor Yellow
$portalContent = Get-Content -Path $portalFile -Raw -Encoding UTF8

# Escape für JavaScript
$escapedJson = $docsDbJson -replace '\\', '\\' -replace '`', '\`' -replace '\$', '`$' -replace "'", "\'" -replace '"', '\"'

# Erstelle JavaScript-Code zum Einbetten
$embedCode = @"

        // ===== EINGEBETTETE DOKUMENTATIONS-DATENBANK =====
        // CORS-FIX: Daten direkt eingebettet, kein fetch() nötig
        // Generiert von: scripts/generate-embedded-docs-db.ps1
        window.EMBEDDED_DOCS_DB = $docsDbJson;
        console.log('✅ Eingebettete Dokumentations-Datenbank geladen: ' + window.EMBEDDED_DOCS_DB.length + ' Einträge');

"@

# Suche nach dem <script> Tag und füge eingebettete Datenbank ein
if ($portalContent -match '(<script>\s*// ===== DOCUMENTATION DATABASE =====)') {
    $portalContent = $portalContent -replace '(<script>\s*// ===== DOCUMENTATION DATABASE =====)', "`$1`n$embedCode"
    Write-Host "✅ Eingebettete Datenbank hinzugefügt" -ForegroundColor Green
} else {
    # Fallback: Füge vor dem ersten <script> ein
    if ($portalContent -match '(<script>)') {
        $portalContent = $portalContent -replace '(<script>)', "$embedCode`n`$1"
        Write-Host "✅ Eingebettete Datenbank hinzugefügt (Fallback-Position)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Konnte keine passende Stelle zum Einfügen finden" -ForegroundColor Yellow
    }
}

# Speichere geänderte Datei
$outputFile = Join-Path $baseDir "DOKU-PORTAL-VOLLSTAENDIG.html"
[System.IO.File]::WriteAllText($outputFile, $portalContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ Portal aktualisiert: DOKU-PORTAL-VOLLSTAENDIG.html" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FERTIG - PORTAL IST JETZT CORS-FREI!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Die Dokumentations-Datenbank ist jetzt direkt im HTML eingebettet." -ForegroundColor White
Write-Host "✨ Keine fetch()-Aufrufe mehr nötig - vollständig CORS-frei!" -ForegroundColor White
Write-Host ""

