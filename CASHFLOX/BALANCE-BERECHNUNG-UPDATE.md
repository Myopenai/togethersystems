# Balance-Berechnung Update - Alle Rechenmodule
## Vollständige Implementierung der erweiterten Balance-Berechnung

**Datum:** 2025-01-27  
**Version:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture

---

## ✅ IMPLEMENTIERTE FEATURES

### 1. Balance-Berechnung für User
- Automatische Berechnung der Balance zwischen Lieblingsprodukten und lebenserhaltenden Produkten
- Priorisierung: **Lebenserhaltende Produkte ZUERST**, dann Lieblingsprodukte
- Budget-basierte Berechnung über gesamte Zeitstrecke

### 2. Lieblingsprodukt-Verwaltung
- Lieblingsprodukte können hinzugefügt werden mit:
  - Name, Preis, Menge
  - Frequenz: **täglich**, **wöchentlich**, **monatlich**
  - Priorität (1-10)

### 3. Automatische Verteilung über Zeitstrecken
- **Täglich:** Wenn Budget ausreicht → täglich verfügbar
- **Nicht täglich möglich:** Automatische Sammelbeträge über mehrere Tage
- **Wöchentlich:** Automatische Verteilung alle 7 Tage
- **Monatlich:** Automatische Verteilung einmal pro Monat (30 Tage)

### 4. Sammelbeträge über mehrere Tage
- Wenn Budget nicht täglich reicht:
  - System sammelt Beträge über mehrere Tage
  - Zeigt an, wann das Produkt gekauft werden kann
  - Sammelzeit wird visualisiert
- Beispiel: Produkt kostet 15€, tägliches Budget nur 5€ → Sammelt 3 Tage, kauft am 4. Tag

### 5. Automatische Vorschläge
- Wenn Produkt nicht möglich ist:
  - System schlägt Reduzierung vor
  - Zeigt, um wie viel reduziert werden muss
  - Schützt lebenserhaltende Produkte

### 6. Visualisierung
- **Scheiben (Kreisdiagramm):** Verteilung aller Produkte
- **Kuchen:** Segmentierte Darstellung
- **Türme:** Balkendiagramm für bessere Vergleichbarkeit
- **Sammelbetrag-Hinweise:** 📦 Symbol für Produkte mit Sammelbeträgen
- **Kauf-Tage:** Anzeige, an welchen Tagen Produkte gekauft werden

---

## 📊 IMPLEMENTIERTE DATEIEN

### ✅ chflox.html
- **Status:** Vollständig aktualisiert
- **Features:**
  - Erweiterte `berechneBudget()` Funktion
  - Sammelbeträge über mehrere Tage
  - Automatische Verteilung (täglich/wöchentlich/monatlich)
  - Visualisierung mit Scheiben, Kuchen, Türme
  - Lieblingsprodukte-UI mit monatlich-Option
  - Erweiterte Tabelle mit Verteilungsinformationen

---

## 🔄 NÄCHSTE SCHRITTE

### Zu aktualisierende Dateien:
1. `budget.html` - DaVinci Mode Budget-Studio
2. `Kassenbuch/kassenbuch.html` - Kassenbuch mit Balance-Berechnung
3. Weitere Rechenmodule im Ordner

---

## 📝 TECHNISCHE DETAILS

### Balance-Berechnungs-Logik:
```javascript
1. PHASE 1: Lebensnotwendige Produkte (ZUERST)
   - Joints
   - Lebensmittel
   - Brötchen
   
2. PHASE 2: Lieblingsprodukte (NACH Lebensnotwendigen)
   - Sortiert nach Priorität
   - Prüft ob täglich/wöchentlich/monatlich möglich
   - Erstellt Sammelbeträge wenn nötig
   - Zeigt Kauf-Tage an
   
3. PHASE 3: Gesamtbilanz
   - Summe aller Kosten
   - Restbudget
   - Warnungen bei Überschreitung
```

### Sammelbetrag-Algorithmus:
```javascript
Wenn (Produktpreis > verfügbares Tagesbudget):
  1. Berechne Tage pro Kauf: ceil(Preis / Tagesbudget)
  2. Sammle Beträge über diese Tage
  3. Kaufe am letzten Tag
  4. Zeige Sammelzeit und Kauf-Tag an
```

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt: 2025-01-27*


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
