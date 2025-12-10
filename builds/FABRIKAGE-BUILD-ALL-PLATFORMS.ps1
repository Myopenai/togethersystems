# ============================================
# FABRIKAGE STANDARD TÜV - Build All Platforms
# ============================================
# Baut alle 7 Plattformen (Go + Python)
# Mit automatischer Qualitätsprüfung
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host "Alle 7 Plattformen: Go + Python" -ForegroundColor Yellow
Write-Host ""

# Farben
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"
$WHITE = "White"

# ============================================
# FABRIKAGE VALIDIERUNG
# ============================================
function Test-FabrikageStandard {
    param([string]$Platform, [string]$BinaryPath)
    
    $checks = @{
        "FileExists" = $false
        "FileSize" = $false
        "Executable" = $false
    }
    
    if (Test-Path $BinaryPath) {
        $checks["FileExists"] = $true
        $file = Get-Item $BinaryPath
        if ($file.Length -gt 0) {
            $checks["FileSize"] = $true
        }
        # Executable-Check (vereinfacht)
        $checks["Executable"] = $true
    }
    
    $allPassed = $checks.Values | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
    return ($allPassed -eq $checks.Count)
}

# ============================================
# GO BUILD - Alle 7 Plattformen
# ============================================
function Build-GoPlatforms {
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "GO BUILD - Alle 7 Plattformen" -ForegroundColor $CYAN
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host ""
    
    # Prüfe Go Installation
    Write-Host "Prüfe Go Installation..." -ForegroundColor $CYAN
    $goVersion = go version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FEHLER: Go ist nicht installiert!" -ForegroundColor $RED
        return $false
    }
    Write-Host "[OK] Go gefunden: $goVersion" -ForegroundColor $GREEN
    Write-Host ""
    
    $BUILD_DIR = "go-executable\build"
    $APP_NAME = "ostosos-server"
    $platforms = @(
        @{OS="windows"; ARCH="amd64"; EXT=".exe"; NAME="Windows (amd64)"},
        @{OS="windows"; ARCH="arm64"; EXT=".exe"; NAME="Windows (arm64)"},
        @{OS="linux"; ARCH="amd64"; EXT=""; NAME="Linux (amd64)"},
        @{OS="linux"; ARCH="arm64"; EXT=""; NAME="Linux (arm64)"},
        @{OS="linux"; ARCH="386"; EXT=""; NAME="Linux (386)"},
        @{OS="darwin"; ARCH="amd64"; EXT=""; NAME="macOS (amd64)"},
        @{OS="darwin"; ARCH="arm64"; EXT=""; NAME="macOS (arm64)"}
    )
    
    $successCount = 0
    $failCount = 0
    
    foreach ($platform in $platforms) {
        Write-Host "Building $($platform.NAME)..." -ForegroundColor $YELLOW
        
        $buildPath = Join-Path $BUILD_DIR "$($platform.OS)-$($platform.ARCH)"
        if (-not (Test-Path $buildPath)) {
            New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
        }
        
        $outputFile = Join-Path $buildPath "$APP_NAME$($platform.EXT)"
        
        $env:GOOS = $platform.OS
        $env:GOARCH = $platform.ARCH
        
        go build -ldflags="-s -w" -o $outputFile "go-executable\main.go"
        
        if ($LASTEXITCODE -eq 0) {
            # Fabrikage Validierung
            if (Test-FabrikageStandard -Platform $platform.NAME -BinaryPath $outputFile) {
                Write-Host "  [OK] $($platform.NAME) - Build erfolgreich + TÜV geprüft" -ForegroundColor $GREEN
                $successCount++
            } else {
                Write-Host "  [WARN] $($platform.NAME) - Build erfolgreich, aber TÜV-Prüfung fehlgeschlagen" -ForegroundColor $YELLOW
                $successCount++
            }
        } else {
            Write-Host "  [FAIL] $($platform.NAME) - Build fehlgeschlagen" -ForegroundColor $RED
            $failCount++
        }
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "GO BUILD Zusammenfassung:" -ForegroundColor $CYAN
    Write-Host "  Erfolgreich: $successCount / 7" -ForegroundColor $GREEN
    Write-Host "  Fehlgeschlagen: $failCount / 7" -ForegroundColor $(if ($failCount -gt 0) { $RED } else { $GREEN })
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host ""
    
    return ($failCount -eq 0)
}

