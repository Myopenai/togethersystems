# STYLE-GUIDE & CODE-STANDARDS
## Entwicklungsrichtlinien für Customer Engagement Platform

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Zweck:** Einheitliche Code-, Dokumentations- und Design-Standards

---

## 1. CODE-STYLE

### 1.1 Namenskonventionen

**Variablen & Funktionen:**
```
✅ RICHTIG (snake_case):
  contact_id
  event_type
  journey_instance
  send_message()
  calculate_segment()

❌ FALSCH:
  contactId (camelCase)
  EventType (PascalCase)
```

**Klassen & Typen:**
```
✅ RICHTIG (PascalCase):
  Contact
  JourneyInstance
  MessageQueue
  TemplateRenderer

❌ FALSCH:
  contact (lowercase)
  journey_instance (snake_case)
```

**Konstanten:**
```
✅ RICHTIG (UPPER_SNAKE_CASE):
  MAX_RETRIES = 3
  DEFAULT_LOCALE = "en"
  SUPPORTED_CHANNELS = ["sms", "email", "whatsapp"]
```

**Database-Tabellen:**
```
✅ RICHTIG (snake_case, Plural):
  contacts
  journey_instances
  message_statuses

❌ FALSCH:
  Contacts (PascalCase)
  Contact (Singular)
  contactInstances (camelCase)
```

### 1.2 Code-Formatierung

**Einrückung:**
```
✅ RICHTIG (2 Spaces):
  if condition:
    action()
    another_action()

❌ FALSCH (Tabs oder 4 Spaces):
  if condition:
      action()
```

**Zeilenlänge:**
```
✅ Maximal 100 Zeichen pro Zeile
✅ Bei Überschreitung: Umbrechen mit Einrückung

Beispiel:
  result = calculate_complex_expression(
    variable1,
    variable2,
    variable3
  )
```

**Leerzeilen:**
```
✅ Zwischen Funktionen: 2 Leerzeilen
✅ Zwischen Logik-Blöcken: 1 Leerzeile
✅ Zwischen Variablen-Deklarationen: 0 Leerzeilen
```

### 1.3 Kommentare

**Dokumentations-Kommentare:**
```
✅ Funktionen dokumentieren:
  """
  Sendet eine Nachricht über den angegebenen Channel.
  
  Args:
    contact_id: UUID des Kontakts
    channel_id: UUID des Channels
    template_id: UUID des Templates
  
  Returns:
    Message-Objekt mit Status
  
  Raises:
    ChannelNotAvailableError: Wenn Channel nicht verfügbar
    TemplateNotFoundError: Wenn Template nicht existiert
  """
  def send_message(contact_id, channel_id, template_id):
    ...
```

**Inline-Kommentare:**
```
✅ Komplexe Logik erklären:
  # Exponential Backoff: 60s * 2^(retry_count - 1)
  backoff_delay = base_delay * (2 ** (retry_count - 1))

❌ Selbstverständliches kommentieren:
  # Kontakt-ID setzen
  contact.id = contact_id
```

### 1.4 Error-Handling

**Exception-Namen:**
```
✅ RICHTIG (Error-Suffix):
  ContactNotFoundError
  ChannelNotAvailableError
  RateLimitExceededError
  TemplateRenderError

❌ FALSCH:
  ContactNotFound
  ChannelNotAvailable
```

**Error-Messages:**
```
✅ Klar und hilfreich:
  raise ContactNotFoundError(
    f"Contact with ID {contact_id} not found in workspace {workspace_id}"
  )

❌ Unklar:
  raise Error("Not found")
  raise Error("Failed")
```

### 1.5 Type-Hints

**Python:**
```
✅ Type-Hints verwenden:
  def send_message(
    contact_id: UUID,
    channel_id: UUID,
    template_id: UUID
  ) -> Message:
    ...

✅ Optional-Types:
  from typing import Optional
  
  def get_contact(contact_id: UUID) -> Optional[Contact]:
    ...
```

**TypeScript:**
```
✅ Type-Annotations:
  function sendMessage(
    contactId: UUID,
    channelId: UUID,
    templateId: UUID
  ): Message {
    ...
  }

✅ Interfaces:
  interface Contact {
    id: UUID;
    workspaceId: UUID;
    attributes: Record<string, Value>;
  }
```

