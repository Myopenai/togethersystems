# Rauchfreie Reise - Smoke-Free Journey Game

## Überblick

Ein interaktives, personalisiertes Aufklärungsspiel für Raucher, die aufhören wollen. Das Spiel integriert Daten aus allen Fakultäten (Medizin, Psychologie, Soziologie, Pharmakologie, Public Health) und der Human Identity Database.

## Features

- ✅ **Multidisziplinäre Aufklärung**: Informationen aus allen Fakultäten
- ✅ **Human Identity DB Integration**: Personalisierung basierend auf individuellen Eigenschaften
- ✅ **Interaktive Journey**: 5 Stufen (Bewusstsein → Wissen → Planung → Handlung → Aufrechterhaltung)
- ✅ **Personalisierte Empfehlungen**: Basierend auf Profil, Kultur, sozialem Umfeld
- ✅ **Fortschritts-Tracking**: Tage rauchfrei, gesparte Zigaretten, gespartes Geld
- ✅ **Gesundheitsverbesserungen**: Zeitbasierte Anzeige von Verbesserungen

## Integration

### In Manifest-Hive System

Das Spiel kann über die normale Spiel-Auswahl gestartet werden:

```javascript
// In hive-room.html oder game-selector
startGame('smoke_free_journey');
```

### Standalone

```html
<script src="human-identity-db.js"></script>
<script src="game-engine.js"></script>
<!-- Öffne frontend.html -->
```

## Human Identity Database

Die Human Identity DB speichert:

- **Traits**: Persönlichkeit, kognitive Stile, emotionale Muster
- **Patterns**: Rauchmuster, Stressreaktionen, Trigger-Situationen
- **Cultural Context**: Kultur, Sprache, soziale Normen
- **Social Network**: Familie, Freunde, Kollegen, Support-Gruppen
- **Health History**: Medizinische Vorgeschichte, frühere Versuche
- **Lifestyle**: Beruf, Stress, Schlaf, Bewegung, Ernährung

## Multidisziplinäre Datenquellen

### Medizin
- Gesundheitliche Auswirkungen (sofort & langfristig)
- Entzugserscheinungen
- Timeline der Verbesserungen

### Psychologie
- Suchtmechanismen
- Bewältigungsstrategien
- Motivationsfaktoren

### Soziologie
- Soziale Faktoren
- Unterstützungssysteme
- Wirtschaftliche Auswirkungen

### Pharmakologie
- Nikotinersatztherapie
- Medikamente
- Natürliche Alternativen

### Public Health
- Erfolgsstatistiken
- Präventionsstrategien
- Bevölkerungsdaten

## Verwendung

1. **User registrieren** in Human Identity DB
2. **Profil erstellen** (Traits, Patterns, Cultural Context, etc.)
3. **Spiel starten** - automatische Personalisierung
4. **Fragen beantworten** - Fortschritt durch Stages
5. **Empfehlungen erhalten** - basierend auf Profil
6. **Fortschritt tracken** - Tage, Zigaretten, Geld, Gesundheit

## Beispiel

```javascript
// Initialisierung
const humanIdentityDB = new HumanIdentityDB();
humanIdentityDB.registerUser('user123', { /* initial data */ });
humanIdentityDB.setTraits('user123', {
  personality: ['determined', 'stressed'],
  cultural_background: 'german'
});

const userProfile = {
  id: 'user123',
  cigarettes_per_day: 20,
  price_per_pack: 7.50,
  stress_level: 8,
  cannabis_use: true
};

const game = new SmokeFreeJourneyGame(userProfile, humanIdentityDB);
const gameState = await game.play();

// Zeige Fragen, Empfehlungen, multidisziplinäre Info
```

## Erweiterte Ratschläge

Das Spiel generiert automatisch Ratschläge basierend auf:

- **Risikofaktoren**: Hoher Konsum, Stress, soziales Umfeld, Rückfälle
- **Schutzfaktoren**: Soziale Unterstützung, Bewegung, Entschlossenheit
- **Kulturelle Anpassung**: Berücksichtigung kultureller Hintergründe
- **Gesundheitsbasiert**: Medizinische Vorgeschichte
- **Lifestyle-basiert**: Beruf, Stress, Gewohnheiten

## Wirkungen auf Teilnehmer

Das Programm zeigt:

1. **Sofortige Wirkungen**: Herzfrequenz, Kohlenmonoxid, etc.
2. **Kurzfristige Wirkungen**: Lungenfunktion, Husten, etc.
3. **Langfristige Wirkungen**: Krebsrisiko, Herzkrankheiten, etc.
4. **Psychologische Wirkungen**: Stressreduktion, Selbstbestimmung
5. **Soziale Wirkungen**: Verbesserte Beziehungen, soziale Akzeptanz
6. **Wirtschaftliche Wirkungen**: Geldersparnis, Produktivität

## Integration in andere Systeme

Das Spiel kann in andere Systeme integriert werden:

- **Therapie-Apps**: Als Teil eines größeren Programms
- **Gesundheitsplattformen**: Für Prävention und Aufklärung
- **Selbsthilfe-Gruppen**: Als interaktives Tool
- **Forschung**: Für Datensammlung und Evaluation

## Lizenz & Verwendung

Siehe Haupt-README des Manifest-Hive Game Systems.

---

**BRANDING**: .T. TogetherSystems - ModularFlux Architecture  
**VERSION**: 3.0.0  
**STANDARD**: IBM STANDARD - PERMANENT AKTIV


