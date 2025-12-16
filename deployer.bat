@echo off 
setlocal enabledelayedexpansion 
 
:main_loop 
    echo [ 1:00:28,34] deployer service running... 
    timeout /t 30 /nobreak >nul 
goto main_loop 
