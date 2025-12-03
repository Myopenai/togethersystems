
# 📘 Digitales Notariat – Benutzeranleitung (Deutsch)

Willkommen bei **Digitales Notariat** – einem modernen Tool zur Unterstützung notarieller Vorgänge.  
Es enthält zusätzlich leistungsstarke Browser-Werkzeuge für den Alltag.

---

## 🧰 Funktionen im Überblick

### 🏛️ Notarielle Funktionen
| Funktion | Beschreibung |
|----------|--------------|
| ✅ Identitätsprüfung | Verifizierung von Personalien und Dokumenten (Vorder- und Rückseite) |
| 📄 Dokumentenbeurkundung | Digitale Beurkundung und Beglaubigung mit Blockchain-Hash |
| ✍️ Unterschriftsbeglaubigung | Qualifizierte elektronische Signaturen (verschlüsselt) |
| 📦 Digitales Archiv | Sichere Aufbewahrung aller Dokumente mit AES-256 |
| 📤 Export & Berichte | Datenexport für Behörden (PDF, XML, JSON, Audit-Log) |
| 🔐 Zwei-Faktor-Authentifizierung | TOTP-basierte Sicherheit für kritische Aktionen |
| 💾 Automatische Backups | 24h-Backups mit Checksum-Validierung |
| 👥 Mandanten-Management | Unterstützung für 100.000+ Mandanten mit Indexierung |
| 📊 Performance-Monitoring | Echtzeit-Überwachung der Systemleistung |

### 🌐 Browser-Tools
| Funktion | Beschreibung |
|----------|--------------|
| 🔐 Passwort-Manager | Verwaltung von Login-Daten, lokal gespeichert |
| 🚫 Werbeblocker | Blockiert Tracking- und Werbe-Skripte |
| 📸 Screenshot-Tool | Nimmt Screenshots der Website auf |
| 📊 SEO-Checker | Prüft Seitenstruktur (Titel, Meta, Überschriften) |
| ⚙️ Autofill-Engine | Füllt Formulare automatisch aus |
| 📤 Datei-Upload | Unterstützt Auswahl & Anzeige von Dateien |

---

## 🚀 One-Click Installation

### Windows (install.bat)
```batch
@echo off
echo ========================================
echo    Digitales Notariat - Installation
echo ========================================
echo.
echo [INFO] Starte Installation...
echo [INFO] Prüfe Node.js Installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js nicht gefunden! Bitte installieren Sie Node.js von https://nodejs.org
    pause
    exit /b 1
)
echo [SUCCESS] Node.js gefunden!
echo.
echo [INFO] Installiere Abhängigkeiten...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Installation fehlgeschlagen!
    pause
    exit /b 1
)
echo [SUCCESS] Abhängigkeiten installiert!
echo.
echo [INFO] Starte Entwicklungsserver...
echo [INFO] Browser öffnet sich automatisch...
echo [INFO] Server läuft auf: http://localhost:5173
echo.
echo [SUCCESS] Installation abgeschlossen!
echo [INFO] Drücken Sie STRG+C zum Beenden
echo.
call pnpm run dev
```

### Linux/macOS (install.sh)
```bash
#!/bin/bash

echo "========================================"
echo "   Digitales Notariat - Installation"
echo "========================================"
echo

# Farben für Logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log-Funktion
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[${timestamp}] [INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}] [WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] [ERROR]${NC} $message"
            ;;
    esac
}

log "INFO" "Starte Installation..."

# Prüfe Node.js
log "INFO" "Prüfe Node.js Installation..."
if ! command -v node &> /dev/null; then
    log "ERROR" "Node.js nicht gefunden! Bitte installieren Sie Node.js von https://nodejs.org"
    exit 1
fi

log "SUCCESS" "Node.js gefunden! Version: $(node --version)"

# Prüfe pnpm
log "INFO" "Prüfe pnpm Installation..."
if ! command -v pnpm &> /dev/null; then
    log "WARNING" "pnpm nicht gefunden! Installiere pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        log "ERROR" "pnpm Installation fehlgeschlagen!"
        exit 1
    fi
fi

log "SUCCESS" "pnpm gefunden! Version: $(pnpm --version)"

# Installiere Abhängigkeiten
log "INFO" "Installiere Abhängigkeiten..."
pnpm install
if [ $? -ne 0 ]; then
    log "ERROR" "Installation fehlgeschlagen!"
    exit 1
fi

log "SUCCESS" "Abhängigkeiten installiert!"

# Starte Entwicklungsserver
log "INFO" "Starte Entwicklungsserver..."
log "INFO" "Browser öffnet sich automatisch..."
log "INFO" "Server läuft auf: http://localhost:5173"
log "SUCCESS" "Installation abgeschlossen!"
log "INFO" "Drücken Sie STRG+C zum Beenden"
echo

pnpm run dev
```

---

## 🖥️ Nutzung als Desktop-App (Electron für Windows/macOS/Linux)

