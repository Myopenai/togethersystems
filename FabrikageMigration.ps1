# Fabrikage Migration Tool v2.0
# Run as Administrator for best results

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param (
    [Parameter(Mandatory = $false)]
    [string]$SourceRoot = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)",
    
    [Parameter(Mandatory = $false)]
    [string]$TargetRoot = "D:\busineshuboffline CHATGTP\Master\Fabrikage",
    
    [Parameter(Mandatory = $false)]
    [string]$LogPath = "$env:TEMP\FabrikageMigration",
    
    [Parameter(Mandatory = $false)]
    [string]$ConfigFile = "$PSScriptRoot\FabrikageMigration.config.json",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipVerification,
    
    [Parameter(Mandatory = $false)]
    [switch]$NoLog,
    
    [Parameter(Mandatory = $false)]
    [string]$EmailRecipient,
    
    [Parameter(Mandatory = $false)]
    [int]$MaxConcurrentJobs = 5
)

#region Initialization
$ErrorActionPreference = 'Stop'
$startTime = Get-Date
$logFile = Join-Path $LogPath "FabrikageMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$stateFile = Join-Path $LogPath "FabrikageMigration_State.json"
$verificationFile = Join-Path $TargetRoot "file_verification_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"

# Create log directory if it doesn't exist
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# Load configuration if exists
$config = @{
    Components = @{
        Directories = @("FABRIQUE", "FabricationSystem")
        FilePatterns = @("Fabrikage*", "*.ps1", "*.psd1", "*.psm1")
        NonRecursivePatterns = @("*.json", "*.config")
        ExcludePatterns = @("*\obj\*", "*\bin\*", "*\node_modules\*")
    }
    EmailSettings = @{
        SmtpServer = "smtp.yourdomain.com"
        Port = 587
        UseSsl = $true
        From = "noreply@yourdomain.com"
    }
}

# Try to load config from file if exists
if (Test-Path $ConfigFile) {
    try {
        $savedConfig = Get-Content $ConfigFile -Raw | ConvertFrom-Json -AsHashtable
        if ($savedConfig) { $config = $savedConfig }
    } catch {
        Write-Warning "Failed to load configuration file: $_"
    }
}

# Initialize state
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

function Save-State {
    param($State)
    
    try {
        $State.EndTime = Get-Date
        $State.Duration = $State.EndTime - $State.StartTime
        
        $State | ConvertTo-Json -Depth 10 | Out-File -FilePath $stateFile -Force
        return $true
    } catch {
        Write-Log "Failed to save state: $_" -Level ERROR
        return $false
    }
}

