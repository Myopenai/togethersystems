# ╔═══════════════════════════════════════════════════════════════════╗
# ║     THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT (PowerShell)         ║
# ╚═══════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DeployDir = Join-Path $ScriptDir "THYNK-ORDERS-FINAL"
$Version = "1.0.0"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Clear-Host
Write-Output ""
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-ColorOutput "Yellow" "   🚀 THYNK ORDERS - ONE-CLICK FULL DEPLOYMENT"
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-Output ""

# 1. Lösche alten Ordner
if (Test-Path $DeployDir) {
    Write-ColorOutput "Yellow" "⚠️  Alten Deployment-Ordner gefunden. Lösche..."
    Remove-Item -Path $DeployDir -Recurse -Force
    Write-ColorOutput "Green" "✅ Alten Ordner gelöscht"
}

# 2. Erstelle Ordner-Struktur
Write-ColorOutput "Cyan" "📁 Erstelle Ordner-Struktur..."
New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "docs\de") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "docs\nl") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "docs\en") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "backups") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "config") -Force | Out-Null
Write-ColorOutput "Green" "✅ Ordner-Struktur erstellt"

# 3. Kopiere Haupt-Application
Write-ColorOutput "Cyan" "📄 Kopiere Haupt-Application..."
$SourceHtml1 = Join-Path $ScriptDir "THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html"
$SourceHtml2 = Join-Path $ScriptDir "THYNK-ORDERS-COMPLETE.html"
$DestHtml = Join-Path $DeployDir "index.html"

if (Test-Path $SourceHtml1) {
    Copy-Item -Path $SourceHtml1 -Destination $DestHtml -Force
    Write-ColorOutput "Green" "✅ index.html kopiert (mit Theme-Switcher)"
} elseif (Test-Path $SourceHtml2) {
    Copy-Item -Path $SourceHtml2 -Destination $DestHtml -Force
    Write-ColorOutput "Green" "✅ index.html kopiert"
} else {
    Write-ColorOutput "Red" "❌ Haupt-HTML-Datei nicht gefunden!"
    exit 1
}

# 4-6. Kopiere Dokumentationen
Write-ColorOutput "Cyan" "📚 Kopiere Dokumentationen..."

$DeDocs = @("DOKUMENTATION-COMPLETE-DE.md", "ANLEITUNG-FUER-DUMMIES.md", "DATENBANK-DOKUMENTATION.md")
foreach ($doc in $DeDocs) {
    $source = Join-Path $ScriptDir $doc
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination (Join-Path $DeployDir "docs\de") -Force
        Write-ColorOutput "Green" "  ✅ $doc"
    }
}

$NlDocs = @("DOKUMENTATION-COMPLETE-NL.md", "README-NL.md")
foreach ($doc in $NlDocs) {
    $source = Join-Path $ScriptDir $doc
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination (Join-Path $DeployDir "docs\nl") -Force
        Write-ColorOutput "Green" "  ✅ $doc"
    }
}

$EnDocs = @("DOKUMENTATION-COMPLETE-EN.md", "README-EN.md")
foreach ($doc in $EnDocs) {
    $source = Join-Path $ScriptDir $doc
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination (Join-Path $DeployDir "docs\en") -Force
        Write-ColorOutput "Green" "  ✅ $doc"
    }
}

# 7. Kopiere README-Dateien
$Readmes = @("README-DE.md", "README-NL.md", "README-EN.md")
foreach ($readme in $Readmes) {
    $source = Join-Path $ScriptDir $readme
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $DeployDir -Force
    }
}

# 8. Erstelle Info-Dateien
Write-ColorOutput "Cyan" "📝 Erstelle Info-Dateien..."

$StartHere = @"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚀 THYNK ORDERS - FINAL PRODUCTION                            ║
║                                                                   ║
║     ONE-CLICK DEPLOYMENT - FERTIG!                                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📁 STARTEN:

Doppelklick auf: index.html

✅ FERTIG!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 THEME: Rechts oben zwischen Modern & THYNK Original wechseln

📚 DOKUMENTATION: docs\de\ | docs\nl\ | docs\en\

✅ ALLES FUNKTIONIERT LOKAL - KEIN SERVER!
"@
$StartHere | Out-File -FilePath (Join-Path $DeployDir "START-HIER.txt") -Encoding UTF8

$VersionContent = @"
THYNK ORDERS - Final Production
Version: $Version
Build: $Timestamp
Deployed: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Status: Production Ready
Type: Local Standalone
"@
$VersionContent | Out-File -FilePath (Join-Path $DeployDir "VERSION.txt") -Encoding UTF8

$Features = @"
✅ Bestellungen (Erstellen, Verwalten, Löschen)
✅ Warenkorb (Mehrere Produkte)
✅ Statistiken (Umsatz, Bestellungen)
✅ Export/Import (Backup)
✅ Theme-Switcher (2 Designs)
✅ Lokale Speicherung (localStorage)
✅ Responsive Design
✅ Vollständig lokal - Kein Server!
"@
$Features | Out-File -FilePath (Join-Path $DeployDir "FEATURES.txt") -Encoding UTF8

Write-ColorOutput "Green" "✅ Info-Dateien erstellt"

# Finale Zusammenfassung
Write-Output ""
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-ColorOutput "Green" "   ✅✅✅ DEPLOYMENT ERFOLGREICH! ✅✅✅"
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-Output ""
Write-ColorOutput "Yellow" "📁 DEPLOYMENT-ORDNER:"
Write-Output "   $DeployDir"
Write-Output ""
Write-ColorOutput "Yellow" "🚀 STARTEN:"
Write-Output "   Doppelklick auf: $DeployDir\index.html"
Write-Output ""
Write-ColorOutput "Green" "🎉 FERTIG! Alles bereit für den Einsatz!"
Write-Output ""

