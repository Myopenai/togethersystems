# Process Bank Statement PDF
# Verarbeitet Bankauszüge mit Fabrikage PDF Processor

param(
    [Parameter(Mandatory = $false)]
    [string]$InputPdf = "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf",
    [Parameter(Mandatory = $false)]
    [string]$OutputPdf = "",
    [switch]$ExtractInfo,
    [switch]$AddHeader,
    [switch]$ShowInfo
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")

# Prüfe ob Eingabedatei existiert
if (!(Test-Path $InputPdf)) {
    Write-Err "PDF-Datei nicht gefunden: $InputPdf"
    Write-Info "Bitte geben Sie den korrekten Pfad an."
    exit 1
}

Write-Info "PDF gefunden: $InputPdf"

# Zeige Informationen über die PDF
if ($ShowInfo -or $ExtractInfo) {
    Write-Info "Analysiere PDF..."
    
    try {
        # Versuche PyMuPDF zu verwenden für Info-Extraktion
        $pythonScript = Join-Path $ScriptDir "extract_pdf_info.py"
        $extractCode = @"
import sys
import fitz  # PyMuPDF

pdf_path = r'$InputPdf'
try:
    doc = fitz.open(pdf_path)
    print(f"Seiten: {len(doc)}")
    print(f"Metadaten:")
    meta = doc.metadata
    for key, value in meta.items():
        if value:
            print(f"  {key}: {value}")
    
    # Versuche Text von erster Seite zu extrahieren
    if len(doc) > 0:
        page = doc[0]
        text = page.get_text()
        print(f"\nErste Seite Text (erste 500 Zeichen):")
        print(text[:500])
    
    doc.close()
except Exception as e:
    print(f"Fehler: {e}")
    sys.exit(1)
"@
        $extractCode | Out-File -FilePath $pythonScript -Encoding UTF8
        
        $pythonCmd = "python"
        if (Get-Command py -ErrorAction SilentlyContinue) {
            $pythonCmd = "py"
        }
        
        & $pythonCmd $pythonScript 2>&1
        
        Remove-Item $pythonScript -ErrorAction SilentlyContinue
        
    } catch {
        Write-Err "Konnte PDF-Informationen nicht extrahieren: $_"
    }
}

# Verarbeite PDF mit Fabrikage
if ($AddHeader -or ($OutputPdf -ne "")) {
    if ($OutputPdf -eq "") {
        $OutputPdf = $InputPdf -replace '\.pdf$', '_PROCESSED.pdf'
    }
    
    Write-Info "Verarbeite PDF mit Fabrikage..."
    Write-Info "Eingabe: $InputPdf"
    Write-Info "Ausgabe: $OutputPdf"
    
    # Verwende run_fabrikage_pdf.ps1
    $fabrikageScript = Join-Path $ScriptDir "run_fabrikage_pdf.ps1"
    
    if (Test-Path $fabrikageScript) {
        & $fabrikageScript -Input $InputPdf -Output $OutputPdf
    } else {
        Write-Err "Fabrikage Script nicht gefunden: $fabrikageScript"
        exit 1
    }
    
    if (Test-Path $OutputPdf) {
        Write-Success "PDF erfolgreich verarbeitet: $OutputPdf"
    }
}

Write-Info "Fertig!"

