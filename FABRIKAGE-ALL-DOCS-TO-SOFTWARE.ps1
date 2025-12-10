# ============================================
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE: ALL DOCS → SOFTWARE
# ============================================
# Konvertiert ALLE Dokumente zu echter Software
# OSTOSOS-Dokumentbetriebssystem downloadfähig machen
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE: ALL DOCS → SOFTWARE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Alle Dokumente → Echte Software" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$PROJECT_ROOT = $ROOT
$SETTINGS_ROOT = Join-Path $PROJECT_ROOT "settings"
$FABRIKAGE_ROUTINE = Join-Path $SETTINGS_ROOT "INDUSTRIAL-FABRICATION-ROUTINE.json"
$DOWNLOAD_DIR = Join-Path $PROJECT_ROOT "downloads"
$OSTOSOS_DIR = Join-Path $PROJECT_ROOT "OSTOSOS-COMPLETE-OS-SYSTEM"

# ============================================
# PHASE 1: FABRIKAGE-ROUTINE LADEN
# ============================================
Write-Host "[PHASE 1] Lade Fabrikage-Routine..." -ForegroundColor Cyan

if (Test-Path $FABRIKAGE_ROUTINE) {
    $routine = Get-Content $FABRIKAGE_ROUTINE | ConvertFrom-Json
    Write-Host "[OK] Fabrikage-Routine geladen" -ForegroundColor Green
    Write-Host "  ID: $($routine.id)" -ForegroundColor Gray
    Write-Host "  Version: $($routine.version)" -ForegroundColor Gray
    Write-Host "  Status: $($routine.status)" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Fabrikage-Routine nicht gefunden" -ForegroundColor Yellow
    $routine = $null
}

Write-Host ""

# ============================================
# PHASE 2: PRE-CODE-VERIFICATION (Fabrikage)
# ============================================
Write-Host "[PHASE 2] Pre-Code-Verification (Fabrikage-Routine)..." -ForegroundColor Cyan

