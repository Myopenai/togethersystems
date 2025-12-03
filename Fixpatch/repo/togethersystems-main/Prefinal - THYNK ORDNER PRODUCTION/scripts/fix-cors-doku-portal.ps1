# ================================================================
# CORS-FIX: DOKU-PORTAL - Einbettung der Dokumentationsdatenbank
# ================================================================
# Baut die Dokumentationsdatenbank direkt ins HTML ein
# Ersetzt fetch() durch eingebettete Daten
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$portalFile = Join-Path $baseDir "DOKU-PORTAL-VOLLSTAENDIG.html"
$docsDbFile = Join-Path $baseDir "docs-database.json"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 CORS-FIX: DOKU-PORTAL" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $portalFile)) {
    Write-Host "❌ Portal-Datei nicht gefunden: $portalFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $docsDbFile)) {
    Write-Host "❌ Dokumentations-Datenbank nicht gefunden: $docsDbFile" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Lade Dokumentations-Datenbank..." -ForegroundColor Yellow
$docsDbJson = Get-Content -Path $docsDbFile -Raw -Encoding UTF8
$docsDb = $docsDbJson | ConvertFrom-Json

Write-Host "✅ ${docsDb.Count} Dokumentationen geladen" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Lese Portal-Datei..." -ForegroundColor Yellow
$portalContent = Get-Content -Path $portalFile -Raw -Encoding UTF8

# Konvertiere JSON zu JavaScript-Objekt (escaped)
$jsObject = $docsDbJson -replace '`', '\`' -replace '\$', '`$' -replace '\\', '\\'

Write-Host "🔧 Ersetze fetch() durch eingebettete Daten..." -ForegroundColor Yellow

# Ersetze loadAllDocumentations() Funktion
$newLoadFunction = @"
        // ===== LOAD ALL DOCUMENTATIONS =====
        async function loadAllDocumentations() {
            const loading = document.getElementById('loading');
            loading.classList.add('active');
            
            try {
                // Verwendet eingebettete Datenbank (kein fetch nötig - CORS-frei)
                const embeddedDbJson = `$jsObject`;
                documentationDB = JSON.parse(embeddedDbJson);
                console.log(`✅ ${documentationDB.length} Dokumentationen geladen (eingebettet)`);
            } catch (error) {
                console.error('Fehler beim Laden der eingebetteten Dokumentation:', error);
                // Fallback auf hardcoded Liste
                documentationDB = getAllDocumentationsFallback();
                console.log(`⚠️ Verwende Fallback-Dokumentationsliste mit ${documentationDB.length} Einträgen`);
            }
            
            allDocsLoaded = true;
            loading.classList.remove('active');
            document.getElementById('totalDocs').textContent = documentationDB.length;
            displayAllDocs();
        }
"@

# Finde und ersetze die loadAllDocumentations Funktion
$pattern = '(?s)// ===== LOAD ALL DOCUMENTATIONS =====.*?displayAllDocs\(\);'
$portalContent = $portalContent -replace $pattern, $newLoadFunction

Write-Host "✅ loadAllDocumentations() ersetzt" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Ersetze openDocumentation() für direkte Links..." -ForegroundColor Yellow

# Neue openDocumentation Funktion mit direktem Link statt fetch
$newOpenFunction = @"
        // ===== OPEN DOCUMENTATION =====
        async function openDocumentation(doc) {
            const loading = document.getElementById('loading');
            loading.classList.add('active');

            try {
                // CORS-FIX: Verwende direkten Link statt fetch()
                // HTML-Version hat Priorität, dann Markdown
                let filePath = doc.path;
                
                // Wenn .md, versuche zuerst .html
                if (filePath.endsWith('.md')) {
                    const htmlPath = filePath.replace(/\.md$/, '.html');
                    // Prüfe ob HTML-Version existiert (relativ zum Portal)
                    const link = document.createElement('a');
                    link.href = htmlPath;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    
                    // Versuche HTML zu öffnen
                    try {
                        // Direkter Link zu HTML-Version
                        window.open(htmlPath, '_blank');
                        loading.classList.remove('active');
                        return;
                    } catch (htmlError) {
                        // HTML nicht verfügbar, verwende Markdown-Link
                    }
                    document.body.removeChild(link);
                }
                
                // Direkter Link zu Datei (Browser öffnet direkt)
                window.open(filePath, '_blank');
            } catch (error) {
                console.error('Error opening documentation:', error);
                alert(`Fehler beim Öffnen der Dokumentation:\n\n${doc.path}\n\nBitte öffnen Sie die Datei manuell.`);
            } finally {
                loading.classList.remove('active');
            }
        }
"@

# Finde und ersetze openDocumentation
$pattern = '(?s)// ===== OPEN DOCUMENTATION =====.*?loading\.classList\.remove\(''active''\);.*?\}'
$portalContent = $portalContent -replace $pattern, $newOpenFunction

Write-Host "✅ openDocumentation() ersetzt (direkte Links)" -ForegroundColor Green

# Speichere geänderte Datei
$outputFile = Join-Path $baseDir "DOKU-PORTAL-VOLLSTAENDIG-FIXED.html"
[System.IO.File]::WriteAllText($outputFile, $portalContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ Portal-Datei gespeichert: DOKU-PORTAL-VOLLSTAENDIG-FIXED.html" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ CORS-FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "   1. Öffnen Sie DOKU-PORTAL-VOLLSTAENDIG-FIXED.html" -ForegroundColor White
Write-Host "   2. Prüfen Sie ob alles funktioniert" -ForegroundColor White
Write-Host "   3. Ersetzen Sie die ursprüngliche Datei wenn alles OK ist" -ForegroundColor White
Write-Host ""

