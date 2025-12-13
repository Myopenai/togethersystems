@echo off 
:start 
echo [%DATE% %TIME%] Monitoring system... 
timeout /t 10 >nul 
goto start 
