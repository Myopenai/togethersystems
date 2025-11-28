# Production Package Creator - Von Produktionsordner ausgehend
# IBM+++ MCP MCP MCP Standard
# Version: 1.0.0

$baseDir = "Produktionsordner\v1.0.0-PRODUCTION-20251124-222131"
$prodDir = "PRODUCTION-PACKAGE"
$deployDir = "DEPLOY-PACKAGE"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$version = "v1.0.0-PRODUCTION-$timestamp"

# Prüfe ob Basis-Ordner existiert
if (-not (Test-Path $baseDir)) {
    Write-Host "FEHLER: Basis-Ordner nicht gefunden: $baseDir" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCTION PACKAGE CREATOR" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Basis: $baseDir" -ForegroundColor Yellow
Write-Host ""

# Lösche alte Versionen
if (Test-Path $prodDir) { Remove-Item $prodDir -Recurse -Force }
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }

# Erstelle neue Ordner
New-Item -ItemType Directory -Path $prodDir -Force | Out-Null
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

Write-Host "Kopiere von Basis-Ordner..." -ForegroundColor Yellow

# Kopiere kompletten Inhalt
Copy-Item -Path "$baseDir\*" -Destination $prodDir -Recurse -Force -Exclude "node_modules","backup","archive",".git"
Copy-Item -Path "$baseDir\*" -Destination $deployDir -Recurse -Force -Exclude "node_modules","backup","archive",".git"

Write-Host "  [OK] Kompletter Inhalt kopiert" -ForegroundColor Green

# Füge Branding zu allen Dokumentations-Dateien hinzu
Write-Host ""
Write-Host "Füge OCR & Unternehmens-Branding hinzu..." -ForegroundColor Yellow

$branding = @"

---
## 🏢 Unternehmens-Branding

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

**Initiator:** Raymond Demitrio Tel  
**ORCID:** [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430)  
**Website:** [tel1.nl](https://tel1.nl)  
**WhatsApp:** [+31 613 803 782](https://wa.me/31613803782)  
**GitHub:** [myopenai/togethersystems](https://github.com/myopenai/togethersystems)  
**Businessplan:** [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf)

**Branding:** `T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -`

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

"@

# Finde alle .md Dateien
$mdFiles = Get-ChildItem -Path $prodDir -Filter "*.md" -Recurse -File | Where-Object {
    $_.Name -ne "README.md" -or $_.DirectoryName -like "*\PRODUCTION-PACKAGE"
}

foreach ($file in $mdFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -notlike "*ORCID*") {
        $newContent = $content + "`n`n" + $branding
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "  [OK] Branding hinzugefügt: $($file.Name)" -ForegroundColor Gray
    }
}

# Füge Branding zu README.md hinzu (am Anfang)
$readmePath = Join-Path $prodDir "README.md"
if (Test-Path $readmePath) {
    $readmeContent = Get-Content $readmePath -Raw
    $readmeHeader = @"
# TogetherSystems Portal

## 🏢 Unternehmens-Informationen

**Initiator:** [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430)  
**ORCID:** [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430)  
**Website:** [tel1.nl](https://tel1.nl)  
**WhatsApp:** [+31 613 803 782](https://wa.me/31613803782)  
**GitHub:** [myopenai/togethersystems](https://github.com/myopenai/togethersystems)  
**Businessplan:** [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf)

**Branding:** `T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -`

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

"@
    $newReadme = $readmeHeader + "`n" + $readmeContent
    Set-Content -Path $readmePath -Value $newReadme -NoNewline
    Write-Host "  [OK] README.md aktualisiert" -ForegroundColor Green
}

# Erstelle INFO.txt mit Branding
$infoPath = Join-Path $prodDir "INFO.txt"
$infoContent = @"
========================================
TOGETHERSYSTEMS PORTAL - PRODUCTION
========================================

Version: $version
Erstellt: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

========================================
UNTERNEHMENS-INFORMATIONEN
========================================

Initiator: Raymond Demitrio Tel
ORCID: 0009-0003-1328-2430
Link: https://orcid.org/0009-0003-1328-2430

Website: tel1.nl
Link: https://tel1.nl

WhatsApp: +31 613 803 782
Link: https://wa.me/31613803782

GitHub: myopenai/togethersystems
Link: https://github.com/myopenai/togethersystems

Businessplan: TGPA Businessplan DE.pdf
Link: https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf

========================================
BRANDING
========================================

T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

IBM+++ MCP MCP MCP Standard
Industrial Business Machine
Industrial Fabrication Software

========================================
"@
Set-Content -Path $infoPath -Value $infoContent
Write-Host "  [OK] INFO.txt erstellt" -ForegroundColor Green

# Größen-Berechnung
$prodSize = (Get-ChildItem -Path $prodDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$deploySize = (Get-ChildItem -Path $deployDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$prodMB = [math]::Round($prodSize / 1MB, 2)
$deployMB = [math]::Round($deploySize / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PACKAGE ERSTELLT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Version: $version" -ForegroundColor White
Write-Host "Production: $prodMB MB" -ForegroundColor White
Write-Host "Deploy: $deployMB MB" -ForegroundColor White
Write-Host ""
Write-Host "Ordner:" -ForegroundColor Cyan
Write-Host "  - $prodDir/ (Komplettversion)" -ForegroundColor White
Write-Host "  - $deployDir/ (Nur Deploy-Dateien)" -ForegroundColor White
Write-Host ""

