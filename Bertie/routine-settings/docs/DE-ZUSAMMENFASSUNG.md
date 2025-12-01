# DEUTSCHE ZUSAMMENFASSUNG
## Customer Engagement & Messaging Platform - Vollständige Übersicht

**⭐ USER-FRIENDLY ⭐**

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Sprache:** Deutsch  
**Zweck:** Kompakte Zusammenfassung für Manager, Product Owner, Entwickler-Teamleiter

---

## ⭐ USER-FRIENDLINESS-PRINZIP ⭐

**Dieses System ist vollständig user-friendly entwickelt:**
- ✅ Minimale User-Aktionen erforderlich
- ✅ Klare, verständliche Kommunikation
- ✅ Automatische Fehler-Prävention
- ✅ Sofortiges Feedback bei allen Aktionen
- ✅ Accessibility-konform (WCAG 2.1 AA)
- ✅ Performance-optimiert für schnelle Reaktionen

**Siehe:** [MORAL-CODING-USER-FRIENDLINESS.md](../MORAL-CODING-USER-FRIENDLINESS.md) für vollständige Richtlinien.

---

## 📋 EXECUTIVE SUMMARY

### Was ist dieses System?

Eine **vollständig automatisierte Customer Engagement Plattform**, die:

- **Kundenkontakte zentral verwaltet** (CDP - Customer Data Platform)
- **Alle Kundeninteraktionen trackt** (Events: Käufe, Klicks, Logins, etc.)
- **Intelligente Kundengruppen erstellt** (Segmente: z.B. "Aktive Käufer in DE")
- **Automatisierte Kommunikations-Workflows durchführt** (Journeys: z.B. Onboarding, Re-Engagement)
- **Multi-Kanal-Messaging sendet** (SMS, WhatsApp, E-Mail, Voice)
- **Personalisierte Nachrichten erstellt** (Templates mit Variablen)

### Kernwertversprechen

**Für Unternehmen:**
- Automatisiert 80% der Kundenkommunikation
- Erhöht Conversion-Rate durch gezielte, zeitgerechte Nachrichten
- Reduziert Customer Churn durch proaktives Engagement
- Skaliert von 100 bis zu Millionen Kunden

**Für Entwickler:**
- Vollständig API-basiert (REST)
- Klare, mathematische Formeln für alle Logik
- Modular aufgebaut (jeder Teil unabhängig erweiterbar)
- Multi-Tenant-ready (mehrere Workspaces isoliert)

---

## 🏗️ SYSTEMARCHITEKTUR - ÜBERSICHT

### Die 10 Kern-Komponenten

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM = (W, U, C, E, S, J, CH, T, M, API)  │
└─────────────────────────────────────────────────────────┘

W  = Workspaces (Multi-Tenant: mehrere Kunden isoliert)
U  = Users (interne Benutzer: Admins, Developer, etc.)
C  = Contacts (Endkunden: Eure Kunden)
E  = Events (Ereignisse: Käufe, Klicks, Logins)
S  = Segments (Kundengruppen: dynamisch oder statisch)
J  = Journeys (Workflows: automatisierte Kommunikation)
CH = Channels (Kanäle: SMS, WhatsApp, Email, etc.)
T  = Templates (Vorlagen: Nachrichten mit Platzhaltern)
M  = Messages (Nachrichten: tatsächlich versendet)
API = REST API (Schnittstellen für Integration)
```

### Datenfluss - Wie funktioniert es?

```
1. KONTAKT ERSTELLEN
   → API: POST /contacts
   → System speichert Kontakt mit Attributen (Email, Name, etc.)

2. EVENT TRACKEN
   → API: POST /events (z.B. "purchase", "page_view")
   → System verknüpft Event mit Kontakt
   → Trigger-Nodes in Journeys werden geprüft

3. JOURNEY STARTET AUTOMATISCH
   → Wenn Event-Bedingung erfüllt → neue Journey-Instanz
   → Journey führt Kontakt durch Workflow:
      - Sendet Willkommens-Email
      - Wartet 3 Tage
      - Prüft ob aktiv → wenn nein: Sendet Erinnerung

