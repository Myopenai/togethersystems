# Auto-Organize HTML Files Script v3
# Fixed path handling and execution policy

# Configuration
$config = @{
    SourceDir = $PWD.Path
    BackupDir = "html_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    LogFile = "reorganization-report-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
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
    Add-Content -Path $config.LogFile -Value $logMessage -ErrorAction SilentlyContinue
}

# Initialize environment
function Initialize-Environment {
    try {
        # Create backup directory
        $backupPath = Join-Path -Path $config.SourceDir -ChildPath $config.BackupDir
        Write-Log "Creating backup at $backupPath"
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        
        # Create target directories
        $config.Structure.Keys | ForEach-Object {
            $dirPath = Join-Path -Path $config.SourceDir -ChildPath $_
            New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
        }
        $legacyPath = Join-Path -Path $config.SourceDir -ChildPath "legacy"
        New-Item -ItemType Directory -Path $legacyPath -Force | Out-Null
        
        # Simple file copy instead of robocopy
        $files = Get-ChildItem -Path $config.SourceDir -File -Recurse -ErrorAction SilentlyContinue | 
                Where-Object { $_.Extension -match '\.(html|htm|js|css|json|md|txt)$' }
        
        $files | ForEach-Object {
            $relativePath = $_.FullName.Substring($config.SourceDir.Length).TrimStart('\')
            $destPath = Join-Path -Path $backupPath -ChildPath (Split-Path -Path $relativePath -Parent)
            
            if (-not (Test-Path -Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
            
            Copy-Item -Path $_.FullName -Destination (Join-Path -Path $destPath -ChildPath $_.Name) -Force -ErrorAction SilentlyContinue
        }
        
        Write-Log "Backup completed. Copied $($files.Count) files."
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
        $files = Get-ChildItem -Path $config.SourceDir -File -Include "*.html", "*.htm" -Recurse -ErrorAction SilentlyContinue | 
                 Where-Object { 
                     $_.DirectoryName -notlike "*\$($config.BackupDir)*" -and 
                     $_.FullName -notlike "*\legacy\*" -and
                     $_.FullName -notlike "*\node_modules\*" -and
                     $_.FullName -notlike "*\.git\*"
                 }

        foreach ($file in $files) {
            try {
                $relativePath = $file.FullName.Substring($config.SourceDir.Length).TrimStart('\')
                $newName = Get-CleanFileName -name $file.Name
                $moved = $false

                # Try to match with structure patterns
                foreach ($dir in $config.Structure.Keys) {
                    if ($file.Name -like $config.Structure[$dir]) {
                        $destination = Join-Path -Path $config.SourceDir -ChildPath (Join-Path $dir $newName)
                        $destinationDir = Split-Path -Parent $destination
                        
                        # Ensure destination directory exists
                        if (-not (Test-Path $destinationDir)) {
                            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
                        }
                        
                        Move-Item -Path $file.FullName -Destination $destination -Force -ErrorAction Stop
                        Write-Log "[MOVE] $relativePath -> $($destination.Substring($config.SourceDir.Length).TrimStart('\'))"
                        $moved = $true
                        break
                    }
                }

                # If no match, move to legacy
                if (-not $moved) {
                    $legacyPath = Join-Path -Path $config.SourceDir -ChildPath "legacy"
                    $legacyFile = Join-Path -Path $legacyPath -ChildPath $newName
                    Move-Item -Path $file.FullName -Destination $legacyFile -Force -ErrorAction Stop
                    Write-Log "[LEGACY] $relativePath -> legacy\$newName"
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

# Update links in HTML files
function Update-HtmlLinks {
    try {
        $htmlFiles = Get-ChildItem -Path $config.SourceDir -Include "*.html", "*.htm" -Recurse -File -ErrorAction SilentlyContinue |
                    Where-Object { $_.FullName -notlike "*\$($config.BackupDir)\*" }
        
        foreach ($file in $htmlFiles) {
            try {
                # Read file content
                $content = [System.IO.File]::ReadAllText($file.FullName)
                $originalContent = $content
                
                # Update href attributes
                $content = [regex]::Replace($content, '(href|src)=["'']([^"''#?]+\.(html?|js|css|png|jpg|jpeg|gif|svg))["'']', {
                    param($match)
                    $attr = $match.Groups[1].Value
                    $link = $match.Groups[2].Value
                    $ext = $match.Groups[3].Value
                    
                    # Only process HTML/HTM files
                    if ($ext -match '^html?$') {
                        $newLink = Get-CleanFileName -name $link
                        if ($link -ne $newLink) {
                            return "$attr=""$newLink"""
                        }
                    }
                    return $match.Value
                })

                # Save if updated
                if ($content -ne $originalContent) {
                    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
                    Write-Log "[UPDATED] $($file.FullName.Substring($config.SourceDir.Length).TrimStart('\'))"
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
    Write-Log "Source Directory: $($config.SourceDir)"
    Write-Log "Backup Directory: $(Join-Path -Path $config.SourceDir -ChildPath $config.BackupDir)"
    Write-Log "Log File: $(Join-Path -Path $config.SourceDir -ChildPath $config.LogFile)"
    
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

    # Cleanup empty directories (skip backup, legacy, and system folders)
    Get-ChildItem -Path $config.SourceDir -Directory -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { 
            $_.GetFiles().Count -eq 0 -and 
            $_.GetDirectories().Count -eq 0 -and
            $_.FullName -notlike "*\$($config.BackupDir)*" -and
            $_.FullName -notlike "*\legacy\*" -and
            $_.FullName -notlike "*\node_modules\*" -and
            $_.FullName -notlike "*\.git\*" -and
            -not ($config.Structure.Keys | Where-Object { $_.StartsWith($_.Name) })
        } | 
        Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

    Write-Log "`n=== Reorganization Complete ==="
    Write-Log "Backup: $(Join-Path -Path $config.SourceDir -ChildPath $config.BackupDir)"
    Write-Log "Log: $(Join-Path -Path $config.SourceDir -ChildPath $config.LogFile)"
    
    # Open log file
    try {
        Invoke-Item (Join-Path -Path $config.SourceDir -ChildPath $config.LogFile)
    }
    catch {
        Write-Log "Could not open log file automatically. Please open it manually: $(Join-Path -Path $config.SourceDir -ChildPath $config.LogFile)"
    }
}
catch {
    $errorMsg = "FATAL ERROR: $($_.Exception.Message)`n$($_.ScriptStackTrace)"
    Write-Log $errorMsg
    Write-Error $errorMsg
    exit 1
}