# T,. Aquarium-Dashboard - Dokumentation

**Branding:** `T,.&T,,.&T,,,.T.`

---

## 🐠 Aquarium-Metapher

Das Aquarium-Dashboard visualisiert den Produktionsprozess als Aquarium mit verschiedenen Fischarten (Abschnitte), die in unterschiedlichen Zonen (Zeitbereiche) schwimmen.

### Zonen

- **Vergangen (links):** Abgeschlossene Abschnitte
- **Aktiv (Mitte):** Aktuell laufende Abschnitte
- **Zukunft (rechts):** Ausstehende Abschnitte

### Fisch-Farben

- 🟢 **Grün:** Aktiv
- 🔵 **Blau:** Abgeschlossen
- ⚪ **Grau:** Ausstehend

---

## 📊 Diagramme

### 1. Kuchendiagramm: Zeitverteilung

- Verstrichene Zeit (grün)
- Verbleibende Zeit (blau)
- Automatisch aktualisiert

### 2. Säulendiagramm: Zeit pro Abschnitt

- Zeigt Zeit pro Abschnitt
- Normalisiert auf Maximum
- Automatisch aktualisiert

### 3. Fortschrittsbalken: Status

- Farbcodierte Statusanzeige
- Progress pro Abschnitt
- Echtzeit-Updates

---

## 🔧 Automatische Aktualisierung

Das Dashboard wird automatisch generiert und bei jeder Produktion aktualisiert.

### Integration

```typescript
import { DashboardGenerator } from './dashboard-generator';
import { StatusManager } from '../status/status-manager';
import { HeartbeatManager } from '../heartbeat/heartbeat-manager';

const statusManager = new StatusManager();
const heartbeatManager = new HeartbeatManager();
const dashboardGenerator = new DashboardGenerator(statusManager, heartbeatManager);

// Dashboard generieren
await dashboardGenerator.saveDashboard();

// Automatische Updates starten
dashboardGenerator.startAutoUpdates(5000); // Alle 5 Sekunden
```

---

## 📁 Dateien

- `aquarium-dashboard.html` - HTML-Template
- `dashboard-generator.ts` - TypeScript Generator
- `README.md` - Diese Datei

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