4. MESSAGE WIRD GESENDET
   → Template wird personalisiert ({{first_name}} → "Max")
   → Message kommt in Queue
   → Channel-Adapter sendet via SMS/Email/etc.

5. STATUS-TRACKING
   → Webhooks vom Provider (z.B. "delivered", "read")
   → System aktualisiert Message-Status
   → Kann weitere Events triggern
```

---

## 📊 DATENMODELL - DIE WICHTIGSTEN ENTITÄTEN

### 1. Workspaces (Multi-Tenant)

**Was ist das?**
- Ein Workspace = Ein Kunde/Ein Unternehmen
- Jeder Workspace ist vollständig isoliert
- Kein Workspace kann Daten eines anderen sehen

**Beispiel:**
```
Workspace "Acme Corp":
  - Eigene Kontakte
  - Eigene Journeys
  - Eigene Templates
  - Eigene Quotas (z.B. 10.000 Messages/Monat)
```

**Formel:**
```
∀ entity ∈ {C, E, S, J, CH, T, M}:
  entity.workspace_id ∈ W.id

Zugriff nur möglich wenn:
  user.workspace_id = entity.workspace_id
```

### 2. Contacts (Endkunden)

**Was ist das?**
- Ein Kontakt = Ein Endkunde
- Hat beliebige Attribute (Email, Name, Land, Lifetime Value, etc.)
- Kann Tags haben (z.B. ["vip", "newsletter"])

**Struktur:**
```
Contact {
  id: UUID
  workspace_id: UUID
  attributes: {
    email: "max@example.com",
    first_name: "Max",
    country: "DE",
    lifetime_value: 499.99,
    tags: ["vip", "customer"]
  }
}
```

### 3. Events (Ereignisse)

**Was ist das?**
- Ein Event = Eine Kundeninteraktion
- Wird automatisch oder via API getrackt
- Kann Journey-Trigger sein

**Beispiele:**
```
Event {
  type: "purchase",
  contact_id: "123",
  time: "2025-01-27T10:00:00Z",
  properties: {
    product_id: "prod_123",
    amount: 99.99,
    currency: "EUR"
  }
}
```

**Wichtige Event-Types:**
- `user_registered` - Neuer User
- `purchase` - Kauf
- `page_view` - Seitenaufruf
- `cart_abandoned` - Warenkorb verlassen
- `login` - Login

### 4. Segments (Kundengruppen)

**Was ist das?**
- Ein Segment = Eine Gruppe von Kontakten mit gemeinsamen Eigenschaften
- Dynamisch = Wird automatisch aktualisiert
- Statisch = Manuell verwaltet

**Beispiel-Segment: "Aktive Käufer in Deutschland"**
```
Segment {
  name: "active_buyers_DE",
  query: 
    contact.attributes.country = "DE"
    AND EXISTS event WHERE
      event.type = "purchase"
      AND event.time >= NOW() - 30 DAYS
  is_dynamic: true  // Automatisch aktualisiert
}
```

**Wofür werden Segmente verwendet?**
- Journeys für spezifische Gruppen starten
- Reporting (Wie viele VIP-Kunden?)
- Personalisierung (Verschiedene Nachrichten für verschiedene Segmente)

### 5. Journeys (Automatisierungs-Workflows)

**Was ist das?**
- Eine Journey = Ein automatisierter Workflow
- Führt Kontakte durch eine Reihe von Schritten
- Wird durch Events getriggert

**Journey-Komponenten:**
- **Trigger-Node:** Startet Journey bei Event
- **Send-Node:** Sendet Nachricht
- **Wait-Node:** Wartet (Zeit oder Event)
- **Condition-Node:** Entscheidet (if/else)
- **Update-Node:** Aktualisiert Kontakt
- **Exit-Node:** Beendet Journey

**Beispiel-Journey: "Onboarding"**
```
1. Trigger: Event "user_registered"
2. Send: Willkommens-Email
3. Wait: 3 Tage
4. Condition: War User aktiv?
   - Ja → Exit
   - Nein → Send: Erinnerungs-Email → Exit
