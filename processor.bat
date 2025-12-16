@echo off 
setlocal enabledelayedexpansion 
 
:main_loop 
    echo [ 1:00:27,86] processor service running... 
    timeout /t 30 /nobreak >nul 
goto main_loop 
