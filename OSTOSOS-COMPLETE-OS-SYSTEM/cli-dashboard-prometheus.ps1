# T,. OSOTOSOS - CLI Dashboard with Prometheus Metrics (PowerShell)
# Überwacht 12 kritische Metriken des Systems

$ErrorActionPreference = "Continue"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Get-Metric {
    param([string]$Name, [scriptblock]$Check)
    try {
        $result = & $Check
        return @{
            Name = $Name
            Value = $result
            Status = if ($result -is [bool]) { if ($result) { "OK" } else { "FAIL" } } else { "OK" }
        }
    } catch {
        return @{
            Name = $Name
            Value = "ERROR"
            Status = "ERROR"
            Error = $_.Exception.Message
        }
    }
}

function Show-Dashboard {
    Write-Host ""
    Write-ColorOutput Cyan "=== T,. OSOTOSOS - CLI Dashboard ==="
    Write-Host ""
    
    $metrics = @(
        (Get-Metric "HTML Files" { (Get-ChildItem -Path . -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "JavaScript Files" { (Get-ChildItem -Path . -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "CSS Files" { (Get-ChildItem -Path . -Filter "*.css" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "Build Artifacts" { (Get-ChildItem -Path "build" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "Signatures" { (Get-ChildItem -Path "signatures" -Filter "*.sig" -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "SBOM Files" { (Get-ChildItem -Path "sbom" -Filter "*.sbom.json" -ErrorAction SilentlyContinue | Measure-Object).Count }),
        (Get-Metric "Core Files Exist" { 
            $files = @("osos-tos-production-portal.html", "osos-tos-production-core.js", "window-manager-core.js", "taskbar-core.js")
            $allExist = $true
            foreach ($file in $files) {
                if (-not (Test-Path $file)) { $allExist = $false; break }
            }
            $allExist
        }),
        (Get-Metric "Dashboard Auto-Start" { Test-Path "dashboard-auto-start.js" }),
        (Get-Metric "UX Wähler" { Test-Path "ux-waehler-complete.js" }),
        (Get-Metric "Multi-Window Menu" { Test-Path "multi-window-menu.js" }),
        (Get-Metric "Build Pipeline" { Test-Path "install_universal_build.sh" }),
        (Get-Metric "TÜV Script" { Test-Path "tuv.ps1" })
    )
    
    foreach ($metric in $metrics) {
        $statusColor = switch ($metric.Status) {
            "OK" { "Green" }
            "FAIL" { "Red" }
            default { "Yellow" }
        }
        
        Write-Host -NoNewline "  "
        Write-ColorOutput $statusColor "$($metric.Status.PadRight(5))"
        Write-Host -NoNewline " | "
        Write-Host -NoNewline "$($metric.Name.PadRight(25))"
        Write-Host " | $($metric.Value)"
        
        if ($metric.Error) {
            Write-ColorOutput Red "      Error: $($metric.Error)"
        }
    }
    
    Write-Host ""
    Write-ColorOutput Cyan "=== End Dashboard ==="
    Write-Host ""
}

# Continuous monitoring
if ($args -contains "--watch" -or $args -contains "-w") {
    Write-Host "Watching mode - Press Ctrl+C to stop"
    while ($true) {
        Clear-Host
        Show-Dashboard
        Start-Sleep -Seconds 5
    }
} else {
    Show-Dashboard
}

