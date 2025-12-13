# PORTAL-START KONFIGURATION
## Wie startet das Portal?

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Version:** 1.0.0

---

## 🚀 PORTAL-START SEQUENZ

### 1. Haupt-Portal (`index.html`)
- **Datei:** `index.html` (Root-Verzeichnis)
- **Funktion:** Automatische Weiterleitung
- **Ziel:** `portal-start-nebula.html`

### 2. Portal-Start-Nebula (`portal-start-nebula.html`)
- **Datei:** `portal-start-nebula.html` (Root-Verzeichnis)
- **Funktion:** Portal-Overlay mit Nebula-Scene
- **Inhalt:** 
  - Heilungsspirale Pro (Iframe)
  - TogetherSystems Branding
  - "Portal öffnen" Button
  - Optional: Auto-Start nach 3 Sekunden

### 3. Heilungsspirale Pro (Nebula-Modus)
- **Datei:** `modular-fabrikage/apps/heilungsspirale-pro.html`
- **Parameter:** `?mode=nebula&autostart=true`
- **Funktion:** Visuelle Nebula-Scene als Portal-Eröffnung

---

## 📋 START-SEQUENZ IM DETAIL

```
1. Benutzer öffnet: index.html
   ↓
2. Automatische Weiterleitung zu: portal-start-nebula.html
   ↓
3. Portal-Overlay wird angezeigt:
   - ".T. TogetherSystems Portal" Branding
   - "Portal öffnen" Button
   - Heilungsspirale Pro lädt im Hintergrund (Iframe)
   ↓
4. Benutzer klickt "Portal öffnen" (oder Auto-Start nach 3s)
   ↓
5. Overlay verschwindet, Heilungsspirale Pro wird sichtbar
   ↓
6. Nebula-Scene läuft mit autostart=true
```

---

## ⚙️ KONFIGURATION

### Auto-Start aktivieren/deaktivieren

In `portal-start-nebula.html`:

```javascript
// Auto-Start aktivieren (Zeile 195):
enableAutoStart();  // Entkommentieren

// Auto-Start deaktivieren:
// enableAutoStart();  // Auskommentieren
```

### Weiterleitung ändern

In `index.html` (Zeile 47):

```javascript
// Aktuell: Weiterleitung zu portal-start-nebula.html
window.location.href = 'portal-start-nebula.html';

// Alternative: Direkt zu Modular-Fabrikage
// window.location.href = 'modular-fabrikage/index.html';

// Alternative: Direkt zu XXXXXXLS-Fabrikage
// window.location.href = 'xxxxxxls-fabrikage/public/index.html';
```

---

## 🎯 VERFÜGBARE PORTALE

### 1. Portal-Start-Nebula
- **URL:** `portal-start-nebula.html`
- **Beschreibung:** Portal-Eröffnung mit Heilungsspirale Pro (Nebula)
- **Status:** ✅ AKTIV (Standard-Start)

### 2. Modular-Fabrikage
- **URL:** `modular-fabrikage/index.html`
- **Beschreibung:** Modulares Fabrikage System
- **Status:** ✅ Verfügbar

### 3. XXXXXXLS-Fabrikage
- **URL:** `xxxxxxls-fabrikage/public/index.html` (nach `npm run dev`)
- **Beschreibung:** Dimensionless Modular Factory
- **Status:** ✅ Verfügbar (Server erforderlich)

### 4. CognitiveFabric
- **URL:** `index.html` (wird weitergeleitet)
- **Beschreibung:** Single-file ES2022 System
- **Status:** ⚠️ Wird weitergeleitet

---

## 🔧 TROUBLESHOOTING

### Portal startet nicht?
1. Prüfe ob `portal-start-nebula.html` existiert
2. Prüfe ob `modular-fabrikage/apps/heilungsspirale-pro.html` existiert
3. Öffne Browser-Konsole (F12) für Fehlermeldungen

### Weiterleitung funktioniert nicht?
1. Prüfe ob JavaScript aktiviert ist
2. Prüfe Browser-Konsole für Fehler
3. Manuell zu `portal-start-nebula.html` navigieren

### Heilungsspirale Pro lädt nicht?
1. Prüfe Pfad: `modular-fabrikage/apps/heilungsspirale-pro.html`
2. Prüfe ob Datei existiert
3. Prüfe Browser-Konsole für 404-Fehler

---

## ✅ AKTUELLE KONFIGURATION

- **Standard-Start:** ✅ `portal-start-nebula.html`
- **Auto-Start:** ⚠️ Deaktiviert (kann aktiviert werden)
- **Weiterleitung:** ✅ Aktiv in `index.html`
- **Branding:** ✅ TogetherSystems (.T.)

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 1.0.0


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
