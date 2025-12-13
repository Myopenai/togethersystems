@echo off
setlocal enabledelayedexpansion

:: ============================================
:: ENHANCED ACTIV RULE VERIFICATION SCRIPT
:: ============================================
:: This script verifies the ACTIV rule system and related components
:: Version: 1.1.0
:: Last Updated: 2025-12-10

:: Set console window title
title ACTIV Rule System Verification - %DATE% %TIME%

:: Set color variables
set "COLOR_RED=91"
set "COLOR_GREEN=92"
set "COLOR_YELLOW=93"
set "COLOR_BLUE=94"
set "COLOR_RESET=0"

:: Function to print colored text
:colorEcho
    echo [%TIME%] %~1
    exit /b

:: Initialize counters
set "PASS_COUNT=0"
set "WARN_COUNT=0"
set "FAIL_COUNT=0"
set "TOTAL_TESTS=0"

:: Start verification
echo.
echo ============================================
echo  ACTIV RULE SYSTEM VERIFICATION TOOL
echo  %DATE% %TIME%
echo ============================================
echo.

:: Test 1: Check for .cursorrules file
set /a TOTAL_TESTS+=1
if exist ".cursorrules" (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] .cursorrules file exists"
) else (
    set /a FAIL_COUNT+=1
    call :colorEcho "[FAIL] .cursorrules file is missing"
    goto :summary
)

:: Test 2: Verify ACTIV rule content
set /a TOTAL_TESTS+=1
findstr /i /c:"INDUSTRIELLE FABRIKATIONS-ROUTINE" ".cursorrules" >nul
if %ERRORLEVEL% EQU 0 (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] INDUSTRIELLE FABRIKATIONS-ROUTINE section found"
) else (
    set /a FAIL_COUNT+=1
    call :colorEcho "[FAIL] INDUSTRIELLE FABRIKATIONS-ROUTINE section missing"
)

:: Test 3: Check for required settings directory
set /a TOTAL_TESTS+=1
if exist "Settings" (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] Settings directory exists"
    
    :: Check for required settings files
    set "REQUIRED_FILES=INDUSTRIAL-FABRICATION-ROUTINE.json settings-manifest.json PRE-CODE-VERIFICATION-SYSTEM.json"
    set "MISSING_FILES="
    
    for %%f in (%REQUIRED_FILES%) do (
        if not exist "Settings\%%~f" (
            set "MISSING_FILES=!MISSING_FILES! %%~f"
        )
    )
    
    if "!MISSING_FILES!"=="" (
        set /a PASS_COUNT+=1
        call :colorEcho "[PASS] All required settings files found"
    ) else (
        set /a WARN_COUNT+=1
        call :colorEcho "[WARN] Missing settings files:!MISSING_FILES!"
    )
) else (
    set /a FAIL_COUNT+=1
    call :colorEcho "[FAIL] Settings directory is missing"
)

:: Test 4: Check system requirements
set /a TOTAL_TESTS+=1
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] Node.js is installed"
) else (
    set /a WARN_COUNT+=1
    call :colorEcho "[WARN] Node.js is not installed (required for full functionality)"
)

:: Test 5: Check for required directories
set /a TOTAL_TESTS+=1
set "REQUIRED_DIRS=scripts tools src ci"
set "MISSING_DIRS="

for %%d in (%REQUIRED_DIRS%) do (
    if not exist "%%~d" (
        set "MISSING_DIRS=!MISSING_DIRS! %%~d"
    )
)

if "!MISSING_DIRS!"=="" (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] All required directories exist"
) else (
    set /a WARN_COUNT+=1
    call :colorEcho "[WARN] Missing directories:!MISSING_DIRS!"
)

:: Test 6: Check for main application files
set /a TOTAL_TESTS+=1
set "MAIN_FILES=index.html package.json"
set "MISSING_MAIN_FILES="

for %%f in (%MAIN_FILES%) do (
    if not exist "%%~f" (
        set "MISSING_MAIN_FILES=!MISSING_MAIN_FILES! %%~f"
    )
)

if "!MISSING_MAIN_FILES!"=="" (
    set /a PASS_COUNT+=1
    call :colorEcho "[PASS] All main application files found"
) else (
    set /a WARN_COUNT+=1
    call :colorEcho "[WARN] Missing main files:!MISSING_MAIN_FILES!"
)

:: Generate summary
:summary
echo.
echo ============================================
echo  VERIFICATION SUMMARY
echo ============================================
echo.
echo [%TIME%] Tests Run:    %TOTAL_TESTS%
echo [%TIME%] Passed:      %PASS_COUNT%
echo [%TIME%] Warnings:    %WARN_COUNT%
echo [%TIME%] Failed:      %FAIL_COUNT%
echo.

if %FAIL_COUNT% GTR 0 (
    call :colorEcho "[%TIME%] [RESULT] VERIFICATION FAILED with %FAIL_COUNT% critical errors"
    exit /b 1
) else if %WARN_COUNT% GTR 0 (
    call :colorEcho "[%TIME%] [RESULT] VERIFICATION COMPLETED with %WARN_COUNT% warnings"
    exit /b 0
) else (
    call :colorEcho "[%TIME%] [RESULT] VERIFICATION PASSED successfully"
    exit /b 0
)

exit /b 0
