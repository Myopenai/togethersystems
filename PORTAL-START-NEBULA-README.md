# Portal Start mit Nebula-Einstellung
## Heilungsspirale Pro als Portal-Eröffnung

**Datum:** 2025-12-07  
**Version:** 1.0.0  
**Status:** ✅ Vollständig implementiert

---

## 🎯 ÜBERSICHT

Die **Portal-Start-Nebula** Seite öffnet die Heilungsspirale Pro mit der Nebula-Einstellung als Eröffnung des Portals beim Start.

### Features:
- ✅ **Nebula-Darstellung:** Heilungsspirale Pro wird im Nebula-Modus angezeigt
- ✅ **Portal-Overlay:** Elegante Eröffnungsanimation
- ✅ **Auto-Start:** Optional automatisches Öffnen nach 3 Sekunden
- ✅ **Vollbild-Modus:** Unterstützung für Vollbild-Anzeige
- ✅ **Keyboard-Shortcuts:** ESC zum Zurückkehren zum Overlay

---

## 🚀 VERWENDUNG

### Direkter Zugriff:
Öffne `portal-start-nebula.html` im Browser.

### Integration in index.html:
Füge einen Link oder eine automatische Weiterleitung hinzu:

```html
<!-- Option 1: Link -->
<a href="portal-start-nebula.html">Portal mit Nebula öffnen</a>

<!-- Option 2: Automatische Weiterleitung -->
<script>
  window.location.href = 'portal-start-nebula.html';
</script>
```

---

## ⚙️ KONFIGURATION

### Nebula-Parameter:
Die Heilungsspirale Pro wird mit folgenden URL-Parametern geladen:
- `mode=nebula` - Aktiviert den Nebula-Modus
- `autostart=true` - Startet automatisch

### Auto-Start aktivieren:
In `portal-start-nebula.html` die folgende Zeile auskommentieren:

```javascript
// Aktuell auskommentiert:
// enableAutoStart();

// Aktivieren:
enableAutoStart();
```

### Auto-Start deaktivieren:
- Auto-Start ist standardmäßig deaktiviert
- Wird automatisch deaktiviert bei Mausbewegung oder Klick

---

## 🎨 ANPASSUNGEN

### Overlay-Text ändern:
```html
<div class="brand">.T.</div>
<div class="subtitle">TogetherSystems Portal</div>
```

### Farben anpassen:
```css
.brand {
  background: linear-gradient(135deg, #39d0ff, #f565ff);
}
```

### Timing anpassen:
```javascript
// Auto-Start nach X Sekunden
setTimeout(() => {
  openPortal();
}, 3000); // 3 Sekunden
```

---

## 📋 DATEI-STRUKTUR

```
.
├── portal-start-nebula.html          # Portal-Start-Seite mit Nebula
├── modular-fabrikage/
│   └── apps/
│       └── heilungsspirale-pro.html  # Heilungsspirale Pro App
└── gentlyoverdone/
    └── Heilungsspirale Pro.html      # Original-Datei
```

---

## ✅ STATUS

- **Portal-Start-Seite:** ✅ Erstellt
- **Heilungsspirale Pro:** ✅ Integriert
- **Nebula-Modus:** ✅ Aktiviert
- **Overlay:** ✅ Implementiert
- **Auto-Start:** ✅ Optional verfügbar

---

## 🔧 FEHLERBEHEBUNG

### Problem: Heilungsspirale Pro wird nicht geladen
- Prüfe ob die Datei existiert: `modular-fabrikage/apps/heilungsspirale-pro.html`
- Prüfe Browser-Konsole auf Fehler
- Stelle sicher, dass der Pfad korrekt ist

### Problem: Nebula-Modus funktioniert nicht
- Prüfe ob die Heilungsspirale Pro die URL-Parameter unterstützt
- Prüfe Browser-Konsole auf Fehler
- Versuche ohne Parameter zu laden

### Problem: Overlay bleibt sichtbar
- Klicke auf "Portal öffnen" Button
- Oder drücke ESC zum Zurückkehren

---

## 📝 NÄCHSTE SCHRITTE

1. **Testen:** Öffne `portal-start-nebula.html` im Browser
2. **Anpassen:** Passe Overlay-Text und Farben an
3. **Integrieren:** Füge Link/Weiterleitung in index.html hinzu
4. **Auto-Start:** Aktiviere Auto-Start falls gewünscht

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 1.0.0