### Voraussetzungen:
- [Node.js installieren](https://nodejs.org) (empfohlen Version 18 oder höher)
- [pnpm installieren](https://pnpm.io/installation) (wird automatisch installiert)

### 1. Installation
- **Windows**: `install.bat` doppelklicken
- **Mac/Linux**: Terminal öffnen und eingeben:
```bash
chmod +x install.sh
./install.sh
```

### 2. Anwendung starten
Nach der Installation öffnet sich das Hauptfenster automatisch.

---

## 🌐 Nutzung als Browser-Erweiterung

### Für Google Chrome:
1. `chrome://extensions/` öffnen
2. „Entwicklermodus" aktivieren
3. „Entpackte Erweiterung laden"
4. Ordner `DigitalNotary_InstallerReady` auswählen

### Für Firefox:
1. `about:debugging#/runtime/this-firefox` öffnen
2. „Temporäres Add-on laden"
3. `manifest.json` im Projektordner auswählen

---

## 🔐 Sicherheitsfunktionen

### Zwei-Faktor-Authentifizierung (2FA)
- **TOTP-basiert** - Kompatibel mit Google Authenticator, Authy
- **Kritische Aktionen geschützt**: Identitätsprüfung, Dokumentenbeurkundung, Unterschriften, Export, Löschungen
- **Einmalige Verifikation** - Session bleibt aktiv bis Browser-Schließung
- **Demo-Codes**: 6-stellige Codes die mit "123" enden (z.B. 000123)

### Automatische Backups
- **24-Stunden-Intervall** - Automatische Backups alle 24 Stunden
- **Manuelle Backups** - Sofortige Backup-Erstellung auf Knopfdruck
- **JSON-Format** - Vollständige Datenexporte mit Metadaten
- **Checksum-Validierung** - Datenintegrität wird überprüft
- **Zeitstempel** - Backup-Historie mit Datum/Uhrzeit

### Verschlüsselte Datenspeicherung
- **AES-256 Verschlüsselung** - Militärgrad-Verschlüsselung für alle Daten
- **Verschlüsselte Unterschriften** - Digitale Signaturen werden zusätzlich verschlüsselt
- **Salt-basierte Verschlüsselung** - Erhöhte Sicherheit durch Salt-Generierung
- **Lokale Speicherung** - Alle Daten bleiben auf Ihrem System

---

## 👥 Mandanten-Management

### Skalierbarkeit
- **100.000+ Mandanten** - Unterstützung für große Notariate
- **Client-Indexierung** - Schnelle Suche und Filterung
- **Performance-Optimierung** - Automatische Datenbank-Optimierung
- **Prioritäts-Management** - Mandanten nach Priorität kategorisieren

### Erweiterte Funktionen
- **Mandanten-Suche** - Volltext-Suche in allen Mandantendaten
- **Prioritäts-Filter** - Filterung nach Dringlichkeit (niedrig, mittel, hoch, dringend)
- **Termin-Management** - Übersicht über anstehende Termine
- **Notar-Zuordnung** - Mandanten bestimmten Notaren zuordnen

---

## 📊 Performance-Monitoring

### System-Status
- **Echtzeit-Überwachung** - Live-Status aller Systemkomponenten
- **Performance-Metriken** - Suchzeiten, Filterzeiten, Speichergröße
- **Optimierungs-Empfehlungen** - Automatische Verbesserungsvorschläge
- **Datenbank-Statistiken** - Detaillierte Auswertung der Datenbankleistung

### Compliance
- **DSGVO-konform** - Vollständige DSGVO-Compliance
- **eIDAS-Verordnung** - Erfüllung der eIDAS-Anforderungen
- **Notariatsordnung** - Konformität mit deutschen Notariatsvorschriften

---

## 🌐 Browser-Tools

Die Anwendung enthält zusätzlich leistungsstarke Browser-Werkzeuge:

### 🔐 Passwort-Manager
- Sichere lokale Speicherung von Login-Daten
- Automatische Passwort-Generierung
- Suchfunktion und Kategorisierung
- Verschlüsselte Datenspeicherung

### 🚫 Werbeblocker
- Blockiert Tracking- und Werbe-Skripte
- Echtzeit-Statistiken über blockierte Anfragen
- Anpassbare Blockierungsregeln
- Schutz vor Malware und Phishing

### 📸 Screenshot-Tool
- Vollständige Seiten-Screenshots
- Verschiedene Formate (PNG, JPEG, WebP)
- Responsive Ansichten (Desktop, Tablet, Mobile)
- Automatischer Download

### 📊 SEO-Checker
- Analyse der Seitenstruktur
- Überprüfung von Meta-Tags und Überschriften
- Performance-Bewertung
- Barrierefreiheits-Checks

### ⚙️ Autofill-Engine
- Intelligente Formular-Erkennung
- Mehrere Benutzerprofile
- Automatisches Ausfüllen von Kontaktdaten
- Unterstützung für Kreditkarten-Daten

### 📤 Datei-Upload
- Drag & Drop Unterstützung
- Mehrere Dateiformate (PDF, Bilder, Dokumente)
- Vorschau und Validierung
- Fortschrittsanzeige

---

## 🔧 Technische Details

### Systemanforderungen
- **Node.js**: Version 18 oder höher
- **pnpm**: Version 8 oder höher
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Betriebssystem**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Architektur
- **Frontend**: React 18 mit TypeScript
- **Backend**: Node.js mit Express
- **Datenbank**: Lokale SQLite mit Verschlüsselung
- **Verschlüsselung**: AES-256 mit Salt
- **Authentifizierung**: TOTP-basierte 2FA

### Sicherheit
- **Verschlüsselung**: AES-256 für alle sensiblen Daten
- **Authentifizierung**: Zwei-Faktor-Authentifizierung
- **Backups**: Automatische verschlüsselte Backups
- **Compliance**: DSGVO, eIDAS, Notariatsordnung

---

## 📞 Support

Bei Fragen oder Problemen:
- **E-Mail**: support@digitales-notariat.de
- **Dokumentation**: Vollständige Dokumentation im Projekt
- **Issues**: GitHub Issues für Bug-Reports

---

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe LICENSE-Datei für Details.


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---
