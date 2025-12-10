# Spec Mirror - Truth Layer
## Live Mirror Coding Architecture - Specs Directory

**VERSION:** 1.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 📋 ÜBERSICHT

Das Spec Mirror ist die **Wahrheitsschicht** der Live Mirror Coding Architecture. Es enthält:
- Service Contracts (OpenAPI/AsyncAPI)
- Domain Schemas (JSON Schema/Protobuf/Avro)
- UI Contracts (Component Interfaces)
- Invariants (Property Tests, Assertions)
- System Context (C4 Diagrams)
- Module Contracts
- Event Schemas
- Acceptance Criteria

---

## 📁 STRUKTUR

```
specs/
├── api/
│   ├── openapi.yaml          # OpenAPI 3.0 Specification
│   ├── asyncapi.yaml         # AsyncAPI Specification
│   └── contracts/            # Service Contracts
├── domain/
│   ├── schemas/              # JSON Schema Definitions
│   ├── entities/              # Domain Entity Schemas
│   └── events/               # Event Schemas
├── ui/
│   ├── components/           # Component Interfaces
│   └── states/              # Visual State Specs
├── invariants/
│   ├── properties/           # Property Test Definitions
│   └── assertions/          # Runtime Assertions
├── system/
│   ├── context/             # C4 System Context
│   ├── contracts/           # Module Contracts
│   └── acceptance/          # Acceptance Criteria
└── README.md
```

---

## 🔄 MIRROR UPDATE PROCESS

1. **On Change:**
   - Repo diffs analysieren
   - Specs automatisch aktualisieren
   - Dependency Graph regenerieren
   - AST/Dependency/Dataflow Graphs aktualisieren

2. **Validation:**
   - Spec Conformance prüfen
   - Backward/Forward Compatibility checken
   - Schema Evolution validieren

3. **Integration:**
   - Specs als First-Class Code behandeln
   - Review und Tests für Specs
   - Versionierung der Specs

---

## 📝 VERWENDUNG

### Service Contracts
```yaml
# specs/api/openapi.yaml
openapi: 3.0.0
info:
  title: Fabrikage API
  version: 3.0.0
paths:
  /api/nodes:
    get:
      responses:
        '200':
          description: List of nodes
```

### Domain Schemas
```json
// specs/domain/schemas/node.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "level": { "type": "string" },
    "ports": { "type": "array" }
  }
}
```

### Invariants
```javascript
// specs/invariants/properties/node-invariants.js
export const nodeInvariants = {
  idMustBeUnique: (nodes) => {
    const ids = nodes.map(n => n.id);
    return ids.length === new Set(ids).size;
  },
  positionMustBeNonNegative: (node) => {
    return node.x >= 0 && node.y >= 0;
  }
};
```

---

## 🔗 INTEGRATION

- **CI/CD:** Specs werden bei jedem Change validiert
- **Code Generation:** Specs dienen als Constraint für LLM-Generierung
- **Testing:** Property Tests basieren auf Invariants
- **Documentation:** Specs sind die Source of Truth

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 1.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV
