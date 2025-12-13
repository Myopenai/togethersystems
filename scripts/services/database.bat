@echo off 
:start 
echo [%DATE% %TIME%] Database is running... 
timeout /t 10 >nul 
goto start 