function Get-FileHashRecursive {
    param(
        [string]$Path,
        [string]$Filter = '*',
        [string[]]$Exclude = @()
    )
    
    $files = Get-ChildItem -Path $Path -Recurse -File -Filter $Filter -Exclude $Exclude
    $totalFiles = $files.Count
    $processed = 0
    
    foreach ($file in $files) {
        $processed++
        $percentComplete = [math]::Min(100, [int](($processed / $totalFiles) * 100))
        Update-Progress -Activity "Verifying files" -Status "Processing $($file.FullName)" -PercentComplete $percentComplete -Id 2
        
        try {
            $hash = Get-FileHash -Path $file.FullName -Algorithm SHA256
            [PSCustomObject]@{
                Path = $file.FullName
                Hash = $hash.Hash
                Size = $file.Length
                LastModified = $file.LastWriteTime
            }
        } catch {
            Write-Log "Failed to hash file $($file.FullName): $_" -Level WARNING
        }
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

function Copy-FileWithRetry {
    [CmdletBinding()]
    param(
        [string]$Source,
        [string]$Destination,
        [int]$RetryCount = 3,
        [int]$RetryDelay = 1
    )
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $RetryCount) {
        try {
            $attempt++
            
            # Create target directory if it doesn't exist
            $targetDir = [System.IO.Path]::GetDirectoryName($Destination)
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            # Copy with progress if it's a large file
            $sourceFile = Get-Item $Source
            if ($sourceFile.Length -gt 10MB) {
                $sourceStream = [System.IO.File]::OpenRead($Source)
                $targetStream = [System.IO.File]::Create($Destination)
                
                $buffer = New-Object byte[] 1MB
                $totalBytes = $sourceFile.Length
                $bytesCopied = 0
                
                while (($bytesRead = $sourceStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                    $targetStream.Write($buffer, 0, $bytesRead)
                    $bytesCopied += $bytesRead
                    $percentComplete = [math]::Min(100, [int](($bytesCopied / $totalBytes) * 100))
                    Update-Progress -Activity "Copying large file" -Status "$([math]::Round($bytesCopied/1MB,2)) MB of $([math]::Round($totalBytes/1MB,2)) MB" -PercentComplete $percentComplete -Id 3
                }
                
                $sourceStream.Close()
                $targetStream.Close()
                
                # Preserve original timestamps
                $sourceFile = Get-Item $Source
                $targetFile = Get-Item $Destination
                $targetFile.CreationTime = $sourceFile.CreationTime
                $targetFile.LastWriteTime = $sourceFile.LastWriteTime
                $targetFile.LastAccessTime = $sourceFile.LastAccessTime
            } else {
                # For smaller files, use Copy-Item with -Force
                Copy-Item -Path $Source -Destination $Destination -Force
            }
            
            # Verify the copy
            if (-not (Test-Path $Destination)) {
                throw "Failed to verify copied file: $Destination"
            }
            
            $sourceHash = (Get-FileHash -Path $Source -Algorithm SHA256).Hash
            $destHash = (Get-FileHash -Path $Destination -Algorithm SHA256).Hash
            
            if ($sourceHash -ne $destHash) {
                throw "Hash mismatch for copied file: $Destination"
            }
            
            $script:State.BytesCopied += (Get-Item $Source).Length
            return $true
        } catch {
            $lastError = $_.Exception.Message
            Write-Log "Attempt $attempt failed for $Source : $lastError" -Level WARNING
            
            if ($attempt -lt $RetryCount) {
                Start-Sleep -Seconds $RetryDelay
                $RetryDelay = [math]::Min(10, $RetryDelay * 2) # Exponential backoff, max 10 seconds
            }
        }
    }
    
    Write-Log "Failed to copy file after $RetryCount attempts: $Source : $lastError" -Level ERROR
    return $false
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
            
            $files = Get-ChildItem -Path $sourceDir -Recurse -File -Exclude $config.Components.ExcludePatterns
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
            $files = Get-ChildItem -Path $SourceRoot -Filter $pattern -File -Recurse -Exclude $config.Components.ExcludePatterns
            foreach ($file in $files) {
                # Skip files already processed by directory scan
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
            $files = Get-ChildItem -Path $SourceRoot -Filter $pattern -File -Exclude $config.Components.ExcludePatterns
            foreach ($file in $files) {
                # Skip files already processed
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
        
        # Process files in parallel with throttling
        $scriptBlock = {
            param($fileInfo, $WhatIf)
            
            $result = [PSCustomObject]@{
                Source = $fileInfo.Source
                Destination = $fileInfo.Destination
                Status = 'Failed'
                Error = $null
                Size = $fileInfo.Size
                LastModified = $fileInfo.LastModified
            }
            
            try {
                # Check if target exists and is up to date
                $needsCopy = $true
                if (Test-Path $fileInfo.Destination) {
                    $targetFile = Get-Item $fileInfo.Destination -ErrorAction Stop
                    if ($targetFile.LastWriteTime -ge $fileInfo.LastModified) {
                        $result.Status = 'Skipped (up to date)'
                        $needsCopy = $false
                    }
                }
                
                if ($needsCopy) {
                    if (-not $WhatIf) {
                        # Create target directory if it doesn't exist
                        $targetDir = [System.IO.Path]::GetDirectoryName($fileInfo.Destination)
                        if (-not (Test-Path $targetDir)) {
                            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                        }
                        
                        # Copy the file
                        Copy-Item -Path $fileInfo.Source -Destination $fileInfo.Destination -Force -ErrorAction Stop
                        
                        # Verify the copy
                        if (-not (Test-Path $fileInfo.Destination)) {
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
        }
        
        $completed = 0
        $jobs = @()
        $maxJobs = $MaxConcurrentJobs
        $throttleLimit = [math]::Min(10, [System.Environment]::ProcessorCount * 2)
        
        # Process files in batches
        for ($i = 0; $i -lt $totalFiles; $i += $maxJobs) {
            $batch = $filesToProcess | Select-Object -Skip $i -First $maxJobs
            $batchJobs = @()
            
            foreach ($file in $batch) {
                $batchJobs += Start-ThreadJob -ScriptBlock $scriptBlock -ArgumentList $file, $WhatIfPreference -ThrottleLimit $throttleLimit
            }
            
            # Wait for batch to complete
            $completedJobs = $batchJobs | Wait-Job -Timeout 300 # 5 minute timeout per batch
            
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
            $failedJobs = $batchJobs | Where-Object { $_.State -eq 'Failed' }
            foreach ($job in $failedJobs) {
                $script:State.FilesFailed++
                $errorMsg = $job.ChildJobs[0].JobStateInfo.Reason.Message
                $script:State.Errors += $errorMsg
                Write-Log "Job failed: $errorMsg" -Level ERROR
                Remove-Job $job -Force
            }
        }
        
        # Final verification if enabled
        if (-not $SkipVerification -and -not $WhatIfPreference) {
            Initialize-Progress -Activity "Verifying copied files" -Status "Starting verification..." -PercentComplete 0 -Id 2
            
            $verificationResults = @()
            $verifiedCount = 0
            
            foreach ($file in $script:State.ProcessedFiles) {
                $relativePath = $file.Substring($SourceRoot.Length).TrimStart('\\', '/')
                $targetFile = Join-Path $TargetRoot $relativePath
                
                try {
                    $sourceHash = (Get-FileHash -Path $file -Algorithm SHA256 -ErrorAction Stop).Hash
                    $targetHash = (Get-FileHash -Path $targetFile -Algorithm SHA256 -ErrorAction Stop).Hash
                    
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
                
                $percentComplete = [math]::Min(100, [int](($verifiedCount / $script:State.ProcessedFiles.Count) * 100))
                Update-Progress -Activity "Verifying copied files" -Status "$verifiedCount of $($script:State.ProcessedFiles.Count)" -PercentComplete $percentComplete -Id 2
            }
            
            # Export verification results
            if ($verificationResults.Count -gt 0) {
                $verificationResults | Export-Csv -Path $verificationFile -NoTypeInformation -Encoding UTF8
                Write-Log "Verification results exported to: $verificationFile" -Level INFO
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

#endregion

#region Main Execution
try {
    # Start migration
    Write-Log "=== Starting Fabrikage Migration ===" -Level INFO
    Write-Log "Source: $SourceRoot" -Level INFO
    Write-Log "Target: $TargetRoot" -Level INFO
    Write-Log "Log file: $logFile" -Level INFO
    
    # Create target directory if it doesn't exist
    if (-not (Test-Path $TargetRoot)) {
        if ($PSCmdlet.ShouldProcess($TargetRoot, "Create target directory")) {
            New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null
            Write-Log "Created target directory: $TargetRoot" -Level INFO
        }
    }
    
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
    $report | Out-File -FilePath $reportFile -Encoding utf8
    
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
    
    # Save final state
    Save-State -State $script:State
}
#endregion
