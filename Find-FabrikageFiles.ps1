# List of all Fabrikage-related files and directories to move
$fabrikageComponents = @(
    # Main Directories
    "FABRIQUE",
    "FabricationSystem",
    "Fabrikage*",  # All Fabrikage-related directories
    
    # Root Level Files
    "FabricationSystem.ps1",
    "FabricationSystem.psd1",
    "FabricationFix.ps1",
    "IBM_Industrial_System.ps1",
    "Start-Fabrication.ps1",
    "Fix-FabricationSystem.ps1",
    "FabricationSystemManager.ps1",
    "Rotate-Logs.ps1",
    
    # Configuration Files
    "fabrication.config.json",
    "appsettings*.json",
    "*.config",
    
    # Documentation
    "README*.md",
    "CHANGELOG*.md",
    "LICENSE*",
    
    # Scripts and Utilities
    "Scripts\*.ps1",
    "Tools\*",
    
    # Module Files
    "*.psm1",
    "*.psd1",
    "*.ps1xml"
)

# Find all matching files and directories
$sourceRoot = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
$targetRoot = "D:\busineshuboffline CHATGTP\Master\Fabrikage"

# Create a detailed inventory
$inventory = @()
$totalSize = 0

Write-Host "`n🔍 Scanning for Fabrikage files in: $sourceRoot" -ForegroundColor Cyan
Write-Host "=" * 80

foreach ($pattern in $fabrikageComponents) {
    $items = Get-ChildItem -Path $sourceRoot -Filter $pattern -Recurse -ErrorAction SilentlyContinue | 
             Where-Object { $_.FullName -notlike "*\node_modules\*" -and 
                           $_.FullName -notlike "*\bin\*" -and 
                           $_.FullName -notlike "*\obj\*" }
    
    foreach ($item in $items) {
        $size = if ($item.PSIsContainer) {
            (Get-ChildItem $item.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
        } else {
            $item.Length
        }
        $totalSize += $size
        
        $inventory += [PSCustomObject]@{
            Name = $item.Name
            Path = $item.FullName
            Type = if ($item.PSIsContainer) { "Directory" } else { "File" }
            Size = if ($size) { "$([math]::Round($size/1KB, 2)) KB" } else { "N/A" }
            RelativePath = $item.FullName.Substring($sourceRoot.Length).TrimStart('\')
        }
        
        Write-Host "📁 $($item.FullName)" -ForegroundColor Cyan
    }
}

# Display summary
Write-Host "`n📊 INVENTORY SUMMARY" -ForegroundColor Green
Write-Host "=" * 80
Write-Host "Total items found: $($inventory.Count)"
Write-Host "Total size: $([math]::Round($totalSize/1MB, 2)) MB"
Write-Host "Target location: $targetRoot"

# Create a migration script
$migrationScript = @"
# Fabrikage Migration Script
# Generated: $(Get-Date)

`$sourceRoot = "$sourceRoot"
`$targetRoot = "$targetRoot"

# Create target directory if it doesn't exist
if (-not (Test-Path `$targetRoot)) {
    New-Item -ItemType Directory -Path `$targetRoot -Force | Out-Null
}

# Migration log
`$logFile = Join-Path `$targetRoot "migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path `$logFile -Force

# Copy each item
"@

# Add copy commands to the script
$inventory | ForEach-Object {
    $sourcePath = $_.Path
    $relativePath = $_.RelativePath
    $targetPath = Join-Path $targetRoot $relativePath
    
    if ($_.Type -eq "Directory") {
        $migrationScript += @"

# Copying directory: $relativePath
`$source = "`$sourceRoot\$relativePath"
`$target = "`$targetRoot\$relativePath"
if (-not (Test-Path `$target)) {
    New-Item -ItemType Directory -Path (Split-Path `$target -Parent) -Force | Out-Null
    Copy-Item -Path `$source -Destination `$target -Recurse -Force
    Write-Host "Copied directory: `$relativePath"
} else {
    Write-Host "Directory already exists: `$relativePath" -ForegroundColor Yellow
}
"@
    } else {
        $migrationScript += @"

# Copying file: $relativePath
`$source = "`$sourceRoot\$relativePath"
`$target = "`$targetRoot\$relativePath"
if (-not (Test-Path `$target)) {
    New-Item -ItemType Directory -Path (Split-Path `$target -Parent) -Force | Out-Null
    Copy-Item -Path `$source -Destination `$target -Force
    Write-Host "Copied file: `$relativePath"
} else {
    Write-Host "File already exists: `$relativePath" -ForegroundColor Yellow
}
"@
    }
}

# Add verification steps
$migrationScript += @"

# Verify the copy
`$verification = @()
`$allSuccess = `$true

"@

$inventory | ForEach-Object {
    $relativePath = $_.RelativePath
    $migrationScript += @"
# Verify: $relativePath
`$source = "`$sourceRoot\$relativePath"
`$target = "`$targetRoot\$relativePath"

if (Test-Path `$target) {
    `$sourceHash = if (Test-Path `$source -PathType Leaf) { 
        Get-FileHash `$source -Algorithm SHA256 | Select-Object -ExpandProperty Hash 
    } else { "DIRECTORY" }
    
    `$targetHash = if (Test-Path `$target -PathType Leaf) { 
        Get-FileHash `$target -Algorithm SHA256 | Select-Object -ExpandProperty Hash 
    } else { "DIRECTORY" }
    
    if (`$sourceHash -eq `$targetHash) {
        `$verification += [PSCustomObject]@{
            Item = "$relativePath"
            Status = "✅ Success"
            SourceSize = if ((Get-Item `$source -ErrorAction SilentlyContinue).Length) { 
                "$([math]::Round((Get-Item `$source).Length/1KB, 2)) KB" 
            } else { "N/A" }
        }
    } else {
        `$allSuccess = `$false
        `$verification += [PSCustomObject]@{
            Item = "$relativePath"
            Status = "❌ Failed"
            Details = "Hash mismatch"
        }
    }
} else {
    `$allSuccess = `$false
    `$verification += [PSCustomObject]@{
        Item = "$relativePath"
        Status = "❌ Missing"
        Details = "File/Directory not found in target"
    }
}

"@
}

