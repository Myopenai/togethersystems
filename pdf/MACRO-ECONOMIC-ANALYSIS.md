# Makroökonomische Bankauszug-Analyse

## 🎯 Professionelles Analyse-System

Dieses System bietet eine **vollständige makroökonomische Analyse** von Bankauszügen mit:

- 📊 Makroökonomische Metriken
- 📈 Wirtschaftsindikatoren
- 💰 Cashflow-Analyse
- 📉 Trend-Analyse
- 💡 Professionelle Empfehlungen

## 🚀 Verwendung

### Vollständige Verarbeitung (Empfohlen)

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\pdf"
powershell -ExecutionPolicy Bypass -File process-with-macro-analysis.ps1 -FullProcessing
```

### Einzelne Schritte

**1. Nur Makroökonomische Analyse:**
```powershell
.\process-with-macro-analysis.ps1 -MacroAnalysis
```

**2. Nur Informationen extrahieren:**
```powershell
.\process-with-macro-analysis.ps1 -ExtractInfo
```

**3. Nur PDF-Verarbeitung:**
```powershell
.\process-with-macro-analysis.ps1 -AddHeader
```

### Direkt mit Python

```bash
# Makroökonomische Analyse
python macro-economic-analyzer.py "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf" analysis_output.json
```

## 📊 Analysierte Metriken

### Makroökonomische Metriken

- **Gesamttransaktionen** - Anzahl aller Transaktionen
- **Gesamtvolumen** - Summe aller Transaktionen
- **Netto-Cashflow** - Differenz zwischen Ein- und Ausgängen
- **Durchschnittliche Transaktion** - Mittelwert
- **Median-Transaktion** - Medianwert
- **Volatilität** - Standardabweichung
- **Credit/Debit Ratio** - Verhältnis Ein- zu Ausgängen

### Wirtschaftsindikatoren

- **Liquiditätsquote** - Verhältnis Credits zu Debits
- **Stabilitätsindex** - Maß für Cashflow-Stabilität (0-1)
- **Aktivitätsindex** - Transaktionen pro Tag
- **Diversifikationsindex** - Vielfalt der Transaktionskategorien

### Kategorisierung

Automatische Kategorisierung in:
- 💰 Income (Einkommen)
- 💸 Expenses (Ausgaben)
- 🔄 Transfers (Überweisungen)
- 💳 Fees (Gebühren)
- 📈 Interest (Zinsen)
- 🏦 Investments (Investitionen)
- 📦 Other (Sonstiges)

## 📈 Generierte Reports

### JSON-Report
- Vollständige Datenstruktur
- Maschinenlesbar
- Für weitere Verarbeitung

### HTML-Report
- Professionelle Visualisierung
- Interaktive Darstellung
- Druckoptimiert

## 💡 Empfehlungen

Das System generiert automatisch makroökonomische Empfehlungen basierend auf:

- Liquiditätsanalyse
- Volatilitätsbewertung
- Diversifikationsgrad
- Aktivitätsniveau

## 🔧 Voraussetzungen

```bash
# Python-Pakete installieren
pip install PyMuPDF
```

## 📁 Output-Struktur

```
analysis_output/
├── pdf_info.txt              # Basis-Informationen
├── macro_analysis.json       # Vollständige Analyse (JSON)
├── macro_report.html         # HTML-Report
└── RA_PROCESSED.pdf          # Verarbeitete PDF (mit Header/Logo)
```

## 🎯 Anwendungsfälle

1. **Persönliche Finanzanalyse**
   - Cashflow-Überwachung
   - Ausgabenanalyse
   - Liquiditätsplanung

2. **Geschäftliche Analyse**
   - Betriebswirtschaftliche Kennzahlen
   - Trend-Analyse
   - Budgetplanung

3. **Makroökonomische Forschung**
   - Wirtschaftsindikatoren
   - Marktanalyse
   - Ökonomische Studien

## 📊 Beispiel-Output

```
MACRO-ECONOMIC BANK STATEMENT ANALYSIS
================================================================================

PDF: RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf
Analysedatum: 2025-01-27T12:00:00

📊 MAKROÖKONOMISCHE METRIKEN:
  Gesamttransaktionen: 45
  Gesamtvolumen: €12,345.67
  Netto-Cashflow: €3,456.78
  Durchschnittliche Transaktion: €274.35
  Volatilität: €156.23

📈 WIRTSCHAFTSINDIKATOREN:
  liquidity_ratio: 1.234
  stability_index: 0.856
  activity_index: 1.500
  diversification_index: 0.714

💡 EMPFEHLUNGEN:
  ✅ Gute Liquiditätsquote: Überschüssige Mittel könnten investiert werden
  📊 Hohe Volatilität: Cashflow-Stabilisierung empfohlen
```

## 🔗 Verwandte Tools

- `macro-economic-analyzer.py` - Hauptanalyse-Engine
- `process-with-macro-analysis.ps1` - PowerShell Wrapper
- `extract_pdf_info.py` - PDF Info Extractor
- `fabrikage_pdf.py` - PDF Processor

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**TogetherSystems International TTT**


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