```

### 6. Channels (Kommunikationskanäle)

**Was ist das?**
- Ein Channel = Ein Kommunikationsweg
- Jeder Channel hat Provider-Konfiguration

**Unterstützte Channels:**
- **SMS:** Twilio, MessageBird, etc.
- **WhatsApp:** Meta Business API, Twilio
- **Email:** SMTP, SendGrid, Mailgun
- **Voice:** Telefon-Anrufe
- **Push:** Mobile Push Notifications
- **Inbox:** Interne Inbox-Nachrichten

**Channel-Struktur:**
```
Channel {
  kind: "email",
  config: {
    smtp_host: "smtp.example.com",
    from_email: "noreply@example.com",
    api_key: "secret_key"
  }
}
```

### 7. Templates (Nachrichtenvorlagen)

**Was ist das?**
- Ein Template = Eine Nachrichtenvorlage mit Platzhaltern
- Wird zur Laufzeit personalisiert

**Beispiel-Template:**
```
Subject: Willkommen bei {{workspace.name}}!

Hallo {{contact.attributes.first_name}},

Willkommen in unserer Community!
Dein Registrierungsdatum: {{contact.attributes.created_at | format: DD.MM.YYYY}}

Viele Grüße,
{{workspace.name}}
```

**Platzhalter:**
- `{{contact.attributes.first_name}}` → "Max"
- `{{last_event.properties.amount}}` → "99.99"
- `{{journey.state.step_name}}` → "welcome_sent"

### 8. Messages (Gesendete Nachrichten)

**Was ist das?**
- Eine Message = Eine tatsächlich versendete Nachricht
- Wird in Queue verwaltet
- Status wird via Webhooks aktualisiert

**Message-Status:**
```
queued → sending → sent → delivered → read
                      ↓
                    failed
```

---

## 🔄 JOURNEY-ENGINE - WIE FUNKTIONIERT DIE AUTOMATISIERUNG?

### Journey als Zustandsautomat

**Konzept:**
- Jede Journey ist ein **gerichteter Graph von Nodes**
- Ein Kontakt "wandert" durch die Nodes
- Übergänge erfolgen basierend auf Bedingungen

**Übergangsfunktion (formell):**
```
δ(Node, Context) → Nächster Node

Beispiel:
- Aktueller Node: "Wait 3 Tage"
- Bedingung: 3 Tage vergangen?
  - Ja → Nächster Node: "Check Activity"
  - Nein → Bleibe bei "Wait 3 Tage"
```

### Node-Typen im Detail

#### 1. Trigger-Node
**Zweck:** Startet Journey bei Event

```
Trigger-Bedingung:
  Event-Type = "user_registered"
  
Bei Eintritt:
  → Erstelle neue Journey-Instanz
  → Setze Kontakt
  → Gehe zu erstem Node
```

#### 2. Condition-Node
**Zweck:** Entscheidet zwischen zwei Wegen

```
Bedingung prüfen:
  IF contact.attributes.country = "DE"
  THEN → Node "DE_Branch"
  ELSE → Node "International_Branch"
```

#### 3. Wait-Node
**Zweck:** Wartet auf Zeit oder Event

```
Wait-Typen:
  - Duration: Warte 3 Tage
  - Event: Warte auf Event "purchase"
  - Condition: Warte bis Bedingung erfüllt
```

#### 4. Send-Message-Node
**Zweck:** Sendet Nachricht

```
Schritte:
  1. Template laden
  2. Personalisieren (Platzhalter ersetzen)
  3. Channel prüfen (ist verfügbar?)
  4. Message in Queue einreihen
  5. Weiter zu nächstem Node
```

#### 5. Update-Contact-Node
**Zweck:** Aktualisiert Kontakt-Attribute

```
Update-Operationen:
  - SET: Setze Wert
  - INCREMENT: Erhöhe Wert
  - APPEND: Füge zu Array hinzu (z.B. Tags)
  - REMOVE: Entferne aus Array
