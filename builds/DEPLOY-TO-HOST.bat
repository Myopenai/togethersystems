@echo off
REM ============================================
REM [.SYSTEMS.T.SYSTEMS.] Deploy to Host
REM ============================================
REM Deployed Server auf Remote-Hosts
REM ============================================

setlocal enabledelayedexpansion

echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] DEPLOY TO HOST
echo ========================================
echo Deployed Server auf Remote-Hosts
echo ========================================
echo.

cd /d "%~dp0"
set "ROOT=%CD%"
set "BUILD_DIR=%ROOT%\go-executable\build"

REM =================================================
REM HOST-KONFIGURATION
REM =================================================
echo Waehle Host-Typ:
echo   1. SSH/SCP (Linux/macOS Server)
echo   2. FTP/SFTP
echo   3. Lokales Verzeichnis
echo   4. Docker Container
echo.
set /p HOST_TYPE="Eingabe (1-4): "

if "%HOST_TYPE%"=="1" goto SSH_DEPLOY
if "%HOST_TYPE%"=="2" goto FTP_DEPLOY
if "%HOST_TYPE%"=="3" goto LOCAL_DEPLOY
if "%HOST_TYPE%"=="4" goto DOCKER_DEPLOY

echo [FEHLER] Ungueltige Auswahl
pause
exit /b 1

:SSH_DEPLOY
echo.
echo ========================================
echo SSH/SCP DEPLOYMENT
echo ========================================
echo.
set /p SSH_HOST="SSH Host (z.B. user@example.com): "
set /p SSH_PORT="SSH Port (Standard: 22): "
if "%SSH_PORT%"=="" set "SSH_PORT=22"
set /p SSH_PATH="Remote-Pfad (z.B. /var/www/ostosos): "
set /p SSH_PLATFORM="Plattform (linux-amd64/linux-arm64/macos-amd64/macos-arm64): "

if "%SSH_PLATFORM%"=="linux-amd64" set "SERVER_BINARY=%BUILD_DIR%\linux-amd64\ostosos-server"
if "%SSH_PLATFORM%"=="linux-arm64" set "SERVER_BINARY=%BUILD_DIR%\linux-arm64\ostosos-server"
if "%SSH_PLATFORM%"=="macos-amd64" set "SERVER_BINARY=%BUILD_DIR%\macos-amd64\ostosos-server"
if "%SSH_PLATFORM%"=="macos-arm64" set "SERVER_BINARY=%BUILD_DIR%\macos-arm64\ostosos-server"

if not exist "%SERVER_BINARY%" (
    echo [FEHLER] Server-Binary nicht gefunden: %SERVER_BINARY%
    pause
    exit /b 1
)

echo.
echo Deploye Server...
echo   Host: %SSH_HOST%
echo   Port: %SSH_PORT%
echo   Pfad: %SSH_PATH%
echo   Binary: %SERVER_BINARY%
echo.

REM Prüfe ob scp verfügbar ist
where scp >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] scp nicht gefunden. Bitte installiere OpenSSH oder Git Bash.
    pause
    exit /b 1
)

REM Kopiere Server-Binary
echo Kopiere Server-Binary...
scp -P %SSH_PORT% "%SERVER_BINARY%" "%SSH_HOST%:%SSH_PATH%/ostosos-server"
if errorlevel 1 (
    echo [FEHLER] SCP-Upload fehlgeschlagen
    pause
    exit /b 1
)

REM Erstelle Start-Script auf Remote-Host
echo Erstelle Start-Script auf Remote-Host...
(
    echo #!/usr/bin/env bash
    echo cd "%SSH_PATH%"
    echo chmod +x ostosos-server
    echo ./ostosos-server ^&
    echo echo "Server gestartet: http://127.0.0.1:9090"
) > "%TEMP%\start-server.sh"

scp -P %SSH_PORT% "%TEMP%\start-server.sh" "%SSH_HOST%:%SSH_PATH%/start-server.sh"
if errorlevel 1 (
    echo [WARN] Start-Script konnte nicht kopiert werden
)

REM SSH-Befehl zum Starten
echo.
echo [OK] Server deployed!
echo.
echo Zum Starten auf Remote-Host:
echo   ssh -p %SSH_PORT% %SSH_HOST% "cd %SSH_PATH% && chmod +x ostosos-server && ./ostosos-server"
echo.
goto END

:FTP_DEPLOY
echo.
echo ========================================
echo FTP/SFTP DEPLOYMENT
echo ========================================
echo.
set /p FTP_HOST="FTP Host: "
set /p FTP_USER="FTP User: "
set /p FTP_PASS="FTP Password: "
set /p FTP_PATH="Remote-Pfad: "
set /p FTP_PLATFORM="Plattform (linux-amd64/linux-arm64): "

if "%FTP_PLATFORM%"=="linux-amd64" set "SERVER_BINARY=%BUILD_DIR%\linux-amd64\ostosos-server"
if "%FTP_PLATFORM%"=="linux-arm64" set "SERVER_BINARY=%BUILD_DIR%\linux-arm64\ostosos-server"

if not exist "%SERVER_BINARY%" (
    echo [FEHLER] Server-Binary nicht gefunden
    pause
    exit /b 1
)

echo.
echo [INFO] FTP-Deployment erfordert FTP-Client
echo Bitte verwende einen FTP-Client wie FileZilla oder WinSCP
echo.
echo Zu kopierende Datei:
echo   %SERVER_BINARY%
echo.
echo Ziel:
echo   ftp://%FTP_HOST%%FTP_PATH%/ostosos-server
echo.
goto END

:LOCAL_DEPLOY
echo.
echo ========================================
echo LOKALES DEPLOYMENT
echo ========================================
echo.
set /p LOCAL_PATH="Lokaler Pfad (z.B. C:\inetpub\wwwroot): "

if not exist "%LOCAL_PATH%" (
    echo [FEHLER] Pfad existiert nicht: %LOCAL_PATH%
    pause
    exit /b 1
)

REM Kopiere Windows-Server
if exist "%BUILD_DIR%\windows-amd64\ostosos-server.exe" (
    copy "%BUILD_DIR%\windows-amd64\ostosos-server.exe" "%LOCAL_PATH%\ostosos-server.exe" >nul
    echo [OK] Windows Server kopiert
)

echo.
echo [OK] Server deployed nach: %LOCAL_PATH%
echo.
goto END

:DOCKER_DEPLOY
echo.
echo ========================================
echo DOCKER DEPLOYMENT
echo ========================================
echo.
echo [INFO] Docker-Deployment erfordert Docker-Installation
echo.
echo Erstelle Docker-Image...
if exist "%ROOT%\docker\Dockerfile" (
    cd "%ROOT%\docker"
    docker build -t ostosos-server .
    if errorlevel 1 (
        echo [FEHLER] Docker-Build fehlgeschlagen
        pause
        exit /b 1
    )
    echo [OK] Docker-Image erstellt
    echo.
    echo Zum Starten:
    echo   docker run -d -p 9090:9090 ostosos-server
) else (
    echo [WARN] Dockerfile nicht gefunden: %ROOT%\docker\Dockerfile
)
echo.
goto END

:END
echo ========================================
echo [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
echo ========================================
echo.
pause

endlocal

