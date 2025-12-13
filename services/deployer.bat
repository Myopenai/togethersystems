@echo off
setlocal enabledelayedexpansion

:: FABRIKAGE DEPLOYER SERVICE
:: =======================

set "SERVICE_NAME=FAB_Deployer"
set "VERSION=1.0.0"
set "LOG_FILE=%~dp0../logs/deployer_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.log"

title %SERVICE_NAME% v%VERSION%

echo [%TIME%] %SERVICE_NAME% v%VERSION% starting... >> "%LOG_FILE%"
echo [%TIME%] %SERVICE_NAME% v%VERSION% starting...

echo [%TIME%] Initializing deployer service... >> "%LOG_FILE%"

:main_loop
    echo [%TIME%] Deployer service is running... >> "%LOG_FILE%"
    timeout /t 30 /nobreak >nul
goto main_loop

:shutdown
echo [%TIME%] Shutting down %SERVICE_NAME%... >> "%LOG_FILE%"
echo [%TIME%] Shutting down %SERVICE_NAME%...
exit /b 0
