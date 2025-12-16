#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Sets up secure SFTP transfer with scheduled task and email notifications
.DESCRIPTION
    This script:
    1. Creates necessary directories
    2. Sets up environment variables
    3. Configures email notifications
    4. Creates a scheduled task
.NOTES
    Version: 1.0
    Author: Enterprise Automation Team
#>

param (
    [string]$SmtpServer = "smtp.tel1.nl",
    [string]$EmailTo = "x@tel1.nl",
    [string]$EmailFrom = "noreply@tel1.nl",
    [int]$SmtpPort = 587,
    [string]$SmtpUser,
    [string]$SmtpPassword,
    [string]$ScheduledTaskName = "Enterprise SFTP Sync",
    [string]$LocalPath = "D:\\local\\path",
    [string]$RemotePath = "/remote/path"
)

# Ensure secure directory exists
$secureDir = "$PSScriptRoot"
if (-not (Test-Path $secureDir)) {
    New-Item -ItemType Directory -Path $secureDir -Force | Out-Null
}

# 1. Create SSH directory and generate keys
$sshDir = "$env:USERPROFILE\\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    icacls $sshDir /inheritance:r
    icacls $sshDir /grant:r "$env:USERNAME:(OI)(CI)F"
}

# 2. Generate SSH key if it doesn't exist
$keyPath = "$sshDir\\id_rsa_enterprise"
if (-not (Test-Path $keyPath)) {
    Write-Host "Generating new SSH key pair..."
    ssh-keygen -t rsa -b 4096 -f $keyPath -N '""' -C "$env:USERNAME@enterprise-sftp-$(Get-Date -Format 'yyyyMMdd')"
    
    # Display public key for server setup
    $publicKey = Get-Content "$keyPath.pub"
    Write-Host "`n[ACTION REQUIRED] Add this public key to the server's ~/.ssh/authorized_keys:`n"
    Write-Host $publicKey -ForegroundColor Green
    Write-Host "`nPress any key after adding the key to the server..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

# 3. Set environment variables
$envVars = @{
    "WINSCP_HOST" = "45.87.81.214"
    "WINSCP_PORT" = "65002"
    "WINSCP_USER" = "u972026834"
    "WINSCP_KEY_PATH" = $keyPath
    "WINSCP_EMAIL_TO" = $EmailTo
    "WINSCP_EMAIL_FROM" = $EmailFrom
    "WINSCP_SMTP_SERVER" = $SmtpServer
    "WINSCP_SMTP_PORT" = $SmtpPort
    "WINSCP_SMTP_USER" = $SmtpUser
    "WINSCP_SMTP_PASS" = $SmtpPassword
}

foreach ($var in $envVars.GetEnumerator()) {
    [System.Environment]::SetEnvironmentVariable($var.Key, $var.Value, [System.EnvironmentVariableTarget]::Machine)
    [System.Environment]::SetEnvironmentVariable($var.Key, $var.Value, [System.EnvironmentVariableTarget]::User)
}

# 4. Create the transfer script with email notifications
$transferScript = @"
@echo off
setlocal enabledelayedexpansion

:: Configuration
set "LOG_DIR=D:\logs\sftp_transfers"
set "TIMESTAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "LOG_FILE=%LOG_DIR%\transfer_!TIMESTAMP!.log"
set "LOCK_FILE=%TEMP%\sftp_transfer.lock"

:: Create log directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Check if another instance is running
if exist "%LOCK_FILE%" (
    echo Another instance is already running. Exiting. >> "%LOG_DIR%\error_!TIMESTAMP!.log"
    exit /b 1
) else (
    echo %DATE% %TIME% > "%LOCK_FILE%"
)

:: Cleanup old logs (keep last 30 days)
forfiles /p "%LOG_DIR%" /m *.log /d -30 /c "cmd /c del @path"

echo [%DATE% %TIME%] Starting SFTP transfer >> "%LOG_FILE%"

:: Execute WinSCP with error handling
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /console ^
  /command ^
    "open sftp://%WINSCP_USER%@%WINSCP_HOST%:%WINSCP_PORT% -hostkey=`"*`" -privatekey=`"%WINSCP_KEY_PATH%.ppk`"" ^
    "synchronize remote "$LocalPath" "$RemotePath"" ^
    "option transfer parallel=8" ^
    "option transfer resume=on" ^
    "option transfer timeout=300" ^
    "log "%LOG_FILE%"" ^
    "option loglevel=2" ^
    "exit"

set "RESULT=%ERRORLEVEL%"

:: Send email notification
if "%RESULT%"=="0" (
    set "SUBJECT=SFTP Transfer Succeeded"
    set "BODY=The scheduled SFTP transfer completed successfully.^nLog: %LOG_FILE%"
) else (
    set "SUBJECT=SFTP Transfer Failed (Error: %RESULT%)"
    set "BODY=The scheduled SFTP transfer failed with error code %RESULT%.^nLog: %LOG_FILE%"
)

:: Send email using PowerShell
powershell -Command "
    `$ErrorActionPreference = 'Stop'
    try {
        `$smtp = New-Object Net.Mail.SmtpClient('%WINSCP_SMTP_SERVER>', %WINSCP_SMTP_PORT%)
        `$smtp.EnableSsl = `$true
        `$smtp.Credentials = New-Object System.Net.NetworkCredential('%WINSCP_SMTP_USER%', '%WINSCP_SMTP_PASS%')
        
        `$mail = New-Object Net.Mail.MailMessage
        `$mail.From = '%WINSCP_EMAIL_FROM%'
        `$mail.To.Add('%WINSCP_EMAIL_TO%')
        `$mail.Subject = '$SUBJECT'
        `$mail.Body = '$BODY'
        
        `$smtp.Send(`$mail)
        'Email notification sent successfully' | Out-File -Append '%LOG_FILE%'
    } catch {
        `$_.Exception.Message | Out-File -Append '%LOG_DIR%\email_error_%TIMESTAMP%.log'
    }"

:: Cleanup
if exist "%LOCK_FILE%" del "%LOCK_FILE%"

endlocal
exit /b %RESULT%
"@

$transferScriptPath = "$secureDir\run_secure_transfer.cmd"
$transferScript | Out-File -FilePath $transferScriptPath -Encoding ASCII

# 5. Create scheduled task
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$transferScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Configure task to run with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the task
Register-ScheduledTask -TaskName $ScheduledTaskName `
                      -Action $action `
                      -Trigger $trigger `
                      -Settings $settings `
                      -Principal $principal `
                      -Force | Out-Null

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "- Scheduled task '$ScheduledTaskName' has been created"
Write-Host "- Transfer script: $transferScriptPath"
Write-Host "- Logs will be stored in: D:\logs\sftp_transfers"
Write-Host "- Email notifications will be sent to: $EmailTo"

# 6. Instructions for PPK conversion
Write-Host "`n[IMPORTANT] Convert the private key to PPK format:"
Write-Host "1. Open PuTTYgen"
Write-Host "2. Load the private key: $keyPath"
Write-Host "3. Click 'Save private key' and save as: $keyPath.ppk"
Write-Host "4. Set appropriate permissions on the .ppk file"

# 7. Test the setup
$test = Read-Host "`nWould you like to test the setup now? (Y/N)"
if ($test -eq 'Y' -or $test -eq 'y') {
    & $transferScriptPath
}
