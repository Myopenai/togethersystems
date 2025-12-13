# Archiv Export Anleitung - Digital Notariat

## Übersicht

Diese Anleitung erklärt, wo exportierte Dateien aus dem Archiv gespeichert werden und wie Sie diese ansehen können.

## Export-Funktionen

### 1. **Einzelner Record Export**

**Wo:** Jeder Datensatz hat einen Export-Button (📤 Download-Icon)

**Was passiert:**
- ✅ Datensatz wird als JSON-Datei exportiert
- ✅ Datei wird automatisch heruntergeladen
- ✅ Dateiname: `notariat_export_[ID]_[DATUM].json`

### 2. **Bulk Export (Mehrere Records)**

**Wo:** Archiv → Checkboxen auswählen → "Exportieren" Button

**Was passiert:**
- ✅ Alle ausgewählten Datensätze werden exportiert
- ✅ Datei wird automatisch heruntergeladen
- ✅ Dateiname: `notariat_bulk_export_[ANZAHL]_records_[DATUM].json`

## 📁 **Speicherort der exportierten Dateien**

### **Standard-Download-Ordner:**

**Windows:**
```
C:\Users\[IhrBenutzername]\Downloads\
```

**Beispiel-Pfad:**
```
C:\Users\MaxMustermann\Downloads\notariat_bulk_export_5_records_2024-01-15.json
```

### **Datei finden:**

1. **Windows Explorer öffnen**
2. **Downloads-Ordner** aufrufen
3. **Nach Dateinamen** suchen: `notariat_*`
4. **Nach Datum sortieren** (neueste zuerst)

## 📖 **Exportierte Dateien ansehen**

### **Option 1: Texteditor (Empfohlen)**

```bash
# Mit Notepad öffnen
notepad "C:\Users\[Benutzername]\Downloads\notariat_export_*.json"

# Mit VS Code öffnen
code "C:\Users\[Benutzername]\Downloads\notariat_export_*.json"
```

### **Option 2: Online JSON Viewer**

1. **Datei in Browser ziehen**
2. **Oder:** [jsonviewer.stack.hu](https://jsonviewer.stack.hu/) verwenden
3. **Datei hochladen** und formatierte Ansicht genießen

### **Option 3: Browser**

1. **Datei in Browser ziehen**
2. **Automatische JSON-Formatierung** wird angezeigt

## 📋 **Inhalt der Export-Dateien**

### **Einzelner Record Export:**
```json
{
  "id": "record_123",
  "type": "identity_verification",
  "status": "completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "description": "Identitätsprüfung Max Mustermann",
  "clientName": "Max Mustermann",
  "hash": "SHA256:abc123...",
  "encryptionKey": "AES-256:key123...",
  "documents": {
    "front": "ausweis_vorne.jpg",
    "back": "ausweis_hinten.jpg"
  }
}
```

### **Bulk Export:**
```json
{
  "exportInfo": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "totalRecords": 5,
    "exportType": "bulk_archive_export",
    "version": "1.0"
  },
  "records": [
    {
      "id": "record_123",
      "type": "identity_verification",
      "status": "completed",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "description": "Identitätsprüfung Max Mustermann",
      "clientName": "Max Mustermann",
      "isLegallyProtected": true,
      "legalBasis": "GoBD",
      "retentionEndDate": "2034-01-15T10:30:00.000Z"
    }
    // ... weitere Records
  ]
}
```

## 🔍 **Export-Dateien durchsuchen**

### **Mit Windows-Suche:**
1. **Windows-Taste + S**
2. **"notariat"** eingeben
3. **Downloads-Ordner** durchsuchen

### **Mit PowerShell:**
```powershell
# Alle Export-Dateien finden
Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "notariat_*.json"

# Nach Datum sortiert
Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "notariat_*.json" | Sort-Object LastWriteTime -Descending
```

### **Mit Command Prompt:**
```cmd
# Alle Export-Dateien auflisten
dir "%USERPROFILE%\Downloads\notariat_*.json"

# Neueste zuerst
dir "%USERPROFILE%\Downloads\notariat_*.json" /OD
```

## 📊 **Export-Statistiken anzeigen**

### **Datei-Informationen:**
- **Anzahl Records:** In der Export-Datei unter `exportInfo.totalRecords`
- **Export-Datum:** In der Export-Datei unter `exportInfo.timestamp`
- **Dateigröße:** Im Datei-Explorer sichtbar

### **Beispiel-Statistik:**
```
📊 EXPORT-STATISTIK:
• Dateiname: notariat_bulk_export_5_records_2024-01-15.json
• Dateigröße: 2.3 KB
• Anzahl Records: 5
• Export-Datum: 15.01.2024 11:30:00
• Typen: 3 Identitätsprüfungen, 2 Dokumente
```

## 🛡️ **Sicherheitshinweise**

### **Datenschutz:**
- ✅ **Verschlüsselte Daten:** Sensible Informationen sind verschlüsselt
- ✅ **Hash-Werte:** Integrität wird durch Hash-Werte gewährleistet
- ✅ **Keine Passwörter:** Passwörter werden nicht exportiert

### **Datei-Sicherheit:**
- 🔒 **Lokale Speicherung:** Dateien werden nur lokal gespeichert
- 🔒 **Keine Cloud-Upload:** Automatische Cloud-Uploads gibt es nicht
- 🔒 **Manuelle Kontrolle:** Sie entscheiden, wo die Dateien gespeichert werden

## 🔧 **Troubleshooting**

### **Problem: Datei wird nicht heruntergeladen**

**Lösungen:**
1. **Browser-Einstellungen prüfen:** Downloads erlauben
2. **Antivirus-Software:** Temporär deaktivieren
3. **Browser-Cache:** Leeren und neu versuchen

### **Problem: Datei kann nicht geöffnet werden**

**Lösungen:**
1. **Rechtsklick → "Öffnen mit" → Notepad**
2. **Dateiendung prüfen:** Sollte `.json` sein
3. **Datei-Integrität:** Neu exportieren

### **Problem: Datei ist leer**

**Lösungen:**
1. **Datensätze prüfen:** Sind Records vorhanden?
2. **Browser-Konsole:** Fehler prüfen (F12)
3. **Neu exportieren:** Mit anderen Datensätzen versuchen

## 📞 **Support**

Bei Problemen mit dem Export:

1. **Browser-Konsole prüfen** (F12 → Console)
2. **Fehlermeldungen notieren**
3. **Screenshot erstellen**
4. **Support kontaktieren** mit Details

## ✅ **Zusammenfassung**

**Exportierte Dateien werden gespeichert in:**
```
📁 Downloads-Ordner
📄 Format: JSON
🔍 Anzeige: Texteditor, Browser, Online-Tools
🛡️ Sicherheit: Lokal, verschlüsselt, DSGVO-konform
```

**Die Export-Funktion ist vollständig implementiert und funktionsfähig!**


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
