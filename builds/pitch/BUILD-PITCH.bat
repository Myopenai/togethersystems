@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Build Pitch Package
REM ============================================
REM Erstellt professionelles Pitch-Paket
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] BUILD PITCH PACKAGE
echo ========================================
echo.

cd /d "%~dp0"
if errorlevel 1 (
    echo [FEHLER] Konnte nicht ins Pitch-Verzeichnis wechseln
    pause
    exit /b 1
)

set "PITCH_DIR=%CD%"
set "DIST_DIR=%PITCH_DIR%\dist"
set "PLATFORM=windows-amd64"

echo Pitch-Verzeichnis: %PITCH_DIR%
echo Dist-Verzeichnis:  %DIST_DIR%
echo.

REM =================================================
REM SCHRITT 1: DIST-VERZEICHNIS ERSTELLEN
REM =================================================
echo ========================================
echo SCHRITT 1: DIST-VERZEICHNIS ERSTELLEN
echo ========================================
echo.

if exist "%DIST_DIR%" (
    echo Loesche altes Dist-Verzeichnis...
    rmdir /s /q "%DIST_DIR%"
)

mkdir "%DIST_DIR%"
mkdir "%DIST_DIR%\ostosos-pitch-%PLATFORM%"
mkdir "%DIST_DIR%\ostosos-pitch-%PLATFORM%\server"
mkdir "%DIST_DIR%\ostosos-pitch-%PLATFORM%\docs"
mkdir "%DIST_DIR%\ostosos-pitch-%PLATFORM%\gui"

echo [OK] Verzeichnis-Struktur erstellt
echo.

REM =================================================
REM SCHRITT 2: SERVER BAUEN
REM =================================================
echo ========================================
echo SCHRITT 2: SERVER BAUEN
echo ========================================
echo.

echo Pruefe Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] Python nicht gefunden!
    pause
    exit /b 1
)

echo Installiere/Pruefe PyInstaller...
python -m pip install pyinstaller --quiet

echo Baue Pitch-Server...
python -m PyInstaller --onefile --name pitch-server ^
    --distpath "%DIST_DIR%\ostosos-pitch-%PLATFORM%\server" ^
    --workpath "%DIST_DIR%\ostosos-pitch-%PLATFORM%\server\build-temp" ^
    --clean --noconfirm pitch-server.py

if exist "%DIST_DIR%\ostosos-pitch-%PLATFORM%\server\pitch-server.exe" (
    echo [OK] Pitch-Server gebaut
) else (
    echo [FEHLER] Pitch-Server Build fehlgeschlagen!
    pause
    exit /b 1
)

echo.

REM =================================================
REM SCHRITT 3: LAUNCHER BAUEN
REM =================================================
echo ========================================
echo SCHRITT 3: LAUNCHER BAUEN
echo ========================================
echo.

echo Baue Pitch-Launcher (GUI)...
python -m PyInstaller --onefile --name START-PITCH ^
    --distpath "%DIST_DIR%\ostosos-pitch-%PLATFORM%" ^
    --workpath "%DIST_DIR%\ostosos-pitch-%PLATFORM%\build-temp" ^
    --clean --noconfirm pitch-launcher.py

if exist "%DIST_DIR%\ostosos-pitch-%PLATFORM%\START-PITCH.exe" (
    echo [OK] Pitch-Launcher gebaut
) else (
    echo [FEHLER] Pitch-Launcher Build fehlgeschlagen!
    pause
    exit /b 1
)

echo.

REM =================================================
REM SCHRITT 4: DATEIEN KOPIEREN
REM =================================================
echo ========================================
echo SCHRITT 4: DATEIEN KOPIEREN
echo ========================================
echo.

REM Kopiere PDFs (falls vorhanden)
if exist "..\pdf\*.pdf" (
    echo Kopiere PDFs...
    copy "..\pdf\*.pdf" "%DIST_DIR%\ostosos-pitch-%PLATFORM%\docs\" >nul 2>&1
    echo [OK] PDFs kopiert
)

REM Kopiere GUI-Dateien (falls vorhanden)
if exist "gui\*" (
    echo Kopiere GUI-Dateien...
    xcopy "gui\*" "%DIST_DIR%\ostosos-pitch-%PLATFORM%\gui\" /E /I /Y >nul 2>&1
    echo [OK] GUI-Dateien kopiert
)

REM Erstelle index.html falls nicht vorhanden
if not exist "%DIST_DIR%\ostosos-pitch-%PLATFORM%\gui\index.html" (
    echo Erstelle Standard index.html...
    (
        echo ^<!DOCTYPE html^>
        echo ^<html^>
        echo ^<head^>
        echo     ^<title^>[.SYSTEMS.T.SYSTEMS.] ostosos Pitch^</title^>
        echo     ^<meta charset="utf-8"^>
        echo ^</head^>
        echo ^<body^>
        echo     ^<h1^>[.SYSTEMS.T.SYSTEMS.] ostosos Pitch^</h1^>
        echo     ^<p^>TogetherSystems International TTT^</p^>
        echo     ^<p^>Original: ^<a href="https://tinyurl.com/BUGCOMPANY"^>https://tinyurl.com/BUGCOMPANY^</a^>^</p^>
        echo ^</body^>
        echo ^</html^>
    ) > "%DIST_DIR%\ostosos-pitch-%PLATFORM%\gui\index.html"
    echo [OK] Standard index.html erstellt
)

echo.

REM =================================================
REM SCHRITT 5: ZIP ERSTELLEN
REM =================================================
echo ========================================
echo SCHRITT 5: ZIP ERSTELLEN
echo ========================================
echo.

cd "%DIST_DIR%"

if exist "ostosos-pitch-%PLATFORM%.zip" (
    del "ostosos-pitch-%PLATFORM%.zip"
)

echo Erstelle ZIP-Archiv...
powershell.exe -Command "Compress-Archive -Path 'ostosos-pitch-%PLATFORM%' -DestinationPath 'ostosos-pitch-%PLATFORM%.zip' -Force"

if exist "ostosos-pitch-%PLATFORM%.zip" (
    echo [OK] ZIP-Archiv erstellt: ostosos-pitch-%PLATFORM%.zip
) else (
    echo [WARN] ZIP-Erstellung fehlgeschlagen (PowerShell erforderlich)
)

echo.

REM =================================================
REM ZUSAMMENFASSUNG
REM =================================================
echo ========================================
echo BUILD ZUSAMMENFASSUNG
echo ========================================
echo.

echo Erstellte Dateien:
echo   - %DIST_DIR%\ostosos-pitch-%PLATFORM%\START-PITCH.exe
echo   - %DIST_DIR%\ostosos-pitch-%PLATFORM%\server\pitch-server.exe
if exist "%DIST_DIR%\ostosos-pitch-%PLATFORM%.zip" (
    echo   - %DIST_DIR%\ostosos-pitch-%PLATFORM%.zip
)
echo.

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo Original: https://tinyurl.com/BUGCOMPANY
echo ========================================
echo.

pause

endlocal
