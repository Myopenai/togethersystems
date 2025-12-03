# T,.&T,,.&T,,,. ERSTELLE AUSFÜHRBARE BUILDS - EINFACHE VERSION

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ERSTELLE AUSFÜHRBARE BUILDS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Erstelle Launcher-Scripts
Write-Host "🔨 Erstelle Launcher-Scripts..." -ForegroundColor Yellow

# Windows Batch-Script
$batContent = "@echo off`n"
$batContent += "echo Starte OSTOSOS PWA...`n"
$batContent += "start http://localhost:8080`n"
$batContent += "echo.`n"
$batContent += "echo Falls kein Server laeuft, oeffne index.html direkt im Browser`n"
$batContent += "pause`n"

$batPath = "builds\web\pwa\START-OSTOSOS.bat"
if (-not (Test-Path "builds\web\pwa")) {
    New-Item -ItemType Directory -Path "builds\web\pwa" -Force | Out-Null
}
$batContent | Out-File -FilePath $batPath -Encoding ASCII -NoNewline
Write-Host "   ✅ Windows-Launcher erstellt: $batPath" -ForegroundColor Green

# Linux Shell-Script
$shContent = "#!/bin/bash`n"
$shContent += "echo `"Starte OSTOSOS...`"`n"
$shContent += "if command -v xdg-open > /dev/null 2>&1; then`n"
$shContent += "    xdg-open index.html`n"
$shContent += "elif command -v open > /dev/null 2>&1; then`n"
$shContent += "    open index.html`n"
$shContent += "else`n"
$shContent += "    echo `"Bitte oeffne index.html manuell im Browser`"`n"
$shContent += "fi`n"

$shPath = "builds\web\pwa\start-ostosos.sh"
$shContent | Out-File -FilePath $shPath -Encoding UTF8 -NoNewline
Write-Host "   ✅ Linux-Launcher erstellt: $shPath" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ SOFORT VERWENDBAR:" -ForegroundColor Green
Write-Host "   - WEB PWA: Doppelklick auf builds\web\pwa\START-OSTOSOS.bat" -ForegroundColor White
Write-Host "   - Oder öffne index.html direkt im Browser" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  FÜR AUSFÜHRBARE DATEIEN BENÖTIGT:" -ForegroundColor Yellow
Write-Host "   - Electron EXE: Node.js + npm + electron-builder" -ForegroundColor White
Write-Host "   - Docker: Docker Desktop" -ForegroundColor White
Write-Host "   - C-System: GCC Compiler" -ForegroundColor White
Write-Host ""
Write-Host "VOLLSTAENDIGE ANLEITUNG:" -ForegroundColor Cyan
Write-Host "   Siehe: BUILD-ANLEITUNG-AUSFUEHRBARE-DATEIEN.md" -ForegroundColor White
Write-Host ""

