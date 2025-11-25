# Datenschutz und Rechtliche Aufbewahrung - Digital Notariat

## Übersicht

Dieses Dokument beschreibt die implementierten Datenschutz- und Aufbewahrungsrichtlinien, die sicherstellen, dass das Löschen von Demo-Daten keine Auswirkungen auf gesetzlich geschützte, nicht löschbare Daten hat.

## Rechtliche Grundlagen

### Gesetzliche Aufbewahrungsfristen

Das Digital Notariat ist an folgende gesetzliche Vorgaben gebunden:

1. **GoBD (Grundsätze ordnungsgemäßer Buchführung)**
   - Aufbewahrungsfrist: 10 Jahre
   - Betrifft: Alle Geschäftsvorfälle und Buchungsbelege

2. **HGB §257 (Handelsgesetzbuch)**
   - Aufbewahrungsfrist: 6-10 Jahre
   - Betrifft: Handelsbücher, Inventare, Eröffnungsbilanzen

3. **Notariatsordnung**
   - Aufbewahrungsfrist: 30 Jahre
   - Betrifft: Notariatsurkunden und -akten

## Implementierte Datenschutz-Features

### 1. **Automatische Datenkategorisierung**

Das System kategorisiert automatisch alle Datensätze:

```typescript
interface DatabaseRecord {
  dataCategory?: 'demo' | 'real' | 'legal_required' | 'archived';
  isLegallyProtected?: boolean;
  legalBasis?: string;
  retentionPeriod?: number;
  retentionEndDate?: Date;
  deletionRestricted?: boolean;
}
```

**Kategorien:**
- **`demo`**: Beispieldaten (können gelöscht werden)
- **`real`**: Echte Daten (gesetzlich geschützt)
- **`legal_required`**: Gesetzlich vorgeschriebene Aufbewahrung
- **`archived`**: Archivierte Daten

### 2. **Demo-Daten-Erkennung**

Das System erkennt automatisch Demo-Daten anhand von Mustern:

```typescript
private isDemoData(record: DatabaseRecord): boolean {
  const demoPatterns = [
    'Max Mustermann',
    'Maria Schmidt', 
    'Johann Weber',
    'Musterstraße',
    'Teststraße',
    'Beispielstraße',
    'demo', 'test', 'example'
  ];
  // ... Erkennungslogik
}
```

### 3. **Gesetzlicher Schutz**

Echte Daten werden automatisch als gesetzlich geschützt markiert:

```typescript
// Automatische Kennzeichnung bei echten Daten
newRecord.dataCategory = 'real';
newRecord.isLegallyProtected = true;
newRecord.deletionRestricted = true;
newRecord.legalBasis = 'GoBD - Grundsätze ordnungsgemäßer Buchführung';
newRecord.retentionPeriod = 10; // 10 Jahre
```

## Sicherheitsfunktionen

### 1. **Geschützte Löschfunktionen**

```typescript
deleteRecord(id: string): boolean {
  const record = this.getRecordById(id);
  
  // Prüfung auf gesetzlichen Schutz
  if (record?.isLegallyProtected === true) {
    console.error(`❌ Datensatz ${id} kann nicht gelöscht werden - gesetzlich geschützt`);
    return false;
  }
  
  // Prüfung auf laufende Aufbewahrungsfrist
  if (record?.retentionEndDate && record.retentionEndDate > new Date()) {
    console.error(`❌ Datensatz ${id} kann nicht gelöscht werden - Aufbewahrungsfrist läuft noch`);
    return false;
  }
  
  // Nur dann löschen
  return true;
}
```

### 2. **Sicheres Demo-Daten-Löschen**

```typescript
clearDemoData(): void {
  const records = this.getAllRecords();
  // Nur Demo-Daten entfernen, geschützte Daten bleiben
  const remainingRecords = records.filter(record => record.dataCategory !== 'demo');
  this.saveToStorage(remainingRecords);
}
```

### 3. **Aufbewahrungsfristen-Monitoring**

```typescript
checkRetentionPeriods(): {
  expired: DatabaseRecord[];      // Abgelaufene Fristen
  expiringSoon: DatabaseRecord[]; // Bald ablaufende Fristen (30 Tage)
  valid: DatabaseRecord[];        // Gültige Fristen
}
```

## Benutzeroberfläche

### 1. **Rechtlicher Status-Button**

Neuer Button im Archiv-Bereich:
- **"Rechtlicher Status"**: Zeigt Details zu gesetzlich geschützten Daten
- **"Beispieldaten löschen"**: Löscht nur Demo-Daten
- **"Beispieldaten wiederherstellen"**: Stellt Demo-Daten wieder her

