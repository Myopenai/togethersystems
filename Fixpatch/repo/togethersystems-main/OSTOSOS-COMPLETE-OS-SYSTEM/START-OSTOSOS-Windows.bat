@echo off
REM T,. OSTOSOS - Windows Starter
REM Startet automatisch den Windows-Installer

echo T,. OSTOSOS - Windows Setup
echo =============================
echo.
echo Starte Installer...

REM Prüfe ob Installer existiert
if exist "OSTOSOS-Setup-Windows.exe" (
    start "" "OSTOSOS-Setup-Windows.exe"
) else if exist "OSTOSOS-MULTIBOOT-USB-ORDNER\builds\windows\OSTOSOS-Windows-Setup.exe" (
    start "" "OSTOSOS-MULTIBOOT-USB-ORDNER\builds\windows\OSTOSOS-Windows-Setup.exe"
) else (
    echo FEHLER: Installer nicht gefunden!
    echo Bitte stellen Sie sicher, dass OSTOSOS-Setup-Windows.exe im selben Ordner liegt.
    pause
    exit /b 1
)

echo.
echo Installer gestartet!
timeout /t 2 >nul

