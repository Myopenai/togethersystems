# TELBANK BANK-KONTAKT-INTEGRATION

**Version:** 1.0.0-XXXL  
**Branding:** T,.&T,,.&T,,,.TELBANK(C)(R)

---

## 📋 POSITION IM SYSTEM

Das **Bank-Kontakt-System** (`bank-contact-universe.html`) ist integriert als:

### Layer 1 – Integration & Bank-Anbindung
- **Bank Directory:** Datenbank mit Banken, monetären Systemen, Wallet-Providern, FinTechs
- **Kontakt-Portal:** HTML-UI für Bank-Kontakte (bereits implementiert)

### Integration mit TELBANK:

1. **Bank-Tabelle:** `bank` in `d1-schema-telbank-negative-assets.sql`
   - Enthält: `contact_email`, `contact_form_url`, `api_base_url`
   - Wird verwendet für: Bank-Identifikation, Kontaktaufnahme, API-Integration

2. **Bank-Kontakt-Portal:** `bank-contact-universe.html`
   - Zeigt alle Banken mit Kontaktinformationen
   - CSV-Export für Bank-Listen
   - Suche/Filter nach Land, Typ, Kanal

3. **TELBANK-Portal:** `telbank-portal-negative-assets.html`
   - Zeigt Participating Banks
   - Verknüpft mit Bank-Kontakt-System

---

## 🔗 VERKNÜPFUNG

### Datenfluss:
```
Bank-Kontakt-System (bank-contact-universe.html)
    ↓
Bank-Tabelle (bank)
    ↓
TELBANK Negative Assets (negative_asset.provider_bank_id)
    ↓
TELBANK Portal (telbank-portal-negative-assets.html)
```

---

## 📊 CSV-IMPORT

### Format für Bank-Kontakt-CSV:
```csv
bank_id,legal_name,short_name,country_code,city,bic_swift,website,contact_email,contact_form_url,api_base_url,role,onboarding_status
```

### Import-Flow:
1. CSV hochladen über TELBANK-Portal
2. `import_batch` anlegen
3. Zeilen validieren
4. `bank`-Einträge erstellen/aktualisieren

---

## 🎯 NÄCHSTE SCHRITTE

1. ✅ Bank-Kontakt-System integriert
2. ⏳ CSV-Import-Funktion implementieren
3. ⏳ Bank-API-Connectors entwickeln
4. ⏳ Automatische Kontakt-Erkennung (Scraping)

---

**STATUS:** 🟢 **INTEGRATION DEFINIERT - IMPLEMENTATION IN PROGRESS**

