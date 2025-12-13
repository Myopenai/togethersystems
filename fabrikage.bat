@echo off
setlocal enabledelayedexpansion

:: ============================================
:: FABRIKAGE INDUSTRIAL CONTROL SYSTEM
:: AUTOMATED PRODUCTION ENVIRONMENT
:: ============================================

:: System Configuration
set "ROOT=%~dp0"
set "LOGS=%ROOT%logs"
set "CONFIG=%ROOT%config"
set "BACKUPS=%ROOT%backups"
set "PRODUCTION=%ROOT%production"
set "TEMP=%TEMP%\fabrikage"

:: Initialize System
if not exist "%LOGS%" mkdir "%LOGS%"
if not exist "%CONFIG%" mkdir "%CONFIG%"
if not exist "%BACKUPS%" mkdir "%BACKUPS%"
if not exist "%PRODUCTION%" mkdir "%PRODUCTION%"
if not exist "%TEMP%" mkdir "%TEMP%"

:: Set Log File
set "LOG=%LOGS%\system_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log"

:: Log Function
:log
echo [%time%] %* >> "%LOG%"
echo %*
exit /b 0

:: Initialize Services
:init_services
call :log "Initializing FABRIKAGE services..."
for %%s in (monitor validator processor deployer) do (
    if not exist "%ROOT%\services\%%s.bat" (
        call :create_service "%%s"
    )
)
exit /b 0

:: Create Service
:create_service
set "service=%~1"
call :log "Creating service: %service%"
(
    echo @echo off
    echo setlocal enabledelayedexpansion
    echo set "SERVICE=%~1"
    echo set "LOG=%%~dp0..\logs\%%SERVICE%%_%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%_%%time::=%%..log"
    echo :start
    echo echo [%%%%time%%%%] %%~1 service running... ^>^> "!LOG!"
    echo timeout /t 10 ^>nul
    echo goto start
) > "%ROOT%\services\%service%.bat"
exit /b 0

:: Start Production
:start_production
call :log "Starting FABRIKAGE production..."
for %%s in (monitor validator processor deployer) do (
    start "FAB_%%s" /MIN cmd /c "services\%%s.bat"
)
exit /b 0

:: Stop Production
:stop_production
call :log "Stopping FABRIKAGE production..."
taskkill /FI "WINDOWTITLE eq FAB_*" /F >nul 2>&1
exit /b 0

:: System Status
:status
call :log "=== FABRIKAGE STATUS ==="
tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE
exit /b 0

:: Main Menu
:menu
cls
echo ===================================
echo    FABRIKAGE INDUSTRIAL CONTROL
echo    Status: %MODE%
echo ===================================
echo 1. Start Production (ACTIV)
echo 2. Stop Production (RUHESTAND)
echo 3. System Status
echo 4. Run Diagnostics
echo 5. Backup System
echo 0. Exit
echo.
set /p choice="Select: "

if "%choice%"=="1" (
    set "MODE=ACTIV"
    call :start_production
    pause
)
if "%choice%"=="2" (
    set "MODE=RUHESTAND"
    call :stop_production
    pause
)
if "%choice%"=="3" (
    call :status
    pause
)
if "%choice%"=="0" (
    call :stop_production
    exit /b 0
)

goto menu

:: Initialize and Start
call :init_services
call :menu