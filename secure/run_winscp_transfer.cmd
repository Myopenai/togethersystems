@echo off
setlocal enabledelayedexpansion

REM Check if required environment variables are set
if "%WINSCP_HOST%"=="" (
    echo Error: WINSCP_HOST environment variable not set.
    echo Please run set_env.cmd first.
    exit /b 1
)

if not exist "%WINSCP_KEY_PATH%" (
    echo Error: SSH private key not found at %WINSCP_KEY_PATH%
    exit /b 1
)

set "TIMESTAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "LOG_FILE=D:\logs\winscp_!TIMESTAMP!.log"

REM Create logs directory if it doesn't exist
if not exist "D:\logs" mkdir "D:\logs"

echo Starting WinSCP transfer at %DATE% %TIME%
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /command ^
    "open sftp://%WINSCP_USER%@%WINSCP_HOST%:%WINSCP_PORT% -hostkey="*" -privatekey="%WINSCP_KEY_PATH%.ppk"" ^
    "synchronize remote D:\local\path /remote/path" ^
    "option transfer parallel=8" ^
    "option transfer resume=on" ^
    "option transfer timeout=300" ^
    "log "%LOG_FILE%"" ^
    "option loglevel=2" ^
    "exit"

if %ERRORLEVEL% EQU 0 (
    echo Transfer completed successfully.
) else (
    echo Transfer failed with error code %ERRORLEVEL%.
    echo Check the log file: %LOG_FILE%
)

endlocal
