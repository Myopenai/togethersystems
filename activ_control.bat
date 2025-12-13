@echo off
setlocal enabledelayedexpansion

:: ============================================
:: FABRIKAGE ACTIV CONTROL SYSTEM - INDUSTRIAL GRADE
:: SINGLE FILE IMPLEMENTATION
:: ============================================

:: Initialize system
if not exist "logs" mkdir logs
if not exist "config" mkdir config
if not exist "scripts" mkdir scripts
if not exist "scripts\services" mkdir scripts\services

:: Create service scripts if they don't exist
if not exist "scripts\services\server.bat" (
    echo @echo off > "scripts\services\server.bat"
    echo :start >> "scripts\services\server.bat"
    echo echo [%%DATE%% %%TIME%%] Server is running... >> "scripts\services\server.bat"
    echo timeout /t 10 ^>nul >> "scripts\services\server.bat"
    echo goto start >> "scripts\services\server.bat"
)

if not exist "scripts\services\database.bat" (
    echo @echo off > "scripts\services\database.bat"
    echo :start >> "scripts\services\database.bat"
    echo echo [%%DATE%% %%TIME%%] Database is running... >> "scripts\services\database.bat"
    echo timeout /t 10 ^>nul >> "scripts\services\database.bat"
    echo goto start >> "scripts\services\database.bat"
)

if not exist "scripts\services\monitor.bat" (
    echo @echo off > "scripts\services\monitor.bat"
    echo :start >> "scripts\services\monitor.bat"
    echo echo [%%DATE%% %%TIME%%] Monitoring system... >> "scripts\services\monitor.bat"
    echo timeout /t 10 ^>nul >> "scripts\services\monitor.bat"
    echo goto start >> "scripts\services\monitor.bat"
)

:: Main control loop
:menu
cls
echo ===================================
echo    FABRIKAGE ACTIV CONTROL SYSTEM
echo ===================================
echo 1. Start All Services
echo 2. Stop All Services
echo 3. System Status
echo 4. Run Diagnostics
echo 0. Exit
echo.
set /p choice="Select: "

if "%choice%"=="1" (
    echo Starting all services...
    start "FABRIKAGE_SERVER" /MIN cmd /c "scripts\services\server.bat"
    start "FABRIKAGE_DATABASE" /MIN cmd /c "scripts\services\database.bat"
    start "FABRIKAGE_MONITOR" /MIN cmd /c "scripts\services\monitor.bat"
    echo Services started in background.
    pause
)

if "%choice%"=="2" (
    echo Stopping all services...
    taskkill /FI "WINDOWTITLE eq FABRIKAGE_*" /F >nul 2>&1
    echo All services stopped.
    pause
)

if "%choice%"=="3" (
    echo.
    echo === System Status ===
    echo.
    tasklist /FI "WINDOWTITLE eq FABRIKAGE_*" /FO TABLE
    echo.
    pause
)

if "%choice%"=="4" (
    echo.
    echo === System Diagnostics ===
    echo.
    echo [*] Checking services...
    tasklist /FI "WINDOWTITLE eq FABRIKAGE_*" /FO TABLE
    echo.
    echo [*] System information:
    systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type"
    echo.
    pause
)

if not "%choice%"=="0" goto menu

echo Shutting down...
timeout /t 2 >nul
exit