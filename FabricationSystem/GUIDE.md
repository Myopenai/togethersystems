# Fabrication System - Complete Guide

## Table of Contents
1. [Verifying Installation](#verifying-installation)
2. [Switching Modes](#switching-modes)
3. [Managing Servers](#managing-servers)
4. [Custom Maintenance Tasks](#custom-maintenance-tasks)
5. [Troubleshooting](#troubleshooting)

## Verifying Installation

### Check Installation Status
```powershell
# Check if module is properly installed
Get-Module -ListAvailable -Name FabricationSystem

# Verify scheduled tasks
Get-ScheduledTask -TaskName "FabricationSystem-*" | Select-Object TaskName, State

# Check service status
Get-Service -Name FabricationSystem -ErrorAction SilentlyContinue
```

### Verify Logs
Logs are stored in: `D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem\Logs`

```powershell
# View latest log
Get-Content "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem\Logs\FabricationSystem-$(Get-Date -Format 'yyyyMMdd').log" -Tail 20
```

## Switching Modes

### From Active to Ruhestand
```powershell
# Stop Active mode
Stop-Process -Name "powershell" -Force -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*Start-FabricationActiveMode*" }

# Start Ruhestand mode
Start-Process powershell -ArgumentList '-NoExit -Command "& {Import-Module FabricationSystem; Start-FabricationRuhestandMode}"' -WindowStyle Normal
```

### From Ruhestand to Active
```powershell
# Stop Ruhestand mode
Stop-Process -Name "powershell" -Force -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*Start-FabricationRuhestandMode*" }

# Start Active mode
Start-Process powershell -ArgumentList '-NoExit -Command "& {Import-Module FabricationSystem; Start-FabricationActiveMode}"' -WindowStyle Normal
```

### Using Scheduled Tasks
```powershell
# Enable/Disable modes using scheduled tasks
Disable-ScheduledTask -TaskName "FabricationSystem-Active"
Enable-ScheduledTask -TaskName "FabricationSystem-Ruhestand"
```

## Managing Servers

### Add a New Server
1. Edit the `servers.json` file
2. Add a new server configuration:

```json
{
    "Name": "NewServer",
    "Address": "192.168.1.200",
    "Type": "Web",
    "Enabled": true,
    "DeploymentPaths": {
        "WebRoot": "C:\\inetpub\\wwwroot",
        "Services": "C:\\Program Files\\FabricationSystem"
    },
    "Authentication": {
        "Method": "Windows",
        "Username": "domain\\username",
        "Password": ""
    },
    "Tags": ["Production", "Web"]
}
```

### Test Server Connection
```powershell
$server = Get-Content "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem\servers.json" | ConvertFrom-Json | Where-Object { $_.Name -eq "NewServer" }

# Test network connectivity
Test-NetConnection -ComputerName $server.Address -Port 5985

# Test PowerShell remoting (if enabled)
Test-WSMan -ComputerName $server.Address -ErrorAction SilentlyContinue
```

## Custom Maintenance Tasks

### Adding a New Task
1. Open `FabricationSystem.psm1`
2. Locate the `Invoke-MaintenanceTasks` function
3. Add your custom task:

```powershell
function Invoke-MaintenanceTasks {
    param([string]$Mode)
    
    $results = @{
        TasksExecuted = 0
        FixesApplied = 0
        Warnings = @()
        Errors = @()
    }
    
    try {
        # Example: Clean up temp files
        $tempFiles = Get-ChildItem -Path $env:TEMP -Recurse -Force | 
                    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
        
        if ($tempFiles) {
            $results.TasksExecuted++
            if ($Mode -eq 'Active') {
                $tempFiles | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
                $results.FixesApplied += $tempFiles.Count
                Write-Log "Cleaned up $($tempFiles.Count) temporary files" -Level Information
            }
        }
        
        # Add more tasks here...
        
    } catch {
        $results.Errors += $_.Exception.Message
        Write-Log "Error in maintenance task: $_" -Level Error
    }
    
    return $results
}
```

### Common Maintenance Tasks

#### 1. Disk Cleanup
```powershell
$disks = Get-Volume | Where-Object { $_.DriveType -eq 'Fixed' -and $_.DriveLetter }
foreach ($disk in $disks) {
    $freeSpace = ($disk.SizeRemaining / 1GB)
    if ($freeSpace -lt 10) {  # Less than 10GB free
        # Perform cleanup
        Cleanup-Disk -DriveLetter $disk.DriveLetter
    }
}
```

#### 2. Service Monitoring
```powershell
$criticalServices = @("MSSQLSERVER", "IISADMIN", "Spooler")
foreach ($service in $criticalServices) {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if (-not $svc -or $svc.Status -ne 'Running') {
        # Alert and attempt restart
        Send-Alert -Message "Service $service is not running" -Level 'Critical'
        Start-Service -Name $service -ErrorAction SilentlyContinue
    }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Run PowerShell as Administrator
   - Check service account permissions
   - Verify firewall rules for remote servers

2. **Module Not Found**
   ```powershell
   # Check module path
   $env:PSModulePath -split ';'
   
   # Import module with full path
   Import-Module "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem\FabricationSystem.psm1" -Force
   ```

3. **Scheduled Task Fails**
   - Check Task Scheduler for errors
   - Verify task is set to run with highest privileges
   - Check "Run whether user is logged on or not"

### Getting Help

For additional support, check the logs in:
`D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem\Logs`

Or contact system administrator with the log files.
