@echo off
setlocal enabledelayedexpansion

REM ═══════════════════════════════════════════════════════════════════════════
REM  Multi-Industry Docs - Production Deployment Helper
REM  This script guides you through the deployment process
REM ═══════════════════════════════════════════════════════════════════════════

title Multi-Industry Docs - Deployment Assistant
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════════════════╗
echo ║                                                                           ║
echo ║          🚀 Multi-Industry Docs - Production Deployment                  ║
echo ║                                                                           ║
echo ║                 WYSIWYG Editor with Auto-Save Persistence                ║
echo ║                                                                           ║
echo ╚═══════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if required files exist
if not exist "dist\" (
    echo.
    echo ❌ ERROR: dist\ folder not found!
    echo.
    echo Please run: npm run build
    echo.
    pause
    exit /b 1
)

if not exist "server.js" (
    echo.
    echo ❌ ERROR: server.js not found!
    echo.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo.
    echo ❌ ERROR: package.json not found!
    echo.
    pause
    exit /b 1
)

echo ✓ All required files verified
echo.

:MENU
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │                        DEPLOYMENT OPTIONS                               │
echo ├──────────────────────────────────────────────────────────────────────────┤
echo │                                                                          │
echo │  1) 🖥️  Start Server Locally (for testing)                             │
echo │     → Runs on http://localhost:4000                                    │
echo │                                                                          │
echo │  2) 📤 Deploy to Remote Server (Automated via PowerShell)              │
echo │     → Uses deploy-secure.ps1                                           │
echo │     → Target: 45.87.81.214:65002                                       │
echo │                                                                          │
echo │  3) 📋 View Deployment Guide                                           │
echo │     → DEPLOYMENT_PRODUCTION.md                                         │
echo │                                                                          │
echo │  4) 📄 View Quick Start Guide                                          │
echo │     → README_PRODUCTION.md                                             │
echo │                                                                          │
echo │  5) 🔧 Run Manual WinSCP Deployment                                    │
echo │     → For experienced users                                            │
echo │                                                                          │
echo │  6) 🧹 Clean & Rebuild                                                 │
echo │     → npm install && npm run build                                     │
echo │                                                                          │
echo │  0) Exit                                                                │
echo │                                                                          │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.

set /p choice="Select option (0-6): "

if "%choice%"=="1" goto LOCAL_TEST
if "%choice%"=="2" goto REMOTE_DEPLOY
if "%choice%"=="3" goto VIEW_GUIDE
if "%choice%"=="4" goto VIEW_README
if "%choice%"=="5" goto WINSCP_MANUAL
if "%choice%"=="6" goto REBUILD
if "%choice%"=="0" goto EXIT_SCRIPT
goto MENU

:LOCAL_TEST
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Starting Local Server...                                                │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.

REM Kill any existing process on port 4000
for /f "tokens=5" %%a in ('netstat -aon ^| find "4000" ^| find "LISTENING"') do taskkill /pid %%a /f 2>nul

echo 🚀 Server starting on http://localhost:4000
echo    (Press Ctrl+C to stop)
echo.

set PORT=4000
call npm start

if errorlevel 1 (
    echo.
    echo ❌ Server failed to start
    echo.
    pause
)
goto MENU

:REMOTE_DEPLOY
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Remote Deployment via PowerShell                                        │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.

echo ℹ️  The secure deployment script will:
echo    1. Connect to 45.87.81.214:65002
echo    2. Upload dist/ folder
echo    3. Upload server.js
echo    4. Upload package.json
echo    5. Set correct permissions
echo.
echo 📋 Post-deployment steps:
echo    1. SSH: ssh -p 65002 u972026836@45.87.81.214
echo    2. Run: npm install --production
echo    3. Run: PORT=80 node server.js
echo    4. Test: curl http://localhost/api/health
echo.

REM Check if PowerShell execution policy allows scripts
powershell -NoProfile -Command "Write-Host 'ℹ️  PowerShell ready'" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PowerShell execution may be restricted
    echo    Run as Administrator and execute:
    echo    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    pause
    goto MENU
)

echo 🔒 Starting PowerShell deployment script...
echo    (A credential dialog will appear - enter your remote password)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\deploy-secure.ps1"

pause
goto MENU

:VIEW_GUIDE
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Deployment Guide - DEPLOYMENT_PRODUCTION.md                            │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.
more "DEPLOYMENT_PRODUCTION.md"
pause
goto MENU

:VIEW_README
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Quick Start Guide - README_PRODUCTION.md                               │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.
more "README_PRODUCTION.md"
pause
goto MENU

:WINSCP_MANUAL
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Manual WinSCP Deployment                                               │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.
echo Instructions:
echo 1. Open WinSCP (if not installed, download from https://winscp.net)
echo 2. Quick Connect to:
echo    Host: 45.87.81.214
echo    Port: 65002
echo    User: u972026836
echo    Password: [Your remote password]
echo.
echo 3. Navigate to: /home/u972026836/domains/digitalnotar.in/public_html
echo.
echo 4. Create directories (if they don't exist):
echo    mkdir data
echo    mkdir data/content
echo.
echo 5. Upload files:
echo    - Drag 'dist' folder
echo    - Drag 'server.js' file
echo    - Drag 'package.json' file
echo.
echo 6. Open WinSCP Terminal (Ctrl+T) and run:
echo    chmod 755 data
echo    chmod 755 data/content
echo.
echo 7. Then SSH separately and run:
echo    cd /home/u972026836/domains/digitalnotar.in/public_html
echo    npm install --production
echo    PORT=80 node server.js
echo.
echo 📂 WinSCP Script template: winscp-deploy-manual.txt
echo.
pause
goto MENU

:REBUILD
echo.
echo ┌──────────────────────────────────────────────────────────────────────────┐
echo │ Rebuilding Project...                                                   │
echo └──────────────────────────────────────────────────────────────────────────┘
echo.

echo 🔄 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    goto MENU
)

echo.
echo 🔨 Building production assets...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    goto MENU
)

echo.
echo ✓ Build complete!
pause
goto MENU

:EXIT_SCRIPT
echo.
echo 👋 Goodbye!
echo.
endlocal
exit /b 0
