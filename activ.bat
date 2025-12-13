@echo off
setlocal enabledelayedexpansion

:: ============================================
:: FABRIKAGE ACTIV Control System
:: Master Control Script for System Management
:: Version: 2.0
:: Last Updated: 2025-12-10
:: ============================================

:: Configuration
set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "CONFIG_DIR=%SCRIPT_DIR%config"
set "BACKUP_DIR=%SCRIPT_DIR%backups"
set "TEMP_DIR=%TEMP%\fabrikage"
set "MODE=ACTIVE"
set "TIMESTAMP=%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"

:: Create required directories
for %%d in ("%LOG_DIR%" "%CONFIG_DIR%" "%BACKUP_DIR%" "%TEMP_DIR%") do (
    if not exist "%%~d" mkdir "%%~d"
)

:: Initialize logging
set "LOG_FILE=%LOG_DIR%\activ_%TIMESTAMP%.log"
call :log "=== FABRIKAGE ACTIV Control System Started ==="
call :log "Timestamp: %DATE% %TIME%"
call :log "Mode: %MODE%"
call :log "Script Directory: %SCRIPT_DIR%"

:: Check for admin privileges
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log "ERROR: This script requires administrator privileges. Restarting with elevated permissions..."
    powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c', '%~f0', '!*'"
    exit /b
)

:: Load configuration
call :load_config

:: Main menu
:main_menu
cls
call :log "Displaying main menu"
echo ===================================
echo    FABRIKAGE ACTIV Control System
echo ===================================
echo Mode: %MODE%
echo Last Check: %TIME%
echo.
echo 1. System Status
echo 2. Start All Services
echo 3. Stop All Services
echo 4. Restart All Services
echo 5. Run System Diagnostics
echo 6. Backup System
echo 7. Update System
echo 8. Toggle Mode (Active/Standby)
echo 9. Emergency Stop
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" (
    call :system_status
    pause
    goto main_menu
) else if "%choice%"=="2" (
    call :start_services
    pause
    goto main_menu
) else if "%choice%"=="3" (
    call :stop_services
    pause
    goto main_menu
) else if "%choice%"=="4" (
    call :stop_services
    call :start_services
    pause
    goto main_menu
) else if "%choice%"=="5" (
    call :run_diagnostics
    pause
    goto main_menu
) else if "%choice%"=="6" (
    call :backup_system
    pause
    goto main_menu
) else if "%choice%"=="7" (
    call :update_system
    pause
    goto main_menu
) else if "%choice%"=="8" (
    call :toggle_mode
    pause
    goto main_menu
) else if "%choice%"=="9" (
    call :emergency_stop
    exit /b
) else if "%choice%"=="0" (
    call :log "Shutting down ACTIV Control System"
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    timeout /t 2 >nul
    goto main_menu
)

exit /b 0

:: ============================================
:: Subroutines
:: ============================================

:load_config
if not exist "%CONFIG_DIR%\fabrikage.cfg" (
    call :log "Configuration file not found. Creating default configuration."
    echo MODE=ACTIVE> "%CONFIG_DIR%\fabrikage.cfg"
    echo BACKUP_ENABLED=1>> "%CONFIG_DIR%\fabrikage.cfg"
    echo BACKUP_RETENTION_DAYS=7>> "%CONFIG_DIR%\fabrikage.cfg"
    echo LOG_RETENTION_DAYS=30>> "%CONFIG_DIR%\fabrikage.cfg"
    echo MONITOR_INTERVAL=300>> "%CONFIG_DIR%\fabrikage.cfg"
)

for /f "tokens=1,2 delims==" %%A in ('type "%CONFIG_DIR%\fabrikage.cfg"') do (
    if /i "%%A"=="MODE" set "MODE=%%B"
    if /i "%%A"=="BACKUP_ENABLED" set "BACKUP_ENABLED=%%B"
    if /i "%%A"=="BACKUP_RETENTION_DAYS" set "BACKUP_RETENTION_DAYS=%%B"
    if /i "%%A"=="LOG_RETENTION_DAYS" set "LOG_RETENTION_DAYS=%%B"
    if /i "%%A"=="MONITOR_INTERVAL" set "MONITOR_INTERVAL=%%B"
)

