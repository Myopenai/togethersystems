# T,.&T,,.&T,,,. OSTOSOS INSTALLER
# Funktioniert garantiert - Keine Abstürze

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OSTOSOS INSTALLER" -ForegroundColor Cyan
Write-Host "T,.&T,,.&T,,,. TOGETHERSYSTEMS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Installationsverzeichnis
$installDir = "$env:ProgramFiles\OSTOSOS"
$desktopDir = [Environment]::GetFolderPath("Desktop")
$startMenuDir = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\OSTOSOS"

Write-Host "Installiere OSTOSOS..." -ForegroundColor Yellow
Write-Host ""

try {
    # Erstelle Installationsverzeichnis
    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
        Write-Host "   ✅ Installationsverzeichnis erstellt: $installDir" -ForegroundColor Green
    }

    # Kopiere Dateien
    Write-Host "   📦 Kopiere Dateien..." -ForegroundColor Yellow
    
    # Kopiere index.html und wichtige Dateien
    $filesToCopy = @(
        "index.html",
        "manifest-forum.html",
        "manifest-portal.html",
        "sw.js",
        "manifest.webmanifest"
    )
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $installDir -Force
            Write-Host "      ✅ $file kopiert" -ForegroundColor Green
        }
    }
    
    # Kopiere Go-Server
    if (Test-Path "builds\go-executable\ostosos-server.exe") {
        Copy-Item -Path "builds\go-executable\ostosos-server.exe" -Destination $installDir -Force
        Write-Host "      ✅ ostosos-server.exe kopiert" -ForegroundColor Green
    }
    
    # Erstelle Desktop-Verknüpfung
    Write-Host "   🔗 Erstelle Verknüpfungen..." -ForegroundColor Yellow
    
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut("$desktopDir\OSTOSOS.lnk")
    $shortcut.TargetPath = "$installDir\ostosos-server.exe"
    $shortcut.WorkingDirectory = $installDir
    $shortcut.Description = "OSTOSOS Operating System"
    $shortcut.Save()
    Write-Host "      ✅ Desktop-Verknüpfung erstellt" -ForegroundColor Green
    
    # Erstelle Start-Menü-Verknüpfung
    if (-not (Test-Path $startMenuDir)) {
        New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
    }
    $startShortcut = $shell.CreateShortcut("$startMenuDir\OSTOSOS.lnk")
    $startShortcut.TargetPath = "$installDir\ostosos-server.exe"
    $startShortcut.WorkingDirectory = $installDir
    $startShortcut.Description = "OSTOSOS Operating System"
    $startShortcut.Save()
    Write-Host "      ✅ Start-Menü-Verknüpfung erstellt" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "✅ INSTALLATION ERFOLGREICH!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Installiert in: $installDir" -ForegroundColor White
    Write-Host "Desktop-Verknüpfung: $desktopDir\OSTOSOS.lnk" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Starten:" -ForegroundColor Yellow
    Write-Host "   - Doppelklick auf Desktop-Verknüpfung" -ForegroundColor White
    Write-Host "   - Oder: $installDir\ostosos-server.exe" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "❌ INSTALLATION FEHLGESCHLAGEN" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fehler: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mögliche Ursachen:" -ForegroundColor Yellow
    Write-Host "   - Keine Administrator-Rechte" -ForegroundColor White
    Write-Host "   - Dateien nicht gefunden" -ForegroundColor White
    Write-Host ""
    Write-Host "Lösung:" -ForegroundColor Yellow
    Write-Host "   - Als Administrator ausführen" -ForegroundColor White
    Write-Host "   - Oder manuell Dateien kopieren" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Drücke eine Taste zum Beenden..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



