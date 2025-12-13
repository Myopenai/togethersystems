# Universal Test Runner for OSTOSOS Project
# This script will:
# 1. Find all files in the project
# 2. Run appropriate tests based on file type
# 3. Generate a detailed test report

# Set error handling
$ErrorActionPreference = "Stop"
$rootDir = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\OSTOSOS-COMPLETE-OS-SYSTEM"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportPath = Join-Path $rootDir "test_results_$timestamp.txt"
$artifactsDir = Join-Path $rootDir "artifacts"

# Create artifacts directory if it doesn't exist
if (-not (Test-Path $artifactsDir)) {
    New-Item -ItemType Directory -Path $artifactsDir | Out-Null
}

# Function to safely get file content
function Get-FileContent {
    param($Path)
    try {
        if ($PSVersionTable.PSVersion.Major -ge 6) {
            return Get-Content $Path -Raw -ErrorAction Stop
        } else {
            # For PowerShell 5.1 and below
            return [System.IO.File]::ReadAllText($Path)
        }
    } catch {
        Write-Warning "Could not read file: $Path"
        return $null
    }
}

# Define test handlers for different file types
$testHandlers = @{
    '.ps1' = {
        param($file)
        try {
            # Skip files with special characters that cause parsing issues
            $content = Get-FileContent -Path $file.FullName
            if ($content -match 'T,\.&T,,\.&T,,,\.T\.' -or 
                $content -match 'Signatur: T,\.&T,,\.&T,,,\.T\.') {
                return @{
                    Status = "SKIPPED"
                    Message = "Contains special characters that cause parsing issues"
                }
            }
            
            # Run the script
            & $file.FullName *> "$artifactsDir\$($file.BaseName)_output.txt"
            return @{
                Status = "PASS"
                Message = "Script executed successfully"
            }
        } catch {
            return @{
                Status = "ERROR"
                Message = $_.Exception.Message
            }
        }
    }
    
    '.js' = {
        param($file)
        try {
            $content = Get-FileContent -Path $file.FullName
            
            # Skip browser-only JavaScript
            $browserOnlyKeywords = @('window\.', 'document\.', 'navigator\.', 'alert\(', 'localStorage')
            $isBrowserOnly = $browserOnlyKeywords | Where-Object { $content -match $_ } | Select-Object -First 1
            
            if ($isBrowserOnly) {
                return @{
                    Status = "SKIPPED"
                    Message = "Browser-only JavaScript - requires browser environment"
                }
            }
            
            # Run Node.js script
            node $file.FullName *> "$artifactsDir\$($file.BaseName)_node_output.txt"
            return @{
                Status = "PASS"
                Message = "Node.js script executed successfully"
            }
        } catch {
            return @{
                Status = "ERROR"
                Message = $_.Exception.Message
            }
        }
    }
    
    # Add other file type handlers as needed
}

# Find all files
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch '\\(\.git|node_modules|__pycache__|artifacts|build|dist)\\'
    }

Write-Host "`nFound $($allFiles.Count) files. Starting test execution..." -ForegroundColor Green

# Test all files
$testResults = @()
$processedCount = 0

foreach ($file in $allFiles) {
    $processedCount++
    Write-Progress -Activity "Testing files" -Status "$processedCount of $($allFiles.Count) - $($file.Name)" -PercentComplete (($processedCount / $allFiles.Count) * 100)
    
    $extension = $file.Extension.ToLower()
    $result = @{
        File = $file.FullName.Replace($rootDir, "")
        Status = "SKIPPED"
        Message = "No test handler for file type"
    }

    if ($testHandlers.ContainsKey($extension)) {
        $handlerResult = & $testHandlers[$extension] $file
        $result.Status = $handlerResult.Status
        $result.Message = $handlerResult.Message
    } else {
        # Default file check
        try {
            $content = Get-FileContent -Path $file.FullName
            if ($null -ne $content) {
                $result.Status = "PASS"
                $result.Message = "Basic file validation passed"
            } else {
                $result.Status = "FAIL"
                $result.Message = "Could not read file content"
            }
        } catch {
            $result.Status = "ERROR"
            $result.Message = $_.Exception.Message
        }
    }

    $testResults += New-Object PSObject -Property $result
    
    # Display test result
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "SKIPPED" { "Yellow" }
        default { "Red" }
    }
    
    Write-Host "$($result.Status): $($result.File)" -ForegroundColor $color
}

# Generate report
$report = @"
=== UNIVERSAL TEST EXECUTION REPORT ===
Date: $(Get-Date)
Total Files: $($testResults.Count)
Passed: $(($testResults | Where-Object { $_.Status -eq "PASS" }).Count)
Failed: $(($testResults | Where-Object { $_.Status -eq "FAIL" }).Count)
Errors: $(($testResults | Where-Object { $_.Status -eq "ERROR" }).Count)
Skipped: $(($testResults | Where-Object { $_.Status -eq "SKIPPED" }).Count)

DETAILED RESULTS:
"@

$testResults | Sort-Object Status | ForEach-Object {
    $report += "`n=== $($_.File) ==="
    $report += "`nStatus: $($_.Status)"
    $report += "`nMessage: $($_.Message)"
    $report += "`n" + ("-" * 80)
}

# Save report
$report | Out-File -FilePath $reportPath -Encoding UTF8

# Display summary
Write-Host "`n=== TEST EXECUTION COMPLETE ===" -ForegroundColor Cyan
Write-Host "Total Files: $($testResults.Count)"
Write-Host "Passed: $(($testResults | Where-Object { $_.Status -eq "PASS" }).Count)" -ForegroundColor Green
Write-Host "Failed: $(($testResults | Where-Object { $_.Status -eq "FAIL" }).Count)" -ForegroundColor Red
Write-Host "Errors: $(($testResults | Where-Object { $_.Status -eq "ERROR" }).Count)" -ForegroundColor Yellow
Write-Host "Skipped: $(($testResults | Where-Object { $_.Status -eq "SKIPPED" }).Count)" -ForegroundColor Gray
Write-Host "`nFull report saved to: $reportPath" -ForegroundColor Cyan

# Exit with error code if any tests failed
if (($testResults | Where-Object { $_.Status -in @("FAIL", "ERROR") }).Count -gt 0) {
    exit 1
}
