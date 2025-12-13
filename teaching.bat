 @echo off
setlocal enabledelayedexpansion

:: ============================================
:: FABRIKAGE AUTOMATION SYSTEM - IBM STANDARD
:: ============================================

:: Configuration
set "ROOT=%~dp0"
set "SERVICES=%ROOT%services"
set "CONFIG=%ROOT%config"
set "LOGS=%ROOT%logs"
set "BACKUPS=%ROOT%backups"
set "TIMESTAMP=%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"

:: Create directories if they don't exist
for %%d in ("%SERVICES%" "%CONFIG%" "%LOGS%" "%BACKUPS%") do (
    if not exist "%%~d" mkdir "%%~d" >nul 2>&1
)

:: Log function
:log
echo [%TIME%] %* >> "%LOGS%\fabrikage_%TIMESTAMP%.log"
echo %*
exit /b 0

:: Initialize system
call :log "=== FABRIKAGE SYSTEM INITIALIZATION ==="
call :log "Root: %ROOT%"
call :log "Timestamp: %TIMESTAMP%"

:: Set environment variables
setx FABRIKAGE_ROOT "%ROOT%" /M >nul 2>&1
setx FABRIKAGE_MODE "AUTO" /M >nul 2>&1

:: Create core services
call :create_service "processor" "FAB_Processor" "Processor service for handling core operations"
call :create_service "validator" "FAB_Validator" "Validation service for data integrity"
call :create_service "deployer" "FAB_Deployer" "Deployment service for system updates"
call :create_service "monitor" "FAB_Monitor" "System monitoring service"

:: Create control script
(
    echo @echo off
    echo setlocal enabledelayedexpansion
    echo.
    echo :: FABRIKAGE CONTROL CENTER - IBM STANDARD
    echo :: DO NOT MODIFY - AUTO-GENERATED
    echo.
    echo set "SERVICES_DIR=%%~dp0services"
    echo set "LOG_DIR=%%~dp0logs"
    echo.
    echo if "%%1"=="" (
    echo     echo FABRIKAGE CONTROL CENTER
    echo     echo.
    echo     echo Usage: %%~nx0 [command]
    echo     echo.
    echo     echo Commands:
    echo     echo   start    - Start all services
    echo     echo   stop     - Stop all services
    echo     echo   restart  - Restart all services
    echo     echo   status   - Show service status
    echo     echo   log      - View system log
    echo     echo   backup   - Create system backup
    echo     echo   update   - Update system components
    echo     echo   repair   - Run system repair
    echo     echo   monitor  - Start monitoring
    echo     echo.
    echo     exit /b 0
    echo )
    echo.
    echo :: Service control functions
    echo :start_services
    echo echo Starting FABRIKAGE services...
    echo for %%%%s in (processor validator deployer monitor) do (
    echo     if exist "!SERVICES_DIR!\%%%%s.bat" (
    echo         start "FAB_%%%%s" /MIN "!SERVICES_DIR!\%%%%s.bat"
    echo         echo Started: %%%%s
    echo     )
    echo )
    echo exit /b 0
    echo.
    echo :stop_services
    echo echo Stopping FABRIKAGE services...
    echo taskkill /FI "WINDOWTITLE eq FAB_*" /F ^>nul 2^>^&1
    echo exit /b 0
    echo.
    echo :show_status
    echo tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE
    echo exit /b 0
    echo.
    echo :create_backup
    echo echo Creating system backup...
    echo if not exist "%%~dp0backups" mkdir "%%~dp0backups"
    echo set "BACKUP_FILE=%%~dp0backups\fabrikage_backup_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.zip"
    echo powershell -Command "Compress-Archive -Path '%%~dp0*' -DestinationPath '!BACKUP_FILE!' -Force"
    echo echo Backup created: !BACKUP_FILE!
    echo exit /b 0
    echo.
    echo :update_system
    echo echo Updating system components...
    echo :: Add update logic here
    echo exit /b 0
    echo.
    echo :repair_system
    echo echo Running system repair...
    echo :: Add repair logic here
    echo exit /b 0
    echo.
    echo :start_monitoring
    echo echo Starting system monitoring...
    echo start "FAB_Monitor" /MIN "%%~dp0services\monitor.bat"
    echo exit /b 0
    echo.
    echo :: Main execution
    echo if /i "%%1"=="start" (
    echo     call :start_services
    echo ) else if /i "%%1"=="stop" (
    echo     call :stop_services
    echo ) else if /i "%%1"=="restart" (
    echo     call :stop_services
    echo     timeout /t 2 >nul
    echo     call :start_services
    echo ) else if /i "%%1"=="status" (
    echo     call :show_status
    echo ) else if /i "%%1"=="backup" (
    echo     call :create_backup
    echo ) else if /i "%%1"=="update" (
    echo     call :update_system
    echo ) else if /i "%%1"=="repair" (
    echo     call :repair_system
    echo ) else if /i "%%1"=="monitor" (
    echo     call :start_monitoring
    echo ) else (
    echo     echo Unknown command: %%1
    echo     exit /b 1
    echo )
) > "%ROOT%\fabrikage_control.bat"

:: Create standard service template
:create_service
set "SERVICE_NAME=%~1"
set "WINDOW_TITLE=%~2"
set "DESCRIPTION=%~3"

(
    echo @echo off
    echo setlocal enabledelayedvalidation
    echo.
    echo :: %WINDOW_TITLE%
    echo :: %DESCRIPTION%
    echo :: DO NOT MODIFY - AUTO-GENERATED
    echo.
    echo set "SERVICE_NAME=%~1"
    echo set "LOG_FILE=%%~dp0..\logs\%%~n0_%TIMESTAMP%.log"
    echo.
    echo :start
    echo echo [%%DATE%% %%TIME%%] Starting %SERVICE_NAME%... ^> "!LOG_FILE!"
    echo.
    echo :loop
    echo echo [%%TIME%%] %SERVICE_NAME% running... ^>^> "!LOG_FILE!"
    echo timeout /t 10 ^>nul
    echo goto loop
) > "%SERVICES%\%SERVICE_NAME%.bat"

call :log "Created service: %SERVICE_NAME%"
exit /b 0

:: Finalize installation
call :log "=== FABRIKAGE SYSTEM READY ==="
echo.
echo ============================================
echo    FABRIKAGE SYSTEM INSTALLATION COMPLETE
echo ============================================
echo.
echo System has been configured with IBM standards
echo.
echo Available commands:
echo   fabrikage_control start    - Start all services
echo   fabrikage_control stop     - Stop all services
echo   fabrikage_control restart  - Restart all services
echo   fabrikage_control status   - Show service status
echo   fabrikage_control backup   - Create system backup
echo   fabrikage_control update   - Update system
echo   fabrikage_control repair   - Run system repair
echo   fabrikage_control monitor  - Start monitoring
echo.
echo Logs directory: %LOGS%
echo.

:: Set system to auto-start on boot
schtasks /create /tn "FABRIKAGE_AUTO_START" /tr "\"%~dp0fabrikage_control.bat\" start" /sc onstart /ru System /f >nul 2>&1

:: Start the system
call "%ROOT%\fabrikage_control.bat" start