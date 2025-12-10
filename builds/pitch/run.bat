@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] ostosos Pitch - Windows
REM ============================================
REM Auto-Auswahl der richtigen Binary
REM ============================================

setlocal enabledelayedexpansion

REM Basisverzeichnis
cd /d "%~dp0"
set "ROOT=%CD%"
set "BIN=%ROOT%\bin"

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] ostosos Pitch
echo ========================================
echo.

REM Architektur bestimmen
set "ARCH="
if /i "%PROCESSOR_ARCHITECTURE%"=="AMD64" set "ARCH=windows-amd64"
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "ARCH=windows-arm64"

REM Fallback: Prüfe auch PROCESSOR_ARCHITEW6432 (für 32-bit auf 64-bit)
if "%ARCH%"=="" (
    if /i "%PROCESSOR_ARCHITEW6432%"=="AMD64" set "ARCH=windows-amd64"
    if /i "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "ARCH=windows-arm64"
)

REM Wenn immer noch nichts: versuche amd64 als Fallback
if "%ARCH%"=="" (
    echo [WARN] Architektur nicht erkannt, versuche windows-amd64
    set "ARCH=windows-amd64"
)

set "SERVER=%BIN%\%ARCH%\ostosos-server.exe"

if not exist "%SERVER%" (
    echo [FEHLER] Server-Binary nicht gefunden:
    echo   %SERVER%
    echo.
    echo Verfügbare Binaries:
    dir /b "%BIN%\windows-*" 2>nul | findstr /i "ostosos-server.exe" || echo   (keine gefunden)
    echo.
    pause
    exit /b 1
)

echo Starte ostosos Pitch: %ARCH%
echo Binary: %SERVER%
echo.

REM Server starten
start "" "%SERVER%"

REM Kurz warten, damit Server hochkommt
timeout /t 2 /nobreak >nul

REM Browser öffnen
echo Öffne Browser: http://127.0.0.1:9090
start "" "http://127.0.0.1:9090"

echo.
echo ========================================
echo Server gestartet
echo URL: http://127.0.0.1:9090
echo.
echo Zum Beenden dieses Fensters eine Taste druecken...
echo ========================================
echo.

pause >nul

endlocal

