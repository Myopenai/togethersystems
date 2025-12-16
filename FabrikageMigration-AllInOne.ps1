<#
.SYNOPSIS
    Fabrikage Migration Tool - All-in-One Solution
.DESCRIPTION
    A comprehensive file migration tool with built-in configuration, logging, and verification.
    No external dependencies or configuration files required.
.NOTES
    Version: 1.0.0
    Author: Your Name
    Created: $(Get-Date -Format 'yyyy-MM-dd')
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param (
    [Parameter(Mandatory = $false)]
    [string]$SourceRoot = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)",
    
    [Parameter(Mandatory = $false)]
    [string]$TargetRoot = "D:\busineshuboffline CHATGTP\Master\Fabrikage",
    
    [Parameter(Mandatory = $false)]
    [string]$LogPath = "$env:TEMP\FabrikageMigration",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipVerification,
    
    [Parameter(Mandatory = $false)]
    [switch]$NoLog,
    
    [Parameter(Mandatory = $false)]
    [string]$EmailRecipient,
    
    [Parameter(Mandatory = $false)]
    [int]$MaxConcurrentJobs = 5,
    
    [Parameter(Mandatory = $false)]
    [string]$SmtpServer = "smtp.yourdomain.com",
    
    [Parameter(Mandatory = $false)]
    [int]$SmtpPort = 587,
    
    [Parameter(Mandatory = $false)]
    [string]$SmtpFrom = "noreply@yourdomain.com",
    
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

#region Initialization
$ErrorActionPreference = 'Stop'
$startTime = Get-Date
$logFile = Join-Path $LogPath "FabrikageMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$verificationFile = Join-Path $TargetRoot "file_verification_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"

# Built-in configuration
$config = @{
    Components = @{
        Directories = @("FABRIQUE", "FabricationSystem", "Fabrikage")
        FilePatterns = @("Fabrikage*", "*.ps1", "*.psd1", "*.psm1", "*.md", "*.yaml", "*.yml", "*.json", "*.config")
        NonRecursivePatterns = @("*.json", "*.config", "*.md")
        ExcludePatterns = @("*\obj\*", "*\bin\*", "*\node_modules\*", "*\.git\*", "*\_*\*", "*.tmp", "*.bak", "*.log")
    }
    EmailSettings = @{
        SmtpServer = $SmtpServer
        Port = $SmtpPort
        UseSsl = $true
        From = $SmtpFrom
    }
    RetrySettings = @{
        MaxRetries = 3
        InitialDelay = 1
        MaxDelay = 10
    }
    Logging = @{
        MaxLogFileSizeMB = 10
        MaxLogFiles = 5
        LogLevel = "INFO"
    }
    Verification = @{
        VerifyAfterCopy = -not $SkipVerification
        HashAlgorithm = "SHA256"
        VerifyFileAttributes = $true
    }
    Performance = @{
        MaxConcurrentJobs = $MaxConcurrentJobs
        BatchSize = 10
        LargeFileThresholdMB = 10
    }
}

# State management
$script:State = @{
    StartTime = $startTime
    FilesProcessed = 0
    FilesSkipped = 0
    FilesFailed = 0
    BytesCopied = 0
    Errors = @()
    ProcessedFiles = @()
    FailedFiles = @()
}

