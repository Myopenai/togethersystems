@echo off
setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY ALL SERVERS
echo ========================================
echo.

cd /d "%~dp0"
set "ROOT=%CD%"
set "DEPLOY=%ROOT%\deploy"

if exist "%DEPLOY%" rmdir /s /q "%DEPLOY%"

mkdir "%DEPLOY%"
mkdir "%DEPLOY%\windows-amd64"
mkdir "%DEPLOY%\windows-arm64"
mkdir "%DEPLOY%\linux-amd64"
mkdir "%DEPLOY%\linux-386"
mkdir "%DEPLOY%\linux-arm64"
mkdir "%DEPLOY%\macos-amd64"
mkdir "%DEPLOY%\macos-arm64"

echo Kopiere Go Servers...
copy "%ROOT%\go-executable\build\windows-amd64\ostosos-server.exe" "%DEPLOY%\windows-amd64\" >nul 2>&1 && echo   [OK] Windows amd64
copy "%ROOT%\go-executable\build\windows-arm64\ostosos-server.exe" "%DEPLOY%\windows-arm64\" >nul 2>&1 && echo   [OK] Windows arm64
copy "%ROOT%\go-executable\build\linux-amd64\ostosos-server" "%DEPLOY%\linux-amd64\" >nul 2>&1 && echo   [OK] Linux amd64
copy "%ROOT%\go-executable\build\linux-386\ostosos-server" "%DEPLOY%\linux-386\" >nul 2>&1 && echo   [OK] Linux 386
copy "%ROOT%\go-executable\build\linux-arm64\ostosos-server" "%DEPLOY%\linux-arm64\" >nul 2>&1 && echo   [OK] Linux arm64
copy "%ROOT%\go-executable\build\macos-amd64\ostosos-server" "%DEPLOY%\macos-amd64\" >nul 2>&1 && echo   [OK] macOS amd64
copy "%ROOT%\go-executable\build\macos-arm64\ostosos-server" "%DEPLOY%\macos-arm64\" >nul 2>&1 && echo   [OK] macOS arm64

echo.
echo Kopiere Python Server...
copy "%ROOT%\python-executable\build\windows-amd64\ostosos-server.exe" "%DEPLOY%\windows-amd64\ostosos-server-python.exe" >nul 2>&1 && echo   [OK] Python Windows amd64

echo.
echo Erstelle Start-Scripts...

echo @echo off > "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo cd /d "%%~dp0" >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo if exist "ostosos-server.exe" ^( >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     start "" "ostosos-server.exe" >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     timeout /t 2 /nobreak ^>nul >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     start "" "http://127.0.0.1:9090" >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     echo Server gestartet: http://127.0.0.1:9090 >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo ^) else ^( >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     echo [FEHLER] Server nicht gefunden >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo     pause >> "%DEPLOY%\windows-amd64\START-SERVER.bat"
echo ^) >> "%DEPLOY%\windows-amd64\START-SERVER.bat"

copy "%DEPLOY%\windows-amd64\START-SERVER.bat" "%DEPLOY%\windows-arm64\START-SERVER.bat" >nul

echo #!/usr/bin/env bash > "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo cd "$(dirname "$0")" >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo if [ -f "ostosos-server" ]; then >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     chmod +x ostosos-server >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     ./ostosos-server ^& >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     sleep 2 >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     xdg-open "http://127.0.0.1:9090" ^& 2^>^/dev/null || open "http://127.0.0.1:9090" ^& >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     echo "Server gestartet: http://127.0.0.1:9090" >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo else >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     echo "[FEHLER] Server nicht gefunden" >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo     exit 1 >> "%DEPLOY%\linux-amd64\START-SERVER.sh"
echo fi >> "%DEPLOY%\linux-amd64\START-SERVER.sh"

copy "%DEPLOY%\linux-amd64\START-SERVER.sh" "%DEPLOY%\linux-386\START-SERVER.sh" >nul
copy "%DEPLOY%\linux-amd64\START-SERVER.sh" "%DEPLOY%\linux-arm64\START-SERVER.sh" >nul
copy "%DEPLOY%\linux-amd64\START-SERVER.sh" "%DEPLOY%\macos-amd64\START-SERVER.sh" >nul
copy "%DEPLOY%\linux-amd64\START-SERVER.sh" "%DEPLOY%\macos-arm64\START-SERVER.sh" >nul

echo   [OK] Start-Scripts erstellt

echo.
echo ========================================
echo [OK] ALLE SERVER DEPLOYED
echo ========================================
echo.
echo Deploy-Verzeichnis: %DEPLOY%
echo.
pause

