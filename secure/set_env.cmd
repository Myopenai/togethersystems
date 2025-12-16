@echo off
REM Set environment variables for WinSCP
setx WINSCP_HOST "45.87.81.214"
setx WINSCP_PORT "65002"
setx WINSCP_USER "u972026834"
setx WINSCP_KEY_PATH "%USERPROFILE%\.ssh\id_rsa_enterprise"

echo Environment variables set successfully.
echo Please restart any open command prompts for changes to take effect.
