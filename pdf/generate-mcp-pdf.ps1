# MCP Setup Dokumentation PDF Generator
# Erstellt eine PDF aus der HTML-Dokumentation

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$HtmlFile = Join-Path $ScriptDir "mcp-setup-documentation.html"
$PdfFile = Join-Path $ScriptDir "MCP-Setup-Dokumentation.pdf"

Write-Info "MCP Setup Dokumentation PDF Generator"
Write-Info "======================================"
Write-Host ""

# Prüfe ob HTML-Datei existiert
if (!(Test-Path $HtmlFile)) {
    Write-Err "HTML-Datei nicht gefunden: $HtmlFile"
    exit 1
}

Write-Info "HTML-Datei gefunden: $HtmlFile"

# Methode 1: Versuche mit Chrome/Edge (empfohlen)
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
    Write-Info "Generiere PDF..."
    
    $htmlUri = "file:///$($HtmlFile.Replace('\', '/').Replace(' ', '%20'))"
    
    try {
        & $browserPath --headless --disable-gpu --print-to-pdf="$PdfFile" "$htmlUri" 2>&1 | Out-Null
        
        if (Test-Path $PdfFile) {
            $fileSize = (Get-Item $PdfFile).Length / 1KB
            Write-Success "PDF erfolgreich erstellt!"
            Write-Success "Datei: $PdfFile"
            Write-Success "Größe: $([math]::Round($fileSize, 2)) KB"
            exit 0
        }
    } catch {
        Write-Err "Fehler bei PDF-Generierung: $_"
    }
}

# Methode 2: Verwende Python mit weasyprint/pdfkit
Write-Info "Versuche Python-Methode..."

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
    # Erstelle temporäres Python-Script
    $pythonScript = Join-Path $ScriptDir "temp_pdf_gen.py"
    
    $pythonCode = @"
import sys
import os

try:
    from weasyprint import HTML
    html_file = r'$HtmlFile'
    pdf_file = r'$PdfFile'
    HTML(filename=html_file).write_pdf(pdf_file)
    print(f"PDF erstellt: {pdf_file}")
    sys.exit(0)
except ImportError:
    try:
        import pdfkit
        html_file = r'$HtmlFile'
        pdf_file = r'$PdfFile'
        pdfkit.from_file(html_file, pdf_file)
        print(f"PDF erstellt: {pdf_file}")
        sys.exit(0)
    except ImportError:
        print("Fehler: weasyprint oder pdfkit nicht installiert")
        print("Installiere mit: pip install weasyprint")
        print("oder: pip install pdfkit")
        sys.exit(1)
except Exception as e:
    print(f"Fehler: {e}")
    sys.exit(1)
"@
    
    $pythonCode | Out-File -FilePath $pythonScript -Encoding UTF8
    
    try {
        Write-Info "Installiere weasyprint..."
        & $pythonCmd -m pip install --quiet weasyprint 2>&1 | Out-Null
        
        Write-Info "Generiere PDF mit weasyprint..."
        $output = & $pythonCmd $pythonScript 2>&1
        
        if (Test-Path $PdfFile) {
            Remove-Item $pythonScript -ErrorAction SilentlyContinue
            $fileSize = (Get-Item $PdfFile).Length / 1KB
            Write-Success "PDF erfolgreich erstellt!"
            Write-Success "Datei: $PdfFile"
            Write-Success "Größe: $([math]::Round($fileSize, 2)) KB"
            exit 0
        }
    } catch {
        Write-Err "Python-Methode fehlgeschlagen: $_"
    } finally {
        Remove-Item $pythonScript -ErrorAction SilentlyContinue
    }
}

# Methode 3: Manuelle Anleitung
Write-Err "Automatische PDF-Generierung fehlgeschlagen."
Write-Host ""
Write-Info "Manuelle Methode:"
Write-Host "1. Öffne die Datei: $HtmlFile"
Write-Host "2. Drücke Ctrl+P (Drucken)"
Write-Host "3. Wähle 'Als PDF speichern'"
Write-Host "4. Speichere als: $PdfFile"
Write-Host ""
Write-Info "Oder installiere ein PDF-Tool:"
Write-Host "  - Chrome/Edge: Bereits installiert (Methode 1 sollte funktionieren)"
Write-Host "  - Python: pip install weasyprint"
Write-Host "  - Node.js: npm install puppeteer"

exit 1

