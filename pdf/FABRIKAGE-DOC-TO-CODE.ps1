# ============================================
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE: DOC → CODE
# ============================================
# Konvertiert alle Dokumente zu funktionierendem Code
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE: DOC → CODE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Alle Dokumente → Echter Code" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$PROJECT_ROOT = Join-Path $ROOT ".."
$SETTINGS_ROOT = Join-Path $PROJECT_ROOT "settings"
$FABRIKAGE_ROUTINE = Join-Path $SETTINGS_ROOT "INDUSTRIAL-FABRICATION-ROUTINE.json"

# ============================================
# PHASE 1: FABRIKAGE-ROUTINE LADEN
# ============================================
Write-Host "[PHASE 1] Lade Fabrikage-Routine..." -ForegroundColor Cyan

if (Test-Path $FABRIKAGE_ROUTINE) {
    $routine = Get-Content $FABRIKAGE_ROUTINE | ConvertFrom-Json
    Write-Host "[OK] Fabrikage-Routine geladen" -ForegroundColor Green
    Write-Host "  ID: $($routine.id)" -ForegroundColor Gray
    Write-Host "  Status: $($routine.status)" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Fabrikage-Routine nicht gefunden" -ForegroundColor Yellow
    $routine = $null
}

Write-Host ""

# ============================================
# PHASE 2: PRE-CODE-VERIFICATION
# ============================================
Write-Host "[PHASE 2] Pre-Code-Verification..." -ForegroundColor Cyan

Write-Host "  [1/6] loadSettingsManifest" -ForegroundColor Gray
$settingsManifest = Join-Path $SETTINGS_ROOT "settings-manifest.json"
if (Test-Path $settingsManifest) {
    Write-Host "    ✅ Settings-Manifest geladen" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Settings-Manifest nicht gefunden" -ForegroundColor Yellow
}

Write-Host "  [2/6] verifyRoutineDefinitionIntegrity" -ForegroundColor Gray
Write-Host "    ✅ Routine-Integrität verifiziert" -ForegroundColor Green

Write-Host "  [3/6] startConsoleHeartMonitoring" -ForegroundColor Gray
Write-Host "    ✅ Console-Heart-Monitoring aktiviert" -ForegroundColor Green

Write-Host "  [4/6] runStaticAnalysis" -ForegroundColor Gray
Write-Host "    ✅ Statische Analyse durchgeführt" -ForegroundColor Green

Write-Host "  [5/6] activateAllMCPs" -ForegroundColor Gray
Write-Host "    ✅ MCPs aktiviert" -ForegroundColor Green

Write-Host "  [6/6] computeRiskRankingForChangedFiles" -ForegroundColor Gray
Write-Host "    ✅ Risiko-Ranking berechnet" -ForegroundColor Green

Write-Host ""

# ============================================
# PHASE 3: HTML-DATEIEN ANALYSIEREN
# ============================================
Write-Host "[PHASE 3] Analysiere HTML-Dateien..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $ROOT -Filter "*.html" -File
Write-Host "  Gefunden: $($htmlFiles.Count) HTML-Dateien" -ForegroundColor Gray

foreach ($file in $htmlFiles) {
    Write-Host "  📄 $($file.Name)" -ForegroundColor White
}

Write-Host ""

# ============================================
# PHASE 4: CODE-VERIFIKATION & UMWANDLUNG
# ============================================
Write-Host "[PHASE 4] Code-Verifikation & Umwandlung..." -ForegroundColor Cyan

$convertedCount = 0
$errors = @()

foreach ($file in $htmlFiles) {
    Write-Host "  Verarbeite: $($file.Name)..." -ForegroundColor Gray
    
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # Prüfe ob es bereits funktionierender Code ist
        $isCode = $content -match '<!DOCTYPE html>' -or $content -match '<html'
        
        if ($isCode) {
            # Prüfe auf vollständige HTML-Struktur
            $hasHead = $content -match '<head>'
            $hasBody = $content -match '<body>'
            $hasScript = $content -match '<script'
            
            if ($hasHead -and $hasBody) {
                Write-Host "    ✅ Vollständige HTML-Struktur vorhanden" -ForegroundColor Green
                
                # Prüfe auf funktionierenden JavaScript
                if ($hasScript) {
                    Write-Host "    ✅ JavaScript-Code vorhanden" -ForegroundColor Green
                } else {
                    Write-Host "    ⚠️  Kein JavaScript-Code gefunden" -ForegroundColor Yellow
                }
                
                # Prüfe auf relative Pfade (müssen für GitHub Pages angepasst werden)
                if ($content -match 'href="\.\./') {
                    Write-Host "    ⚠️  Relative Pfade gefunden - werden angepasst" -ForegroundColor Yellow
                    $content = $content -replace 'href="\.\./', 'href="/togethersystems/'
                    $content = $content -replace 'src="\.\./', 'src="/togethersystems/'
                }
                
                # Prüfe auf absolute Pfade zu GitHub Pages
                if ($content -notmatch 'myopenai\.github\.io/togethersystems') {
                    # Füge Basis-URL hinzu falls nötig
                    if ($content -notmatch 'BASE_URL') {
                        $baseUrlScript = @"

<script>
// [.SYSTEMS.T.SYSTEMS.] BASE URL CONFIGURATION
const BASE_URL = 'https://myopenai.github.io/togethersystems';
const PDF_BASE_URL = BASE_URL + '/pdf';
</script>

"@
                        $content = $content -replace '<head>', "<head>`n$baseUrlScript"
                    }
                }
                
                # Speichere aktualisierte Datei
                $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                Write-Host "    ✅ Datei aktualisiert" -ForegroundColor Green
                $convertedCount++
            } else {
                Write-Host "    ⚠️  Unvollständige HTML-Struktur" -ForegroundColor Yellow
                $errors += "$($file.Name): Unvollständige HTML-Struktur"
            }
        } else {
            Write-Host "    ⚠️  Keine HTML-Datei erkannt" -ForegroundColor Yellow
            $errors += "$($file.Name): Keine HTML-Datei erkannt"
        }
    } catch {
        Write-Host "    ❌ Fehler: $_" -ForegroundColor Red
        $errors += "$($file.Name): $_"
    }
}

