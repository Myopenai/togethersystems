# 🔴 STANDARD: Automatische Produktions-Updates

**Status:** PERMANENT AKTIV - Für alle Produktionen  
**Wichtigkeit:** HOCHST

---

## 🎯 IMMER ANWENDEN BEI

- Kostenberechnung muss aktuell sein
- MD-zu-HTML Konvertierung gewünscht
- Production Tracking mit Jahresangaben
- Automatische Updates ohne User-Handlung

---

## 🔄 AUTOMATISCHE PROZESSE

### 1. Kostenberechnung
- Script: `auto-update-cost-calculation.ps1`
- Analysiert Code-Stand
- Berechnet Aufwand
- Aktualisiert Kostenberechnung
- Mit Jahresangaben

### 2. MD-zu-HTML
- Script: `auto-convert-md-to-html.ps1`
- Konvertiert bei Änderungen
- Aktualisiert Index
- Vollautomatisch

---

## 📁 DATEIEN ERSTELLEN

1. `scripts/production-tracker.ps1` - Haupt-Tracker
2. `scripts/auto-update-cost-calculation.ps1` - Kosten
3. `scripts/auto-convert-md-to-html.ps1` - MD-zu-HTML
4. `AUTOMATISCHE-UPDATES-STARTEN.bat` - Start
5. `PRODUCTION-TRACKING-YYYY.json` - Tracking

---

## ⏱️ AUTOMATISCH

- Täglich um 02:00 Uhr
- Bei Code-Änderungen
- Vor Deployment
- Bei Git-Commit

---

## 🚀 EINRICHTUNG

```powershell
scripts\setup-automatic-updates.ps1
```

Oder manuell:
```batch
AUTOMATISCHE-UPDATES-STARTEN.bat
```

---

## ✅ STANDARD

**IMMER so implementieren bei neuen Produktionen!**

**Prinzip:** Minimale Handlungen - Maximale Ergebnisse - Vollautomatisch

---

**Siehe:** `Settings/STANDARD-AUTOMATISCHE-PRODUKTIONS-UPDATES.json`