# Create log directory if it doesn't exist
if (-not $NoLog -and -not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# Ensure target directory exists
if (-not (Test-Path $TargetRoot)) {
    New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null
}
#endregion

#region Helper Functions
function Write-Log {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [ValidateSet('DEBUG', 'INFO', 'WARNING', 'ERROR')]
        [string]$Level = 'INFO',
        
        [switch]$NoConsole
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    if (-not $NoLog) {
        try {
            Add-Content -Path $logFile -Value $logMessage -ErrorAction Stop
        } catch {
            Write-Host "Failed to write to log file: $_" -ForegroundColor Red
        }
    }
    
    if (-not $NoConsole) {
        $color = switch ($Level) {
            'ERROR'   { 'Red' }
            'WARNING' { 'Yellow' }
            'DEBUG'   { 'Gray' }
            default   { 'White' }
        }
        Write-Host $logMessage -ForegroundColor $color
    }
}

function Initialize-Progress {
    param($Activity, $Status, $CurrentOperation, $PercentComplete, $Id = 1)
    
    if ($PSCmdlet.MyInvocation.BoundParameters["Verbose"].IsPresent) {
        Write-Verbose "$Activity - $Status - $CurrentOperation ($PercentComplete%)"
    } else {
        Write-Progress -Id $Id -Activity $Activity -Status $Status -CurrentOperation $CurrentOperation -PercentComplete $PercentComplete
    }
}

function Update-Progress {
    param($Activity, $Status, $CurrentOperation, $PercentComplete, $Id = 1)
    
    if ($PSCmdlet.MyInvocation.BoundParameters["Verbose"].IsPresent) {
        Write-Verbose "$Activity - $Status - $CurrentOperation ($PercentComplete%)"
    } else {
        Write-Progress -Id $Id -Activity $Activity -Status $Status -CurrentOperation $CurrentOperation -PercentComplete $PercentComplete
    }
}

function Complete-Progress {
    param($Id = 1)
    
    if (-not $PSCmdlet.MyInvocation.BoundParameters["Verbose"].IsPresent) {
        Write-Progress -Id $Id -Activity "Completed" -Completed
    }
}

function Send-EmailReport {
    param(
        [string]$To,
        [string]$Subject,
        [string]$Body,
        [string[]]$Attachments = @()
    )
    
    if ([string]::IsNullOrEmpty($To)) {
        Write-Log "No email recipient specified. Skipping email notification." -Level WARNING
        return
    }
    
    try {
        $emailParams = @{
            From = $config.EmailSettings.From
            To = $To
            Subject = $Subject
            Body = $Body
            SmtpServer = $config.EmailSettings.SmtpServer
            Port = $config.EmailSettings.Port
            UseSsl = $config.EmailSettings.UseSsl
            ErrorAction = 'Stop'
        }
        
        if ($Attachments -and $Attachments.Count -gt 0) {
            $emailParams['Attachments'] = $Attachments | Where-Object { Test-Path $_ }
        }
        
        Send-MailMessage @emailParams
        Write-Log "Email report sent to $To" -Level INFO
    } catch {
        Write-Log "Failed to send email: $_" -Level ERROR
    }
}

function Start-FileMigration {
    [CmdletBinding()]
    param()
    
    $filesToProcess = @()
    $totalSize = 0
    
    try {
        # Build file list
        Initialize-Progress -Activity "Scanning source directory" -Status "Building file list..." -PercentComplete 0
        
        # Process directories
        foreach ($dir in $config.Components.Directories) {
            $sourceDir = Join-Path $SourceRoot $dir
            if (-not (Test-Path $sourceDir)) {
                Write-Log "Source directory not found: $sourceDir" -Level WARNING
                continue
            }
            
            $files = Get-ChildItem -Path $sourceDir -Recurse -File -Exclude $config.Components.ExcludePatterns -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring($SourceRoot.Length).TrimStart('\\', '/')
                $targetPath = Join-Path $TargetRoot $relativePath
                
                $filesToProcess += [PSCustomObject]@{
                    Source = $file.FullName
                    Destination = $targetPath
                    Size = $file.Length
                    LastModified = $file.LastWriteTime
                    Status = 'Pending'
                }
                
                $totalSize += $file.Length
            }
        }
        
        # Process file patterns
        foreach ($pattern in $config.Components.FilePatterns) {
            $files = Get-ChildItem -Path $SourceRoot -Filter $pattern -File -Recurse -Exclude $config.Components.ExcludePatterns -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                if ($filesToProcess.Source -notcontains $file.FullName) {
                    $relativePath = $file.FullName.Substring($SourceRoot.Length).TrimStart('\\', '/')
                    $targetPath = Join-Path $TargetRoot $relativePath
                    
                    $filesToProcess += [PSCustomObject]@{
                        Source = $file.FullName
                        Destination = $targetPath
                        Size = $file.Length
                        LastModified = $file.LastWriteTime
                        Status = 'Pending'
                    }
                    
                    $totalSize += $file.Length
                }
            }
        }
        
        # Process non-recursive patterns
        foreach ($pattern in $config.Components.NonRecursivePatterns) {
            $files = Get-ChildItem -Path $SourceRoot -Filter $pattern -File -Exclude $config.Components.ExcludePatterns -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                if ($filesToProcess.Source -notcontains $file.FullName) {
                    $relativePath = $file.FullName.Substring($SourceRoot.Length).TrimStart('\\', '/')
                    $targetPath = Join-Path $TargetRoot $relativePath
                    
                    $filesToProcess += [PSCustomObject]@{
                        Source = $file.FullName
                        Destination = $targetPath
                        Size = $file.Length
                        LastModified = $file.LastWriteTime
                        Status = 'Pending'
                    }
                    
                    $totalSize += $file.Length
                }
            }
        }
        
        $totalFiles = $filesToProcess.Count
        Write-Log "Found $totalFiles files to process (Total size: $([math]::Round($totalSize/1MB,2)) MB)" -Level INFO
        
        if ($totalFiles -eq 0) {
            Write-Log "No files found to process. Exiting." -Level WARNING
            return
        }
        
        # Process files in batches
        $completed = 0
        $batchSize = $config.Performance.BatchSize
        
        for ($i = 0; $i -lt $totalFiles; $i += $batchSize) {
            $batch = $filesToProcess | Select-Object -Skip $i -First $batchSize
            $jobs = @()
            
            foreach ($file in $batch) {
                $jobs += Start-ThreadJob -ScriptBlock {
                    param($Source, $Destination, $WhatIf, $Force)
                    
                    $result = [PSCustomObject]@{
                        Source = $Source
                        Destination = $Destination
                        Status = 'Failed'
                        Error = $null
                    }
                    
                    try {
                        # Check if target exists and is up to date
                        $needsCopy = $true
                        if ((Test-Path $Destination) -and -not $Force) {
                            $targetFile = Get-Item $Destination -ErrorAction Stop
                            $sourceFile = Get-Item $Source -ErrorAction Stop
                            
                            if ($targetFile.LastWriteTime -ge $sourceFile.LastWriteTime) {
                                $result.Status = 'Skipped (up to date)'
                                $needsCopy = $false
                            }
                        }
                        
                        if ($needsCopy) {
                            if (-not $WhatIf) {
                                # Create target directory if it doesn't exist
                                $targetDir = [System.IO.Path]::GetDirectoryName($Destination)
                                if (-not (Test-Path $targetDir)) {
                                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                                }
                                
                                # Copy the file
                                Copy-Item -Path $Source -Destination $Destination -Force -ErrorAction Stop
                                
                                # Verify the copy
                                if (-not (Test-Path $Destination)) {
                                    throw "Failed to verify copied file"
                                }
                                
                                $result.Status = 'Copied'
                            } else {
                                $result.Status = 'Would copy'
                            }
                        }
                        
                    } catch {
                        $result.Status = 'Failed'
                        $result.Error = $_.Exception.Message
                    }
                    
                    return $result
                } -ArgumentList $file.Source, $file.Destination, $WhatIfPreference, $Force
            }
            
            # Wait for batch to complete
            $completedJobs = $jobs | Wait-Job -Timeout 300 # 5 minute timeout per batch
            
            # Process results
            foreach ($job in $completedJobs) {
                $result = Receive-Job $job
                
                $completed++
                $percentComplete = [math]::Min(100, [int](($completed / $totalFiles) * 100))
                
                Update-Progress -Activity "Migrating files" -Status "$completed of $totalFiles" -PercentComplete $percentComplete -Id 1
                
                switch ($result.Status) {
                    'Copied' {
                        $script:State.FilesProcessed++
                        $script:State.ProcessedFiles += $result.Source
                        $script:State.BytesCopied += (Get-Item $result.Source).Length
                        Write-Log "Copied: $($result.Source) -> $($result.Destination)" -Level INFO
                    }
                    'Skipped (up to date)' {
                        $script:State.FilesSkipped++
                        Write-Log "Skipped (up to date): $($result.Source)" -Level DEBUG
                    }
                    'Would copy' {
                        $script:State.FilesSkipped++
                        Write-Log "Would copy: $($result.Source) -> $($result.Destination)" -Level INFO
                    }
                    default {
                        $script:State.FilesFailed++
                        $script:State.Errors += "$($result.Source): $($result.Error)"
                        $script:State.FailedFiles += $result.Source
                        Write-Log "Failed: $($result.Source) - $($result.Error)" -Level ERROR
                    }
                }
                
                # Clean up the job
                Remove-Job $job -Force
            }
            
            # Handle any failed jobs
            $failedJobs = $jobs | Where-Object { $_.State -eq 'Failed' }
            foreach ($job in $failedJobs) {
                $script:State.FilesFailed++
                $errorMsg = $job.ChildJobs[0].JobStateInfo.Reason.Message
                $script:State.Errors += $errorMsg
                Write-Log "Job failed: $errorMsg" -Level ERROR
                Remove-Job $job -Force
            }
        }
        
        # Final verification if enabled
        if ($config.Verification.VerifyAfterCopy -and -not $WhatIfPreference) {
            Initialize-Progress -Activity "Verifying copied files" -Status "Starting verification..." -PercentComplete 0 -Id 2
            
            $verificationResults = @()
            $verifiedCount = 0
            $totalToVerify = $script:State.ProcessedFiles.Count
            
            if ($totalToVerify -gt 0) {
                foreach ($file in $script:State.ProcessedFiles) {
                    $relativePath = $file.Substring($SourceRoot.Length).TrimStart('\\', '/')
                    $targetFile = Join-Path $TargetRoot $relativePath
                    
                    try {
                        $sourceHash = (Get-FileHash -Path $file -Algorithm $config.Verification.HashAlgorithm -ErrorAction Stop).Hash
                        $targetHash = (Get-FileHash -Path $targetFile -Algorithm $config.Verification.HashAlgorithm -ErrorAction Stop).Hash
                        
                        $verificationResults += [PSCustomObject]@{
                            Source = $file
                            Target = $targetFile
                            Status = if ($sourceHash -eq $targetHash) { 'Verified' } else { 'HashMismatch' }
                            SourceHash = $sourceHash
                            TargetHash = $targetHash
                        }
                        
                        if ($sourceHash -ne $targetHash) {
                            Write-Log "Verification failed for $targetFile (hash mismatch)" -Level ERROR
                            $script:State.Errors += "Verification failed: $targetFile"
                        } else {
                            $verifiedCount++
                        }
                    } catch {
                        Write-Log "Verification failed for $targetFile : $_" -Level ERROR
                        $script:State.Errors += "Verification failed: $targetFile - $_"
                    }
                    
                    $percentComplete = [math]::Min(100, [int](($verifiedCount / $totalToVerify) * 100))
                    Update-Progress -Activity "Verifying copied files" -Status "$verifiedCount of $totalToVerify" -PercentComplete $percentComplete -Id 2
                }
                
                # Export verification results
                if ($verificationResults.Count -gt 0) {
                    $verificationResults | Export-Csv -Path $verificationFile -NoTypeInformation -Encoding UTF8 -ErrorAction SilentlyContinue
                    Write-Log "Verification results exported to: $verificationFile" -Level INFO
                }
            } else {
                Write-Log "No files to verify." -Level INFO
            }
            
            Complete-Progress -Id 2
        }
        
    } catch {
        Write-Log "Error during file migration: $_" -Level ERROR
        $script:State.Errors += $_.Exception.Message
        throw
    } finally {
        Complete-Progress -Id 1
    }
}