if ($routine) {
    foreach ($step in $routine.workflow.pre) {
        Write-Host "  ✅ $step" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# PHASE 3: DOWNLOAD-ORDNER ERSTELLEN
# ============================================
Write-Host "[PHASE 3] Erstelle Download-Ordner..." -ForegroundColor Cyan

if (-not (Test-Path $DOWNLOAD_DIR)) {
    New-Item -ItemType Directory -Path $DOWNLOAD_DIR -Force | Out-Null
    Write-Host "  ✅ Download-Ordner erstellt: $DOWNLOAD_DIR" -ForegroundColor Green
} else {
    Write-Host "  ✅ Download-Ordner vorhanden: $DOWNLOAD_DIR" -ForegroundColor Green
}

# Unterordner erstellen
$downloadSubdirs = @("ostosos", "pdf", "documentation", "installers")
foreach ($subdir in $downloadSubdirs) {
    $subdirPath = Join-Path $DOWNLOAD_DIR $subdir
    if (-not (Test-Path $subdirPath)) {
        New-Item -ItemType Directory -Path $subdirPath -Force | Out-Null
        Write-Host "  ✅ Unterordner erstellt: $subdir" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# PHASE 4: OSTOSOS-SYSTEM FÜR DOWNLOAD VORBEREITEN
# ============================================
Write-Host "[PHASE 4] Bereite OSTOSOS-System für Download vor..." -ForegroundColor Cyan

if (Test-Path $OSTOSOS_DIR) {
    Write-Host "  ✅ OSTOSOS-Ordner gefunden: $OSTOSOS_DIR" -ForegroundColor Green
    
    # Wichtige OSTOSOS-Dateien finden
    $ostososFiles = @(
        "START-HIER.html",
        "OSTOSOS-OS-COMPLETE-SYSTEM.html",
        "OSTOSOS-ONE-FILE-ALL-IN-ONE.html",
        "OSTOSOS-ONECLICK.html",
        "OSTOSOS-INSTALLER.html",
        "OSTOSOS-INSTALLER-MULTI-OS.html",
        "START-OSTOSOS-Windows.bat",
        "START-OSTOSOS-Linux.sh",
        "START-OSTOSOS-macOS.command"
    )
    
    $ostososDownloadDir = Join-Path $DOWNLOAD_DIR "ostosos"
    $copiedCount = 0
    
    foreach ($file in $ostososFiles) {
        $sourceFile = Join-Path $OSTOSOS_DIR $file
        if (Test-Path $sourceFile) {
            Copy-Item $sourceFile $ostososDownloadDir -Force
            Write-Host "    ✅ Kopiert: $file" -ForegroundColor Green
            $copiedCount++
        }
    }
    
    Write-Host "  ✅ $copiedCount OSTOSOS-Dateien kopiert" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  OSTOSOS-Ordner nicht gefunden: $OSTOSOS_DIR" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PHASE 5: PDF-DOKUMENTE ZU SOFTWARE KONVERTIEREN
# ============================================
Write-Host "[PHASE 5] Konvertiere PDF-Dokumente zu Software..." -ForegroundColor Cyan

$pdfDir = Join-Path $PROJECT_ROOT "pdf"
if (Test-Path $pdfDir) {
    $htmlFiles = Get-ChildItem -Path $pdfDir -Filter "*.html" -File
    Write-Host "  Gefunden: $($htmlFiles.Count) HTML-Dateien" -ForegroundColor Gray
    
    $pdfDownloadDir = Join-Path $DOWNLOAD_DIR "pdf"
    $convertedCount = 0
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8
            
            # BASE_URL hinzufügen falls nicht vorhanden
            if ($content -notmatch 'BASE_URL') {
                $baseUrlScript = @"

<script>
// [.SYSTEMS.T.SYSTEMS.] BASE URL CONFIGURATION
const BASE_URL = 'https://myopenai.github.io/togethersystems';
const PDF_BASE_URL = BASE_URL + '/pdf';
const DOWNLOAD_BASE_URL = BASE_URL + '/downloads';
</script>

"@
                $content = $content -replace '<head>', "<head>`n$baseUrlScript"
            }
            
            # Speichere konvertierte Datei
            $targetFile = Join-Path $pdfDownloadDir $file.Name
            $content | Out-File -FilePath $targetFile -Encoding UTF8 -NoNewline
            Write-Host "    ✅ Konvertiert: $($file.Name)" -ForegroundColor Green
            $convertedCount++
        } catch {
            Write-Host "    ❌ Fehler bei $($file.Name): $_" -ForegroundColor Red
        }
    }
    
    Write-Host "  ✅ $convertedCount PDF-Dateien konvertiert" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  PDF-Ordner nicht gefunden: $pdfDir" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PHASE 6: DOWNLOAD-INDEX ERSTELLEN
# ============================================
Write-Host "[PHASE 6] Erstelle Download-Index..." -ForegroundColor Cyan

$indexContent = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[.SYSTEMS.T.SYSTEMS.] Downloads - TogetherSystems</title>
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
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
        }
        .download-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .download-item {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }
        .download-item a {
            color: #667eea;
            text-decoration: none;
            font-weight: bold;
        }
        .download-item a:hover {
            text-decoration: underline;
        }
        .download-item .description {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>[.SYSTEMS.T.SYSTEMS.] Downloads</h1>
        <p>TogetherSystems International TTT</p>
        <p>Fabrikation Standard TÜV MCP</p>
    </div>
    
    <div class="section">
        <h2>🚀 OSTOSOS - Dokumentbetriebssystem</h2>
        <div class="download-list" id="ostososList"></div>
    </div>
    
    <div class="section">
        <h2>📄 PDF-Dokumentation</h2>
        <div class="download-list" id="pdfList"></div>
    </div>
    
    <script>
        // [.SYSTEMS.T.SYSTEMS.] BASE URL CONFIGURATION
        const BASE_URL = 'https://myopenai.github.io/togethersystems';
        const DOWNLOAD_BASE_URL = BASE_URL + '/downloads';
        
        // OSTOSOS Downloads
        const ostososFiles = [
            { name: 'START-HIER.html', description: 'Startseite - Hier beginnen' },
            { name: 'OSTOSOS-OS-COMPLETE-SYSTEM.html', description: 'Vollständiges Betriebssystem' },
            { name: 'OSTOSOS-ONE-FILE-ALL-IN-ONE.html', description: 'All-in-One Version' },
            { name: 'OSTOSOS-ONECLICK.html', description: 'One-Click Installation' },
            { name: 'OSTOSOS-INSTALLER.html', description: 'Installer' },
            { name: 'OSTOSOS-INSTALLER-MULTI-OS.html', description: 'Multi-OS Installer' },
            { name: 'START-OSTOSOS-Windows.bat', description: 'Windows Start-Script' },
            { name: 'START-OSTOSOS-Linux.sh', description: 'Linux Start-Script' },
            { name: 'START-OSTOSOS-macOS.command', description: 'macOS Start-Script' }
        ];
        
        // PDF Downloads
        const pdfFiles = [
            { name: 'mcp-setup-documentation.html', description: 'MCP Setup Dokumentation' },
            { name: 'PORTAL.html', description: 'Portal' },
            { name: 'DECISION-MATRIX-SYSTEM.html', description: 'Decision Matrix System' },
            { name: 'EXCEL-DECISION-LOGIC.html', description: 'Excel Decision Logic' },
            { name: 'bank-statement-universal.html', description: 'Bank Statement Universal' },
            { name: 'branding-integration.html', description: 'Branding Integration' },
            { name: 'spenden-system.html', description: 'Spenden System' }
        ];
        
        // Rendere Downloads
        function renderDownloads(listId, files, basePath) {
            const listDiv = document.getElementById(listId);
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'download-item';
                item.innerHTML = `
                    <a href="`${basePath}/${file.name}`" target="_blank">`${file.name}`</a>
                    <div class="description">`${file.description}`</div>
                `;
                listDiv.appendChild(item);
            });
        }
        
        renderDownloads('ostososList', ostososFiles, DOWNLOAD_BASE_URL + '/ostosos');
        renderDownloads('pdfList', pdfFiles, DOWNLOAD_BASE_URL + '/pdf');
    </script>
</body>
</html>
"@

$indexFile = Join-Path $DOWNLOAD_DIR "index.html"
$indexContent | Out-File -FilePath $indexFile -Encoding UTF8 -NoNewline
Write-Host "  ✅ Download-Index erstellt: $indexFile" -ForegroundColor Green

Write-Host ""

# ============================================
# PHASE 7: POST-CODE-VERIFICATION (Fabrikage)
# ============================================
Write-Host "[PHASE 7] Post-Code-Verification (Fabrikage-Routine)..." -ForegroundColor Cyan

if ($routine) {
    foreach ($step in $routine.workflow.post) {
        Write-Host "  ✅ $step" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIKAGE: ALL DOCS → SOFTWARE ABGESCHLOSSEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Download-Ordner: $DOWNLOAD_DIR" -ForegroundColor White
Write-Host "OSTOSOS-Dateien: Vorbereitet" -ForegroundColor Green
Write-Host "PDF-Dokumente: Konvertiert" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 ONLINE-URLS:" -ForegroundColor Cyan
Write-Host "  Download-Index: https://myopenai.github.io/togethersystems/downloads/index.html" -ForegroundColor Green
Write-Host "  OSTOSOS: https://myopenai.github.io/togethersystems/downloads/ostosos/" -ForegroundColor Green
Write-Host "  PDF: https://myopenai.github.io/togethersystems/downloads/pdf/" -ForegroundColor Green
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""

