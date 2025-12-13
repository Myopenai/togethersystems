@echo off
:: ============================================
:: FABRIKAGE SYSTEM DIAGNOSTIC TOOL
:: ============================================

setlocal enabledelayedexpansion

:: Configuration
set "LOG_FILE=system_check_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%.log"
set "LOG_FILE=!LOG_FILE: =0!"

:: Log function
:log
echo [%TIME%] %* >> "!LOG_FILE!"
echo %*
exit /b 0

call :log "=== STARTING SYSTEM DIAGNOSTIC ==="

:: 1. Check teaching.bat status
call :log "Checking teaching.bat status..."
tasklist /FI "WINDOWTITLE eq teaching.bat" /FO TABLE

:: 2. Check FABRIKAGE services
call :log "`n=== FABRIKAGE SERVICES STATUS ==="
tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE

:: 3. Check system files
call :log "`n=== SYSTEM FILES CHECK ==="
set "MISSING_FILES=0"

for %%f in (
    "teaching.bat"
    "fabrikage_control.bat"
    "services\processor.bat"
    "services\validator.bat"
    "services\deployer.bat"
    "services\monitor.bat"
) do (
    if exist "%%~f" (
        call :log "Found: %%~f"
    ) else (
        call :log "MISSING: %%~f"
        set /a "MISSING_FILES+=1"
    )
)

:: 4. Start FABRIKAGE system if possible
if exist "fabrikage_control.bat" (
    call :log "`n=== STARTING FABRIKAGE SYSTEM ==="
    call :log "Found fabrikage_control.bat, attempting to start services..."
    start "FAB_Control" /MIN "fabrikage_control.bat" start
    timeout /t 3 >nul
    
    :: Verify services started
    call :log "`n=== VERIFYING SERVICES ==="
    tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE
    
    :: Check if any services are running
    tasklist /FI "WINDOWTITLE eq FAB_*" /FI "STATUS eq RUNNING" | find "FAB_" >nul
    if errorlevel 1 (
        call :log "WARNING: No FABRIKAGE services are running"
        call :log "Trying to run teaching.bat directly..."
        if exist "teaching.bat" (
            start "FAB_Teaching" /MIN "teaching.bat"
            timeout /t 5 >nul
            tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE
        ) else (
            call :log "ERROR: teaching.bat not found!"
        )
    )
) else (
    call :log "`n=== SETUP REQUIRED ==="
    call :log "fabrikage_control.bat not found. Running teaching.bat setup..."
    if exist "teaching.bat" (
        start "FAB_Setup" /MIN "teaching.bat"
    ) else (
        call :log "ERROR: teaching.bat not found! Cannot proceed with setup."
    )
)

:: 5. Final status
call :log "`n=== DIAGNOSTIC COMPLETE ==="
call :log "Log file: %CD%\!LOG_FILE!"

echo.
echo ============================================
echo    FABRIKAGE SYSTEM DIAGNOSTIC COMPLETE
echo ============================================
echo.
echo Log file: %CD%\!LOG_FILE!
echo.

if %MISSING_FILES% GTR 0 (
    echo WARNING: %MISSING_FILES% required files are missing!
    echo Please run 'teaching.bat' to repair the installation.
) else (
    echo System check completed successfully.
)

echo.
pause
