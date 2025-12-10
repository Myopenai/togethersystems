# [.SYSTEMS.T.SYSTEMS.] Decision Matrix System

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📋 Übersicht

Ein vollständiges Entscheidungsmatrix-System zur systematischen Erfassung von Einflussfaktoren, Definition von Regeln und Standardisierung der Logik.

### Hauptmerkmale

- ✅ **Parameter-Ebenen** - Struktur/Kontext, Werte/Mengen, Zeit/Priorität
- ✅ **Regeltabellen** - Wenn-Dann-Sonst-Logik
- ✅ **Scoring-Modell** - Gewichtete Bewertung
- ✅ **Flowchart-Visualisierung** - Visuelle Entscheidungslogik
- ✅ **Export-Funktionen** - JSON & CSV
- ✅ **Dropdown-Listen** - Konsistente Eingaben

---

## 🎯 Funktionen

### 1. Parameter-Ebenen

#### Parameter A – Struktur / Kontext

**Eingabefelder:**
- **Kundentyp:** Neu, Bestandskunde, VIP, Partner, Reseller
- **Produkt:** Standard, Premium, SaaS, Hardware, Service
- **Land:** DE, AT, CH, NL, EU, Non-EU
- **Status:** Aktiv, Inaktiv, Gesperrt, Testkunde

#### Parameter B – Werte / Mengen

**Eingabefelder:**
- **Umsatzhöhe:** Numerisch (€)
- **Menge / Stückzahl:** Numerisch
- **Score:** 0-100
- **Rabattklasse:** 0%, 5%, 10%, 20%

#### Parameter C – Zeit / Priorität

**Eingabefelder:**
- **Vertragsbeginn:** Datum
- **Laufzeit:** Monate (numerisch)
- **Priorität:** Hoch, Mittel, Niedrig
- **Phase:** Onboarding, Betrieb, Kündigung

### 2. Regeltabellen

**Funktionen:**
- Dynamische Regelverwaltung
- Wenn-Dann-Sonst-Logik
- Wildcard-Unterstützung (* = beliebig)
- Prioritätsbasiertes Matching (erste passende Regel)

**Standard-Regeln:**
- **R1:** Neu, Umsatz ≥ 0, Land: *, Priorität: * → **Standard**
- **R2:** Bestandskunde, Umsatz ≥ 10.000, Land: DE, Priorität: * → **Premium**
- **R3:** VIP, Umsatz ≥ 0, Land: *, Priorität: * → **VIP-Handling**
- **R4:** *, Umsatz ≥ 50.000, Land: *, Priorität: * → **Sonderfall**

**Regel-Matching:**
```javascript
// Logik:
1. Kundentyp matcht (oder *)
2. Umsatz >= Minimum
3. Land matcht (oder *)
4. Priorität matcht (oder *)
→ Erste passende Regel wird verwendet
```

### 3. Scoring-Modell

**Gewichtete Bewertung:**

| Kriterium | Gewicht | Punkte-System |
|-----------|---------|---------------|
| **Kundentyp** | 3 | Neu: 1, Bestand: 2, VIP: 3, Partner: 2, Reseller: 1 |
| **Umsatzklasse** | 2 | <10k: 1, 10k-50k: 2, >50k: 3 |
| **Land-Risiko** | 1 | DE/AT/CH/NL: 1, EU: 2, Non-EU: 3 |
| **Priorität** | 1 | Niedrig: 1, Mittel: 2, Hoch: 3 |

**Berechnung:**
```
Gesamtpunkte = Σ(Gewicht × Punkte)
```

**Ergebnis-Kategorien:**
- **Top-Kunde:** ≥ 15 Punkte
- **Premium:** ≥ 10 Punkte
- **Mittel:** ≥ 5 Punkte
- **Standard:** < 5 Punkte

### 4. Flowchart-Visualisierung

**Dynamische Generierung:**
- Start-Knoten
- Entscheidungs-Knoten (Diamant-Form)
- Ergebnis-Knoten
- Pfeile zwischen Knoten

**Logik-Flow:**
```
Start
  ↓
Kundentyp = VIP?
  ├─ Ja → VIP-Handling
  └─ Nein → Umsatz ≥ 50k?
      ├─ Ja → Sonderfall
      └─ Nein → Bestand & DE & ≥10k?
          ├─ Ja → Premium
          └─ Nein → Standard
```

### 5. Export-Funktionen

#### JSON Export
```json
{
  "timestamp": "2025-01-27T...",
  "inputs": {
    "customerType": "VIP",
    "revenue": 75000,
    "country": "DE",
    ...
  },
  "rules": [...],
  "result": "VIP-Handling",
  "scoring": {
    "totalScore": "18",
    "result": "Top-Kunde (18 Punkte)"
  }
}
```

