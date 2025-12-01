# ╔═══════════════════════════════════════════════════════════════════╗
# ║                                                                   ║
# ║     THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT (PowerShell)         ║
# ║                                                                   ║
# ║     Erstellt komplette lokale Application (OHNE SERVER)           ║
# ║     Click & Run - Funktioniert direkt im Browser                  ║
# ║                                                                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"

# Farben für Output
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# Variablen
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DeployDir = Join-Path $ScriptDir "thynk-orders-local"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Output ""
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-ColorOutput "Yellow" "   🚀 THYNK ORDERS - COMPLETE LOCAL DEPLOYMENT"
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-Output ""

# 1. Prüfe ob Deploy-Ordner existiert, lösche wenn ja
if (Test-Path $DeployDir) {
    Write-ColorOutput "Yellow" "⚠️  Deploy-Ordner existiert bereits. Lösche..."
    Remove-Item -Path $DeployDir -Recurse -Force
}

# 2. Erstelle Deploy-Ordner-Struktur
Write-ColorOutput "Cyan" "📁 Erstelle Ordner-Struktur..."
New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "docs") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "config") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DeployDir "backups") -Force | Out-Null

# 3. Kopiere Haupt-HTML-Datei
Write-ColorOutput "Cyan" "📄 Kopiere Haupt-Application..."
$SourceHtml = Join-Path $ScriptDir "THYNK-ORDERS-COMPLETE.html"
$DestHtml = Join-Path $DeployDir "index.html"

if (Test-Path $SourceHtml) {
    Copy-Item -Path $SourceHtml -Destination $DestHtml -Force
    Write-ColorOutput "Green" "✅ index.html kopiert"
} else {
    Write-ColorOutput "Red" "❌ THYNK-ORDERS-COMPLETE.html nicht gefunden!"
    exit 1
}

# 4. Kopiere Dokumentationen
Write-ColorOutput "Cyan" "📚 Kopiere Dokumentationen..."

$Docs = @(
    "DOKUMENTATION-COMPLETE-DE.md",
    "ANLEITUNG-FUER-DUMMIES.md",
    "DOKUMENTATION-COMPLETE-NL.md",
    "DOKUMENTATION-COMPLETE-EN.md",
    "DATENBANK-DOKUMENTATION.md",
    "UMBAU-ANPASSUNGEN-ANLEITUNG.md"
)

foreach ($Doc in $Docs) {
    $SourceDoc = Join-Path $ScriptDir $Doc
    if (Test-Path $SourceDoc) {
        Copy-Item -Path $SourceDoc -Destination (Join-Path $DeployDir "docs") -Force
        Write-ColorOutput "Green" "✅ $Doc kopiert"
    }
}

# 5. Kopiere README-Dateien
Write-ColorOutput "Cyan" "📋 Kopiere README-Dateien..."
$Readmes = @("README-DE.md", "README-NL.md", "README-EN.md")
foreach ($Readme in $Readmes) {
    $SourceReadme = Join-Path $ScriptDir $Readme
    if (Test-Path $SourceReadme) {
        Copy-Item -Path $SourceReadme -Destination $DeployDir -Force
        Write-ColorOutput "Green" "✅ $Readme kopiert"
    }
}

# 6. Erstelle START-HIER.txt
Write-ColorOutput "Cyan" "📝 Erstelle START-HIER.txt..."
$StartHere = @"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🚀 THYNK ORDERS - LOCAL APPLICATION                           ║
║                                                                   ║
║     KEIN SERVER NÖTIG! - CLICK & RUN!                             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

📁 STARTEN:

1. Doppelklick auf: index.html

ODER

2. Rechtsklick → "Öffnen mit" → Browser wählen

✅ FERTIG!

Die Application öffnet sich direkt im Browser.
Alles funktioniert lokal - kein Server nötig!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOKUMENTATION:

- docs\DOKUMENTATION-COMPLETE-DE.md (Deutsch)
- docs\DOKUMENTATION-COMPLETE-NL.md (Nederlands)
- docs\DOKUMENTATION-COMPLETE-EN.md (English)
- docs\ANLEITUNG-FUER-DUMMIES.md (Für Anfänger)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FUNKTIONEN:

✅ Bestellungen erstellen
✅ Bestellungen verwalten
✅ Warenkorb
✅ Statistiken
✅ Export/Import (Backup)
✅ Lokale Datenspeicherung

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ALLES FUNKTIONIERT LOKAL - KEIN SERVER NÖTIG!
"@
$StartHere | Out-File -FilePath (Join-Path $DeployDir "START-HIER.txt") -Encoding UTF8
Write-ColorOutput "Green" "✅ START-HIER.txt erstellt"

