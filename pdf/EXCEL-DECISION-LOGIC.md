# [.SYSTEMS.T.SYSTEMS.] Excel Decision Logic System

**Original:** https://tinyurl.com/BUGCOMPANY  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

---

## 📋 Übersicht

Excel-ähnliches Entscheidungssystem mit FILTER/XLOOKUP, WENN-Verschachtelung und SUMMENPRODUKT-Scoring. **Vollständig fehlerkorrigiert** mit robusten Validierungsfunktionen.

### Hauptmerkmale

- ✅ **Excel-Formeln** - FILTER/XLOOKUP, WENN-Verschachtelung, SUMMENPRODUKT
- ✅ **Regeltabelle** - Mit "Regel passt?" Spalte (Excel-ähnlich)
- ✅ **Scoring-Modell** - Gewichtete Bewertung (SUMMENPRODUKT)
- ✅ **Robuste Validierung** - Alle Logik-Fehler korrigiert
- ✅ **Dynamische Formeln** - WENN-Verschachtelung wird generiert

---

## 🎯 Excel-Formeln

### Variante 1 – FILTER/XLOOKUP

**Hilfsspalte "Regel passt?":**
```excel
=UND(
   ODER([@Kundentyp]="*";[@Kundentyp]=$B$2);
   [@Umsatz ≥]<=$C$2;
   ODER([@Land]="*";[@Land]=$D$2)
)
```

**Ausgabe (XLOOKUP-Style):**
```excel
=XLOOKUP(WAHR; [Spalte_mit_Regel_passt]; [Ergebnis-Spalte]; "Keine passende Regel")
```

**JavaScript-Implementierung:**
```javascript
// FILTER: Finde alle passenden Regeln
const matchingRules = rules.filter(rule => {
  const customerMatch = rule.customerType === '*' || rule.customerType === customerType;
  const revenueMatch = revenue >= rule.revenueMin;
  const countryMatch = rule.country === '*' || rule.country === country;
  const priorityMatch = rule.priority === '*' || rule.priority === priority;
  return customerMatch && revenueMatch && countryMatch && priorityMatch;
});

// XLOOKUP: Erste passende Regel
const matchedRule = matchingRules.length > 0 ? matchingRules[0] : null;
```

### Variante 2 – WENN-Verschachtelung

**Klassische Excel-Formel:**
```excel
=WENN(UND(B2="VIP";C2>=0);"VIP-Handling";
WENN(C2>=50000;"Sonderfall";
WENN(UND(B2="Bestandskunde";C2>=10000;D2="DE");"Premium";
"Standard")))
```

**Dynamisch generiert:**
- Wird automatisch aus Regeln erstellt
- Zeigt Excel-ähnliche Syntax
- Erklärt die Logik

### Variante 3 – Scoring-Modell (SUMMENPRODUKT)

**Excel-Formel:**
```excel
=SUMMENPRODUKT(Gewicht_Bereich; Punkte_Bereich)
```

**JavaScript-Implementierung:**
```javascript
// Gewichte × Punkte
const calc1 = weight1 * points1;
const calc2 = weight2 * points2;
const calc3 = weight3 * points3;
const calc4 = weight4 * points4;

// SUMMENPRODUKT
const totalScore = calc1 + calc2 + calc3 + calc4;
```

---

## 🔧 Robuste Validierung (Fehlerkorrektur)

### Implementierte Funktionen

**validateFormula():**
```javascript
function validateFormula(value, min = 0, max = Infinity, defaultValue = 0) {
  const num = parseFloat(value);
  if (!isFinite(num) || isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}
```

**safeDivide():**
```javascript
function safeDivide(numerator, denominator, defaultValue = 0) {
  if (!isFinite(numerator) || !isFinite(denominator) || 
      denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
    return defaultValue;
  }
  return numerator / denominator;
}
```

**safeParseInt() / safeParseFloat():**
```javascript
function safeParseInt(value, defaultValue = 0) {
  const num = parseInt(value);
  if (!isFinite(num) || isNaN(num)) return defaultValue;
  return num;
}
```

### Anwendung

**Alle numerischen Eingaben:**
```javascript
const revenue = validateFormula(revenueRaw, 0, Infinity, 0);
const weight1 = validateFormula(weight1Raw, 0, 10, 0);
```

**Alle Berechnungen:**
```javascript
const calc1 = isFinite(weight1) && isFinite(points1) ? weight1 * points1 : 0;
const totalScore = isFinite(calc1) && isFinite(calc2) && ... ? calc1 + calc2 + ... : 0;
```

**Alle Anzeigen:**
```javascript
const revenueFormatted = isFinite(revenue) ? revenue.toLocaleString('de-DE') : '0';
```

---

## 📊 Regeltabelle

### Excel-ähnliche Spalten

| Regel-ID | Kundentyp | Umsatz ≥ | Land | Priorität | Ergebnis | Regel passt? |
|----------|-----------|----------|------|-----------|----------|--------------|
| R1 | * | 0 | * | * | Standard | ✓ WAHR / FALSCH |
| R2 | Bestandskunde | 10000 | DE | * | Premium | ✓ WAHR / FALSCH |
| ... | ... | ... | ... | ... | ... | ... |

**"Regel passt?" Spalte:**
- Zeigt in Echtzeit, welche Regel matcht
- Excel UND/ODER-Logik
- Grünes ✓ für WAHR, grau für FALSCH

