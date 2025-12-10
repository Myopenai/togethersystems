# 💰 Spenden-System für Branding-Implementierung

## 🎯 Übersicht

Benutzer können ihr **eigenes Branding** in Dynamic PDFs implementieren, während **TogetherSystems Verifizierung** erhalten bleibt.

## 💳 Spenden-Struktur

### Standard (Kostenlos)
- ✅ TogetherSystems Branding
- ✅ TogetherSystems Logo-Verifizierung
- ✅ Vollständige Funktionalität
- ✅ Makroökonomische Analyse

### Premium (Gegen Spende)
- ✅ Eigenes Logo
- ✅ Firmenname
- ✅ Eigene Farben
- ✅ Eigene Schriftarten
- ✅ TogetherSystems Verifizierung bleibt sichtbar
- ✅ Spenden-Info im Footer (optional)

## 💰 Spenden-Beträge

### Einmalige Spende
- **Minimum:** €10
- **Empfohlen:** €25-50
- **Premium:** €100+

### Regelmäßige Spenden
- **Monatlich:** €15/Monat
- **Jährlich:** €150/Jahr (spart 25%)

## 🔗 Spenden-Integration

### In PDF
- Footer: "Powered by TogetherSystems - Spenden: [Link]"
- Optional: Spenden-Button
- Transparenz: Spenden werden dokumentiert

### Spenden-Link
```
https://tel1.nl/donate
```

## 📋 Verwendung

### Standard (Kostenlos)
```powershell
.\universal-pdf-processor.ps1 -InputPdf "path/to/file.pdf"
```

### Premium (Mit eigenem Branding)
```powershell
.\universal-pdf-processor.ps1 `
  -InputPdf "path/to/file.pdf" `
  -UseCustomBranding `
  -CompanyName "Ihre Firma" `
  -CompanyLogo "path/to/logo.png" `
  -PrimaryColor "#1a1a2e" `
  -SecondaryColor "#16213e" `
  -ShowDonationInfo
```

## 🔐 TogetherSystems Verifizierung

**Immer vorhanden:**
- Logo im Header
- Copyright im Footer
- Verifizierungs-Badge
- SHA256 Hash

**Nicht entfernbar:**
- Verifizierung bleibt auch bei Premium-Branding
- Zusammenarbeit wird dokumentiert

---

**Version:** 1.0.0  
**TogetherSystems International TTT**