#region Main Execution
try {
    # Start migration
    Write-Log "=== Starting Fabrikage Migration ===" -Level INFO
    Write-Log "Source: $SourceRoot" -Level INFO
    Write-Log "Target: $TargetRoot" -Level INFO
    Write-Log "Log file: $logFile" -Level INFO
    
    # Start file migration
    if ($PSCmdlet.ShouldProcess("Migrate files from $SourceRoot to $TargetRoot")) {
        Start-FileMigration
    }
    
    # Generate report
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    $report = @"
# Fabrikage Migration Report
## Generated: $(Get-Date)

## Summary
- **Source:** $SourceRoot
- **Destination:** $TargetRoot
- **Start Time:** $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))
- **End Time:** $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))
- **Duration:** $([math]::Round($duration.TotalMinutes, 2)) minutes

## Statistics
- **Total Files Processed:** $($script:State.FilesProcessed + $script:State.FilesSkipped + $script:State.FilesFailed)
- **Files Copied:** $($script:State.FilesProcessed)
- **Files Skipped (up to date):** $($script:State.FilesSkipped)
- **Files Failed:** $($script:State.FilesFailed)
- **Total Data Copied:** $([math]::Round($script:State.BytesCopied/1MB, 2)) MB

## Next Steps
1. Verify the files in: $TargetRoot
2. Check the log for any errors: $logFile

