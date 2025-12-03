# T,. OSTOSOS - Live System & Installation Dokumentation

**VERSION:** 1.0.0  
**DATUM:** 2025-12-01  
**BRANDING:** T,.&T,,.&T,,,.(C)TEL1.NL

---

## 🎯 ÜBERSICHT

Das OSTOSOS Multi-Boot USB-System bietet zwei Betriebsmodi:

1. **Live-System:** Läuft direkt vom USB-Stick (wie Linux Live USB)
2. **Installation:** Installation auf Festplatte (optional)

---

## 🚀 LIVE-SYSTEM FUNKTIONALITÄT

### Was ist ein Live-System?

Ein Live-System läuft komplett vom USB-Stick, ohne Installation auf der Festplatte. Ähnlich wie Linux Live USB-Distributionen.

### Vorteile:

- ✅ **Keine Installation nötig** - Einfach USB-Stick einstecken und starten
- ✅ **Funktioniert auf jedem Gerät** - Läuft auf Windows, macOS, Linux
- ✅ **Alle Funktionen verfügbar** - Komplettes OSTOSOS-System
- ✅ **Daten bleiben auf USB** - Persönliche Einstellungen und Dateien
- ✅ **Keine System-Änderungen** - Keine Modifikationen am Host-System
- ✅ **Portable** - USB-Stick mitnehmen, überall nutzen

### Verfügbare Funktionen im Live-System:

- 🌐 **Online surfen** - Kompletter Browser
- 📧 **E-Mails** - Mail Hub mit allen Funktionen
- 💾 **Dateien speichern** - Auf USB-Stick
- 🎮 **Spiele** - Matrix Games
- ⚙️ **Alle 200+ Tools** - Vollständige Tool-Sammlung
- 💼 **Produktivität** - Alle Business-Funktionen
- ☁️ **Cloud-Sync** - Optional verfügbar

---

## 💾 INSTALLATION AUF FESTPLATTE

### Wann sollte ich installieren?

Installation ist **optional**. Empfohlen wenn:

- Sie OSTOSOS regelmäßig nutzen möchten
- Schnellerer Start gewünscht ist
- Mehr Speicherplatz benötigt wird
- System-Integration gewünscht ist

### Installations-Optionen:

1. **Vollständig** - Alle 200+ Tools installieren
2. **Minimal** - Nur Kern-System installieren
3. **Benutzerdefiniert** - Eigene Tool-Auswahl

### Installations-Pfade:

- **Windows:** `C:\OSTOSOS` (empfohlen)
- **macOS:** `/Applications/OSTOSOS` (empfohlen)
- **Linux:** `/opt/ostosos` (empfohlen)

### Installations-Features:

- ✅ **Desktop-Verknüpfung** - Optional erstellen
- ✅ **Startmenü-Eintrag** - Optional erstellen
- ✅ **Auto-Start** - Optional nach Installation
- ✅ **Parallel-Installation** - Läuft neben anderen OS

---

## 🔄 AUTO-ERKENNUNG BEI LAUFENDEM SYSTEM

### Windows:

**Autorun.inf** erkennt USB-Stick automatisch:
- Zeigt Dialog: "OSTOSOS Live-System starten?"
- User kann wählen: Live-System oder Installation
- Startet automatisch `LIVE-SYSTEM-INSTALLER.html`

### macOS:

**autorun.command** erkennt USB-Stick:
- Zeigt Dialog mit Optionen
- User wählt: Live-System, Installation oder Abbrechen
- Startet entsprechend

### Linux:

**autorun.sh** erkennt USB-Stick:
- Zeigt Dialog mit Optionen (zenity)
- User wählt: Live-System, Installation oder Abbrechen
- Startet entsprechend

---

## 📋 INSTALLATIONS-ABLAUF

### Schritt 1: USB-Stick einstecken

USB-Stick wird automatisch erkannt (Windows/macOS/Linux)

### Schritt 2: Option wählen

**Dialog erscheint:**
- "OSTOSOS Live-System starten?"
- "OSTOSOS auf Festplatte installieren?"
- "Abbrechen"

### Schritt 3a: Live-System

- System startet direkt vom USB-Stick
- Alle Funktionen verfügbar
- Daten werden auf USB gespeichert

