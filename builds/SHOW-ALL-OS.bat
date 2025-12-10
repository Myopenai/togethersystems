@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Show All OS Builds
REM ============================================
REM Zeigt alle vorhandenen Builds
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] ALLE OS BUILDS
echo ========================================
echo.

REM In das Verzeichnis der Batch wechseln
cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Projektverzeichnis wechseln
    exit /b 1
)

set "BUILD_DIR=%CD%"
set "GO_DIR=%BUILD_DIR%\go-executable\build"
set "PYTHON_DIR=%BUILD_DIR%\python-executable\build"

echo Build-Verzeichnis: %BUILD_DIR%
echo.
echo GO-Builds unter:      %GO_DIR%
echo Python-Builds unter:  %PYTHON_DIR%
echo.

REM ============================================
REM GO BUILDS
REM ============================================
echo GO BUILDS:
echo ----------------------------------------

if exist "%GO_DIR%\windows-amd64\ostosos-server.exe" (
    echo   [OK] Windows amd64
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

if exist "%GO_DIR%\windows-arm64\ostosos-server.exe" (
    echo   [OK] Windows arm64
) else (
    echo   [WARN] Windows arm64 nicht gefunden
)

if exist "%GO_DIR%\linux-amd64\ostosos-server" (
    echo   [OK] Linux amd64
) else (
    echo   [WARN] Linux amd64 nicht gefunden
)

if exist "%GO_DIR%\linux-arm64\ostosos-server" (
    echo   [OK] Linux arm64
) else (
    echo   [WARN] Linux arm64 nicht gefunden
)

if exist "%GO_DIR%\linux-386\ostosos-server" (
    echo   [OK] Linux 386
) else (
    echo   [WARN] Linux 386 nicht gefunden
)

if exist "%GO_DIR%\macos-amd64\ostosos-server" (
    echo   [OK] macOS amd64
) else (
    echo   [WARN] macOS amd64 nicht gefunden
)

if exist "%GO_DIR%\macos-arm64\ostosos-server" (
    echo   [OK] macOS arm64
) else (
    echo   [WARN] macOS arm64 nicht gefunden
)

echo.

REM ============================================
REM PYTHON BUILDS
REM ============================================
echo PYTHON BUILDS:
echo ----------------------------------------

if exist "%PYTHON_DIR%\windows-amd64\ostosos-server.exe" (
    echo   [OK] Windows amd64
) else (
    echo   [WARN] Windows amd64 nicht gefunden
)

echo.
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo Original: https://tinyurl.com/BUGCOMPANY
echo ========================================
echo.
REM FABRIK UEBERNIMMT ALLES - KEINE USER-INTERAKTION
endlocal