---

## 2. DATENBANK-STANDARDS

### 2.1 Tabellen-Namen

```
✅ RICHTIG:
  - Plural: contacts, journeys, messages
  - snake_case: journey_instances, access_keys
  - Präfix für Join-Tables: journey_node_edges

❌ FALSCH:
  - Singular: contact, journey
  - PascalCase: Contacts, Journeys
  - camelCase: journeyInstances
```

### 2.2 Spalten-Namen

```
✅ RICHTIG:
  - snake_case: contact_id, event_type, created_at
  - Boolean: is_active, has_permission
  - Timestamps: created_at, updated_at, deleted_at

❌ FALSCH:
  - camelCase: contactId, eventType
  - Präfix "tbl_": tbl_contact_id
  - Ungenaue Namen: date, time (statt created_at)
```

### 2.3 Primary Keys

```
✅ RICHTIG:
  - Immer UUID
  - Spaltenname: id
  - Typ: UUID (nicht INT auto-increment)

Beispiel:
  CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    ...
  )
```

### 2.4 Foreign Keys

```
✅ RICHTIG:
  - Spaltenname: {table_name}_id
  - Beispiel: workspace_id, contact_id, journey_id
  - NOT NULL (außer explizit nullable)

Beispiel:
  CREATE TABLE events (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    contact_id UUID REFERENCES contacts(id),
    ...
  )
```

### 2.5 Indexes

```
✅ Benennung:
  - Einzelspalte: idx_{table}_{column}
  - Zusammengesetzt: idx_{table}_{col1}_{col2}
  - Unique: uk_{table}_{columns}

Beispiele:
  CREATE INDEX idx_contacts_workspace_id ON contacts(workspace_id);
  CREATE INDEX idx_events_contact_time ON events(contact_id, event_time DESC);
  CREATE UNIQUE INDEX uk_contacts_workspace_email ON contacts(workspace_id, (attributes->>'email'));
```

---

## 3. API-STANDARDS

### 3.1 REST-Endpoints

**URL-Struktur:**
```
✅ RICHTIG:
  /api/v1/contacts
  /api/v1/contacts/{id}
  /api/v1/contacts/{id}/events
  /api/v1/journeys/{id}/instances

❌ FALSCH:
  /api/v1/Contacts (PascalCase)
  /api/v1/contact/{id} (Singular)
  /api/v1/getContact/{id} (Verb im URL)
```

**HTTP-Methoden:**
```
✅ RICHTIG:
  GET    /api/v1/contacts        → Liste
  GET    /api/v1/contacts/{id}   → Einzelnes Objekt
  POST   /api/v1/contacts        → Erstellen
  PUT    /api/v1/contacts/{id}   → Vollständig aktualisieren
  PATCH  /api/v1/contacts/{id}   → Teilweise aktualisieren
  DELETE /api/v1/contacts/{id}   → Löschen
```

### 3.2 Request/Response-Format

**Request-Body:**
```json
✅ RICHTIG (camelCase für JSON):
{
  "contactId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "attributes": {
    "firstName": "Max",
    "lastName": "Mustermann"
  }
}

❌ FALSCH (snake_case im JSON):
{
  "contact_id": "...",
  "first_name": "..."
}
```

**Response-Format:**
```json
✅ RICHTIG:
{
  "data": {
    "id": "...",
    "email": "...",
    "attributes": {...}
  },
  "meta": {
    "timestamp": "2025-01-27T12:00:00Z"
  }
}

✅ Liste:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1000
  }
}
```

**Error-Response:**
```json
✅ RICHTIG:
{
  "error": {
    "code": "CONTACT_NOT_FOUND",
    "message": "Contact not found",
    "details": {
      "contactId": "123e4567-...",
      "workspaceId": "789e0123-..."
    }
  }
}
```

### 3.3 Status-Codes

```
✅ RICHTIG:
  200 OK                    → Erfolgreich
  201 Created              → Erfolgreich erstellt
  204 No Content           → Erfolgreich, kein Body
  400 Bad Request          → Ungültige Request-Daten
  401 Unauthorized         → Nicht authentifiziert
  403 Forbidden            → Keine Berechtigung
  404 Not Found            → Ressource nicht gefunden
  409 Conflict             → Konflikt (z.B. Duplikat)
  422 Unprocessable Entity → Validierungsfehler
  429 Too Many Requests    → Rate-Limit überschritten
  500 Internal Server Error → Server-Fehler
```

