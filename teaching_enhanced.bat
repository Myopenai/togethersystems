@echo off
setlocal enabledelayedexpansion

:: ============================================
:: FABRIKAGE ZERO-TOUCH AUTOMATION SYSTEM v2.0
:: Enhanced with better error handling and logging
:: ============================================

:: Configuration - Edit these values as needed
set "BACKUP_ENABLED=1"
set "MONITORING_ENABLED=1"
set "SELF_HEAL_ENABLED=1"
set "LOG_LEVEL=INFO"  ; DEBUG, INFO, WARN, ERROR

:: Core Configuration
set "ROOT=%~dp0"
set "TIMESTAMP=%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "SELF=%~nx0"

:: Initialize Directories
for %%d in ("%ROOT%logs" "%ROOT%backups" "%ROOT%temp") do (
    if not exist "%%~d" (
        mkdir "%%~d" >nul 2>&1
        call :log "INFO" "Created directory: %%~d"
    )
)

:: Initialize Logging
set "LOG_FILE=%ROOT%logs\%SELF%_%TIMESTAMP%.log"
call :log "INFO" "=== FABRIKAGE ZERO-TOUCH INITIALIZATION ==="
call :log "INFO" "Starting at: %DATE% %TIME%"
call :log "INFO" "Script: %~f0"
call :log "INFO" "Arguments: %*"

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    set "ADMIN_MODE=1"
    call :log "INFO" "Running with administrative privileges"
) else (
    set "ADMIN_MODE=0"
    call :log "WARN" "Insufficient privileges, requesting elevation..."
    powershell -Command "Start-Process cmd -ArgumentList '/c ""%~f0" %*' -Verb RunAs"
    exit /b
)

:: Main Execution Flow
call :log "INFO" "Starting main execution sequence..."

:: 1. Backup current state
if "%BACKUP_ENABLED%"=="1" (
    call :create_backup
) else (
    call :log "INFO" "Backup skipped (disabled in configuration)"
)

:: 2. Deploy core services
call :deploy_services

:: 3. Start monitoring if enabled
if "%MONITORING_ENABLED%"=="1" (
    call :start_monitoring
) else (
    call :log "INFO" "Monitoring disabled in configuration"
)

:: 4. Run self-healing if enabled
if "%SELF_HEAL_ENABLED%"=="1" (
    call :self_heal
) else (
    call :log "INFO" "Self-healing disabled in configuration"
)

call :log "INFO" "=== EXECUTION COMPLETED SUCCESSFULLY ==="
exit /b 0

:: ============================================
:: CORE FUNCTIONS
:: ============================================

:log <level> <message>
set "LOG_LEVEL_CURRENT=%~1"
set "LOG_MESSAGE=%~2"

:: Skip logging if message level is below threshold
if /i "!LOG_LEVEL_CURRENT!"=="DEBUG" if /i not "!LOG_LEVEL!"=="DEBUG" exit /b 0
if /i "!LOG_LEVEL_CURRENT!"=="INFO" if /i "!LOG_LEVEL!"=="WARN" exit /b 0
if /i "!LOG_LEVEL_CURRENT!"=="INFO" if /i "!LOG_LEVEL!"=="ERROR" exit /b 0
if /i "!LOG_LEVEL_CURRENT!"=="WARN" if /i "!LOG_LEVEL!"=="ERROR" exit /b 0

:: Format and write log
set "LOG_TIMESTAMP=%DATE% %TIME%"
echo [!LOG_TIMESTAMP!] [%COMPUTERNAME%] [%~1] %~2 >> "%LOG_FILE%"
echo [!LOG_TIMESTAMP!] [%~1] %~2
exit /b 0

:check_requirements
call :log "INFO" "Verifying system requirements..."

:: Check Windows version
ver | find "10.0." >nul
if %ERRORLEVEL% NEQ 0 (
    call :log "ERROR" "Windows 10 or later required"
    exit /b 1
)

:: Check disk space (min 1GB free)
for /f "tokens=3" %%a in ('dir /-c %SystemDrive%\ ^| find "bytes free"') do set free=%%a
set "free=!free:,=!"
if !free! LSS 1073741824 (
    call :log "ERROR" "Insufficient disk space (need at least 1GB free)"
    exit /b 2
)

:: Check internet connectivity
ping -n 1 8.8.8.8 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log "WARN" "No internet connection detected"
    set "OFFLINE_MODE=1"
) else (
    set "OFFLINE_MODE=0"
)

call :log "INFO" "System requirements verified successfully"
exit /b 0

:create_backup
call :log "INFO" "Creating system backup..."
set "BACKUP_FILE=%ROOT%backups\backup_%TIMESTAMP%.7z"

:: Show progress
echo Creating backup, please wait...
call :show_progress 10

:: Use 7-Zip if available, fallback to PowerShell
if exist "%ProgramFiles%\7-Zip\7z.exe" (
    "%ProgramFiles%\7-Zip\7z" a -t7z -mx=9 "%BACKUP_FILE%" "%ROOT%*" -xr!*.7z -xr!*.zip -xr!*.log >nul 2>&1
) else (
    powershell -Command "Compress-Archive -Path '%ROOT%*' -DestinationPath '%BACKUP_FILE%' -Force" >nul 2>&1
)

