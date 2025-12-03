# TogetherSystems T,. - Clean-Floor-System

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE  
**Datum:** 2025-01-15

---

## 🧹 Clean-Floor-Prinzip

**Ziel:** Werkflur immer sauber, TÜV/APK abgenommen, zu jeder Trillionstel Sekunde.

---

## 📋 Status-Konventionen

### Active (Aktiv)
- **Symbol:** Kein Symbol
- **Frontmatter:** `status: active`
- **Sichtbarkeit:** Standard
- **Bearbeitbar:** Ja

### Deprecated (Veraltet)
- **Symbol:** `#Vergangenheit:` (am Anfang)
- **Frontmatter:** `status: deprecated`
- **Sichtbarkeit:** Gefiltert
- **Bearbeitbar:** Nein
- **Erfordert:** `replaced_by`

**Beispiel:**
```markdown
# #Vergangenheit: Alte API-Dokumentation

---
status: deprecated
epoch: 2025-01-15T20:37:00Z
ref: Docs/API.md#old
hash: e3b0c442...
replaced_by: Docs/API.md#new
---
```

### Superseded (Ersetzt)
- **Symbol:** `↦ Ersetzt durch:` (am Anfang)
- **Frontmatter:** `status: superseded`
- **Sichtbarkeit:** Gefiltert
- **Bearbeitbar:** Nein
- **Erfordert:** `replaced_by`

**Beispiel:**
```markdown
# ↦ Ersetzt durch: Docs/API.md#new

---
status: superseded
epoch: 2025-01-15T20:37:00Z
ref: Docs/API.md#old
hash: e3b0c442...
replaced_by: Docs/API.md#new
---
```

### Archived (Archiviert)
- **Symbol:** `⟂` (am Anfang und Ende)
- **Frontmatter:** `status: archived`
- **Sichtbarkeit:** Nur Historie
- **Bearbeitbar:** Nein
- **Final:** Ja

**Beispiel:**
```markdown
# ⟂ Archivierte Dokumentation ⟂

---
status: archived
epoch: 2025-01-15T20:37:00Z
ref: Archive/2025/01/Docs/API.md@5a1c...d3.md
hash: e3b0c442...
---
```

---

## 🔍 Path-Announcement-System

### Automatische Pfad-Angabe

Jede Erstellung gibt automatisch aus:

```
=====================================
T,. ARTEFAKT ERSTELLT
=====================================
Typ: created
ID: artifact-001
Pfad: Docs/API.md
Anchor: deploy
Hash: 5a1c...d3
Deep-Link: Docs/API.md#deploy
Portal-Link: Portal/index.html#Docs-API-deploy
Modul: Docs
Zeitstempel: 2025-01-15T20:37:00Z
=====================================

→ Öffnen:
  Datei: Docs/API.md
  Portal: Portal/index.html#Docs-API-deploy
```

---

## 🖥️ Universal Desktop

**Pfad:** `Portal/universal-desktop.html`

**Features:**
- Dashboard mit Statistiken
- Explorer-View (Baumansicht)
- Timeline-View (Audit-Clock-basiert)
- Metrics-View (Visualisierungen, Statistiken)
- Quick-Search (Pfad, ID, Hash)
- Status-Filter (Active, Deprecated, Archived)
- Recent Artifacts (letzte 10)
- Deep-Links zu allen Artefakten

---

## 🤖 Multi-Model-Analyzer

**Pfad:** `Fabrikage.IntelligenceMatrix/multi-model-analyzer.ts`

**Modell-Zuweisungen:**

| Bereich | Modell | Provider | Zweck |
|---------|--------|----------|-------|
| Code/Generatoren | DeepSeek Coder | OpenRouter | Code-Qualität, Syntax |
| Architektur | Claude 3.5 Sonnet | Anthropic | Systemarchitektur, Skalierbarkeit |
| Policies | GPT-4 | OpenAI | Compliance, Standards |
| Security | GPT-4 | OpenAI | Sicherheit, Vulnerabilities |
| Performance | Claude 3.5 Sonnet | Anthropic | Performance, Optimierung |
| Dokumentation | Claude 3.5 Sonnet | Anthropic | Klarheit, Vollständigkeit |
| Testing | DeepSeek Coder | OpenRouter | Coverage, Quality |
| Deployment | GPT-4 | OpenAI | CI/CD, Infrastructure |
| Observability | Claude 3.5 Sonnet | Anthropic | Monitoring, Logging |
| UX | Claude 3.5 Sonnet | Anthropic | Accessibility, Usability |

**Workflow:**
1. Jeder Bereich wird mit seinem spezifischen Modell analysiert
2. Ergebnisse werden kombiniert
3. Konsens-Punkte werden identifiziert
4. Konflikte werden erkannt
5. Finale Lösung wird erstellt

---

## 🔧 Tools

### Status-Lint
**Pfad:** `Fabrikage.CoreProtocols/tools/status-lint.js`

**Prüft:**
- Frontmatter-Status vorhanden
- Titel-Symbol konsistent mit Status
- `replaced_by` bei superseded/deprecated
- `⟂` Symbol bei archived

**Verwendung:**
```bash
cd Fabrikage.CoreProtocols/tools
node status-lint.js
```

---

## 📊 Registry-Erweiterung

**Schema:** `Fabrikage.ProvenanceLedger/registry/artifact-registry-extended.json`

**Neue Felder:**
- `deep_link` - Deep-Link zum Artefakt
- `portal_link` - Portal-Link
- `status` - Active/Deprecated/Superseded/Archived
- `history.replaces` - Wird ersetzt von
- `history.replaced_by` - Ersetzt durch
- `history.superseded_at` - Wann ersetzt
- `history.archived_at` - Wann archiviert

---

## ✅ Checkliste

- [x] Clean-Floor-Policy erstellt
- [x] Status-Lint-Tool implementiert
- [x] Path-Announcement-System implementiert
- [x] Universal Desktop erstellt
- [x] Multi-Model-Analyzer implementiert
- [x] Registry erweitert
- [x] Frontmatter-Templates erstellt

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