---

## 4. DOCUMENTATION-STANDARDS

### 4.1 Markdown-Format

**Überschriften:**
```
✅ RICHTIG:
  # Haupttitel (Level 1)
  ## Kapitel (Level 2)
  ### Unterkapitel (Level 3)

❌ FALSCH:
  Überschriften ohne # oder mit Leerzeichen-Fehler
```

**Code-Blöcke:**
```
✅ RICHTIG:
  ```python
  def function():
      pass
  ```

✅ Mit Sprach-Angabe für Syntax-Highlighting
```

**Listen:**
```
✅ RICHTIG:
  - Item 1
  - Item 2
    - Sub-Item 2.1
    - Sub-Item 2.2

✅ Oder nummeriert:
  1. Schritt 1
  2. Schritt 2
```

### 4.2 Dokumentations-Struktur

**Jedes Dokument sollte haben:**
```
# TITEL

**Version:** X.Y.Z  
**Erstellt:** YYYY-MM-DD  
**Zweck:** Kurze Beschreibung

---

## 1. ÜBERSICHT
...

## 2. DETAILS
...

## ENDE
```

### 4.3 Kommentare in Code

**Dokumentations-Strings:**
```
✅ RICHTIG (Python docstring):
  """
  Kurze Beschreibung.
  
  Längere Beschreibung falls nötig.
  
  Args:
    param1: Beschreibung
    param2: Beschreibung
  
  Returns:
    Beschreibung des Rückgabewerts
  
  Raises:
    ExceptionType: Wann wird diese Exception geworfen
  """
```

**Inline-Kommentare:**
```
✅ RICHTIG:
  # Komplexe Logik erklären
  # TODO: Später optimieren
  # FIXME: Bug beheben
  # NOTE: Wichtige Information
```

---

## 5. TESTING-STANDARDS

### 5.1 Test-Namenskonventionen

```
✅ RICHTIG:
  test_send_message_success()
  test_send_message_channel_not_available()
  test_send_message_template_not_found()
  test_calculate_segment_with_complex_query()

❌ FALSCH:
  test1()
  test_message()
  test_send()
```

### 5.2 Test-Struktur

```
✅ RICHTIG (AAA-Pattern):
  def test_send_message_success():
      # Arrange
      contact = create_test_contact()
      channel = create_test_channel()
      template = create_test_template()
      
      # Act
      message = send_message(contact.id, channel.id, template.id)
      
      # Assert
      assert message.status == "queued"
      assert message.contact_id == contact.id
```

### 5.3 Test-Daten

```
✅ RICHTIG:
  - Test-Daten klar benennen: test_contact, mock_channel
  - Test-Daten isoliert (jeder Test eigene Daten)
  - Cleanup nach jedem Test

❌ FALSCH:
  - Shared State zwischen Tests
  - Echte Datenbank-Daten verwenden
  - Keine Cleanup-Routine
```

---

## 6. GIT-STANDARDS

### 6.1 Commit-Messages

```
✅ RICHTIG (Conventional Commits):
  feat: Add template rendering with i18n support
  fix: Resolve rate limiting issue for SMS channel
  docs: Update API documentation for segments
  refactor: Extract message queue logic into separate module
  test: Add unit tests for journey processor

Format:
  <type>: <subject>
  
  <body> (optional)
  
  <footer> (optional)

Types:
  - feat: Neue Feature
  - fix: Bug-Fix
  - docs: Dokumentation
  - style: Code-Formatierung
  - refactor: Code-Umstrukturierung
  - test: Tests
  - chore: Maintenance-Tasks
```

### 6.2 Branch-Namen

```
✅ RICHTIG:
  feature/add-i18n-support
  fix/rate-limiting-bug
  docs/update-api-spec
  refactor/message-queue

Format:
  {type}/{short-description}

Types:
  - feature/
  - fix/
  - docs/
  - refactor/
```

### 6.3 PR-Titel

```
✅ RICHTIG:
  [Feature] Add i18n support for templates
  [Fix] Resolve rate limiting issue
  [Docs] Update API documentation

Format:
  [Type] Short description
```

---

## 7. SECURITY-STANDARDS