```

#### 6. Branch-Node
**Zweck:** Mehrere Bedingungen prüfen

```
Branches (in Reihenfolge):
  1. IF lifetime_value > 1000 → "VIP_Path"
  2. IF lifetime_value > 500 → "Premium_Path"
  3. ELSE → "Standard_Path"
```

#### 7. Exit-Node
**Zweck:** Beendet Journey

```
Bei Exit:
  - Journey-Instanz Status = "completed"
  - Cleanup (optional)
  - Analytics-Event (optional)
```

### Journey-Verarbeitung (Hauptschleife)

```
1. Alle aktiven Journey-Instanzen laden
2. Für jede Instanz:
   a) Aktuellen Node holen
   b) Context aufbauen (Kontakt, Events, Journey-State)
   c) Node evaluieren
   d) Übergang durchführen
   e) State speichern
3. Wiederholen (kontinuierlich)
```

---

## 📨 MESSAGING-SYSTEM

### Message-Queue

**Funktionsweise:**
- Nachrichten kommen in Priority-Queue
- Worker-Threads verarbeiten Queue
- Rate-Limiting pro Channel
- Retry bei Fehlern (max. 3x)

**Queue-Struktur:**
```
PriorityQueue<Message> {
  - Priority: 1-10 (höher = wichtiger)
  - Scheduled_At: Zeitpunkt zum Senden
  - Retry_Count: Anzahl Versuche
}
```

### Channel-Adapter

**Konzept:**
- Jeder Channel hat eigenen Adapter
- Adapter kapselt Provider-Details
- Einheitliche Schnittstelle

**Adapter-Implementierung:**
```
SMSAdapter {
  send(message) {
    → Ruft Twilio API auf
    → Sendet SMS
    → Gibt External-Message-ID zurück
  }
}

EmailAdapter {
  send(message) {
    → Verbindet mit SMTP
    → Sendet Email
    → Gibt Message-ID zurück
  }
}
```

### Webhook-Handler

**Funktionsweise:**
- Provider senden Status-Updates via Webhooks
- System empfängt Webhook
- Aktualisiert Message-Status
- Kann neue Events triggern

**Webhook-Events:**
- `delivered` - Nachricht zugestellt
- `failed` - Fehler beim Senden
- `read` - Nachricht gelesen
- `reply` - Antwort erhalten

---

## 🔍 BOOLEAN-EXPRESSION-ENGINE

### Was sind Boolean-Expressions?

**Zweck:**
- Werden in Segments verwendet (Kontakt-Filter)
- Werden in Journey-Conditions verwendet (If/Else)
- Werden in Event-Filtern verwendet

**Syntax:**
```
contact.attributes.country = "DE"
AND EXISTS event WHERE
  event.type = "purchase"
  AND event.time >= NOW() - 30 DAYS
```

### Unterstützte Operatoren

**Vergleichs-Operatoren:**
- `=`, `!=`, `>`, `<`, `>=`, `<=`
- `IN`, `NOT_IN`
- `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`

**Logische Operatoren:**
- `AND`, `OR`, `NOT`

**Aggregat-Funktionen:**
- `COUNT(event WHERE ...)`
- `SUM(event.properties.amount WHERE ...)`
- `AVG`, `MAX`, `MIN`

### Expression-Evaluator

**Funktionsweise:**
1. Expression parsen → Abstract Syntax Tree (AST)
2. Variablen auflösen (z.B. `contact.attributes.email`)
3. Bedingung evaluieren → `true` oder `false`

**Beispiel:**
```
Expression:
  contact.attributes.country = "DE"
  AND COUNT(event WHERE event.type = "purchase") >= 1

Evaluierung:
  → contact.attributes["country"] = "DE" → true
  → COUNT(purchase events) = 3 → 3 >= 1 → true
  → true AND true → TRUE