## Verification
To verify file integrity, you can run:
```powershell
Get-FileHash -Path "$TargetRoot\*" -Recurse -Algorithm SHA256 | Export-Csv -Path "$TargetRoot\file_hashes.csv" -NoTypeInformation
```

## Errors
$(if ($script:State.Errors.Count -gt 0) {
    $script:State.Errors -join "`n- " | ForEach-Object { "- $_" }
} else {
    "No errors encountered."
})
"@

    # Save report
    $reportFile = Join-Path $LogPath "FabrikageMigration_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
    $report | Out-File -FilePath $reportFile -Encoding utf8 -ErrorAction SilentlyContinue
    
    # Display summary
    Write-Host "`n=== Migration Summary ===" -ForegroundColor Cyan
    Write-Host "Files Copied: $($script:State.FilesProcessed)" -ForegroundColor Green
    Write-Host "Files Skipped: $($script:State.FilesSkipped)" -ForegroundColor Yellow
    Write-Host "Files Failed: $($script:State.FilesFailed)" -ForegroundColor $(if ($script:State.FilesFailed -gt 0) { 'Red' } else { 'Green' })
    Write-Host "Total Data: $([math]::Round($script:State.BytesCopied/1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host "`nReport saved to: $reportFile" -ForegroundColor Cyan
    
    # Send email if recipient specified
    if ($EmailRecipient) {
        $emailSubject = "Fabrikage Migration Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $emailBody = $report -replace '##', '###'  # Reduce heading level for email
        
        Send-EmailReport -To $EmailRecipient -Subject $emailSubject -Body $emailBody -Attachments @($logFile, $reportFile, $verificationFile | Where-Object { Test-Path $_ })
    }
    
    # Exit with appropriate code
    if ($script:State.FilesFailed -gt 0) {
        exit 1
    } else {
        exit 0
    }
    
} catch {
    Write-Log "Fatal error: $_" -Level ERROR
    Write-Log $_.ScriptStackTrace -Level DEBUG -NoConsole
    
    # Send error notification if email is configured
    if ($EmailRecipient) {
        $errorSubject = "Fabrikage Migration Failed - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $errorBody = @"
The Fabrikage migration has failed with the following error:

$($_.Exception.Message)

Stack Trace:
$($_.ScriptStackTrace)

Please check the log file for more details: $logFile
"@
        
        Send-EmailReport -To $EmailRecipient -Subject $errorSubject -Body $errorBody -Attachments @($logFile)
    }
    
    exit 2
} finally {
    # Clean up
    Complete-Progress -Id 1
    Complete-Progress -Id 2
    Complete-Progress -Id 3
}
#endregion
