@echo off
setlocal enabledelayedexpansion

:: ============================================
:: AUTOMATED ACTIV CONTROL SYSTEM INSTALLER
:: ============================================

:: Set paths
set "ROOT_DIR=%~dp0"
set "DOWNLOADS=%TEMP%\activ_setup"
set "NODE_URL=https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
set "PYTHON_URL=https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe"
set "GIT_URL=https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.3/Git-2.41.0.3-64-bit.exe"
set "SEVENZIP_URL=https://www.7-zip.org/a/7z2301-x64.exe"

:: Create required directories
for %%d in ("%ROOT_DIR%logs" "%ROOT_DIR%config" "%ROOT_DIR%backups" "%DOWNLOADS%") do (
    if not exist "%%~d" mkdir "%%~d"
)

:: Initialize logging
set "LOG_FILE=%ROOT_DIR%logs\install_%DATE:/=%.log"
echo [%TIME%] Starting installation > "%LOG_FILE%"

:: Function to download files
:download
echo [%TIME%] Downloading %~1... >> "%LOG_FILE%"
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%~1', '%~2')" >> "%LOG_FILE%" 2>&1
exit /b %ERRORLEVEL%

:: Function to install MSI
:install_msi
echo [%TIME%] Installing %~1... >> "%LOG_FILE%"
start /wait msiexec /i "%~1" /qn /norestart >> "%LOG_FILE%" 2>&1
exit /b %ERRORLEVEL%

:: Function to install EXE
:install_exe
echo [%TIME%] Installing %~1... >> "%LOG_FILE%"
start /wait "" "%~1" %~2 >> "%LOG_FILE%" 2>&1
exit /b %ERRORLEVEL%

:: Check and install Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%TIME%] Installing Node.js... >> "%LOG_FILE%"
    call :download "%NODE_URL%" "%DOWNLOADS%\nodejs.msi"
    call :install_msi "%DOWNLOADS%\nodejs.msi"
    set "NODE_INSTALLED=1"
) else (
    echo [%TIME%] Node.js is already installed >> "%LOG_FILE%"
)

:: Check and install Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%TIME%] Installing Python... >> "%LOG_FILE%"
    call :download "%PYTHON_URL%" "%DOWNLOADS%\python_installer.exe"
    call :install_exe "%DOWNLOADS%\python_installer.exe" "/quiet InstallAllUsers=1 PrependPath=1"
) else (
    echo [%TIME%] Python is already installed >> "%LOG_FILE%"
)

:: Check and install Git
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%TIME%] Installing Git... >> "%LOG_FILE%"
    call :download "%GIT_URL%" "%DOWNLOADS%\git_installer.exe"
    call :install_exe "%DOWNLOADS%\git_installer.exe" "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS"
) else (
    echo [%TIME%] Git is already installed >> "%LOG_FILE%"
)

:: Check and install 7-Zip
where 7z >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%TIME%] Installing 7-Zip... >> "%LOG_FILE%"
    call :download "%SEVENZIP_URL%" "%DOWNLOADS%\7z_installer.exe"
    call :install_exe "%DOWNLOADS%\7z_installer.exe" "/S"
) else (
    echo [%TIME%] 7-Zip is already installed >> "%LOG_FILE%"
)

:: Create default configuration
if not exist "%ROOT_DIR%config\fabrikage.cfg" (
    echo [%TIME%] Creating default configuration >> "%LOG_FILE%"
    (
        echo MODE=ACTIVE
        echo BACKUP_ENABLED=1
        echo BACKUP_RETENTION_DAYS=7
        echo LOG_RETENTION_DAYS=30
        echo MONITOR_INTERVAL=300
    ) > "%ROOT_DIR%config\fabrikage.cfg"
)

:: Create monitor script
if not exist "%ROOT_DIR%monitor.bat" (
    echo [%TIME%] Creating monitor script >> "%LOG_FILE%"
    (
        echo @echo off
        echo setlocal enabledelayedexpansion
        echo set "LOG_FILE=%%~dp0logs\monitor_%%DATE:/=%%_%%TIME::=%%..log"
        echo :loop
        echo [%%TIME%%] System check >> "!LOG_FILE!"
        echo timeout /t 300 ^>nul
        echo goto loop
    ) > "%ROOT_DIR%monitor.bat"
)

:: Create activ_control.bat
echo [%TIME%] Creating ACTIV Control System >> "%LOG_FILE%"
(
    echo @echo off
    echo setlocal enabledelayedexpansion
    echo set "ROOT_DIR=%%~dp0"
    echo set "LOG_DIR=%%ROOT_DIR%%logs"
    echo set "CONFIG_DIR=%%ROOT_DIR%%config"
    echo set "BACKUP_DIR=%%ROOT_DIR%%backups"
    echo set "TEMP_DIR=%%TEMP%%\fabrikage"
    echo set "TIMESTAMP=%%DATE:~-4,4%%%%DATE:~-10,2%%%%DATE:~-7,2%%_%%TIME:~0,2%%%%TIME:~3,2%%%%TIME:~6,2%%"
    echo set "TIMESTAMP=!TIMESTAMP: =0!"
    echo 
    echo :: Ensure directories exist
    echo for %%%%d in ^("%%LOG_DIR%%" "%%CONFIG_DIR%%" "%%BACKUP_DIR%%" "%%TEMP_DIR%%"^) do ^(
    echo     if not exist "%%%%~d" mkdir "%%%%~d"
    echo ^)
    echo 
    echo :: Start services
    echo start "" "%%ROOT_DIR%%monitor.bat"
    echo 
    echo :: Open dashboard
    echo start http://localhost:3000
    echo 
    echo :: Keep console open
    echo pause
) > "%ROOT_DIR%activ_control.bat"

:: Start the system
echo [%TIME%] Starting ACTIV Control System >> "%LOG_FILE%"
start "" "%ROOT_DIR%activ_control.bat"

echo [%TIME%] Installation completed successfully >> "%LOG_FILE%"
echo ACTIV Control System has been installed and started successfully!
timeout /t 5 >nul
exit /b 0