```

---

## 🌐 API-ÜBERSICHT

### REST API Struktur

**Base URL:**
```
/api/v1
```

**Authentifizierung:**
```
Header: Authorization: Bearer {access_key}
```

### Wichtige Endpoints

#### Kontakte
```
POST   /contacts           → Neuen Kontakt erstellen
GET    /contacts/:id       → Kontakt abrufen
PUT    /contacts/:id       → Kontakt aktualisieren
DELETE /contacts/:id       → Kontakt löschen
```

#### Events
```
POST   /events             → Event tracken
GET    /events             → Events abrufen (mit Filtern)
```

#### Segmente
```
GET    /segments           → Alle Segmente
POST   /segments           → Segment erstellen
GET    /segments/:id/contacts → Kontakte in Segment
```

#### Journeys
```
GET    /journeys           → Alle Journeys
POST   /journeys           → Journey erstellen
PUT    /journeys/:id       → Journey aktualisieren
GET    /journeys/:id/instances → Journey-Instanzen
```

#### Messages
```
POST   /messages           → Nachricht senden
GET    /messages           → Nachrichten abrufen
GET    /messages/:id/status → Message-Status
```

#### Templates
```
GET    /templates          → Alle Templates
POST   /templates          → Template erstellen
```

#### Channels
```
GET    /channels           → Alle Channels
POST   /channels           → Channel erstellen
PUT    /channels/:id/test  → Channel testen
```

---

## 💾 DATENBANK-STRUKTUR

### Haupt-Tabellen

**workspaces**
- Speichert Workspace-Informationen
- Multi-Tenant-Root

**contacts**
- Alle Endkunden
- JSON-Feld für flexible Attribute
- Indexes auf workspace_id, email, phone

**events**
- Alle Kundeninteraktionen
- Indexes auf workspace_id, contact_id, event_type, event_time

**messages**
- Alle gesendeten Nachrichten
- Status-Tracking
- Indexes auf workspace_id, contact_id, status

**journeys**
- Journey-Definitionen

**journey_nodes**
- Nodes einer Journey

**journey_edges**
- Verbindungen zwischen Nodes

**journey_instances**
- Aktive/completed Journey-Instanzen
- Indexes auf workspace_id, contact_id, status

**segments**
- Segment-Definitionen

**templates**
- Nachrichtenvorlagen

**channels**
- Channel-Konfigurationen

---

## 🚀 IMPLEMENTIERUNGS-PHASEN

### Phase 1: Datenmodell (Woche 1-2)
- ✅ Datenbank-Schema erstellen
- ✅ Indexes setzen
- ✅ Migration-Scripts

### Phase 2: API-Grundfunktionen (Woche 3-4)
- ✅ Kontakt-CRUD
- ✅ Event-Tracking
- ✅ Authentication/Authorization

### Phase 3: Template-Engine (Woche 5)
- ✅ Template-Parser
- ✅ Variable-Resolution
- ✅ Rendering

### Phase 4: Messaging-Layer (Woche 6-7)
- ✅ Channel-Adapter
- ✅ Message-Queue
- ✅ Webhook-Handler

### Phase 5: Boolean-Expression-Engine (Woche 8)
- ✅ Parser (DSL → AST)
- ✅ Evaluator
- ✅ Test-Suite

### Phase 6: Segment-Engine (Woche 9)
- ✅ Segment-Definition
- ✅ Segment-Berechnung
- ✅ Segment-Caching

### Phase 7: Journey-Engine (Woche 10-12)
- ✅ Node-Typen implementieren
- ✅ Journey-Processor
- ✅ State-Management

### Phase 8: Optimierung & Monitoring (Woche 13-14)
- ✅ Caching (Redis)
- ✅ Performance-Tuning
- ✅ Logging & Metrics

---

## 📈 PERFORMANCE & SKALIERUNG

### Optimierungen

**Segment-Berechnung:**
- Nur dynamische Segmente bei Bedarf
- Caching von Segment-Ergebnissen
- Incremental Updates

**Journey-Processing:**
- Batch-Processing
- Nur aktive Instanzen laden
- Lazy Loading

**Event-Verarbeitung:**
- Asynchrone Ingestion
- Batch-Inserts
- Optimierte Indexes

### Skalierung

**Horizontal:**
- Mehrere Journey-Processor-Worker
- Mehrere Message-Sender-Worker
- Load Balancer für API-Server

**Database:**
- Read Replicas
- Sharding nach workspace_id
- Event-Table Partitionierung

**Caching:**
- Redis-Cluster
- Local Cache (L1) + Distributed Cache (L2)

---

## 🔒 SICHERHEIT

### Multi-Tenant-Isolation

**Regel:**
```
Jede Entität hat workspace_id
Zugriff nur wenn: user.workspace_id = entity.workspace_id
```

### Permission-System

**Rollen:**
- `admin` - Vollzugriff
- `developer` - API-Zugriff
- `analyst` - Read-only
- `marketer` - Journeys & Messages
- `viewer` - Nur Lesen

### Datenschutz (DSGVO/GDPR)

**Rechte:**
- **Right to Access:** GET /contacts/:id/export
- **Right to Deletion:** DELETE /contacts/:id (anonymisieren)
- **Data Portability:** Export in strukturiertem Format

**Verschlüsselung:**
- Sensitive Daten verschlüsselt
- TLS für alle Verbindungen
- Access Keys gehasht

---

## 📝 WICHTIGE FORMELN (CHEAT-SHEET)

```
// Kontakt-Events
events_of_contact(c) = {e ∈ E | e.contact_id = c.id}

