# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE CONSOLE STANDARDS

**Fabrikation Standard TÜV MCP**  
**Console Error Handling & Quality Standards**

---

## 🎯 FABRIKAGE CONSOLE STANDARDS

### 1. Error Handling Standards

#### ✅ ERFORDERLICH:
- **try-catch Blöcke** für alle kritischen Operationen
- **console.error()** mit aussagekräftigen Meldungen
- **Fehler-Logging** mit Kontext-Informationen
- **Graceful Degradation** bei Fehlern

#### ❌ VERBOTEN:
- **Unbehandelte Exceptions**
- **console.log()** für Fehler (nur console.error)
- **JSON.parse()** ohne try-catch
- **DOM-Manipulation** ohne Null-Checks

### 2. JavaScript Syntax Standards

#### ✅ KORREKT:
```javascript
try {
    const data = JSON.parse(jsonString);
    // Verarbeitung
} catch(e) {
    console.error('[FABRIKAGE] JSON parse error:', e);
    // Fallback
}
```

#### ❌ FALSCH:
```javascript
// FALSCH: Kein try-catch
const data = JSON.parse(jsonString);

// FALSCH: Falsche JSON.parse Verwendung
const data = JSON.parse($('#editor').text());

// FALSCH: Verschachtelte try-catch ohne Sinn
const data = (function() { try { return (function() { try { return JSON.parse(...); } catch(e) {} })(); } catch(e) {} })();
```

### 3. Console Output Standards

#### ✅ ERFORDERLICH:
- **Präfixe** für alle Console-Ausgaben: `[FABRIKAGE]`, `[MODULE]`, etc.
- **Strukturierte Logs** mit Kontext
- **Error-Stack-Traces** bei kritischen Fehlern

#### Beispiel:
```javascript
console.error('[FABRIKAGE] Portal – Start: Fehler beim Laden der Daten:', {
    error: e.message,
    stack: e.stack,
    timestamp: new Date().toISOString()
});
```

### 4. DOM Manipulation Standards

#### ✅ KORREKT:
```javascript
const element = document.getElementById('myElement');
if (element) {
    element.textContent = 'Text';
} else {
    console.error('[FABRIKAGE] Element nicht gefunden: myElement');
}
```

#### ❌ FALSCH:
```javascript
// FALSCH: Kein Null-Check
document.getElementById('myElement').textContent = 'Text';
```

### 5. JSON Parsing Standards

#### ✅ KORREKT:
```javascript
function parseJSON(jsonString) {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            throw new Error('Invalid JSON string');
        }
        return JSON.parse(jsonString);
    } catch(e) {
        console.error('[FABRIKAGE] JSON parse error:', {
            error: e.message,
            input: jsonString?.substring(0, 100)
        });
        return null; // oder Fallback-Wert
    }
}
```

### 6. Async/Await Error Handling

#### ✅ KORREKT:
```javascript
async function loadData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch(e) {
        console.error('[FABRIKAGE] Load data error:', e);
        return null;
    }
}
```

### 7. Event Handler Error Handling

#### ✅ KORREKT:
```javascript
element.addEventListener('click', (e) => {
    try {
        // Handler-Logik
    } catch(error) {
        console.error('[FABRIKAGE] Event handler error:', error);
        // Fehlerbehandlung
    }
});
```

---

## 🔍 QUALITY CHECKS

### Automatische Prüfungen:
1. ✅ Keine unbehandelten Exceptions
2. ✅ Alle JSON.parse() in try-catch
3. ✅ Alle DOM-Zugriffe mit Null-Checks
4. ✅ Console-Ausgaben mit Präfixen
5. ✅ Strukturierte Error-Logs

### TÜV-Prüfung:
- **Phase 1:** Syntax-Validierung
- **Phase 2:** Error-Handling-Prüfung
- **Phase 3:** Console-Output-Prüfung
- **Phase 4:** Runtime-Tests

---

## 📋 CHECKLIST

- [ ] Alle kritischen Operationen in try-catch
- [ ] console.error() für alle Fehler
- [ ] Präfixe bei Console-Ausgaben
- [ ] Null-Checks vor DOM-Manipulation
- [ ] JSON.parse() immer in try-catch
- [ ] Strukturierte Error-Logs
- [ ] Graceful Degradation implementiert

---

**[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT**  
**FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen**

