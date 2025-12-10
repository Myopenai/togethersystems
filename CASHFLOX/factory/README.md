# Fabrikage A‑Start

Ein-Kommando-Start für die Fabrikage‑Pipeline basierend auf `factory.manifest.yaml`.

Ausführen:

```powershell
cd "C:\Users\Gebruiker\Documents\01db.com\CASHFLOX"
pwsh -NoProfile -ExecutionPolicy Bypass -File factory\a_start.ps1
```

Optional mit expliziten Inputs:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File factory\a_start.ps1 -Inputs "C:\Pfad\zu\deiner\PDF.pdf"
```

Ergebnis:
- Verarbeitete Dateien gemäß Manifest
- Berichte unter `factory\output\`


