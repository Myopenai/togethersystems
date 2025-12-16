# Auto-Organize HTML Files Script v2
# Fixed for PowerShell compatibility

# Configuration
$config = @{
    SourceDir = $PWD.Path
    BackupDir = ".\html_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    LogFile = ".\reorganization-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    Structure = @{
        "app/admin" = "*admin*"
        "app/dashboard" = "*dashboard*"
        "app/api" = "*api*"
        "docs/reports" = "*report*"
        "docs/manuals" = "*manual*"
        "system/neural-network" = "*neural*"
        "system/encryption" = "*encrypt*"
        "system/portal" = "*portal*"
        "system/cms" = "*cms*"
    }
}

# Initialize logging
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    Write-Output $logMessage
    Add-Content -Path $config.LogFile -Value $logMessage
}

# Initialize environment
function Initialize-Environment {
    try {
        # Create backup directory
        Write-Log "Creating backup at $($config.BackupDir)"
        New-Item -ItemType Directory -Path $config.BackupDir -Force | Out-Null
        
        # Create target directories
        $config.Structure.Keys | ForEach-Object {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
        New-Item -ItemType Directory -Path "legacy" -Force | Out-Null
        
        # Backup files with robocopy (handles long paths better)
        $sourcePath = $config.SourceDir.TrimEnd('\')
        $destPath = $config.BackupDir.TrimEnd('\')
        $robocopyLog = "$($config.LogFile).robocopy.log"
        
        $robocopyArgs = @(
            '""{0}""' -f $sourcePath
            '""{0}""' -f $destPath
            "/E", "/COPYALL", "/R:1", "/W:1", "/NP", "/LOG+:$robocopyLog"
            "/XD", '".git"', '".github"', '"node_modules"'
            "/XF", '"*.tmp"', '"*.temp"'
        )
        
        Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -NoNewWindow -Wait
        Write-Log "Backup completed. See $robocopyLog for details."
        
        return $true
    }
    catch {
        Write-Log "ERROR during initialization: $_"
        return $false
    }
}

# Clean filename
function Get-CleanFileName {
    param([string]$name)
    $invalidChars = [IO.Path]::GetInvalidFileNameChars() -join ''
    $re = "[{0}]" -f [regex]::Escape($invalidChars)
    $cleanName = $name.ToLower() -replace '\s+', '-' -replace $re, '' -replace '-+', '-'
    return $cleanName.Trim('-', '.')
}

# Process files
function Move-HtmlFiles {
    try {
        $files = Get-ChildItem -Path $config.SourceDir -File -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | 
                 Where-Object { $_.DirectoryName -notlike "*$($config.BackupDir)*" -and 
                               $_.FullName -notlike "*\legacy\*" }

        foreach ($file in $files) {
            try {
                $relativePath = $file.FullName.Substring($config.SourceDir.Length).TrimStart('\')
                $newName = Get-CleanFileName -name $file.Name
                $moved = $false

                # Try to match with structure patterns
                foreach ($dir in $config.Structure.Keys) {
                    if ($file.Name -like $config.Structure[$dir]) {
                        $destination = Join-Path $dir $newName
                        $destinationDir = Split-Path -Parent $destination
                        
                        # Ensure destination directory exists
                        if (-not (Test-Path $destinationDir)) {
                            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
                        }
                        
                        Move-Item -Path $file.FullName -Destination $destination -Force -ErrorAction Stop
                        Write-Log "[MOVE] $relativePath -> $destination"
                        $moved = $true
                        break
                    }
                }

                # If no match, move to legacy
                if (-not $moved) {
                    $legacyPath = Join-Path "legacy" $newName
                    Move-Item -Path $file.FullName -Destination $legacyPath -Force -ErrorAction Stop
                    Write-Log "[LEGACY] $relativePath -> $legacyPath"
                }
            }
            catch {
                Write-Log "ERROR processing $($file.FullName): $_"
                continue
            }
        }
        return $true
    }
    catch {
        Write-Log "ERROR in Move-HtmlFiles: $_"
        return $false
    }
}

# Update links in HTML files (compatible with older PowerShell)
function Update-HtmlLinks {
    try {
        $htmlFiles = Get-ChildItem -Path $config.SourceDir -Filter "*.html" -Recurse -File -ErrorAction SilentlyContinue
        
        foreach ($file in $htmlFiles) {
            try {
                # Read file content without -Raw parameter
                $content = [System.IO.File]::ReadAllText($file.FullName)
                $originalContent = $content
                
                # Update href attributes
                $content = [regex]::Replace($content, 'href=["'']([^"''#?]+\.html)["'']', {
                    param($match)
                    $link = $match.Groups[1].Value
                    $newLink = Get-CleanFileName -name $link
                    if ($link -ne $newLink) {
                        return "href=""$newLink"""
                    }
                    return $match.Value
                })

                # Save if updated
                if ($content -ne $originalContent) {
                    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
                    Write-Log "[UPDATED] $($file.FullName)"
                }
            }
            catch {
                Write-Log "ERROR updating links in $($file.FullName): $_"
                continue
            }
        }
        return $true
    }
    catch {
        Write-Log "ERROR in Update-HtmlLinks: $_"
        return $false
    }
}

# Main execution
try {
    # Start process
    Write-Log "=== Starting HTML Reorganization ==="
    Write-Log "Timestamp: $(Get-Date)"
    
    # Initialize environment
    if (-not (Initialize-Environment)) {
        throw "Initialization failed. Check the log for details."
    }
    
    # Move and organize files
    if (-not (Move-HtmlFiles)) {
        throw "File organization encountered errors. Check the log for details."
    }
    
    # Update HTML links
    if (-not (Update-HtmlLinks)) {
        Write-Log "Warning: Some links might not have been updated. Check the log for details."
    }

    # Cleanup empty directories
    Get-ChildItem -Path $config.SourceDir -Directory -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.GetFiles().Count -eq 0 -and 
            $_.GetDirectories().Count -eq 0 -and
            $_.FullName -notlike "*$($config.BackupDir)*" -and
            $_.FullName -notlike "*\legacy\*" -and
            $_.Name -notin $config.Structure.Keys
        } | 
        Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

    Write-Log "`n=== Reorganization Complete ==="
    Write-Log "Backup: $($config.BackupDir)"
    Write-Log "Log: $($config.LogFile)"
    
    # Open log file
    Invoke-Item $config.LogFile
}
catch {
    $errorMsg = "FATAL ERROR: $($_.Exception.Message)`n$($_.ScriptStackTrace)"
    Write-Log $errorMsg
    Write-Error $errorMsg
}