<#
.SYNOPSIS
    Rolls back the Fabrication System to the previous version
.DESCRIPTION
    Performs a rollback to the previous version of the Fabrication System
    by switching traffic back to the previous environment.
.NOTES
    Version: 1.0.0
    Last Updated: 2025-12-14
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Import required modules and configurations
$ErrorActionPreference = 'Stop'
$script:RollbackConfig = @{
    BlueEnvironment = @{
        Name = "FabricationSystem_Blue"
        Port = 8080
    }
    GreenEnvironment = @{
        Name = "FabricationSystem_Green"
        Port = 8081
    }
    LoadBalancerConfig = "$PSScriptRoot\Config\loadbalancer.json"
    BackupDir = "$PSScriptRoot\Backup"
}

# Ensure required directories exist
$null = New-Item -ItemType Directory -Path $script:RollbackConfig.BackupDir -Force
$null = New-Item -ItemType Directory -Path "$PSScriptRoot\Logs\Rollback" -Force

function Write-RollbackLog {
    param($Message, $Level = 'Info')
    $logMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff')] [$Level] $Message"
    Add-Content -Path "$PSScriptRoot\Logs\Rollback\rollback_$(Get-Date -Format 'yyyyMMdd').log" -Value $logMessage
    Write-Host $logMessage
}

function Get-CurrentEnvironment {
    if (-not (Test-Path $script:RollbackConfig.LoadBalancerConfig)) {
        throw "Load balancer configuration not found at $($script:RollbackConfig.LoadBalancerConfig)"
    }
    
    $config = Get-Content -Path $script:RollbackConfig.LoadBalancerConfig -Raw | ConvertFrom-Json
    return $config.ActiveEnvironment
}

function Test-EnvironmentHealth {
    param($Environment)
    
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($Environment.Port)/health" -Method Get -TimeoutSec 5
        return $health.Status -eq 'Healthy'
    } catch {
        Write-RollbackLog "Health check failed on port $($Environment.Port): $_" -Level 'Warning'
        return $false
    }
}

function Switch-Environment {
    param($TargetEnvironment)
    
    # Load current config
    $config = Get-Content -Path $script:RollbackConfig.LoadBalancerConfig -Raw | ConvertFrom-Json
    
    # Update config
    $config.ActiveEnvironment = $TargetEnvironment.Name
    $config.LastSwitchTime = (Get-Date).ToUniversalTime().ToString('o')
    
    # Save config
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $script:RollbackConfig.LoadBalancerConfig -Force
    
    Write-RollbackLog "Switched active environment to $($TargetEnvironment.Name)"
}

function Start-Rollback {
    Write-RollbackLog "Starting Fabrication System rollback"
    
    # Determine current and target environments
    $currentEnv = Get-CurrentEnvironment
    $targetEnv = if ($currentEnv -eq $script:RollbackConfig.BlueEnvironment.Name) {
        $script:RollbackConfig.GreenEnvironment
    } else {
        $script:RollbackConfig.BlueEnvironment
    }
    
    Write-RollbackLog "Current environment: $currentEnv"
    Write-RollbackLog "Target environment: $($targetEnv.Name)"
    
    # Check if target environment is healthy
    Write-RollbackLog "Checking health of $($targetEnv.Name)..."
    if (-not (Test-EnvironmentHealth -Environment $targetEnv)) {
        throw "Target environment $($targetEnv.Name) is not healthy. Cannot proceed with rollback."
    }
    
    # Perform the switch
    Write-RollbackLog "Initiating rollback to $($targetEnv.Name)..."
    Switch-Environment -TargetEnvironment $targetEnv
    
    # Verify the switch was successful
    $newEnv = Get-CurrentEnvironment
    if ($newEnv -ne $targetEnv.Name) {
        throw "Failed to switch to $($targetEnv.Name). Current environment is still $newEnv"
    }
    
    Write-RollbackLog "Rollback to $($targetEnv.Name) completed successfully"
}

# Main rollback process
try {
    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin -and -not $Force) {
        throw "This script requires administrator privileges. Please run as administrator or use -Force to override."
    }
    
    Start-Rollback
    exit 0
} catch {
    Write-RollbackLog "Rollback failed: $_" -Level 'Error'
    Write-RollbackLog $_.ScriptStackTrace -Level 'Error'
    exit 1
}
