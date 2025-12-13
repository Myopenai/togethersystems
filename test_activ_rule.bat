@echo off
setlocal enabledelayedexpansion

echo =============================================
echo ACTIV RULE SYSTEM VERIFICATION TOOL
echo =============================================
echo [%DATE% %TIME%] Starting system verification...

:: Check for required files
echo.
echo [1/5] Verifying system files...
if exist ".cursorrules" (
    echo ✓ .cursorrules found
) else (
    echo ✗ Error: .cursorrules not found!
    exit /b 1
)

if exist "Settings\INDUSTRIAL-FABRICATION-ROUTINE.json" (
    echo ✓ INDUSTRIAL-FABRICATION-ROUTINE.json found
) else (
    echo ⚠ Warning: INDUSTRIAL-FABRICATION-ROUTINE.json not found
)

:: Test basic functionality
echo.
echo [2/5] Testing basic functionality...
set "ERROR_COUNT=0"

:: Test 1: Check if system is responsive
ping -n 1 127.0.0.1 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ System is responsive
) else (
    echo ✗ System is not responding
    set /a ERROR_COUNT+=1
)

:: Test 2: Check for required environment variables
if defined PATH (
    echo ✓ PATH environment variable is set
) else (
    echo ✗ PATH environment variable is not set
    set /a ERROR_COUNT+=1
)

:: Test 3: Check for Node.js (if applicable)
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js is installed
) else (
    echo ⚠ Node.js is not installed (optional but recommended)
)

:: Run system tests
echo.
echo [3/5] Running system tests...

:: Test 4: Check for common script directories
set "SCRIPT_DIRS=scripts tools src"
set "MISSING_DIRS="

for %%d in (%SCRIPT_DIRS%) do (
    if not exist "%%~d" (
        set "MISSING_DIRS=!MISSING_DIRS! %%~d"
    )
)

if "!MISSING_DIRS!"=="" (
    echo ✓ All standard script directories found
) else (
    echo ⚠ Missing script directories:!MISSING_DIRS!
)

:: Test 5: Check for main application files
set "MAIN_FILES=index.html package.json"
set "MISSING_FILES="

for %%f in (%MAIN_FILES%) do (
    if not exist "%%~f" (
        set "MISSING_FILES=!MISSING_FILES! %%~f"
    )
)

if "!MISSING_FILES!"=="" (
    echo ✓ All main application files found
) else (
    echo ⚠ Missing main files:!MISSING_FILES!
)

:: Run validation
echo.
echo [4/5] Validating system integrity...

:: Check for common issues in .cursorrules
findstr /i /c:"ACTIV" ".cursorrules" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ ACTIV rule is properly defined
) else (
    echo ✗ ACTIV rule definition not found in .cursorrules
    set /a ERROR_COUNT+=1
)

:: Check for required sections in .cursorrules
set "REQUIRED_SECTIONS="
for %%s in ("INDUSTRIELLE FABRIKATIONS-ROUTINE" "FEHLER-PRÄVENTION" "WORKFLOW") do (
    findstr /i /c:"%%~s" ".cursorrules" >nul
    if not %ERRORLEVEL% EQU 0 (
        set "REQUIRED_SECTIONS=!REQUIRED_SECTIONS! %%~s"
    )
)

if "!REQUIRED_SECTIONS!"=="" (
    echo ✓ All required sections found in .cursorrules
) else (
    echo ✗ Missing required sections in .cursorrules:!REQUIRED_SECTIONS!
    set /a ERROR_COUNT+=1
)

:: Final report
echo.
echo [5/5] Generating final report...
echo.
echo =============================================
echo VERIFICATION COMPLETE
if %ERROR_COUNT% EQU 0 (
    echo ✓ System verification passed with no critical errors
) else (
    echo ✗ System verification found %ERROR_COUNT% critical error(s)
)
echo =============================================
echo [%DATE% %TIME%] Test completed

:: Return appropriate exit code
if %ERROR_COUNT% GTR 0 exit /b 1
exit /b 0