#### CSV Export
- Parameter als Spalten
- Regeln als separate Tabelle
- Ergebnis & Scoring

---

## 🔧 Technische Details

### Regel-Matching-Algorithmus

**Priorität:**
1. Erste passende Regel wird verwendet
2. Wildcard (*) matcht alles
3. Exakte Übereinstimmung hat Vorrang

**Beispiel:**
```
Eingabe: VIP, 25.000€, DE, Hoch

Regeln:
R1: Neu, 0, *, * → Standard (nicht passend)
R2: Bestand, 10000, DE, * → Premium (nicht passend)
R3: VIP, 0, *, * → VIP-Handling ✅ (PASST!)
R4: *, 50000, *, * → Sonderfall (nicht passend)

Ergebnis: VIP-Handling (Regel R3)
```

### Scoring-Berechnung

**Formel:**
```javascript
totalScore = 
  (weight1 × points1) +
  (weight2 × points2) +
  (weight3 × points3) +
  (weight4 × points4)
```

**Beispiel:**
```
Kundentyp: VIP (3 Punkte) × Gewicht 3 = 9
Umsatz: >50k (3 Punkte) × Gewicht 2 = 6
Land: DE (1 Punkt) × Gewicht 1 = 1
Priorität: Hoch (3 Punkte) × Gewicht 1 = 3
─────────────────────────────────────────
Gesamt: 19 Punkte → Top-Kunde
```

---

## 📊 Verwendung

### Schnellstart

1. **Eingaben machen:**
   - Parameter A, B, C ausfüllen
   - Dropdown-Listen verwenden

2. **Berechnen:**
   - Button "Berechnen" klicken
   - Ergebnis wird angezeigt

3. **Regeln anpassen:**
   - Tab "Regeln" öffnen
   - Neue Regel hinzufügen oder bearbeiten

4. **Scoring prüfen:**
   - Tab "Scoring" öffnen
   - Gewichte anpassen
   - Punkte automatisch berechnet

5. **Flowchart visualisieren:**
   - Tab "Flowchart" öffnen
   - Entscheidungslogik sehen

6. **Export:**
   - Tab "Export" öffnen
   - JSON oder CSV speichern

### Best Practices

**Regeln definieren:**
- Spezifische Regeln zuerst
- Allgemeine Regeln (*) am Ende
- Priorität beachten (erste passende Regel)

**Scoring anpassen:**
- Gewichte nach Wichtigkeit setzen
- Punkte-System konsistent halten
- Schwellenwerte definieren

**Dokumentation:**
- Regeln dokumentieren
- Scoring-Logik erklären
- Flowchart als Referenz nutzen

---

## 🎨 Design

### Farben

**Hintergrund:**
- Haupt: `#0b1020`
- Panel: `#020617`
- Gradient: Radial

**Akzente:**
- Primär: `#6366f1`
- Erfolg: `#4ade80`
- Warnung: `#f59e0b`
- Fehler: `#ef4444`

**Flowchart-Knoten:**
- Start: Grün (`#065f46`)
- Entscheidung: Orange (`#7c2d12`)
- Ergebnis: Blau (`#1e3a8a`)

---

## 🔗 Integration

### Links

**TogetherSystems:**
- Website: tel1.nl
- Support: info@tel1.nl
- Original: https://tinyurl.com/BUGCOMPANY

### Kompatibilität

**Browser:**
- Chrome/Edge (empfohlen)
- Firefox
- Safari

**Features:**
- LocalStorage (optional, für Regeln)
- File Download (JSON/CSV)
- Canvas (Flowchart)

---

## 📝 Erweiterungen

### Mögliche Features

- **Regel-Import/Export** - Regeln als JSON speichern
- **Historie** - Berechnungen speichern
- **Templates** - Vordefinierte Regel-Sets
- **API-Integration** - Externe Datenquellen
- **Multi-User** - Regeln teilen
- **Versionierung** - Regel-Versionen verwalten

---

## 🐛 Fehlerbehandlung

### Validierung

**Automatische Checks:**
- Dropdown-Validierung
- Numerische Eingaben
- Datum-Formatierung
- Regel-Konsistenz

**Fehlermeldungen:**
- "Keine passende Regel" - Wenn keine Regel matcht
- "Bitte Eingaben überprüfen" - Bei fehlenden Werten

---

## 📄 Lizenz & Credits

**Erstellt mit:**
- Decision Matrix System
- TogetherSystems International TTT
- [.SYSTEMS.T.SYSTEMS.]

**Technologien:**
- HTML5
- JavaScript (ES6+)
- CSS3 (Grid, Flexbox)

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

