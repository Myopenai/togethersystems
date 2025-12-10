# PDF Dokumentation Generator

## 📄 Verfügbare Dokumentation

- **HTML-Version:** `mcp-setup-documentation.html` - Kann direkt im Browser geöffnet werden
- **PDF-Generator:** `generate-pdf.js` - Erstellt PDF aus HTML

## 🚀 PDF erstellen

### Methode 1: Mit Puppeteer (Empfohlen)

```bash
# Installiere Puppeteer
npm install puppeteer

# Generiere PDF
node generate-pdf.js
```

### Methode 2: Mit html-pdf

```bash
# Installiere html-pdf
npm install html-pdf

# Generiere PDF
node generate-pdf.js
```

### Methode 3: Manuell im Browser

1. Öffne `mcp-setup-documentation.html` im Browser
2. Drücke `Ctrl+P` (Windows) oder `Cmd+P` (Mac)
3. Wähle "Als PDF speichern"
4. Speichere als `MCP-Setup-Dokumentation.pdf`

### Methode 4: Mit wkhtmltopdf (Linux/Mac)

```bash
# Installiere wkhtmltopdf
# Ubuntu/Debian:
sudo apt-get install wkhtmltopdf

# Mac:
brew install wkhtmltopdf

# Generiere PDF
wkhtmltopdf mcp-setup-documentation.html MCP-Setup-Dokumentation.pdf
```

## 📋 Inhalt der Dokumentation

Die PDF-Dokumentation enthält:

- ✅ Systemübersicht und Status
- ✅ Verbundene MCP Server Details
- ✅ Verfügbare Capabilities
- ✅ Konfigurationsdateien
- ✅ Verwendungsanleitung
- ✅ Netzwerk-Verteilung
- ✅ Routing-Richtlinien
- ✅ Nächste Schritte

## 📁 Ausgabedatei

Nach erfolgreicher Generierung:
- **Dateiname:** `MCP-Setup-Dokumentation.pdf`
- **Format:** A4
- **Seiten:** Automatisch generiert
