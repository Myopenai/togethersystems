@echo off
echo Kompiliere ostosos-server.exe neu...
cd builds\go-executable
go build -o ostosos-server.exe main.go
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Server erfolgreich kompiliert!
    echo.
    echo Server starten mit: ostosos-server.exe
    echo Oder Doppelklick auf ostosos-server.exe
) else (
    echo.
    echo ❌ Kompilierung fehlgeschlagen!
)
pause



