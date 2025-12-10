# Bank Statement PDF Verarbeitung

## 📄 Verfügbare PDF

**Datei:** `RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf`  
**Pfad:** `C:\Users\Gebruiker\Documents\01db.com\`  
**Typ:** Bankauszug (Rekeningafschrift) - bereits mit Fabrikage verarbeitet

## 🔧 Verfügbare Operationen

### 1. PDF-Informationen anzeigen

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\pdf"
powershell -ExecutionPolicy Bypass -File process-bank-statement.ps1 -ShowInfo
```

### 2. PDF weiterverarbeiten (Header/Logo hinzufügen)

```powershell
powershell -ExecutionPolicy Bypass -File process-bank-statement.ps1 -AddHeader -OutputPdf "C:\Users\Gebruiker\Documents\01db.com\RA_PROCESSED.pdf"
```

### 3. Mit Fabrikage PDF Processor

```powershell
# Direkt mit Fabrikage Script
.\run_fabrikage_pdf.ps1 `
  -Input "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf" `
  -Output "C:\Users\Gebruiker\Documents\01db.com\RA_PROCESSED.pdf"
```

### 4. Informationen extrahieren

```powershell
# Mit Python
python extract_pdf_info.py "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf"
```

## 📋 Was kann verarbeitet werden?

- **Header hinzufügen** - Mit TogetherSystems Branding
- **Logo einfügen** - T,.&T,,.&T,,,. Logo
- **Text redactieren** - Sensible Daten entfernen
- **Metadaten setzen** - Fabrikage Stamps
- **Informationen extrahieren** - Seitenzahl, Text, Metadaten

## 🎯 Fabrikage Features

Die PDF wurde bereits mit Fabrikage verarbeitet (erkennbar an `.FABRIKAGE.pdf`):

- ✅ Header/Logo hinzugefügt
- ✅ Metadaten gesetzt
- ✅ SHA256 Checksumme berechnet
- ✅ Report generiert

## 📝 Nächste Schritte

1. **Informationen anzeigen:**
   ```powershell
   .\process-bank-statement.ps1 -ShowInfo
   ```

2. **Weiterverarbeiten:**
   ```powershell
   .\process-bank-statement.ps1 -AddHeader
   ```

3. **Als Vorlage verwenden:**
   Die PDF kann als Vorlage für weitere Bankauszüge verwendet werden.

## 🔗 Verwandte Tools

- `fabrikage_pdf.py` - Python PDF Processor
- `run_fabrikage_pdf.ps1` - PowerShell Wrapper
- `extract_pdf_info.py` - PDF Info Extractor