if exist "%BACKUP_FILE%" (
    call :log "INFO" "Backup created: %BACKUP_FILE%"
) else (
    call :log "ERROR" "Backup creation failed"
    exit /b 1
)
exit /b 0

:deploy_services
call :log "INFO" "Deploying core services..."

:: Deploy each service
set "SERVICES=processor validator deployer monitor"
for %%s in (%SERVICES%) do (
    call :deploy_service "%%s"
    if !ERRORLEVEL! NEQ 0 (
        call :log "ERROR" "Failed to deploy service: %%s"
        exit /b 1
    }
)
exit /b 0

:deploy_service
set "SERVICE=%~1"
set "SVC_FILE=%ROOT%%SERVICE%.bat"

call :log "INFO" "Deploying service: %SERVICE%"

:: Create service batch file
echo @echo off > "%SVC_FILE%"
echo setlocal enabledelayedexpansion >> "%SVC_FILE%"
echo. >> "%SVC_FILE%"
echo :main_loop >> "%SVC_FILE%"
echo     echo [%%TIME%%] %SERVICE% service running... >> "%SVC_FILE%"
echo     timeout /t 30 /nobreak ^>nul >> "%SVC_FILE%"
echo goto main_loop >> "%SVC_FILE%"

:: Create scheduled task
schtasks /create /tn "FAB_%SERVICE%" /tr "\"%SVC_FILE%\"" /sc onstart /ru SYSTEM /f >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log "ERROR" "Failed to create scheduled task for %SERVICE%"
    exit /b 1
)

:: Start the service
start "FAB_%SERVICE%" /MIN "%SVC_FILE%"
if %ERRORLEVEL% NEQ 0 (
    call :log "ERROR" "Failed to start service: %SERVICE%"
    exit /b 1
)

call :log "INFO" "Service deployed: %SERVICE%"
exit /b 0

:start_monitoring
call :log "INFO" "Starting monitoring system..."

:: Start monitoring services
start "FAB_Monitor" /MIN powershell -NoProfile -ExecutionPolicy Bypass -Command "while($true) { Get-Process | Out-File -Append '%ROOT%logs\system_metrics.log'; Start-Sleep -Seconds 60 }"
if %ERRORLEVEL% NEQ 0 (
    call :log "ERROR" "Failed to start monitoring"
    exit /b 1
)

call :log "INFO" "Monitoring system started"
exit /b 0

:self_heal
call :log "INFO" "Running self-healing routine..."

:: System file check
call :log "INFO" "Running system file check..."
sfc /scannow /offbootdir=%SystemDrive%\ /offwindir=%SystemRoot% >nul 2>&1

:: DISM repair
call :log "INFO" "Running DISM repair..."
DISM /Online /Cleanup-Image /RestoreHealth >nul 2>&1

:: Auto-update if internet is available
if "!OFFLINE_MODE!"=="0" (
    call :log "INFO" "Checking for updates..."
    powershell -Command "Invoke-WebRequest -Uri 'https://fabrikage.example.com/update/check' -UseBasicParsing" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        call :log "INFO" "Updates available, applying..."
        call :apply_updates
    ) else (
        call :log "INFO" "System is up to date"
    )
) else (
    call :log "WARN" "Skipping update check (offline mode)"
)

exit /b 0

:apply_updates
call :log "INFO" "Applying system updates..."

:: Download and apply updates
powershell -Command "
    $updateUrl = 'https://fabrikage.example.com/updates/latest.zip';
    $tempFile = [System.IO.Path]::GetTempFileName() + '.zip';
    try {
        Invoke-WebRequest -Uri $updateUrl -OutFile $tempFile;
        Expand-Archive -Path $tempFile -DestinationPath '%ROOT%' -Force;
        Remove-Item -Path $tempFile -Force;
        exit 0
    } catch {
        Write-Error $_.Exception.Message;
        exit 1
    }
"

if %ERRORLEVEL% NEQ 0 (
    call :log "ERROR" "Failed to apply updates"
    exit /b 1
)

call :log "INFO" "Updates applied successfully"
exit /b 0

:show_progress <seconds>
setlocal
set "seconds=%~1"
if "%seconds%"=="" set "seconds=5"

echo [                    ] 0%%
for /l %%i in (1,1,20) do (
    ping -n 2 127.0.0.1 >nul
    set /a "percent=%%i*5"
    set "progress="
    for /l %%j in (1,1,%%i) do set "progress=!progress!#"
    set "remaining="
    set /a "remaining=20-%%i"
    for /l %%k in (1,1,!remaining!) do set "remaining=!remaining! "
    <nul set /p "=!progress!!remaining! !percent!%%`r"
)
echo.
endlocal
exit /b 0

:error_handling
call :log "ERROR" "An unexpected error occurred"
call :log "DEBUG" "Error details: %ERRORLEVEL%"
exit /b 1