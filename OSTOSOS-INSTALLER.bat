@echo off
echo ========================================
echo OSTOSOS INSTALLER
echo T,.&T,,.&T,,,. TOGETHERSYSTEMS
echo ========================================
echo.

REM Prüfe Administrator-Rechte
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo FEHLER: Administrator-Rechte erforderlich!
    echo.
    echo Bitte Rechtsklick auf diese Datei und
    echo "Als Administrator ausfuehren" waehlen.
    echo.
    pause
    exit /b 1
)

echo Starte Installation...
echo.

REM Führe PowerShell-Installer aus
powershell -ExecutionPolicy Bypass -File "%~dp0OSTOSOS-INSTALLER.ps1"

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo INSTALLATION ERFOLGREICH!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo INSTALLATION FEHLGESCHLAGEN!
    echo ========================================
)

pause



