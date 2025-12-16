@echo off
setlocal enabledelayedexpansion

:: Multi-Industry Docs Deployment Helper
:: =========================================

cls
echo ================================================
echo Multi-Industry Docs Professional+++xxxl Kit
echo DEPLOYMENT HELPER
echo ================================================
echo.

set "SOURCE_PATH=D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\docs\multi-industry-docs"
set "REMOTE_HOST=45.87.81.214"
set "REMOTE_PORT=65002"
set "REMOTE_USER=u972026836"
set "REMOTE_PASS=a~B9no3FMhqFl*~*"
set "REMOTE_PATH=/public_html"

echo Deployment Configuration:
echo   Source: %SOURCE_PATH%
echo   Target: sftp://%REMOTE_HOST%:%REMOTE_PORT%%REMOTE_PATH%
echo   User: %REMOTE_USER%
echo.

:: Check if source exists
if not exist "%SOURCE_PATH%" (
    echo ERROR: Source path not found!
    echo Path: %SOURCE_PATH%
    pause
    exit /b 1
)

:: Count files
setlocal enabledelayedexpansion
set /a FILE_COUNT=0
for /r "%SOURCE_PATH%" %%f in (*) do (
    set /a FILE_COUNT=!FILE_COUNT!+1
)
echo Files to deploy: !FILE_COUNT!
echo.

:: Show deployment options
echo ================================================
echo DEPLOYMENT OPTIONS
echo ================================================
echo.
echo 1. WinSCP (Recommended - requires installation)
echo 2. Create Deployment Package (ZIP)
echo 3. Generate Batch Script for Manual Upload
echo 4. Open DEPLOYMENT_GUIDE.md
echo 5. Exit
echo.

set /p CHOICE="Select option (1-5): "

if "%CHOICE%"=="1" (
    goto WINSCP_DEPLOY
) else if "%CHOICE%"=="2" (
    goto CREATE_PACKAGE
) else if "%CHOICE%"=="3" (
    goto BATCH_SCRIPT
) else if "%CHOICE%"=="4" (
    goto OPEN_GUIDE
) else if "%CHOICE%"=="5" (
    goto END
) else (
    echo Invalid choice. Please try again.
    pause
    goto DEPLOYMENT_OPTIONS
)

:WINSCP_DEPLOY
echo.
echo ================================================
echo WinSCP Deployment
echo ================================================
echo.
echo Checking for WinSCP installation...
echo.

set "WINSCP_PATH1=C:\Program Files (x86)\WinSCP\WinSCP.com"
set "WINSCP_PATH2=C:\Program Files\WinSCP\WinSCP.com"

if exist "%WINSCP_PATH1%" (
    echo WinSCP found at: %WINSCP_PATH1%
    echo Starting deployment...
    echo.
    "%WINSCP_PATH1%" /script="%CD%\winscp_deploy_session.txt" /log="%CD%\deployment.log"
    echo.
    echo Deployment completed. Check deployment.log for details.
    pause
    goto END
) else if exist "%WINSCP_PATH2%" (
    echo WinSCP found at: %WINSCP_PATH2%
    echo Starting deployment...
    echo.
    "%WINSCP_PATH2%" /script="%CD%\winscp_deploy_session.txt" /log="%CD%\deployment.log"
    echo.
    echo Deployment completed. Check deployment.log for details.
    pause
    goto END
) else (
    echo WinSCP not found.
    echo.
    echo Please install WinSCP from: https://winscp.net/
    echo.
    echo After installation, run this script again.
    echo.
    pause
    goto DEPLOYMENT_OPTIONS
)

:CREATE_PACKAGE
echo.
echo ================================================
echo Creating Deployment Package (ZIP)
echo ================================================
echo.

set "PACKAGE_NAME=MultiIndustryDocs_Deployment_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.zip"

echo Creating ZIP archive: %PACKAGE_NAME%
echo Please wait...
echo.

powershell -NoProfile -Command "Compress-Archive -Path '%SOURCE_PATH%' -DestinationPath '%CD%\%PACKAGE_NAME%' -Force -CompressionLevel Optimal"

if %ERRORLEVEL% equ 0 (
    echo.
    echo SUCCESS: Package created: %PACKAGE_NAME%
    echo Size: approximately 850 MB
    echo.
    echo You can now upload this ZIP to the server and extract it.
) else (
    echo.
    echo ERROR: Failed to create package.
)

pause
goto DEPLOYMENT_OPTIONS

:BATCH_SCRIPT
echo.
echo ================================================
echo Generate Batch Upload Script
echo ================================================
echo.

echo Generating script for manual SFTP upload...
echo.

setlocal enabledelayedexpansion
set "SCRIPT_FILE=manual_upload_script.bat"

(
    echo @echo off
    echo REM Manual SFTP Upload Script
    echo REM Target: %REMOTE_HOST%:%REMOTE_PORT%/%REMOTE_PATH%
    echo REM User: %REMOTE_USER%
    echo.
    echo echo Please use one of the following tools to upload:
    echo echo.
    echo echo OPTION 1: WinSCP Command Line
    echo echo   winscp.com /script=winscp_deploy_session.txt
    echo echo.
    echo echo OPTION 2: PuTTY PSFTP
    echo echo   psftp %REMOTE_USER%@%REMOTE_HOST% -P %REMOTE_PORT% -pw PASSWORD
    echo echo   cd /public_html
    echo echo   mput -r "*"
    echo echo.
    echo echo OPTION 3: FileZilla
    echo echo   - Download from https://filezilla-project.org/
    echo echo   - Create new SFTP session with credentials
    echo echo   - Upload files to /public_html
    echo echo.
    echo pause
) > "%SCRIPT_FILE%"

echo Script created: %SCRIPT_FILE%
echo.
echo You can now use this script or one of the manual methods.
pause
goto DEPLOYMENT_OPTIONS

:OPEN_GUIDE
echo.
echo Opening DEPLOYMENT_GUIDE.md...
echo.

if exist "%CD%\DEPLOYMENT_GUIDE.md" (
    start notepad "%CD%\DEPLOYMENT_GUIDE.md"
) else (
    echo DEPLOYMENT_GUIDE.md not found in current directory.
)

pause
goto DEPLOYMENT_OPTIONS

:END
echo.
echo ================================================
echo Thank you for using Multi-Industry Docs Kit
echo ================================================
echo.
echo For support, visit: https://srv480-files.hstgr.io/
echo.

endlocal
exit /b 0
