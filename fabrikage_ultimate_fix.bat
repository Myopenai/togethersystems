@echo off
setlocal enabledelayedexpansion

:: Create basic directories if they don't exist
mkdir logs 2>nul
mkdir config 2>nul
mkdir backups 2>nul
mkdir services 2>nul

:: Simple logging function
:log
echo [%time%] %* >> logs\fabrikage_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log
echo %*
exit /b 0

:: Main menu
:menu
cls
echo =============================
echo    FABRIKAGE CONTROL PANEL
echo =============================
echo 1. Start Services
echo 2. Stop Services
echo 3. Check Status
echo 4. Run Backup
echo 0. Exit
echo.
set /p choice="Select: "

if "%choice%"=="1" (
    call :start_services
    pause
)
if "%choice%"=="2" (
    call :stop_services
    pause
)
if "%choice%"=="3" (
    call :check_status
    pause
)
if "%choice%"=="4" (
    call :run_backup
    pause
)
if not "%choice%"=="0" goto menu
exit /b 0

:: Service control functions
:start_services
call :log "Starting FABRIKAGE services..."
start "FAB_monitor" /MIN cmd /c "echo [%time%] Monitor running... > logs\monitor.log & pause"
start "FAB_processor" /MIN cmd /c "echo [%time%] Processor running... > logs\processor.log & pause"
call :log "Services started"
exit /b 0

:stop_services
call :log "Stopping FABRIKAGE services..."
taskkill /FI "WINDOWTITLE eq FAB_*" /F >nul 2>&1
call :log "Services stopped"
exit /b 0

:check_status
echo.
echo === SERVICE STATUS ===
tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE
echo.
exit /b 0

:run_backup
call :log "Starting backup..."
mkdir backups\%date:~-4,4%%date:~-10,2%%date:-7,2% 2>nul
xcopy /Y /E /I *.* backups\%date:~-4,4%%date:~-10,2%%date:-7,2%\
call :log "Backup completed"
exit /b 0