---

## 🎯 Scoring-Modell

### Excel SUMMENPRODUKT

**Tabelle:**
| Kriterium | Gewicht | Wert (Input) | Punkte | Berechnet |
|-----------|---------|------------|---------|------------|
| Kundentyp | 3 | VIP | 3 | 9 |
| Umsatzklasse | 2 | >50k | 3 | 6 |
| Land-Risiko | 1 | DE | 1 | 1 |
| Priorität | 1 | Hoch | 3 | 3 |
| **Gesamtpunkte** | | | | **19** |

**Formel:**
```excel
=SUMMENPRODUKT(B2:B5; E2:E5)
```

**Ergebnis-Kategorien:**
- **Top-Kunde:** ≥ 15 Punkte
- **Premium:** ≥ 10 Punkte
- **Mittel:** ≥ 5 Punkte
- **Standard:** < 5 Punkte

---

## 🔧 Korrigierte Funktionen

### calculate()

**Vorher (fehleranfällig):**
```javascript
const revenue = parseInt(document.getElementById('revenue').value) || 0;
```

**Nachher (robust):**
```javascript
const revenueRaw = document.getElementById('revenue').value;
const revenue = validateFormula(revenueRaw, 0, Infinity, 0);
```

### updateScoring()

**Vorher:**
```javascript
const calc1 = weight1 * points1;
const totalScore = calc1 + calc2 + calc3 + calc4;
```

**Nachher:**
```javascript
const calc1 = isFinite(weight1) && isFinite(points1) ? weight1 * points1 : 0;
const totalScore = isFinite(calc1) && isFinite(calc2) && ... ? calc1 + calc2 + ... : 0;
```

### renderRules()

**Hinzugefügt:**
- "Regel passt?" Spalte mit Excel UND/ODER-Logik
- Robuste Validierung aller Regel-Werte
- Sichere Formatierung

---

## 📝 Verwendung

### Schnellstart

1. **Eingaben machen:**
   - Parameter A, B, C ausfüllen
   - Dropdown-Listen verwenden

2. **Berechnen:**
   - Button "Berechnen" klicken
   - Regeltabelle zeigt "Regel passt?" Spalte
   - Ergebnis wird angezeigt

3. **Excel-Formeln sehen:**
   - FILTER/XLOOKUP-Formel wird angezeigt
   - WENN-Verschachtelung wird generiert
   - SUMMENPRODUKT wird berechnet

4. **Scoring prüfen:**
   - Gewichte anpassen
   - Punkte automatisch berechnet
   - Gesamtpunkte mit SUMMENPRODUKT

### Best Practices

**Regeln definieren:**
- Spezifische Regeln zuerst
- Allgemeine Regeln (*) am Ende
- "Regel passt?" Spalte prüfen

**Excel-Formeln:**
- FILTER/XLOOKUP für flexible Suche
- WENN-Verschachtelung für einfache Logik
- SUMMENPRODUKT für Scoring

**Validierung:**
- Alle Eingaben werden validiert
- NaN/Infinity werden verhindert
- Division durch Null wird abgefangen

---

## 🎨 Design

### Excel-ähnliches Layout

**Farben:**
- Hintergrund: `#0b1020` / `#020617`
- Akzente: `#6366f1` (Blau)
- Erfolg: `#10b981` (Grün für "WAHR")
- Text: `#e5e7eb` / `#9ca3af`

**Tabellen:**
- Excel-ähnliche Spalten
- "Regel passt?" mit grünem ✓
- Monospace für Formeln

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

**Excel-Export:**
- CSV-Format möglich
- JSON für Daten-Import

---

## 📄 Unterschiede zur Matrix-Version

### Excel-Version (diese Datei)

- ✅ Excel-Formeln sichtbar
- ✅ "Regel passt?" Spalte
- ✅ WENN-Verschachtelung generiert
- ✅ SUMMENPRODUKT explizit
- ✅ Excel-ähnliches Layout

### Matrix-Version

- ✅ Flowchart-Visualisierung
- ✅ Tabs für verschiedene Ansichten
- ✅ Moderneres UI
- ✅ Export-Funktionen

**Beide Versionen:**
- ✅ Robuste Validierung
- ✅ Fehlerkorrektur angewendet
- ✅ Sichere Berechnungen

---

## 🐛 Fehlerbehandlung

### Validierung

**Automatische Checks:**
- Dropdown-Validierung
- Numerische Eingaben (validateFormula)
- Datum-Formatierung
- Regel-Konsistenz

**Fehlermeldungen:**
- "Keine passende Regel" - Wenn keine Regel matcht
- "Bitte Eingaben überprüfen" - Bei fehlenden Werten
- Automatische Korrektur ungültiger Werte

---

## 📄 Lizenz & Credits

**Erstellt mit:**
- Excel Decision Logic System
- TogetherSystems International TTT
- [.SYSTEMS.T.SYSTEMS.]

**Technologien:**
- HTML5
- JavaScript (ES6+)
- CSS3 (Grid, Flexbox)

**Fehlerkorrektur:**
- Robuste Validierungsfunktionen
- NaN/Infinity Handling
- Division durch Null verhindert

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Branding:** [.SYSTEMS.T.SYSTEMS.]  
**TogetherSystems International TTT**