call :log "Configuration loaded. Mode: %MODE%"
goto :eof

:system_status
call :log "Running system status check..."
echo.
echo === System Status ===
echo.

:: Check system time
echo [*] System Time: %DATE% %TIME%

:: Check disk space
for /f "tokens=1,2,3,4,5 delims= " %%a in ('wmic logicaldisk get caption^,freespace^,size^,freespace^,freespace^ /format:value ^| find "="') do (
    for /f "tokens=1,2 delims==" %%i in ("%%a") do (
        if "%%i"=="Caption" set "drive=%%j"
        if "%%i"=="FreeSpace" set "free=%%j"
        if "%%i"=="Size" set "size=%%j"
    )
    if defined drive if defined free if defined size (
        set /a "free_gb=!free:~0,-9!" 2>nul
        set /a "size_gb=!size:~0,-9!" 2>nul
        if !size_gb! gtr 0 (
            set /a "used_pct=(size_gb-free_gb)*100/size_gb"
            echo [*] Drive !drive! - Free: !free_gb!GB / !size_gb!GB (!used_pct!%% used)
        )
        set "drive="
        set "free="
        set "size="
    )
)

echo.
:: Check running processes
echo [*] Checking critical processes...
for %%p in (node.exe, python.exe, java.exe, nginx.exe, redis-server.exe) do (
    tasklist /FI "IMAGENAME eq %%p" 2>nul | find /i "%%p" >nul
    if !errorlevel!==0 (
        echo [X] %%p is NOT running
    ) else (
        echo [✓] %%p is running
    )
)

goto :eof

:start_services
call :log "Starting all services..."
echo.
echo === Starting Services ===
echo.

:: Start web server
if not exist "%SCRIPT_DIR%\server\start_server.bat" (
    echo [X] Server start script not found
) else (
    call "%SCRIPT_DIR%\server\start_server.bat"
    if !errorlevel!==0 (
        echo [✓] Web server started successfully
    ) else (
        echo [X] Failed to start web server
    )
)

:: Start database
if not exist "%SCRIPT_DIR%\database\start_db.bat" (
    echo [X] Database start script not found
) else (
    call "%SCRIPT_DIR%\database\start_db.bat"
    if !errorlevel!==0 (
        echo [✓] Database started successfully
    ) else (
        echo [X] Failed to start database
    )
)

:: Start monitoring
start "FABRIKAGE Monitor" /MIN cmd /c "%SCRIPT_DIR%\monitor.bat"
echo [*] Monitoring service started in background

echo.
echo All services started.
goto :eof

:stop_services
call :log "Stopping all services..."
echo.
echo === Stopping Services ===
echo.

:: Stop web server
taskkill /F /IM node.exe /T >nul 2>&1
echo [*] Web server stopped

:: Stop database
taskkill /F /IM mongod.exe /T >nul 2>&1
taskkill /F /IM mysqld.exe /T >nul 2>&1
echo [*] Database services stopped

:: Stop monitoring
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq FABRIKAGE Monitor" /T >nul 2>&1
echo [*] Monitoring service stopped

echo.
echo All services stopped.
goto :eof

:run_diagnostics
call :log "Running system diagnostics..."
echo.
echo === System Diagnostics ===
echo.

:: Check network connectivity
echo [*] Testing network connectivity...
ping -n 1 8.8.8.8 >nul
if !errorlevel!==0 (
    echo [X] No internet connection detected
) else (
    echo [✓] Internet connection is active
)

:: Check disk health
echo.
echo [*] Checking disk health...
wmic diskdrive get status 2>&1 | find "OK" >nul
if !errorlevel!==0 (
    echo [X] Disk health check failed
) else (
    echo [✓] Disk health check passed
)

:: Check system resources
echo.
echo [*] Checking system resources...
wmic OS get FreePhysicalMemory /Value | find "FreePhysicalMemory"
wmic OS get TotalVisibleMemorySize /Value | find "TotalVisibleMemorySize"

echo.
echo Diagnostics complete.
goto :eof

:backup_system
if "%BACKUP_ENABLED%"=="0" (
    echo Backup is disabled in configuration.
    goto :eof
)

call :log "Starting system backup..."
echo.
echo === System Backup ===
echo.

set "BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.zip"

