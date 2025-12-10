# Formula Program Generator
## Automatische Programmgenerierung aus Formeldatenbank

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🎯 ÜBERSICHT

Dieses System generiert automatisch vollständige Programme aus einer Formeldatenbank:

- **Formeln = Module:** Jede Formel ist ein wiederverwendbares Funktionsmodul
- **Mischungen = Graph:** Kombinationen erzeugen einen DAG (Directed Acyclic Graph)
- **Graph = Programm:** Der Graph wird in ausführbaren Code übersetzt
- **Vorhersage:** System sagt voraus, welche Art von Programm entsteht

---

## 📁 STRUKTUR

```
formula-generator/
├── formula-graph.js      # DAG-Generator aus Formeln
├── code-generator.js      # Code-Generator für alle Sprachen
├── ui-generator.js        # Web-UI/Dashboard-Generator
├── generate-program.js    # CLI-Tool (einzelne Sprache)
└── generate-all.js        # CLI-Tool (alle Sprachen + UI)
```

---

## 🚀 VERWENDUNG

### Einzelne Sprache generieren

```bash
node formula-generator/generate-program.js F000001 F000002 --lang=python --output=./generated
```

### Alle Sprachen + UI generieren

```bash
node formula-generator/generate-all.js F000001 F000002 --output=./generated-all
```

### Verfügbare Sprachen

- Python
- JavaScript
- TypeScript
- Rust
- Go
- Java
- C++
- C#
- Swift
- Kotlin

---

## 📊 BEISPIEL

### Eingabe

```bash
node generate-all.js F000001 F000002 F000003
```

### Ergebnis

- **Programm-Typ:** "Haushalts-Finanz-Energie-Simulator"
- **Code in 10 Sprachen** generiert
- **Web-UI/Dashboard** generiert
- **Graph-Visualisierung** möglich

---

## 🔧 FORMEL-SCHEMA

Jede Formel benötigt:

- **ID:** Eindeutige Kennung (z.B. F000001)
- **Inputs:** Eingabeparameter mit Typen und Constraints
- **Output:** Ausgabe mit Typ und Dimension
- **Domain:** Kategorien (Finanz, Energie, Statistik, etc.)
- **Implementation:** Code in allen unterstützten Sprachen
- **Formula:** Mathematische Formel

---

## 🎨 UI-GENERATOR

Generiert automatisch:

- **HTML:** Strukturierte Eingabeformulare
- **CSS:** Modernes, responsives Design
- **JavaScript:** Interaktive Berechnungen

Öffne `ui/index.html` im Browser für das Dashboard.

---

## 🔮 VORHERSAGE

Das System sagt automatisch voraus:

- **"Haushalts-Finanz-Energie-Simulator"** (Finanz + Energie + Statistik)
- **"Finanz-Analyse-Programm"** (nur Finanz)
- **"Energieprognose-Tool"** (Energie + Statistik)
- **"Statistik-Analyse-Tool"** (nur Statistik)

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV


