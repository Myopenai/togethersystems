#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs prerequisites for Startup Systems
.DESCRIPTION
    This script installs essential software and dependencies for Startup Systems.
    Includes: Git, Node.js, Python, Docker, Kubernetes tools, and development tools.
#>

# Configuration
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$installDir = "$env:ProgramFiles\StartupSystems"
$tempDir = "$env:TEMP\startup-systems"

# Create required directories
New-Item -ItemType Directory -Path $installDir, $tempDir -Force | Out-Null

# Install Chocolatey if not present
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install core development tools
$packages = @(
    "git",
    "nodejs-lts",
    "python",
    "docker-desktop",
    "kubernetes-cli",
    "kubectx",
    "helm",
    "minikube",
    "vscode",
    "postman",
    "wsl2",
    "ubuntu-2004"
)

foreach ($pkg in $packages) {
    choco install $pkg -y --no-progress
}

# Install WSL and set default version
wsl --install -d Ubuntu-20.04
wsl --set-default-version 2

Write-Host "Prerequisites installation completed successfully!" -ForegroundColor Green
Write-Host "Please restart your computer to complete the installation." -ForegroundColor Yellow