echo [*] Creating backup to %BACKUP_FILE%
"%ProgramFiles%\7-Zip\7z.exe" a -tzip "%BACKUP_FILE%" "%SCRIPT_DIR%" -xr!*.log -xr!*.tmp -xr!*.temp -xr!*.bak -xr!*\node_modules\* -xr!*\vendor\* -xr!*\cache\* -xr!*\temp\* -xr!*\tmp\* -xr!*\logs\* -xr!*\backups\* -xr!*.git\* -xr!*.svn\* -xr!*.idea\* -xr!*.vscode\*

if !errorlevel!==0 (
    call :log "Backup created successfully: %BACKUP_FILE%"
    echo [✓] Backup completed successfully
    
    :: Clean up old backups
    forfiles /P "%BACKUP_DIR%" /M "backup_*.zip" /D -%BACKUP_RETENTION_DAYS% /C "cmd /c echo Deleting old backup @file && del /f @file"
    call :log "Cleaned up backups older than %BACKUP_RETENTION_DAYS% days"
) else (
    call :log "ERROR: Backup failed with code !errorlevel!"
    echo [X] Backup failed with code !errorlevel!
)

goto :eof

:update_system
call :log "Starting system update..."
echo.
echo === System Update ===
echo.

echo [*] Checking for updates...

:: Backup before updating
call :backup_system

:: Update from Git repository
if exist "%SCRIPT_DIR%\.git" (
    echo [*] Updating from Git repository...
    cd /d "%SCRIPT_DIR%"
    git pull
    if !errorlevel!==0 (
        echo [X] Git pull failed
        goto update_error
    )
    echo [✓] Git repository updated
)

:: Update Node.js dependencies
if exist "%SCRIPT_DIR%\package.json" (
    echo [*] Updating Node.js dependencies...
    cd /d "%SCRIPT_DIR%"
    call npm install
    if !errorlevel!==0 (
        echo [X] npm install failed
        goto update_error
    )
    echo [✓] Node.js dependencies updated
)

echo.
echo [✓] System update completed successfully
call :log "System update completed successfully"
goto :eof

:update_error
echo.
echo [X] System update failed
call :log "ERROR: System update failed"
goto :eof

:toggle_mode
if "%MODE%"=="ACTIVE" (
    set "MODE=STANDBY"
    echo [*] Switching to STANDBY mode
    call :log "Switching to STANDBY mode"
) else (
    set "MODE=ACTIVE"
    echo [*] Switching to ACTIVE mode
    call :log "Switching to ACTIVE mode"
)

:: Update configuration file
(
    echo MODE=%MODE%
    echo BACKUP_ENABLED=%BACKUP_ENABLED%
    echo BACKUP_RETENTION_DAYS=%BACKUP_RETENTION_DAYS%
    echo LOG_RETENTION_DAYS=%LOG_RETENTION_DAYS%
    echo MONITOR_INTERVAL=%MONITOR_INTERVAL%
) > "%CONFIG_DIR%\fabrikage.cfg"

goto :eof

:emergency_stop
call :log "=== EMERGENCY STOP INITIATED ==="
echo.
echo ====================================
echo        EMERGENCY STOP
echo ====================================
echo.
echo [*] Stopping all services...

:: Stop all services
call :stop_services

:: Kill all related processes
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM nginx.exe /T >nul 2>&1
taskkill /F /IM redis-server.exe /T >nul 2>&1

echo.
echo [✓] All services stopped.
echo.
echo SYSTEM HALTED
call :log "=== EMERGENCY STOP COMPLETED ==="
timeout /t 5 >nul
exit /b 0

:log
echo [%DATE% %TIME%] %* >> "%LOG_FILE%"
if "%~1"=="" (
    echo. >> "%LOG_FILE%"
) else (
    echo %*
)
goto :eof

:cleanup_logs
call :log "Cleaning up old log files..."
forfiles /P "%LOG_DIR%" /M "*.log" /D -%LOG_RETENTION_DAYS% /C "cmd /c echo Deleting old log @file && del /f @file"
goto :eof

:error_handling
call :log "ERROR: An error occurred in %0"
call :log "Error level: !errorlevel!"
call :log "Error context: %*"
goto :eof

:end
call :log "ACTIV Control System shutdown"
exit /b 0