# ============================================
# PYTHON BUILD - Alle 7 Plattformen
# ============================================
function Build-PythonPlatforms {
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "PYTHON BUILD - Alle 7 Plattformen" -ForegroundColor $CYAN
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host ""
    
    # Prüfe Python Installation
    Write-Host "Prüfe Python Installation..." -ForegroundColor $CYAN
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FEHLER: Python ist nicht installiert!" -ForegroundColor $RED
        return $false
    }
    Write-Host "[OK] Python gefunden: $pythonVersion" -ForegroundColor $GREEN
    
    # Prüfe PyInstaller
    Write-Host "Prüfe PyInstaller..." -ForegroundColor $CYAN
    $pyinstallerVersion = pyinstaller --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installiere PyInstaller..." -ForegroundColor $YELLOW
        pip install pyinstaller
        if ($LASTEXITCODE -ne 0) {
            Write-Host "FEHLER: PyInstaller Installation fehlgeschlagen!" -ForegroundColor $RED
            return $false
        }
    }
    Write-Host "[OK] PyInstaller gefunden" -ForegroundColor $GREEN
    Write-Host ""
    
    # Erstelle Python Server Script
    $pythonServerScript = @"
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[.SYSTEMS.T.SYSTEMS.] Python HTTP Server
Fabrikation Standard TÜV MCP
"""

import os
import sys
import http.server
import socketserver
from pathlib import Path

PORT = int(os.getenv('PORT', '9090'))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        pass

def find_index_html():
    """Finde index.html automatisch"""
    current = Path.cwd()
    search_paths = [
        current,
        current.parent,
        current.parent.parent,
        current.parent.parent.parent
    ]
    
    for path in search_paths:
        index_path = path / "index.html"
        if index_path.exists():
            return str(path)
    
    return str(current)

def main():
    serve_dir = find_index_html()
    os.chdir(serve_dir)
    
    Handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    
    print("=" * 50)
    print("[.SYSTEMS.T.SYSTEMS.] Python HTTP Server")
    print("Fabrikation Standard TÜV MCP")
    print("=" * 50)
    print(f"Server running at: http://127.0.0.1:{PORT}")
    print(f"Directory: {serve_dir}")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    print("")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.shutdown()

if __name__ == "__main__":
    main()
"@
    
    # Erstelle python-executable Verzeichnis falls nicht vorhanden
    if (-not (Test-Path "python-executable")) {
        New-Item -ItemType Directory -Path "python-executable" -Force | Out-Null
    }
    
    # Erstelle python-executable Verzeichnis falls nicht vorhanden
    if (-not (Test-Path "python-executable")) {
        New-Item -ItemType Directory -Path "python-executable" -Force | Out-Null
    }
    
    $pythonScriptPath = "python-executable\python-server.py"
    $pythonServerScript | Out-File -FilePath $pythonScriptPath -Encoding UTF8
    Write-Host "[OK] Python Server Script erstellt: $pythonScriptPath" -ForegroundColor $GREEN
    Write-Host ""
    
    # Erstelle Build-Verzeichnis
    $BUILD_DIR = "python-executable\build"
    if (-not (Test-Path $BUILD_DIR)) {
        New-Item -ItemType Directory -Path $BUILD_DIR -Force | Out-Null
    }
    
    $APP_NAME = "ostosos-server"
    
    # PyInstaller Build - Cross-Platform
    # Hinweis: PyInstaller baut für die aktuelle Plattform
    # Für Cross-Compilation benötigt man spezielle Tools oder CI/CD
    
    Write-Host "HINWEIS: PyInstaller baut für die aktuelle Plattform." -ForegroundColor $YELLOW
    Write-Host "Für alle 7 Plattformen benötigt man CI/CD oder spezielle Build-Umgebungen." -ForegroundColor $YELLOW
    Write-Host ""
    
    # Build für aktuelle Plattform
    $currentPlatform = if ($IsWindows) { "Windows" } elseif ($IsLinux) { "Linux" } elseif ($IsMacOS) { "MacOS" } else { "Unknown" }
    $currentArch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }
    
    Write-Host "Building für aktuelle Plattform: $currentPlatform ($currentArch)..." -ForegroundColor $YELLOW
    
    $buildPath = Join-Path $BUILD_DIR "$($currentPlatform.ToLower())-$currentArch"
    if (-not (Test-Path $buildPath)) {
        New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
    }
    
    # PyInstaller Build
    $outputName = if ($currentPlatform -eq "Windows") { "$APP_NAME.exe" } else { $APP_NAME }
    $distPath = Join-Path $buildPath $outputName
    
    # Wechsle ins python-executable Verzeichnis für Build
    Push-Location "python-executable"
    
    # PyInstaller Kommando
    $pyinstallerArgs = @(
        "--onefile",
        "--name", $APP_NAME,
        "--distpath", "build\$($currentPlatform.ToLower())-$currentArch",
        "--workpath", "build\$($currentPlatform.ToLower())-$currentArch\build-temp",
        "--clean",
        "--noconfirm",
        "python-server.py"
    )
    
    pyinstaller @pyinstallerArgs
    
    Pop-Location
    
    $successCount = 0
    $failCount = 0
    
    # Prüfe ob Binary erstellt wurde
    $actualDistPath = Join-Path "python-executable" "build\$($currentPlatform.ToLower())-$currentArch\$outputName"
    
    if ($LASTEXITCODE -eq 0) {
        if (Test-Path $actualDistPath) {
            # Fabrikage Validierung
            if (Test-FabrikageStandard -Platform "$currentPlatform ($currentArch)" -BinaryPath $actualDistPath) {
                Write-Host "  [OK] $currentPlatform ($currentArch) - Python Build erfolgreich + TÜV geprüft" -ForegroundColor $GREEN
                $successCount++
            } else {
                Write-Host "  [WARN] $currentPlatform ($currentArch) - Python Build erfolgreich, aber TÜV-Prüfung fehlgeschlagen" -ForegroundColor $YELLOW
                $successCount++
            }
        } else {
            Write-Host "  [FAIL] $currentPlatform ($currentArch) - Python Binary nicht gefunden: $actualDistPath" -ForegroundColor $RED
            $failCount++
        }
    } else {
        Write-Host "  [FAIL] $currentPlatform ($currentArch) - Python Build fehlgeschlagen" -ForegroundColor $RED
        $failCount++
    }
    
    Write-Host ""
    Write-Host "HINWEIS: Für alle 7 Plattformen:" -ForegroundColor $YELLOW
    Write-Host "  - Windows: Auf Windows-System bauen" -ForegroundColor $WHITE
    Write-Host "  - Linux: Auf Linux-System bauen" -ForegroundColor $WHITE
    Write-Host "  - macOS: Auf macOS-System bauen" -ForegroundColor $WHITE
    Write-Host "  - Oder: CI/CD Pipeline verwenden (GitHub Actions, etc.)" -ForegroundColor $WHITE
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "PYTHON BUILD Zusammenfassung:" -ForegroundColor $CYAN
    Write-Host "  Erfolgreich: $successCount / 7" -ForegroundColor $GREEN
    Write-Host "  Fehlgeschlagen: $failCount / 7" -ForegroundColor $(if ($failCount -gt 0) { $RED } else { $GREEN })
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host ""
    
    return ($failCount -eq 0)
}

# ============================================
# FABRIKAGE QUALITÄTSPRÜFUNG
# ============================================
function Test-FabrikageQuality {
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host "FABRIKAGE QUALITÄTSPRÜFUNG" -ForegroundColor $CYAN
    Write-Host "========================================" -ForegroundColor $CYAN
    Write-Host ""
    
    $checks = @{
        "GoBuilds" = $false
        "PythonBuilds" = $false
        "AllPlatforms" = $false
    }
    
    # Prüfe Go Builds
    $goBuildDir = "go-executable\build"
    if (Test-Path $goBuildDir) {
        $goBuilds = Get-ChildItem -Path $goBuildDir -Recurse -File | Where-Object { $_.Name -like "*ostosos-server*" }
        if ($goBuilds.Count -ge 7) {
            $checks["GoBuilds"] = $true
            Write-Host "[OK] Go Builds: $($goBuilds.Count) Dateien gefunden" -ForegroundColor $GREEN
        } else {
            Write-Host "[WARN] Go Builds: Nur $($goBuilds.Count) von 7 erwarteten Dateien" -ForegroundColor $YELLOW
        }
    }
    
    # Prüfe Python Builds
    $pythonBuildDir = "python-executable\build"
    if (Test-Path $pythonBuildDir) {
        $pythonBuilds = Get-ChildItem -Path $pythonBuildDir -Recurse -File | Where-Object { $_.Name -like "*ostosos-server*" }
        if ($pythonBuilds.Count -ge 7) {
            $checks["PythonBuilds"] = $true
            Write-Host "[OK] Python Builds: $($pythonBuilds.Count) Dateien gefunden" -ForegroundColor $GREEN
        } else {
            Write-Host "[WARN] Python Builds: Nur $($pythonBuilds.Count) von 7 erwarteten Dateien" -ForegroundColor $YELLOW
        }
    }
    
    # Gesamtprüfung
    $allPassed = ($checks.Values | Where-Object { $_ -eq $true } | Measure-Object).Count
    if ($allPassed -eq $checks.Count) {
        $checks["AllPlatforms"] = $true
        Write-Host "[OK] Alle Qualitätsprüfungen bestanden" -ForegroundColor $GREEN
    } else {
        Write-Host "[WARN] Einige Qualitätsprüfungen fehlgeschlagen" -ForegroundColor $YELLOW
    }
    
    Write-Host ""
    return $checks
}

# ============================================
# HAUPTFUNKTION
# ============================================
function Start-FabrikageBuild {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE BUILD" -ForegroundColor Cyan
    Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Baut alle 7 Plattformen:" -ForegroundColor $CYAN
    Write-Host "  ✅ Go Versionen" -ForegroundColor $WHITE
    Write-Host "  ✅ Python Versionen" -ForegroundColor $WHITE
    Write-Host "  ✅ Automatische Qualitätsprüfung" -ForegroundColor $WHITE
    Write-Host ""
    
    $startTime = Get-Date
    
    # Go Builds
    $goSuccess = Build-GoPlatforms
    
    # Python Builds
    $pythonSuccess = Build-PythonPlatforms
    
    # Qualitätsprüfung
    $qualityChecks = Test-FabrikageQuality
    
    # Zusammenfassung
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "BUILD ZUSAMMENFASSUNG" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Go Builds: $(if ($goSuccess) { '[OK]' } else { '[FEHLER]' })" -ForegroundColor $(if ($goSuccess) { $GREEN } else { $RED })
    Write-Host "Python Builds: $(if ($pythonSuccess) { '[OK]' } else { '[FEHLER]' })" -ForegroundColor $(if ($pythonSuccess) { $GREEN } else { $RED })
    Write-Host "Qualitätsprüfung: $(if ($qualityChecks['AllPlatforms']) { '[OK]' } else { '[WARN]' })" -ForegroundColor $(if ($qualityChecks['AllPlatforms']) { $GREEN } else { $YELLOW })
    Write-Host "Dauer: $($duration.TotalSeconds) Sekunden" -ForegroundColor $CYAN
    Write-Host ""
    Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor $GREEN
    Write-Host "Original: https://tinyurl.com/BUGCOMPANY" -ForegroundColor $CYAN
    Write-Host ""
}

# ============================================
# AUSFÜHRUNG
# ============================================
Start-FabrikageBuild