### 7.1 Sensitive Data

```
✅ RICHTIG:
  - Passwörter: Nie im Klartext speichern (nur gehasht)
  - API-Keys: Verschlüsselt speichern
  - PII: Verschlüsselt speichern (DSGVO/GDPR)
  - Secrets: In Environment-Variablen oder Secret-Manager

❌ FALSCH:
  - Passwörter im Klartext
  - API-Keys im Code hardcoded
  - Secrets in Git committed
```

### 7.2 Input-Validation

```
✅ RICHTIG:
  - Alle Inputs validieren
  - SQL-Injection verhindern (Parameterized Queries)
  - XSS verhindern (Input-Sanitization)
  - Rate-Limiting implementieren

Beispiel:
  def create_contact(email: str, attributes: dict):
      # Validate email
      if not is_valid_email(email):
          raise ValidationError("Invalid email address")
      
      # Validate attributes
      validate_attributes(attributes)
      
      # Create contact
      ...
```

---

## 8. PERFORMANCE-STANDARDS

### 8.1 Database-Queries

```
✅ RICHTIG:
  - Indexes auf häufig gefilterten Spalten
  - N+1-Problem vermeiden (Batch-Loading)
  - Pagination für große Listen
  - Query-Optimierung (EXPLAIN verwenden)

❌ FALSCH:
  - SELECT * ohne WHERE
  - Queries in Loops
  - Fehlende Indexes
  - Keine Pagination
```

### 8.2 Caching

```
✅ RICHTIG:
  - Caching für häufig abgerufene Daten
  - Cache-Invalidierung bei Updates
  - TTL für Cache-Einträge
  - Cache-Key-Struktur konsistent

Beispiel:
  cache_key = f"contact:{workspace_id}:{contact_id}"
  cached = cache.get(cache_key)
  if cached:
      return cached
  # Load from database
  contact = load_contact(contact_id)
  cache.set(cache_key, contact, ttl=5*60)
```

---

## 9. ERROR-HANDLING-STANDARDS

### 9.1 Logging

```
✅ RICHTIG:
  - Strukturierte Logs (JSON)
  - Log-Levels: DEBUG, INFO, WARN, ERROR
  - Sensitive Daten nicht loggen
  - Context-Informationen mitloggen

Beispiel:
  logger.info("Message sent", extra={
      "message_id": message.id,
      "contact_id": contact.id,
      "channel": channel.kind,
      "workspace_id": workspace.id
  })
```

### 9.2 Error-Propagation

```
✅ RICHTIG:
  - Spezifische Exceptions verwenden
  - Error-Context weitergeben
  - User-freundliche Error-Messages
  - Technical Details im Log, nicht im Response

Beispiel:
  try:
      send_message(...)
  except ChannelNotAvailableError as e:
      logger.error("Channel not available", extra={"error": str(e)})
      raise APIError(
          code="CHANNEL_NOT_AVAILABLE",
          message="Channel is currently not available"
      )
```

---

## 10. DATEI-ORGANISATION

### 10.1 Projekt-Struktur

```
✅ RICHTIG:
  project/
    ├── src/
    │   ├── api/
    │   │   ├── routes/
    │   │   ├── handlers/
    │   │   └── middleware/
    │   ├── models/
    │   ├── services/
    │   ├── utils/
    │   └── config/
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   └── e2e/
    ├── docs/
    ├── migrations/
    └── scripts/
```

### 10.2 Datei-Namen

```
✅ RICHTIG:
  - snake_case: contact_service.py, message_queue.py
  - Klar benannt: journey_processor.py (nicht processor.py)
  - Konsistente Endungen: .py, .ts, .js

❌ FALSCH:
  - camelCase: contactService.py
  - Unklar: service.py, handler.py
```

---

## ENDE DES STYLE-GUIDES

**Diese Richtlinien enthalten:**
- ✅ Code-Style & Namenskonventionen
- ✅ Datenbank-Standards
- ✅ API-Standards
- ✅ Dokumentations-Standards
- ✅ Testing-Standards
- ✅ Git-Standards
- ✅ Security-Standards
- ✅ Performance-Standards

**Verwendung:**
- Als Referenz für Code-Reviews
- Für Neueinsteiger im Team
- Für Konsistenz im Projekt

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-01-27