# 7. Erstelle README.md
Write-ColorOutput "Cyan" "📝 Erstelle README.md..."
$ReadmeContent = @"
# 🛒 THYNK ORDERS - Local Application

**Komplette lokale Bestellsystem-Application - KEIN SERVER NÖTIG!**

---

## 🚀 SCHNELLSTART

1. **Doppelklick** auf `index.html`
2. Fertig! ✅

Die Application öffnet sich direkt im Browser und funktioniert komplett lokal.

---

## ✅ FUNKTIONEN

- ✅ Bestellungen erstellen & verwalten
- ✅ Warenkorb-System
- ✅ Statistiken
- ✅ Export/Import (Backup)
- ✅ Lokale Datenspeicherung (localStorage)

---

## 📚 DOKUMENTATION

Alle Dokumentationen finden Sie im `docs\` Ordner:

- **Deutsch:** `docs\DOKUMENTATION-COMPLETE-DE.md`
- **Nederlands:** `docs\DOKUMENTATION-COMPLETE-NL.md`
- **English:** `docs\DOKUMENTATION-COMPLETE-EN.md`
- **Für Anfänger:** `docs\ANLEITUNG-FUER-DUMMIES.md`

---

## 💾 DATEN-SICHERUNG

**WICHTIG:** Regelmäßig Backups erstellen!

1. Gehen Sie in der Application zu "⚙️ Einstellungen"
2. Klicken Sie auf "💾 Backup erstellen"
3. Die JSON-Datei wird heruntergeladen
4. Bewahren Sie diese Datei sicher auf!

---

## 🔧 TECHNISCH

- **Sprache:** HTML, CSS, JavaScript (Vanilla)
- **Daten-Speicherung:** Browser localStorage
- **Server:** NICHT NÖTIG - komplett lokal!
- **Browser:** Alle modernen Browser (Chrome, Firefox, Edge, Safari)

---

## 📦 DEPLOYMENT

Dieser Ordner kann direkt verwendet werden:
- ✅ Auf USB-Stick kopieren
- ✅ In Cloud-Speicher hochladen
- ✅ Auf anderen Computer kopieren
- ✅ Auf Webserver hochladen (optional)

---

**Version:** 1.0.0  
**Status:** ✅ Vollständig funktionsfähig - Kein Server nötig!
"@
$ReadmeContent | Out-File -FilePath (Join-Path $DeployDir "README.md") -Encoding UTF8
Write-ColorOutput "Green" "✅ README.md erstellt"

# 8. Erstelle VERSION.txt
Write-ColorOutput "Cyan" "📝 Erstelle VERSION.txt..."
$VersionContent = @"
THYNK ORDERS - Local Application
Version: 1.0.0
Build: $Timestamp
Deployed: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Type: Local Standalone (No Server)
"@
$VersionContent | Out-File -FilePath (Join-Path $DeployDir "VERSION.txt") -Encoding UTF8
Write-ColorOutput "Green" "✅ VERSION.txt erstellt"

# 9. Erstelle Backup-README
$BackupReadme = @"
BACKUP-ORDNER

Speichern Sie hier Ihre exportierten Backups aus der Application.

Um Backup zu erstellen:
1. Application öffnen
2. Zu "⚙️ Einstellungen" gehen
3. "💾 Backup erstellen" klicken
4. Datei hier speichern
"@
$BackupReadme | Out-File -FilePath (Join-Path $DeployDir "backups\README.txt") -Encoding UTF8

# 10. Zusammenfassung
Write-Output ""
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-ColorOutput "Green" "   ✅✅✅ DEPLOYMENT ERFOLGREICH ABGESCHLOSSEN! ✅✅✅"
Write-ColorOutput "Cyan" "═══════════════════════════════════════════════════════════════════"
Write-Output ""
Write-ColorOutput "Yellow" "📁 DEPLOYMENT-ORDNER:"
Write-Output "   $DeployDir"
Write-Output ""
Write-ColorOutput "Yellow" "🚀 STARTEN:"
Write-Output "   → Doppelklick auf: $DeployDir\index.html"
Write-Output ""
Write-ColorOutput "Yellow" "📚 DOKUMENTATION:"
Write-Output "   → $DeployDir\docs\"
Write-Output ""
Write-ColorOutput "Yellow" "✅ ENTHALTEN:"
Write-Output "   ✅ Haupt-Application (index.html)"
Write-Output "   ✅ Komplette Dokumentation (3 Sprachen)"
Write-Output "   ✅ README-Dateien"
Write-Output "   ✅ Backup-Ordner"
Write-Output ""
Write-ColorOutput "Green" "🎉 FERTIG! Die Application ist bereit zum Verwenden!"
Write-Output ""

