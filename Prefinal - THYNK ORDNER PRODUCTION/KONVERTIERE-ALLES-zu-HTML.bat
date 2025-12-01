@echo off
echo ================================================
echo   ALLE MARKDOWN-DATEIEN ZU HTML KONVERTIEREN
echo ================================================
echo.
echo Bitte warten...
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\convert-fast.ps1"

echo.
echo ================================================
echo   KONVERTIERUNG ABGESCHLOSSEN!
echo ================================================
echo.
pause

