@echo off 
setlocal enabledelayedexpansion 
 
:main_loop 
    echo [ 1:00:28,08] validator service running... 
    timeout /t 30 /nobreak >nul 
goto main_loop 
