# TELADIA Portal Backup Script
# Erstellt ein verifiziertes, komplettes Backup

$backupDir = "backup/portal-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "Creating backup in $backupDir..."

# Backup HTML files
Copy-Item -Path "*.html" -Destination "$backupDir/" -Recurse -Force
Copy-Item -Path "TELADIA/*.html" -Destination "$backupDir/TELADIA/" -Recurse -Force
Copy-Item -Path "TELBANK/*.html" -Destination "$backupDir/TELBANK/" -Recurse -Force

# Backup CSS
Copy-Item -Path "css/*.css" -Destination "$backupDir/css/" -Recurse -Force

# Backup JS
Copy-Item -Path "js/*.js" -Destination "$backupDir/js/" -Recurse -Force

# Backup Settings
Copy-Item -Path "Settings/*" -Destination "$backupDir/Settings/" -Recurse -Force

# Create manifest
$manifest = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    files = @()
    checksum = "SHA256"
}

Get-ChildItem -Path $backupDir -Recurse -File | ForEach-Object {
    $hash = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
    $manifest.files += @{
        path = $_.FullName.Replace($backupDir, "")
        hash = $hash
        size = $_.Length
    }
}

$manifest | ConvertTo-Json -Depth 10 | Out-File "$backupDir/manifest.json"

Write-Host "Backup created: $backupDir"
Write-Host "Files: $($manifest.files.Count)"
Write-Host "Manifest: $backupDir/manifest.json"

