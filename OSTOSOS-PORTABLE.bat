@echo off
title OSTOSOS Portable
echo ========================================
echo OSTOSOS PORTABLE VERSION
echo ========================================
echo.

REM Erstelle portable Version im aktuellen Verzeichnis
set "PORTABLE_DIR=%~dp0OSTOSOS-Portable"
set "PORTABLE_EXE=%PORTABLE_DIR%\ostosos-server.exe"
set "PORTABLE_HTML=%PORTABLE_DIR%\index.html"

echo Erstelle portable Version...
echo Ziel: %PORTABLE_DIR%
echo.

REM Erstelle Verzeichnis
if not exist "%PORTABLE_DIR%" mkdir "%PORTABLE_DIR%"

REM Kopiere Go-Server
if exist "builds\go-executable\ostosos-server.exe" (
    copy /Y "builds\go-executable\ostosos-server.exe" "%PORTABLE_EXE%" >nul
    echo [OK] Server kopiert
) else (
    echo [FEHLER] Go-Server nicht gefunden!
    pause
    exit /b 1
)

REM Kopiere index.html
if exist "index.html" (
    copy /Y "index.html" "%PORTABLE_HTML%" >nul
    echo [OK] index.html kopiert
) else (
    echo [WARNUNG] index.html nicht gefunden
)

REM Erstelle Start-Script
(
echo @echo off
echo title OSTOSOS
echo cd /d "%%~dp0"
echo echo Starte OSTOSOS...
echo start http://localhost:8080
echo ostosos-server.exe
) > "%PORTABLE_DIR%\START.bat"

echo [OK] Start-Script erstellt
echo.

echo ========================================
echo PORTABLE VERSION ERSTELLT!
echo ========================================
echo.
echo Verzeichnis: %PORTABLE_DIR%
echo.
echo So starten:
echo   1. Gehe zu: %PORTABLE_DIR%
echo   2. Doppelklick auf: START.bat
echo   3. Oder: ostosos-server.exe
echo.
pause



