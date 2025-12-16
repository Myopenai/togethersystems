# Auto-Organize HTML Files Script (cleaned)
# This script will:
# 1. Create a timestamped backup
# 2. Reorganize HTML files into a standard structure
# 3. Clean up filenames
# 4. Generate a report

# Configuration
# Auto-Organize HTML Files Script (cleaned)
# This script will:
# 1. Create a timestamped backup
# 2. Reorganize HTML files into a standard structure
# 3. Clean up filenames
# 4. Generate a report

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

# Initialize
function Initialize-Environment {
    # Create backup
    Write-Output "[$(Get-Date)] Creating backup at $($config.BackupDir)" | Tee-Object -FilePath $config.LogFile -Append
    New-Item -ItemType Directory -Path $config.BackupDir -Force | Out-Null
    Copy-Item -Path "$($config.SourceDir)\*" -Destination $config.BackupDir -Recurse -Force

    # Create target directories
    $config.Structure.Keys | ForEach-Object {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
    New-Item -ItemType Directory -Path "legacy" -Force | Out-Null
}

# Clean filename
function Get-CleanFileName {
    param([string]$name)
    return ($name.ToLower() -replace '\s+', '-' -replace '[^a-z0-9\-\.]', '' -replace '-+', '-').Trim('-')
}

# Process files
function Move-HtmlFiles {
    $files = Get-ChildItem -Path $config.SourceDir -File -Filter "*.html" -Recurse | 
             Where-Object { $_.DirectoryName -ne $config.BackupDir -and $_.FullName -notlike "*\legacy\*" }

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($config.SourceDir.Length).TrimStart('\')
        $newName = Get-CleanFileName -name $file.Name
        $moved = $false

        # Try to match with structure patterns
        foreach ($dir in $config.Structure.Keys) {
            if ($file.Name -like $config.Structure[$dir]) {
                $destination = Join-Path $dir $newName
                Move-Item -Path $file.FullName -Destination $destination -Force -ErrorAction SilentlyContinue
                if (Test-Path $destination) {
                    Write-Output "[MOVE] $relativePath -> $destination" | Tee-Object -FilePath $config.LogFile -Append
                    $moved = $true
                    break
                }
            }
        }

        # If no match, move to legacy
        if (-not $moved) {
            $legacyPath = Join-Path "legacy" $newName
            Move-Item -Path $file.FullName -Destination $legacyPath -Force -ErrorAction SilentlyContinue
            if (Test-Path $legacyPath) {
                Write-Output "[LEGACY] $relativePath -> $legacyPath" | Tee-Object -FilePath $config.LogFile -Append
            }
        }
    }
}

# Update links in HTML files
function Update-HtmlLinks {
    $htmlFiles = Get-ChildItem -Path $config.SourceDir -Filter "*.html" -Recurse -File
    $totalUpdated = 0

    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $updated = $false

        # Update href attributes (match href="..." or href='...')
        $content = [regex]::Replace($content, 'href=(?:"|\'')([^"'']+\.html)(?:"|\'')' , {
            param($match)
            $link = $match.Groups[1].Value
            $newLink = Get-CleanFileName -name $link
            if ($link -ne $newLink) {
                $updated = $true
                return ('href="' + $newLink + '"')
            }
            return $match.Value
        })

        # Save if updated
        if ($updated) {
            $content | Set-Content -Path $file.FullName -NoNewline
            Write-Output "[UPDATED] $($file.FullName)" | Tee-Object -FilePath $config.LogFile -Append
            $totalUpdated++
        }
    }

    Write-Output "Total files updated: $totalUpdated" | Tee-Object -FilePath $config.LogFile -Append
}

# Main execution
try {
    # Set execution policy for this session
    $originalPolicy = Get-ExecutionPolicy -Scope Process
    Set-ExecutionPolicy Bypass -Scope Process -Force

    # Start process
    Write-Output "=== Starting HTML Reorganization ===" | Tee-Object -FilePath $config.LogFile
    Write-Output "Timestamp: $(Get-Date)" | Tee-Object -FilePath $config.LogFile -Append
    
    Initialize-Environment
    Move-HtmlFiles
    Update-HtmlLinks

    # Cleanup empty directories
    Get-ChildItem -Path $config.SourceDir -Directory -Recurse | 
        Where-Object { $_.GetFiles().Count -eq 0 -and $_.GetDirectories().Count -eq 0 } | 
        Remove-Item -Force -Recurse

    Write-Output "`n=== Reorganization Complete ===" | Tee-Object -FilePath $config.LogFile -Append
    Write-Output "Backup: $($config.BackupDir)" | Tee-Object -FilePath $config.LogFile -Append
    Write-Output "Log: $($config.LogFile)" | Tee-Object -FilePath $config.LogFile -Append
}
catch {
    Write-Output "ERROR: $_" | Tee-Object -FilePath $config.LogFile -Append
    Write-Output "Stack Trace: $($_.ScriptStackTrace)" | Tee-Object -FilePath $config.LogFile -Append
    throw $_
}
finally {
    # Restore original execution policy
    Set-ExecutionPolicy $originalPolicy -Scope Process -Force
}

# Open log file
Invoke-Item $config.LogFile
