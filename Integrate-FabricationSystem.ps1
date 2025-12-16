<#
.SYNOPSIS
    Fabrication System Integrator
.DESCRIPTION
    Integrates with existing Fabrication System components
    and ensures proper functionality across all modules.
#>

# Configuration
$rootPath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
$logPath = Join-Path -Path $rootPath -ChildPath "FabricationIntegration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Start logging
Start-Transcript -Path $logPath -Force
Write-Host "=== Fabrication System Integration ===" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date)" -ForegroundColor Cyan
Write-Host "Root path: $rootPath" -ForegroundColor Cyan

# Function to write status
function Write-Status {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# Discover all Fabrication components
$fabFolders = @(
    "Fabrikage.ProvenanceLedger",
    "FABRIKAGE_SYSTEM",
    "FabrikageAIExtension",
    "FABRIQUE",
    "fabrique-ai",
    "Farbriqautions",
    "FabricationSystem",
    "Fabrikage",
    "Fabrikage.AutoExecution",
    "Fabrikage.CoreProtocols",
    "Fabrikage.IntelligenceMatrix",
    "Fabrikage.ObservabilityAtlas",
    "Fabrikage.PromptProcessing"
)

# Process each component
foreach ($folder in $fabFolders) {
    $fullPath = Join-Path -Path $rootPath -ChildPath $folder
    
    if (Test-Path -Path $fullPath) {
        Write-Status "Processing: $folder" "Yellow"
        
        # Check for common files
        $moduleFiles = Get-ChildItem -Path $fullPath -Filter "*.psm1" -Recurse -ErrorAction SilentlyContinue
        
        if ($moduleFiles.Count -gt 0) {
            Write-Status "  Found $($moduleFiles.Count) module files" "Green"
            
            foreach ($file in $moduleFiles) {
                try {
                    # Import the module
                    $moduleName = $file.BaseName
                    Write-Status "  Importing module: $($file.Name)" "Cyan"
                    
                    Import-Module $file.FullName -Force -ErrorAction Stop
                    
                    # Test basic functionality if possible
                    $testCmds = @("Get-$moduleName", "Test-$moduleName", "Start-$moduleName")
                    foreach ($cmd in $testCmds) {
                        if (Get-Command -Name $cmd -ErrorAction SilentlyContinue) {
                            $result = & $cmd -ErrorAction Stop
                            Write-Status "  Successfully tested: $cmd" "Green"
                            $result | Format-List * | Out-String -Stream | ForEach-Object { Write-Status "    $_" "Gray" }
                            break
                        }
                    }
                    
                    # Check for required functions
                    $requiredFuncs = @("Initialize", "Start", "Stop", "Get-Status")
                    $missingFuncs = $requiredFuncs | Where-Object { -not (Get-Command -Name "$moduleName\$_" -ErrorAction SilentlyContinue) }
                    
                    if ($missingFuncs.Count -gt 0) {
                        Write-Status "  Warning: Missing standard functions: $($missingFuncs -join ', ')" "Yellow"
                    }
                    
                    # Create/Update module manifest if missing
                    $manifestPath = Join-Path -Path $file.DirectoryName -ChildPath "$($file.BaseName).psd1"
                    if (-not (Test-Path -Path $manifestPath)) {
                        $manifestContent = @"
@{
    ModuleVersion = '1.0.0'
    GUID = '$(New-Guid)'
    Author = 'Fabrication System'
    CompanyName = 'Together Systems'
    Copyright = 'Copyright (c) 2025'
    Description = 'Automatically generated module manifest for $moduleName'
    PowerShellVersion = '5.1'
    RootModule = '$($file.Name)'
    FunctionsToExport = @('*')
    CmdletsToExport = @()
    VariablesToExport = @()
    AliasesToExport = @()
}
"@
                        $manifestContent | Out-File -FilePath $manifestPath -Encoding utf8 -Force
                        Write-Status "  Created module manifest: $($file.BaseName).psd1" "Green"
                    }
                    
                    # Check for dependencies
                    $moduleContent = Get-Content -Path $file.FullName -Raw
                    if ($moduleContent -match "using module|#requires -Module") {
                        Write-Status "  Module has dependencies" "Cyan"
                        # TODO: Handle dependencies
                    }
                    
                } catch {
                    Write-Status "  Error processing $($file.Name): $_" "Red"
                }
            }
        } else {
            Write-Status "  No module files found" "Yellow"
            
            # Check for other important files
            $importantFiles = Get-ChildItem -Path $fullPath -Include *.ps1,*.dll,*.exe -Recurse -ErrorAction SilentlyContinue
            if ($importantFiles.Count -gt 0) {
                Write-Status "  Found $($importantFiles.Count) important files" "Green"
                $importantFiles | ForEach-Object {
                    Write-Status "    - $($_.Name) ($($_.Extension))" "Gray"
                }
            }
        }
        
        # Check for configuration files
        $configFiles = Get-ChildItem -Path $fullPath -Include *.json,*.config,*.yaml,*.yml -Recurse -ErrorAction SilentlyContinue
        if ($configFiles.Count -gt 0) {
            Write-Status "  Found $($configFiles.Count) configuration files" "Cyan"
        }
        
        # Check for documentation
        $docs = Get-ChildItem -Path $fullPath -Include README*.md,*.md -Recurse -ErrorAction SilentlyContinue
        if ($docs.Count -gt 0) {
            Write-Status "  Found documentation: $($docs.Name -join ', ')" "Green"
        }
        
        Write-Status "----------------------------------------" "Gray"
    } else {
        Write-Status "Directory not found: $folder" "Red"
    }
}

# Create integration summary
Write-Host "`n=== Integration Summary ===" -ForegroundColor Cyan
Write-Host "Processed $($fabFolders.Count) Fabrication components" -ForegroundColor White
Write-Host "Log file: $logPath" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the log file for any issues" -ForegroundColor White
Write-Host "2. Test each component individually" -ForegroundColor White
Write-Host "3. Update any missing configurations" -ForegroundColor White

Stop-Transcript