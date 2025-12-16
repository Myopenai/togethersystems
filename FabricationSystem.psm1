function Get-SystemHealth {
    [CmdletBinding()]
    param(
        [switch]$Detailed
    )

    try {
        # Get system information
        $os = Get-CimInstance -ClassName Win32_OperatingSystem
        $cpu = Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property LoadPercentage -Average
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
        
        # Calculate memory usage
        $memory = [PSCustomObject]@{
            TotalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
            FreeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
            UsedPercent = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 2)
        }

        # Calculate disk usage
        $diskUsage = [PSCustomObject]@{
            TotalGB = [math]::Round($disk.Size / 1GB, 2)
            FreeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
            UsedPercent = [math]::Round(($disk.Size - $disk.FreeSpace) / $disk.Size * 100, 2)
        }

        # Check for common issues
        $issues = @()
        if ($cpu.Average -gt 90) { $issues += "High CPU usage: $($cpu.Average)%" }
        if ($memory.UsedPercent -gt 90) { $issues += "High memory usage: $($memory.UsedPercent)%" }
        if ($diskUsage.UsedPercent -gt 90) { $issues += "High disk usage: $($diskUsage.UsedPercent)%" }

        # Create result object
        $result = [PSCustomObject]@{
            Status = if ($issues.Count -eq 0) { "Healthy" } else { "Issues Detected" }
            Timestamp = Get-Date
            Mode = "Active"  # Default mode
            CPU = [PSCustomObject]@{
                Load = $cpu.Average
                Status = if ($cpu.Average -gt 90) { "Warning" } else { "Normal" }
            }
            Memory = $memory
            Disk = $diskUsage
            Issues = $issues
        }

        # Add detailed checks if requested
        if ($Detailed) {
            $result | Add-Member -MemberType NoteProperty -Name "Checks" -Value @(
                [PSCustomObject]@{
                    Name = "CPU"
                    Status = if ($cpu.Average -gt 90) { "Warning" } else { "Healthy" }
                    Message = "CPU Load: $($cpu.Average)%"
                },
                [PSCustomObject]@{
                    Name = "Memory"
                    Status = if ($memory.UsedPercent -gt 90) { "Warning" } else { "Healthy" }
                    Message = "Memory Used: $($memory.UsedPercent)% ($($memory.UsedGB)GB of $($memory.TotalGB)GB)"
                },
                [PSCustomObject]@{
                    Name = "Disk"
                    Status = if ($diskUsage.UsedPercent -gt 90) { "Warning" } else { "Healthy" }
                    Message = "Disk Used: $($diskUsage.UsedPercent)% ($($diskUsage.UsedGB)GB of $($diskUsage.TotalGB)GB)"
                }
            )
        }

        return $result
    }
    catch {
        Write-Error "Failed to get system health: $_"
        return [PSCustomObject]@{
            Status = "Error"
            Message = "Failed to get system health: $_"
            Timestamp = Get-Date
        }
    }
}

# Add to export list
Export-ModuleMember -Function Get-SystemHealth