### Schritt 3b: Installation

1. **Installations-Modal öffnet sich**
2. **Installations-Pfad wählen:**
   - Automatisch (empfohlen)
   - Benutzerdefiniert
3. **Installations-Typ wählen:**
   - Vollständig (alle Tools)
   - Minimal (nur Kern-System)
   - Benutzerdefiniert (Tool-Auswahl)
4. **Optionen:**
   - Desktop-Verknüpfung erstellen
   - Startmenü-Eintrag erstellen
   - Nach Installation starten
5. **Installation starten:**
   - Fortschrittsanzeige
   - Automatische Installation
   - Fertig-Meldung

---

## 🛠️ TECHNISCHE DETAILS

### Live-System Architektur:

```
USB-Stick/
├── ostosos/
│   ├── LIVE-SYSTEM-INSTALLER.html  → Haupt-Interface
│   ├── OSTOSOS-OS-COMPLETE-SYSTEM.html  → Live-System
│   ├── data/  → Persönliche Daten (IndexedDB, LocalStorage)
│   └── tools/  → Alle 200+ Tools
├── autorun.inf  → Windows Auto-Start
├── autorun.command  → macOS Auto-Start
└── autorun.sh  → Linux Auto-Start
```

### Installation Architektur:

```
Festplatte/
├── Windows: C:\OSTOSOS\
├── macOS: /Applications/OSTOSOS/
└── Linux: /opt/ostosos/

Installation kopiert:
- Alle System-Dateien
- Alle Tools (je nach Typ)
- Konfiguration
- Desktop-Verknüpfungen (optional)
- Startmenü-Einträge (optional)
```

### Daten-Persistenz:

**Live-System:**
- Daten werden auf USB-Stick gespeichert (IndexedDB, LocalStorage)
- Beim Entfernen bleiben Daten erhalten
- Beim Wiedereinstecken sind alle Daten wieder da

**Installation:**
- Daten werden auf Festplatte gespeichert
- Schnellerer Zugriff
- Mehr Speicherplatz verfügbar

---

## 🔧 KONFIGURATION

### Live-System Konfiguration:

Gespeichert in `localStorage` auf USB-Stick:
- `ostosos.mode` = "live"
- `ostosos.usb.path` = USB-Stick-Pfad
- `ostosos.data.path` = Daten-Pfad auf USB

### Installation Konfiguration:

Gespeichert in `localStorage` auf Festplatte:
- `ostosos.mode` = "installed"
- `ostosos.install.path` = Installations-Pfad
- `ostosos.install.type` = Installations-Typ
- `ostosos.installed` = "true"

---

## 📊 VERGLEICH: LIVE-SYSTEM vs. INSTALLATION

| Feature | Live-System | Installation |
|---------|-------------|--------------|
| Start-Geschwindigkeit | Normal | Schneller |
| Speicherplatz | USB-Stick | Festplatte |
| Portabilität | ✅ Hoch | ❌ Niedrig |
| System-Integration | ❌ Keine | ✅ Vollständig |
| Desktop-Verknüpfung | ❌ Nein | ✅ Optional |
| Startmenü-Eintrag | ❌ Nein | ✅ Optional |
| Alle Funktionen | ✅ Ja | ✅ Ja |
| Daten-Persistenz | ✅ USB | ✅ Festplatte |

---

## 🎯 EMPFEHLUNGEN

### Live-System verwenden wenn:

- Sie OSTOSOS nur gelegentlich nutzen
- Portabilität wichtig ist
- Keine System-Änderungen gewünscht sind
- Testen vor Installation

### Installation verwenden wenn:

- Sie OSTOSOS regelmäßig nutzen
- Schnellerer Start wichtig ist
- System-Integration gewünscht ist
- Mehr Speicherplatz benötigt wird

---

## ✅ BEKANNTE FUNKTIONEN

- ✅ Live-System vom USB-Stick
- ✅ Installation auf Festplatte
- ✅ Auto-Erkennung bei laufendem System
- ✅ Benachrichtigung und Dialog
- ✅ Alle 200+ Tools verfügbar
- ✅ Daten-Persistenz
- ✅ Multi-OS Support

---

**ERSTELLT:** 2025-12-01  
**STATUS:** ✅ IMPLEMENTIERT