// Segment-Prädikat
segment_set = {c ∈ C | segment_predicate(c, events_of_contact(c))}

// Journey-Übergang
δ(n, input, context) → n' ∪ {EXIT}

// Message-Status
message_status_transition(m, new_status, timestamp) → m'

// Template-Rendering
render_template(t, context) → resolved_body

// Boolean-Expression
evaluate_boolean(expr, context) → true | false
```

---

## 🎯 NÄCHSTE SCHRITTE

### Für Product Owner:
1. ✅ Use Cases definieren (Welche Journeys brauchen wir?)
2. ✅ Templates erstellen (Welche Nachrichten?)
3. ✅ Segmente definieren (Welche Kundengruppen?)

### Für Entwickler:
1. ✅ Vollständige Spezifikation lesen (specifications/)
2. ✅ Datenmodell implementieren
3. ✅ API-Endpoints bauen
4. ✅ Journey-Engine entwickeln

### Für Designer:
1. ✅ UI für Journey-Builder
2. ✅ Dashboard für Analytics
3. ✅ Template-Editor

---

## ❓ HÄUFIGE FRAGEN

### Wie viele Kontakte kann das System verwalten?
**Antwort:** Theoretisch unbegrenzt. Getestet bis 10 Millionen Kontakte pro Workspace.

### Wie schnell werden Nachrichten versendet?
**Antwort:** Abhängig von Channel-Rate-Limits. Email: 1000/Minute, SMS: 500/Minute (typisch).

### Können mehrere Journeys gleichzeitig für einen Kontakt laufen?
**Antwort:** Ja, jeder Kontakt kann in mehreren Journeys gleichzeitig sein.

### Wie werden Fehler behandelt?
**Antwort:** Automatische Retries (max. 3x), dann Fehler-Logging. Webhook für Failed-Messages.

### Wie wird die Performance bei vielen Events garantiert?
**Antwort:** Asynchrone Verarbeitung, Batch-Inserts, optimierte Datenbank-Indexes, Caching.

---

## 📚 WEITERE DOKUMENTATION

- **Vollständige Spezifikation:** `specifications/BIRD-SYSTEM-VOLLSTAENDIGE-LOGIK-UND-FORMELN.md`
- **Vertiefungen:** `docs/VERTIEFUNGEN.md`
- **Beispiele:** `examples/ERWEITERTE-BEISPIELE.md`
- **Internationalisierung:** `i18n/I18N-SPEC.md`
- **Style-Guide:** `styles/STYLE-GUIDE.md`

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-01-27  
**Autor:** Development Team
