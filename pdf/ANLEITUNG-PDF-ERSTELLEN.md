# 📄 PDF erstellen - Anleitung

## ✅ HTML-Datei vorhanden

Die HTML-Dokumentation wurde erstellt:
- **Datei:** `mcp-setup-documentation.html`
- **Speicherort:** `D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\pdf\`

## 🚀 Methoden zur PDF-Erstellung

### Methode 1: Browser (Einfachste Methode) ⭐ EMPFOHLEN

1. **Öffne die HTML-Datei:**
   - Navigiere zu: `pdf\mcp-setup-documentation.html`
   - Doppelklick zum Öffnen im Browser

2. **Als PDF speichern:**
   - Drücke `Ctrl+P` (Windows) oder `Cmd+P` (Mac)
   - Wähle "Als PDF speichern" oder "Microsoft Print to PDF"
   - Speichere als: `MCP-Setup-Dokumentation.pdf`

### Methode 2: PowerShell Script

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\pdf"
powershell -ExecutionPolicy Bypass -File generate-mcp-pdf.ps1
```

### Methode 3: Chrome/Edge Command Line

```powershell
# Mit Chrome
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --print-to-pdf="MCP-Setup-Dokumentation.pdf" "file:///D:/busineshuboffline CHATGTP/TOGETHERSYSTEMS- GITHUB/Nieuwe map (3)/pdf/mcp-setup-documentation.html"

# Mit Edge
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --print-to-pdf="MCP-Setup-Dokumentation.pdf" "file:///D:/busineshuboffline CHATGTP/TOGETHERSYSTEMS- GITHUB/Nieuwe map (3)/pdf/mcp-setup-documentation.html"
```

### Methode 4: Python mit weasyprint

```bash
# Installiere weasyprint
pip install weasyprint

# Erstelle PDF
python -c "from weasyprint import HTML; HTML('mcp-setup-documentation.html').write_pdf('MCP-Setup-Dokumentation.pdf')"
```

### Methode 5: Node.js mit puppeteer

```bash
# Installiere puppeteer
npm install puppeteer

# Führe das Script aus
node generate-pdf.js
```

## 📋 Inhalt der Dokumentation

Die PDF enthält:

- ✅ Systemübersicht und Status
- ✅ Verbundene MCP Server Details
- ✅ Verfügbare Capabilities (10 Funktionen)
- ✅ Konfigurationsdateien Übersicht
- ✅ Verwendungsanleitung
- ✅ Netzwerk-Verteilung
- ✅ Routing-Richtlinien
- ✅ Nächste Schritte

## 🎯 Empfohlene Einstellungen beim Drucken

- **Format:** A4
- **Ränder:** Standard (2cm)
- **Hintergrundgrafiken:** Aktivieren
- **Seitenzahlen:** Optional
- **Kopf- und Fußzeilen:** Optional

## ✨ Tipp

Die HTML-Datei ist bereits für den Druck optimiert mit:
- Seitenumbrüchen
- Druckfreundlichen Farben
- Tabellen-Layout
- Professionellem Styling

Einfach im Browser öffnen und drucken!