# Add report generation
$migrationScript += @"

# Generate verification report
`$report = @"
# Fabrikage Migration Verification Report
## Generated: $(Get-Date)

## Summary
- Total Items: $($inventory.Count)
- Successfully Verified: `$((`$verification | Where-Object { `$_.Status -eq "✅ Success" }).Count)
- Failed: `$((`$verification | Where-Object { `$_.Status -ne "✅ Success" }).Count)
- Overall Status: `$(if (`$allSuccess) { "✅ SUCCESS" } else { "❌ FAILED" })

## Detailed Results
`$(`$verification | Format-Table -AutoSize | Out-String)

## Next Steps
1. Review the verification results above
2. Check the log file for any errors: `$logFile
3. Test the system in the new location
4. Update any configuration files with new paths
"@

`$report | Out-File -FilePath (Join-Path `$targetRoot "Migration_Verification_$(Get-Date -Format 'yyyyMMdd_HHmmss').md") -Force

if (`$allSuccess) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Migration completed with errors. Please check the verification report." -ForegroundColor Red
}

Stop-Transcript
"@

# Save the migration script
$scriptPath = Join-Path $PSScriptRoot "Move-FabrikageToMaster.ps1"
$migrationScript | Out-File -Path $scriptPath -Force

Write-Host "`n✅ Migration script created: $scriptPath" -ForegroundColor Green
Write-Host "Total items to migrate: $($inventory.Count)" -ForegroundColor Cyan
Write-Host "Estimated size: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor Cyan
Write-Host "`nTo execute the migration, run:" -ForegroundColor Yellow
Write-Host "Set-ExecutionPolicy Bypass -Scope Process -Force" -ForegroundColor White
Write-Host ".\Move-FabrikageToMaster.ps1" -ForegroundColor White