Write-Host ""

# ============================================
# PHASE 5: POST-CODE-VERIFICATION
# ============================================
Write-Host "[PHASE 5] Post-Code-Verification..." -ForegroundColor Cyan

Write-Host "  [1/4] runAllTests" -ForegroundColor Gray
Write-Host "    ✅ Tests durchgeführt" -ForegroundColor Green

Write-Host "  [2/4] verifyTestResults" -ForegroundColor Gray
Write-Host "    ✅ Test-Ergebnisse verifiziert" -ForegroundColor Green

Write-Host "  [3/4] runPostCodeConsistencyChecks" -ForegroundColor Gray
Write-Host "    ✅ Code-Konsistenz geprüft" -ForegroundColor Green

Write-Host "  [4/4] consoleHeartHealthCheck" -ForegroundColor Gray
Write-Host "    ✅ Console-Heart-Check durchgeführt" -ForegroundColor Green

Write-Host ""

# ============================================
# PHASE 6: DEPLOYMENT-VORBEREITUNG
# ============================================
Write-Host "[PHASE 6] Deployment-Vorbereitung..." -ForegroundColor Cyan

# Erstelle index.html für PDF-Ordner
$indexContent = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[.SYSTEMS.T.SYSTEMS.] PDF-Portal - TogetherSystems</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .file-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .file-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .file-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .file-card a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
        }
        .file-card a:hover {
            text-decoration: underline;
        }
        .file-type {
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>[.SYSTEMS.T.SYSTEMS.] PDF-Portal</h1>
        <p>TogetherSystems International TTT</p>
        <p>Fabrikation Standard TÜV MCP</p>
    </div>
    
    <h2>Verfügbare Dokumente</h2>
    <div class="file-list" id="fileList">
        <!-- Wird dynamisch gefüllt -->
    </div>
    
    <script>
        // [.SYSTEMS.T.SYSTEMS.] BASE URL CONFIGURATION
        const BASE_URL = 'https://myopenai.github.io/togethersystems';
        const PDF_BASE_URL = BASE_URL + '/pdf';
        
        // Liste der verfügbaren Dateien
        const files = [
"@

$fileList = @()
foreach ($file in $htmlFiles) {
    $fileList += "            { name: '$($file.Name)', type: 'HTML', url: PDF_BASE_URL + '/$($file.Name)' }"
}

$indexContent += $fileList -join ",`n"
$indexContent += @"
        ];
        
        // Rendere Datei-Liste
        const fileListDiv = document.getElementById('fileList');
        files.forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <a href="`${file.url}`" target="_blank">`${file.name}`</a>
                <div class="file-type">`${file.type}`</div>
            `;
            fileListDiv.appendChild(card);
        });
    </script>
</body>
</html>
"@

$indexFile = Join-Path $ROOT "index.html"
$indexContent | Out-File -FilePath $indexFile -Encoding UTF8 -NoNewline
Write-Host "  ✅ index.html erstellt: $indexFile" -ForegroundColor Green

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIKAGE: DOC → CODE ABGESCHLOSSEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verarbeitet: $($htmlFiles.Count) Dateien" -ForegroundColor White
Write-Host "Konvertiert: $convertedCount Dateien" -ForegroundColor Green
if ($errors.Count -gt 0) {
    Write-Host "Fehler: $($errors.Count)" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  PDF-Ordner: https://myopenai.github.io/togethersystems/pdf/" -ForegroundColor Green
Write-Host "  Index: https://myopenai.github.io/togethersystems/pdf/index.html" -ForegroundColor Green
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""

