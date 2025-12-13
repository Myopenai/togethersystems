# Kassenbuch Integration Guide

## [.SYSTEMS.T.SYSTEMS.] Kassenbuch – Kommunikations-Layer

Das Kassenbuch ist eine eigenständige Anwendung, die automatisch mit allen anderen Apps kommuniziert:

- **Budget** (budget.html)
- **Contract** (contract.html)
- **Flowcashx** (FLOCASHX.HTML)
- **Indexportal** (indexortal.html)

## Funktionalität

### 1. Eigenständiges Kassenbuch
- **Datei**: `CASHFLOX/Kassenbuch/kassenbuch.html`
- Vollständige Kassenbuch-Funktionalität
- CSV/Text Import
- Export als JSON
- Automatische Synchronisation mit anderen Apps

### 2. Integration in andere Apps
- Jede App kann Kassenbuch-Daten lesen
- Jede App kann Daten an Kassenbuch senden
- Automatische Daten-Synchronisation alle 30 Sekunden
- Cross-Tab Kommunikation via localStorage Events

## Kommunikations-Interface

### Kassenbuch → Apps
```javascript
// Apps können Daten vom Kassenbuch abrufen
const data = window.kassenbuchModule.getData();
// Returns: { entries: [...], stats: { income, expense, balance } }
```

### Apps → Kassenbuch
```javascript
// Apps können Daten an Kassenbuch senden
window.kassenbuchModule.setData({
    entries: [
        {
            id: 'unique-id',
            date: '2025-12-06',
            description: 'Miete',
            category: 'wohnen',
            amount: -550,
            createdAt: new Date().toISOString()
        }
    ]
});
```

### App-Modul Interface
Jede App muss ein Modul-Interface implementieren:

```javascript
window.budgetModule = {
    setFromKassenbuch: function(data) {
        // Empfange Daten vom Kassenbuch
    },
    
    getData: function() {
        // Sende Daten an Kassenbuch
        return { entries: [...], ... };
    }
};
```

## Automatische Synchronisation

- **Intervall**: Alle 30 Sekunden
- **Event-basiert**: Bei localStorage Änderungen
- **Cross-Tab**: Funktioniert über mehrere Browser-Tabs

## Datenformat

### Kassenbuch-Eintrag
```javascript
{
    id: 'unique-id',
    date: '2025-12-06',
    description: 'Beschreibung',
    category: 'wohnen' | 'lebensmittel' | 'transport' | 'einnahme' | ...,
    amount: -550, // Negativ = Ausgabe, Positiv = Einnahme
    createdAt: '2025-12-06T12:00:00.000Z',
    source: 'budget' | 'contract' | 'flowcashx' | 'indexortal' | 'kassenbuch',
    imported: true // Optional: Markiert importierte Einträge
}
```

## Integration in bestehende Apps

### Budget (budget.html)
- ✅ Bereits integriert
- Sendet Budget-Daten an Kassenbuch
- Empfängt Einnahmen vom Kassenbuch

### Contract (contract.html)
- ✅ Bereits integriert
- Sendet Contract-Daten an Kassenbuch
- Empfängt Wohnkosten vom Kassenbuch

### Flowcashx (FLOCASHX.HTML)
- ⚠️ Integration erforderlich

### Indexportal (indexortal.html)
- ⚠️ Integration erforderlich

## Verwendung

### Eigenständig
1. Öffne `CASHFLOX/Kassenbuch/kassenbuch.html`
2. Füge Einträge manuell hinzu oder importiere CSV
3. Daten werden automatisch mit anderen Apps synchronisiert

### Integriert
1. Öffne eine App (Budget, Contract, etc.)
2. Ändere Werte oder importiere Daten
3. Kassenbuch wird automatisch aktualisiert
4. Änderungen im Kassenbuch werden an alle Apps gesendet

## Download

Das Kassenbuch ist als eigenständige Datei verfügbar:
- `CASHFLOX/Kassenbuch/kassenbuch.html`
- Kann direkt geöffnet werden
- Funktioniert offline
- Keine externe Abhängigkeiten

## [.SYSTEMS.T.SYSTEMS.] Fabrikage Standards

- ✅ BASE_URL konfiguriert
- ✅ UTF-8 Encoding
- ✅ Error Handling (try-catch)
- ✅ Console Logging ([FABRIKAGE])
- ✅ .T. Branding
- ✅ Datenschutz (Löschfunktion)


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
