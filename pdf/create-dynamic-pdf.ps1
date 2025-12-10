# Create Dynamic PDF from HTML Template
# Erstellt professionelle, interaktive PDFs mit korrektem Branding

param(
    [Parameter(Mandatory = $false)]
    [string]$InputHtml = "dynamic-pdf-template.html",
    [Parameter(Mandatory = $false)]
    [string]$OutputPdf = "TogetherSystems-MCP-Dokumentation-DYNAMIC.pdf",
    [switch]$UseChrome,
    [switch]$UsePython,
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputPath = Join-Path $ScriptDir $InputHtml
$OutputPath = Join-Path $ScriptDir $OutputPdf

Write-Info "=========================================="
Write-Info "DYNAMIC PDF GENERATOR"
Write-Info "TogetherSystems International TTT"
Write-Info "=========================================="
Write-Host ""

# Prüfe Eingabedatei
if (!(Test-Path $InputPath)) {
    Write-Err "HTML-Template nicht gefunden: $InputPath"
    exit 1
}

Write-Success "HTML-Template gefunden: $InputPath"

# Test-Modus: Öffne nur im Browser
if ($TestOnly) {
    Write-Info "Test-Modus: Öffne HTML im Browser..."
    Start-Process $InputPath
    Write-Success "HTML im Browser geöffnet. Prüfe Layout und Interaktivität."
    exit 0
}

# Methode 1: Chrome/Edge (Empfohlen für interaktive PDFs)
if ($UseChrome -or !$UsePython) {
    Write-Info "Methode 1: Verwende Chrome/Edge für interaktive PDF..."
    
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    )
    
    $browserPath = $null
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            $browserPath = $path
            break
        }
    }
    
    if ($browserPath) {
        Write-Info "Browser gefunden: $browserPath"
        Write-Info "Generiere interaktive PDF..."
        
        $htmlUri = "file:///$($InputPath.Replace('\', '/').Replace(' ', '%20'))"
        
        try {
            & $browserPath --headless --disable-gpu --print-to-pdf="$OutputPath" "$htmlUri" 2>&1 | Out-Null
            
            if (Test-Path $OutputPath) {
                $fileSize = (Get-Item $OutputPath).Length / 1KB
                Write-Success "✅ Interaktive PDF erfolgreich erstellt!"
                Write-Success "📁 Datei: $OutputPath"
                Write-Success "📊 Größe: $([math]::Round($fileSize, 2)) KB"
                Write-Host ""
                Write-Info "💡 Tipp: Öffne die PDF in Adobe Acrobat Reader für volle Interaktivität"
                exit 0
            }
        } catch {
            Write-Err "Chrome-Methode fehlgeschlagen: $_"
        }
    } else {
        Write-Warn "Chrome/Edge nicht gefunden. Versuche Python-Methode..."
    }
}

# Methode 2: Python mit weasyprint (für statische PDFs)
if ($UsePython -or !$UseChrome) {
    Write-Info "Methode 2: Verwende Python weasyprint..."
    
    $pythonCmd = $null
    $pythonVersions = @("python", "py", "python3")
    foreach ($cmd in $pythonVersions) {
        try {
            $version = & $cmd --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $pythonCmd = $cmd
                Write-Info "Python gefunden: $version"
                break
            }
        } catch {
            continue
        }
    }
    
    if ($pythonCmd) {
        try {
            Write-Info "Installiere weasyprint (falls nötig)..."
            & $pythonCmd -m pip install --quiet weasyprint 2>&1 | Out-Null
            
            Write-Info "Generiere PDF mit weasyprint..."
            $pythonScript = Join-Path $ScriptDir "convert_html_to_pdf.py"
            
            $convertCode = @"
from weasyprint import HTML
import sys

html_file = r'$InputPath'
pdf_file = r'$OutputPath'

try:
    HTML(filename=html_file).write_pdf(pdf_file)
    print(f"PDF erstellt: {pdf_file}")
except Exception as e:
    print(f"Fehler: {e}")
    sys.exit(1)
"@
            $convertCode | Out-File -FilePath $pythonScript -Encoding UTF8
            
            & $pythonCmd $pythonScript
            
            if (Test-Path $OutputPath) {
                Remove-Item $pythonScript -ErrorAction SilentlyContinue
                $fileSize = (Get-Item $OutputPath).Length / 1KB
                Write-Success "✅ PDF erfolgreich erstellt!"
                Write-Success "📁 Datei: $OutputPath"
                Write-Success "📊 Größe: $([math]::Round($fileSize, 2)) KB"
                exit 0
            }
        } catch {
            Write-Err "Python-Methode fehlgeschlagen: $_"
        } finally {
            Remove-Item $pythonScript -ErrorAction SilentlyContinue
        }
    }
}

# Fallback: Manuelle Anleitung
Write-Err "Automatische PDF-Generierung fehlgeschlagen."
Write-Host ""
Write-Info "Manuelle Methode (Empfohlen für interaktive PDFs):"
Write-Host "1. Öffne die HTML-Datei im Browser:"
Write-Host "   $InputPath"
Write-Host ""
Write-Host "2. Drücke Ctrl+P (Drucken)"
Write-Host ""
Write-Host "3. Wähle 'Als PDF speichern'"
Write-Host ""
Write-Host "4. In den Druckeinstellungen:"
Write-Host "   - Hintergrundgrafiken: Aktivieren"
Write-Host "   - Seitenränder: Standard"
Write-Host "   - Format: A4"
Write-Host ""
Write-Host "5. Speichere als: $OutputPath"
Write-Host ""
Write-Info "Für volle Interaktivität:"
Write-Host "  - Verwende Adobe Acrobat Pro zum Erstellen"
Write-Host "  - Oder InDesign → Export als Interaktive PDF"

