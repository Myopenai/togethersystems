# T,. OSOTOSOS Windows Installer Creator
# Erstellt MSIX oder Inno Setup Installer

$ErrorActionPreference = "Stop"

$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Windows Installer Creator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$BUILD_DIR = "..\build\windows-amd64"
$INSTALLER_DIR = "..\installers\windows"
$APP_NAME = "ostosos-server"
$VERSION = "1.0.0"

# Prüfe ob Binary existiert
if (-not (Test-Path "$BUILD_DIR\$APP_NAME.exe")) {
    Write-Host "FEHLER: Binary nicht gefunden: $BUILD_DIR\$APP_NAME.exe" -ForegroundColor $RED
    Write-Host "Bitte erst Build ausführen: ..\build-all.ps1" -ForegroundColor $YELLOW
    exit 1
}

# Erstelle Installer-Verzeichnis
if (-not (Test-Path $INSTALLER_DIR)) {
    New-Item -ItemType Directory -Path $INSTALLER_DIR -Force | Out-Null
}

Write-Host "Erstelle Windows Installer..." -ForegroundColor $CYAN

# Option 1: Inno Setup Script erstellen
$innoScript = @"
[Setup]
AppId={{OSTOSOS-UNIQUE-ID-2025}}
AppName=OSTOSOS Server
AppVersion=$VERSION
AppPublisher=Together Systems
AppPublisherURL=https://tel1.nl
DefaultDirName={autopf}\OSTOSOS
DefaultGroupName=OSTOSOS
OutputDir=$INSTALLER_DIR
OutputBaseFilename=ostosos-server-setup-$VERSION
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
SetupIconFile=
UninstallDisplayIcon={app}\$APP_NAME.exe
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "$BUILD_DIR\$APP_NAME.exe"; DestDir: "{app}"; Flags: ignoreversion

[Run]
Filename: "{app}\$APP_NAME.exe"; Description: "Start OSTOSOS Server"; Flags: nowait postinstall skipifsilent

[Icons]
Name: "{group}\OSTOSOS Server"; Filename: "{app}\$APP_NAME.exe"
Name: "{group}\Uninstall OSTOSOS"; Filename: "{uninstallexe}"
Name: "{autodesktop}\OSTOSOS Server"; Filename: "{app}\$APP_NAME.exe"
"@

$innoScriptPath = Join-Path $INSTALLER_DIR "ostosos-installer.iss"
$innoScript | Out-File -FilePath $innoScriptPath -Encoding UTF8

Write-Host "✓ Inno Setup Script erstellt: $innoScriptPath" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Zum Erstellen des Installers:" -ForegroundColor $YELLOW
Write-Host "  1. Installiere Inno Setup: https://jrsoftware.org/isdl.php" -ForegroundColor $CYAN
Write-Host "  2. Öffne: $innoScriptPath" -ForegroundColor $CYAN
Write-Host "  3. Klicke: Build > Compile" -ForegroundColor $CYAN
Write-Host ""

# Option 2: Einfacher ZIP-Installer mit Auto-Start
Write-Host "Erstelle ZIP-Installer mit Auto-Start..." -ForegroundColor $CYAN

$zipDir = Join-Path $INSTALLER_DIR "ostosos-server-$VERSION"
if (Test-Path $zipDir) {
    Remove-Item -Path $zipDir -Recurse -Force
}
New-Item -ItemType Directory -Path $zipDir -Force | Out-Null

# Kopiere Binary
Copy-Item "$BUILD_DIR\$APP_NAME.exe" -Destination $zipDir -Force

# Erstelle Start-Script
$startScript = @"
@echo off
echo Starting OSTOSOS Server...
start "" "$APP_NAME.exe"
"@
$startScript | Out-File -FilePath (Join-Path $zipDir "START-OSTOSOS.bat") -Encoding ASCII

# Erstelle README
$readme = @"
OSTOSOS Server $VERSION

Installation:
1. Extrahiere alle Dateien in einen Ordner (z.B. C:\OSTOSOS)
2. Führe START-OSTOSOS.bat aus
3. Der Server startet automatisch auf http://localhost:8080

T,.&T,,.&T,,,.T. - Together Systems
"@
$readme | Out-File -FilePath (Join-Path $zipDir "README.txt") -Encoding UTF8

# Erstelle ZIP
$zipPath = Join-Path $INSTALLER_DIR "ostosos-server-$VERSION-windows.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
Compress-Archive -Path "$zipDir\*" -DestinationPath $zipPath -Force

Write-Host "✓ ZIP-Installer erstellt: $zipPath" -ForegroundColor $GREEN
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Windows Installer erstellt!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Installer befindet sich in: $INSTALLER_DIR" -ForegroundColor $CYAN

