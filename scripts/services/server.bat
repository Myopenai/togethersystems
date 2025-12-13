@echo off 
:start 
echo [%DATE% %TIME%] Server is running... 
timeout /t 10 >nul 
goto start 
