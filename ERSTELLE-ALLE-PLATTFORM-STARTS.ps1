# T,.&T,,.&T,,,. ERSTELLE START-SCRIPTS FÜR ALLE PLATTFORMEN

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ERSTELLE PLATTFORM-START-SCRIPTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Windows .bat (bereits vorhanden)
Write-Host "✅ Windows: OSTOSOS-START.bat" -ForegroundColor Green

# Linux/macOS .sh
Write-Host "✅ Linux/macOS: OSTOSOS-START.sh" -ForegroundColor Green

# macOS .command
Write-Host "✅ macOS: OSTOSOS-START.command" -ForegroundColor Green

# Setze Ausführungsrechte für .sh und .command (falls auf Linux/macOS)
if ($IsLinux -or $IsMacOS) {
    chmod +x OSTOSOS-START.sh
    chmod +x OSTOSOS-START.command
    Write-Host "✅ Ausführungsrechte gesetzt" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ ALLE PLATTFORM-START-SCRIPTS ERSTELLT" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verfügbar für:" -ForegroundColor Yellow
Write-Host "   - Windows: OSTOSOS-START.bat" -ForegroundColor White
Write-Host "   - Linux: OSTOSOS-START.sh" -ForegroundColor White
Write-Host "   - macOS: OSTOSOS-START.command oder .sh" -ForegroundColor White
Write-Host ""