### 2. **Schutz-Warnungen**

Bei Löschversuchen von geschützten Daten:
```
❌ LÖSCHUNG NICHT ERLAUBT!

Dieser Datensatz ist gesetzlich geschützt:
• Beschreibung: Kaufvertrag Immobilie
• Rechtsgrundlage: GoBD - Grundsätze ordnungsgemäßer Buchführung
• Aufbewahrungsfrist bis: 31.12.2034

Löschung ist erst nach Ablauf der gesetzlichen Aufbewahrungsfrist möglich.
```

### 3. **Demo-Daten-Löschung mit Warnung**

```
⚠️ ACHTUNG: 5 gesetzlich geschützte Datensätze werden NICHT gelöscht!

• 3 Demo-Datensätze werden gelöscht
• 5 gesetzlich geschützte Datensätze bleiben erhalten

Dies entspricht den gesetzlichen Anforderungen (GoBD, HGB §257).
```

## Technische Implementierung

### 1. **Datenbank-Erweiterungen**

```typescript
// Neue Felder in DatabaseRecord
dataCategory?: 'demo' | 'real' | 'legal_required' | 'archived';
retentionPeriod?: number;
retentionEndDate?: Date;
isLegallyProtected?: boolean;
legalBasis?: string;
deletionRestricted?: boolean;
archiveDate?: Date;
archiveReason?: string;
```

### 2. **Neue Datenbank-Methoden**

```typescript
// Schutz-Prüfungen
isRecordLegallyProtected(recordId: string): boolean
getLegallyProtectedRecords(): DatabaseRecord[]
checkRetentionPeriods(): { expired, expiringSoon, valid }

// Sicheres Löschen
clearDemoData(): void
markAsLegallyProtected(recordId, legalBasis, retentionYears): boolean
```

### 3. **UI-Integration**

```typescript
// Neue Funktionen in App.tsx
showLegalDataStatus(): void
clearArchiveSampleData(): void  // Erweitert mit Schutz-Prüfungen
handleDeleteRecord(): void      // Erweitert mit Schutz-Prüfungen
```

## Compliance-Features

### 1. **Automatische Kennzeichnung**

- **Echte Daten**: Automatisch als gesetzlich geschützt markiert
- **Demo-Daten**: Automatisch als löschbar markiert
- **Aufbewahrungsfristen**: Automatisch berechnet (Standard: 10 Jahre)

### 2. **Audit-Trail**

Alle Aktionen werden protokolliert:
```typescript
auditTrail: [
  {
    action: 'Datensatz als gesetzlich geschützt markiert',
    timestamp: new Date(),
    user: 'System',
    details: 'Automatische Kennzeichnung nach GoBD'
  }
]
```

### 3. **Rechtliche Dokumentation**

Jeder geschützte Datensatz enthält:
- **Rechtsgrundlage**: z.B. "GoBD", "HGB §257"
- **Aufbewahrungsfrist**: In Jahren
- **Enddatum**: Konkretes Datum
- **Schutz-Status**: Boolean-Flag

## Best Practices

### 1. **Für Entwickler**

- Verwenden Sie `clearDemoData()` statt `clearDatabase()`
- Prüfen Sie immer `isRecordLegallyProtected()` vor Löschungen
- Dokumentieren Sie rechtliche Anforderungen in Code-Kommentaren

### 2. **Für Benutzer**

- Nutzen Sie den "Rechtlicher Status"-Button für Übersichten
- Beachten Sie Warnungen bei Löschversuchen
- Verstehen Sie, dass Demo-Daten und echte Daten unterschiedlich behandelt werden

### 3. **Für Compliance**

- Regelmäßige Prüfung der Aufbewahrungsfristen
- Dokumentation aller rechtlichen Anforderungen
- Audit-Trail für alle Datenoperationen

## Fazit

Die implementierten Datenschutz-Features stellen sicher, dass:

✅ **Demo-Daten sicher gelöscht werden können**
✅ **Gesetzlich geschützte Daten niemals versehentlich gelöscht werden**
✅ **Aufbewahrungsfristen automatisch überwacht werden**
✅ **Rechtliche Compliance gewährleistet ist**
✅ **Benutzer über den Status informiert werden**

Das System entspricht den Anforderungen von GoBD, HGB und der Notariatsordnung und schützt sowohl die Datenintegrität als auch die rechtliche Compliance des Digital Notariats. 