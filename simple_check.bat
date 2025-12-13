@echo off
echo === SIMPLE FABRIKAGE CHECK ===
echo.
echo Current Directory: %CD%
echo.

echo === Checking for teaching.bat ===
if exist "teaching.bat" (
    echo teaching.bat FOUND
    echo.
    echo === Running teaching.bat ===
    start "FAB_Teaching" /MIN "teaching.bat"
    timeout /t 5 >nul
) else (
    echo teaching.bat NOT FOUND
)

echo.
echo === Checking for FABRIKAGE services ===
tasklist /FI "WINDOWTITLE eq FAB_*" /FO TABLE

echo.
echo === Checking for fabrikage_control.bat ===
if exist "fabrikage_control.bat" (
    echo fabrikage_control.bat FOUND
    echo.
    echo === Running fabrikage_control.bat status ===
    call "fabrikage_control.bat" status
) else (
    echo fabrikage_control.bat NOT FOUND
)

echo.
echo === Checking for services directory ===
if exist "services" (
    echo services directory FOUND
    echo.
    echo === Listing services ===
    dir /b services\*.bat
) else (
    echo services directory NOT FOUND
)

echo.
pause
