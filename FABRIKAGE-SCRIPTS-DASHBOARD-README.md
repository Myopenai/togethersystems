# FABRIKAGE SCRIPTS DASHBOARD
## Übersichtsseite für alle Fabrikage-Skripte

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🚀 FUNKTIONEN

### Automatische Features:
- ✅ **Automatisches Scannen:** Findet alle `FABRIKAGE-*.ps1` Skripte automatisch
- ✅ **Automatische Updates:** Dashboard aktualisiert sich alle 30 Sekunden
- ✅ **Kategorisierung:** Skripte werden automatisch kategorisiert
- ✅ **Beschreibungen:** Werden aus Skript-Kommentaren extrahiert
- ✅ **Klick-Ausführung:** Skripte per Klick ausführen (ohne Terminal)

### Manuelle Features:
- 🔍 **Suche:** Durchsuche Skripte nach Name oder Beschreibung
- 🏷️ **Filter:** Filtere nach Kategorien
- 📊 **Statistiken:** Zeige Gesamtanzahl, laufende, erfolgreiche, fehlerhafte Skripte
- ℹ️ **Info:** Zeige detaillierte Informationen zu jedem Skript

---

## 📋 ZUGRIFF

### Localhost:
```
http://localhost:5173/scripts-dashboard
```

### Nach Server-Start:
1. Server starten: `cd xxxxxxls-fabrikage && npm start`
2. Browser öffnen: `http://localhost:5173/scripts-dashboard`

---

## 🔧 SKRIPTE AUSFÜHREN

### Per Dashboard:
1. Öffne Dashboard
2. Klicke auf "▶️ Ausführen" bei gewünschtem Skript
3. Warte auf Ausführung (Status wird angezeigt)

### Automatische Updates:
- Dashboard aktualisiert sich automatisch alle 30 Sekunden
- Neue Skripte werden automatisch erkannt
- Beschreibungen werden aus Skript-Kommentaren extrahiert

---

## 📝 SKRIPT-BESCHREIBUNGEN AKTUALISIEREN

### Automatisch:
```powershell
.\FABRIKAGE-UPDATE-SCRIPTS-DASHBOARD.ps1
```

Dieses Skript:
- Scannt alle `FABRIKAGE-*.ps1` Skripte
- Extrahiert Beschreibungen aus Kommentaren
- Kategorisiert automatisch
- Aktualisiert das Dashboard

### Manuell:
Füge Beschreibungen in `fabrikage-scripts-dashboard.html` im `scriptDescriptions`-Objekt hinzu.

---

## 🎯 KATEGORIEN

- **Test:** Test-Skripte
- **Deploy:** Deployment-Skripte
- **Fix:** Fehlerbehebungs-Skripte
- **Mirror:** Code-Mirror-Skripte
- **Standards:** Standards-Implementierung
- **Complete:** Komplette Ausführung
- **Error Prevention:** Fehlerprävention
- **Master:** Master-Orchestrierung
- **Update:** Update-Skripte
- **Other:** Sonstige

---

## 🔄 AUTOMATISCHE UPDATES

Das Dashboard aktualisiert sich automatisch:
- **Alle 30 Sekunden:** Neue Skripte werden erkannt
- **Bei Ausführung:** Status wird aktualisiert
- **Bei Änderungen:** Beschreibungen werden aktualisiert

---

## 📊 API-ENDPOINTS

### Liste aller Skripte:
```
GET /api/scripts/list
```

### Skript ausführen:
```
POST /api/scripts/run
Body: { "script": "FABRIKAGE-COMPLETE-TEST-AND-VERIFY-ALL.ps1" }
```

### Skript-Informationen:
```
GET /api/scripts/info/:script
```

---

## ✅ VORTEILE

1. **Keine Terminal-Befehle:** Alles per Klick
2. **Immer aktuell:** Automatische Updates
3. **Übersichtlich:** Alle Skripte auf einen Blick
4. **Beschreibungen:** Wofür jedes Skript ist
5. **Status:** Welche Skripte laufen/erfolgreich/fehlerhaft
6. **Suche & Filter:** Schnell finden was man braucht

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV



