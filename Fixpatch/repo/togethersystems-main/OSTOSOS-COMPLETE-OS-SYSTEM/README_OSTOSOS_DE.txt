================================================================================
T,. OSTOSOS - Installationsanleitung und Fixpatch-Beschreibung
================================================================================

VERSION: 1.0.0
DATUM: 2025-12-01
BRANDING: T,.&T,,.&T,,,.(C)TEL1.NL

================================================================================
ÜBERSICHT
================================================================================

Dieses Paket enthält die OSTOSOS-Installation für Windows, macOS und Linux.

Die Struktur wurde optimiert, um klare Einstiegspunkte für jedes Betriebssystem
zu bieten und Verwirrung durch viele Dateien/Ordner zu reduzieren.

================================================================================
INSTALLATION - SCHNELLSTART
================================================================================

WINDOWS:
--------
1. Doppelklicken Sie auf: START-OSTOSOS-Windows.bat
   ODER
2. Doppelklicken Sie direkt auf: OSTOSOS-Setup-Windows.exe

Der Installer startet automatisch und führt Sie durch die Installation.

MACOS:
------
1. Doppelklicken Sie auf: START-OSTOSOS-macOS.command
   (Bei Gatekeeper-Warnung: Rechtsklick → Öffnen → Öffnen)
   ODER
2. Doppelklicken Sie direkt auf: OSTOSOS-Setup-macOS

Der Installer startet automatisch und führt Sie durch die Installation.

LINUX:
------
1. Führen Sie aus: ./START-OSTOSOS-Linux.sh
   (Im Terminal: chmod +x START-OSTOSOS-Linux.sh && ./START-OSTOSOS-Linux.sh)
   ODER
2. Führen Sie direkt aus: ./OSTOSOS-Setup-Linux.bin
   (Zuerst: chmod +x OSTOSOS-Setup-Linux.bin)

Der Installer startet automatisch und führt Sie durch die Installation.

================================================================================
PAKET-STRUKTUR
================================================================================

Root-Verzeichnis:
-----------------
START-OSTOSOS-Windows.bat      → Windows Starter (doppelklicken)
START-OSTOSOS-macOS.command    → macOS Starter (doppelklicken)
START-OSTOSOS-Linux.sh         → Linux Starter (ausführen)

OSTOSOS-Setup-Windows.exe      → Windows Installer (direkt startbar)
OSTOSOS-Setup-macOS            → macOS Installer (direkt startbar)
OSTOSOS-Setup-Linux.bin        → Linux Installer (direkt startbar)

README_OSTOSOS_DE.txt          → Diese Datei

Unterordner:
------------
OSTOSOS-MULTIBOOT-USB-ORDNER/  → Multi-Boot USB-Stick Erstellung
  builds/
    windows/                   → Windows Builds
    macos/                     → macOS Builds
    linux/                     → Linux Builds

Produktionsordner/             → Alte Builds (Backup)

================================================================================
ZUKÜNFTIGE INSTALLER-VERSIONEN - EMPFEHLUNGEN
================================================================================

WINDOWS:
--------
Empfohlene Anpassungen im Installer-Projekt (z.B. Inno Setup / NSIS / MSI):

1. Desktop-Icon-Option
   - Checkbox: "Desktop-Verknüpfung für OSTOSOS erstellen"
   - Standard: aktiviert, aber abwählbar

2. Startmenü-Gruppe
   - Ordner: "OSTOSOS"
   - Einträge:
     * OSTOSOS (Hauptstart des Agents / Launchers)
     * OSTOSOS – Tools (optional, um direkt in die Erweiterungen zu springen)
     * OSTOSOS – Uninstall (Standard-Deinstallations-Link)

3. Eindeutiges Icon (.ico)
   - Zentrales Icon in den Ressourcen des Installers hinterlegen
   - Alle Verknüpfungen (.lnk) verwenden dasselbe OSTOSOS-Haupticon

4. Log- und Diagnosepfad
   - Installations-Logs unter %ProgramData%\OSTOSOS\Logs ablegen
   - Optional im Setup-Finish-Dialog einen Button "Logs öffnen" anbieten

5. Start nach Installation
   - Option: "OSTOSOS jetzt starten"
   - Ruft nach erfolgreicher Installation den Haupt-Agent/Launcher auf

MACOS:
------
Empfohlene Anpassungen:

1. App-Bundle-Struktur
   - OSTOSOS.app mit:
     * Contents/MacOS/OSTOSOS (Binary)
     * Contents/Info.plist (CFBundleIdentifier, DisplayName, etc.)
     * Contents/Resources/OSTOSOS.icns (App-Icon)

2. Installation
   - Installer oder Disk-Image (.dmg) soll die .app-Datei in /Applications ziehen

3. Desktop-/Dock-Option
   - Beim ersten Start optional anbieten:
     * Alias auf dem Desktop anzulegen
     * App im Dock zu behalten

4. Logs
   - Logs unter ~/Library/Logs/OSTOSOS schreiben

LINUX:
------
Empfohlene Anpassungen:

1. .desktop-Datei
   Erstellen einer Datei ostosos.desktop z.B. unter /usr/share/applications
   oder ~/.local/share/applications:

   [Desktop Entry]
   Type=Application
   Name=OSTOSOS
   Comment=OSTOSOS Agent und Tool-Sammlung
   Exec=/opt/ostosos/ostosos-launcher
   Icon=ostosos
   Terminal=false
   Categories=Utility;Development;

2. Icon-Installation
   - Icon-Datei ostosos.png / ostosos.svg nach
     /usr/share/icons/hicolor/256x256/apps/ (bzw. passende Größe) kopieren
   - gtk-update-icon-cache bzw. Desktop-spezifische Icon-Cache-Aktualisierung

3. Desktop-Verknüpfung (optional)
   - Kopie der .desktop-Datei auf den Desktop des Users
     (Pfad abhängig von Distribution/DE, meist ~/Desktop)
   - Ausführungsrechte setzen

4. Logs
   - Logs unter ~/.local/share/ostosos/logs sammeln

================================================================================
200+ TOOLS / ERWEITERUNGEN
================================================================================

Da die eigentlichen Tools/Erweiterungen erst nach der Installation auf dem
Zielsystem vorliegen, konnte in diesem Fixpatch keine Laufzeit-Validierung
aller Komponenten erfolgen.

Empfohlene Strukturierung:

1. Tool-Registry
   - JSON/YAML-Datei (z.B. tools.json) im Installationsverzeichnis mit Feldern:
     * id, name, version, os, binary, dependencies, category
   - Der Haupt-Agent liest diese Registry und stellt die Tools im bestehenden
     UI dar (UI/UX bleibt unverändert, nur die Datenbasis wird sauberer)

2. Selbsttest beim ersten Start
   - Agent führt einen Integritäts-Check aus:
     * Existiert die Binary?
     * Hat sie Ausführungsrechte (macOS/Linux)?
     * Sind Mindestabhängigkeiten erfüllt (z.B. externe CLI-Tools)?
   - Ergebnis als Log/Diagnose speichern

3. Reparatur-Funktion
   - Menüpunkt im bestehenden UI (nicht umdesignen, nur Funktion ergänzen):
     * "Installationsprüfung / Reparatur"
   - Prüft anhand der Registry alle Tools und bietet an, fehlende/defekte
     Dateien neu zu installieren (z.B. über einen Repair-Installer oder
     Online-Update)

4. Versionierung & Kompatibilität
   - Jede Erweiterung sollte eine Version und evtl. eine minimale OSTOSOS-Version
     deklarieren
   - Der Agent prüft vor dem Start des Tools, ob die Kombination kompatibel ist

================================================================================
BEKANNTE GRENZEN DIESES FIXPATCHES
================================================================================

- Die Binärdateien (OSTOSOS-Setup.exe, OSTOSOS-Setup, OSTOSOS-Setup.bin) konnten
  nicht verändert oder intern repariert werden

- UI/UX/GUI wurde bewusst nicht angetastet, wie gewünscht

- Die 200+ Tools konnten nur konzeptionell berücksichtigt werden, da sie erst
  durch den Installer entpackt werden

Trotzdem ist das Paket jetzt deutlich klarer strukturiert und bietet für Nutzer
auf allen drei Betriebssystemen einen eindeutigen Einstiegspunkt sowie eine
Dokumentation, wie zukünftige Installer Desktop-/Startleisten-Integration und
Diagnosefunktionen sauber umsetzen können.

================================================================================
SUPPORT & KONTAKT
================================================================================

BRANDING: T,.&T,,.&T,,,.(C)TEL1.NL
URL: https://tel1.jouwweb.nl/servicesoftware
WHATSAPP: 0031613803782

================================================================================
ENDE DER DOKUMENTATION
================================================================================

