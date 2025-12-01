# VERTIEFUNGEN WICHTIGER BEREICHE
## Detaillierte technische Vertiefungen für Entwickler

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Zweck:** Technische Tiefe für komplexe Systemkomponenten

---

## 1. JOURNEY-ENGINE VERTIEFUNG

### 1.1 Zustandsautomat - Mathematische Definition

**Vollständige Formale Definition:**

```
Journey J = (Q, Σ, δ, q₀, F, λ)

wobei:
- Q = {n₁, n₂, ..., nₖ}  // Menge aller Nodes
- Σ = EVENT ∪ {TIMEOUT, MANUAL_TRIGGER, CONDITION_MET}  // Input-Alphabet
- δ : Q × Σ × CONTEXT → Q × ACTION ∪ {EXIT}  // Übergangsfunktion mit Aktionen
- q₀ ∈ Q  // Start-Node
- F ⊆ Q  // End-Nodes (Exit-Nodes)
- λ : Q → LABEL  // Node-Labels
```

**Erweiterte Übergangsfunktion:**

```
δ(n, input, context) → (n', actions):

  // Actions sind Seiteneffekte (z.B. Message senden)
  actions = []
  
  SWITCH n.node_type:
    
    CASE "trigger":
      // Triggers werden nur beim Start evaluiert
      return (n.config["next_node_id"], [])
    
    CASE "condition":
      result = evaluate_boolean(n.config["condition"], context)
      if result:
        return (n.config["true_node_id"], [])
      else:
        return (n.config["false_node_id"], [])
    
    CASE "wait":
      if n.config["wait_type"] = "duration":
        wait_until = context.journey_state["wait_until"]
        if now() >= wait_until:
          // Wartezeit abgelaufen
          return (n.config["next_node_id"], [])
        else:
          // Noch warten
          return (n, [])
      
      else if n.config["wait_type"] = "event":
        // Warte auf Event
        wait_event_type = n.config["event_type"]
        if EXISTS e ∈ context.events:
          e.event_type = wait_event_type
          ∧ e.event_time > context.journey_state["wait_start_time"]
          ∧ evaluate_boolean(n.config["event_conditions"] ?? true, {
              contact: context.contact,
              event: e
            }):
          return (n.config["next_node_id"], [])
        else:
          return (n, [])
      
      else if n.config["wait_type"] = "condition":
        // Warte bis Bedingung erfüllt
        check_interval = n.config["check_interval"] ?? 1h
        last_check = context.journey_state["last_condition_check"] ?? context.journey_state["entry_time"]
        
        if now() >= last_check + check_interval:
          condition_result = evaluate_boolean(n.config["wait_condition"], context)
          context.journey_state["last_condition_check"] = now()
          
          if condition_result:
            return (n.config["next_node_id"], [])
          else:
            return (n, [])
        else:
          return (n, [])
    
    CASE "send_message":
      // Message senden
      message = create_and_send_message(n, context)
      actions.append({
        type: "message_sent",
        message_id: message.id
      })
      return (n.config["next_node_id"], actions)
    
    CASE "update_contact":
      // Kontakt aktualisieren
      apply_contact_updates(n.config["updates"], context.contact)
      actions.append({
        type: "contact_updated",
        contact_id: context.contact.id
      })
      return (n.config["next_node_id"], actions)
    
    CASE "branch":
      // Mehrere Bedingungen prüfen
      sorted_branches = sort(n.config["branches"], by: "priority")
      ∀ branch ∈ sorted_branches:
        if evaluate_boolean(branch.condition, context):
          return (branch.next_node_id, [])
      return (n.config["default_node_id"], [])
    
    CASE "exit":
      return (EXIT, [{
        type: "journey_completed",
        journey_id: context.journey_instance.journey_id,
        contact_id: context.contact.id
      }])
```

### 1.2 Journey-Instanz-Verwaltung

**Parallele Journey-Instanzen:**

```
Ein Kontakt kann in mehreren Journeys gleichzeitig sein.

Verwaltung:
active_instances(c) := { ji ∈ JI |
  ji.contact_id = c.id
  ∧ ji.status = "active"
}

Reentry-Policy (bei Trigger-Fire):

IF existing_instances = active_instances(c) WHERE ji.journey_id = journey.id:
  
  SWITCH journey.config["reentry_policy"]:
    
    CASE "skip":
      // Überspringe, wenn bereits aktiv
      return null
    
    CASE "restart":
      // Alte Instanz beenden, neue starten
      ∀ ji ∈ existing_instances:
        ji.status = "cancelled"
        ji.state_data["cancel_reason"] = "restarted"
      create_new_instance()
    
    CASE "parallel":
      // Erlaube mehrere Instanzen
      create_new_instance()
    
    CASE "wait":
      // Warte bis alte Instanz fertig ist
      if |existing_instances| > 0:
        return null  // Wird später neu geprüft
      else:
        create_new_instance()
```

**Journey-State-Management:**

```
state_data : Map(String, Value)

Reservierte Keys:
- "entry_time": Timestamp
- "trigger_event_id": UUID
- "wait_until": Timestamp
- "wait_start_time": Timestamp
- "last_condition_check": Timestamp
- "last_message_id": UUID
- "last_message_channel": String
- "step_count": Number

Custom State:
- Beliebige zusätzliche Keys erlaubt
- Persistiert zwischen Node-Übergängen
- Wird bei Exit archiviert
```

### 1.3 Journey-Processing-Optimierung

**Batch-Processing:**

```
process_journey_instances_batch(batch_size = 100):

  // 1. Aktive Instanzen laden (nur notwendige Felder)
  active_instances = SELECT ji FROM journey_instances
    WHERE status = "active"
    ORDER BY last_updated ASC
    LIMIT batch_size
  
  // 2. Kontakt-IDs sammeln
  contact_ids = DISTINCT(ji.contact_id FOR ji IN active_instances)
  
  // 3. Kontakte batch-laden
  contacts = LOAD contacts WHERE id IN contact_ids
  
  // 4. Events batch-laden (nur für notwendige Kontakte)
  events = LOAD events WHERE contact_id IN contact_ids
    GROUP BY contact_id
  
  // 5. Journey-Definitionen laden (nur einmal)
  journey_ids = DISTINCT(ji.journey_id FOR ji IN active_instances)
  journeys = LOAD journeys WHERE id IN journey_ids
  nodes = LOAD journey_nodes WHERE journey_id IN journey_ids
  
  // 6. Pro Instanz verarbeiten
  ∀ ji ∈ active_instances:
    context = build_context_optimized(ji, contacts, events, journeys, nodes)
    process_journey_instance(ji, context)
  
  // 7. Batch-Update
  UPDATE journey_instances SET ... WHERE id IN (ji.id ...)
```

**Lazy Loading:**

```
build_context_optimized(ji, contacts_cache, events_cache, journeys_cache, nodes_cache):

  contact = contacts_cache[ji.contact_id]
  events = events_cache[ji.contact_id] ?? []
  journey = journeys_cache[ji.journey_id]
  current_node = nodes_cache[ji.current_node_id]
  
  // Nur wenn nötig: Journey-State erweitern
  if current_node.node_type = "wait" AND current_node.config["wait_type"] = "event":
    // Events müssen verfügbar sein (bereits geladen)
    pass
  else if current_node.node_type = "condition":
    // Events müssen verfügbar sein (bereits geladen)
    pass
  else:
    // Events nicht unbedingt nötig
    events = []  // Empty wenn nicht benötigt
  
  return {
    contact: contact,
    events: events,
    journey_state: ji.state_data,
    system_time: now(),
    workspace: get_workspace_cached(ji.workspace_id),
    journey_instance: ji,
    journey: journey,
    current_node: current_node
  }
```

---

## 2. BOOLEAN-EXPRESSION-ENGINE VERTIEFUNG

### 2.1 Parser-Implementierung (Recursive Descent)

**AST-Struktur:**

```
EXPRESSION_NODE = 
  | COMPARISON_NODE
  | EXISTS_NODE
  | AGGREGATE_NODE
  | LOGICAL_NODE

COMPARISON_NODE {
  left: PATH_NODE,
  operator: OPERATOR,
  right: VALUE_NODE
}

EXISTS_NODE {
  entity: "event" | "contact",
  where_clause: EXPRESSION_NODE
}

AGGREGATE_NODE {
  function: "COUNT" | "SUM" | "AVG" | "MAX" | "MIN",
  entity: "event",
  property: PATH_NODE | null,
  where_clause: EXPRESSION_NODE
}

LOGICAL_NODE {
  operator: "AND" | "OR" | "NOT",
  left: EXPRESSION_NODE,
  right: EXPRESSION_NODE | null  // null bei NOT
}

PATH_NODE {
  parts: Array<String>,
  type: "contact" | "journey" | "event" | "system"
}
```

**Parser-Funktion:**

```
parse_expression(tokens: Array<Token>) → EXPRESSION_NODE:

  return parse_logical_expression(tokens)

parse_logical_expression(tokens) → EXPRESSION_NODE:
  
  left = parse_comparison_expression(tokens)
  
  if peek(tokens) ∈ {"AND", "OR"}:
    operator = consume(tokens)
    right = parse_logical_expression(tokens)
    return LOGICAL_NODE(operator, left, right)
  
  else if peek(tokens) = "NOT":
    operator = consume(tokens)
    right = parse_logical_expression(tokens)
    return LOGICAL_NODE("NOT", left, right)
  
  else:
    return left

parse_comparison_expression(tokens) → EXPRESSION_NODE:
  
  if peek(tokens) = "EXISTS":
    return parse_exists_clause(tokens)
  
  else if peek(tokens) ∈ {"COUNT", "SUM", "AVG", "MAX", "MIN"}:
    return parse_aggregate_clause(tokens)
  
  else:
    return parse_simple_comparison(tokens)

parse_simple_comparison(tokens) → COMPARISON_NODE:
  
  left = parse_path(tokens)
  operator = consume_operator(tokens)
  right = parse_value(tokens)
  
  return COMPARISON_NODE(left, operator, right)

parse_exists_clause(tokens) → EXISTS_NODE:
  
  consume(tokens, "EXISTS")
  entity = consume_entity(tokens)  // "event" oder "contact"
  consume(tokens, "WHERE")
  where_clause = parse_expression(tokens)
  
  return EXISTS_NODE(entity, where_clause)

parse_aggregate_clause(tokens) → AGGREGATE_NODE:
  
  function = consume_function(tokens)  // COUNT, SUM, etc.
  consume(tokens, "(")
  entity = consume_entity(tokens)
  
  if peek(tokens) = ".":
    // SUM(event.properties.amount)
    consume(tokens, ".")
    property = parse_path(tokens)
  else:
    property = null
  
  consume(tokens, "WHERE")
  where_clause = parse_expression(tokens)
  consume(tokens, ")")
  
  operator = consume_operator(tokens)
  value = parse_value(tokens)
  
  // Wrap in comparison
  return COMPARISON_NODE(
    AGGREGATE_NODE(function, entity, property, where_clause),
    operator,
    value
  )
```

### 2.2 Optimierter Evaluator

**Caching-Strategie:**

```
evaluate_with_cache(expr: EXPRESSION_NODE, context: CONTEXT) → Boolean:

  // Cache-Key generieren
  cache_key = generate_cache_key(expr, context.contact.id)
  
  // Cache prüfen
  if cached_result = cache.get(cache_key):
    return cached_result
  
  // Evaluieren
  result = evaluate_expression(expr, context)
  
  // Cache speichern (TTL: 5 Minuten)
  cache.set(cache_key, result, ttl=5min)
  
  return result

generate_cache_key(expr, contact_id):
  // Hash von Expression + Contact-ID
  return hash(serialize(expr) + contact_id)
```

**Event-Filter-Optimierung:**

```
evaluate_exists_optimized(exists_node: EXISTS_NODE, context: CONTEXT) → Boolean:

  if exists_node.entity = "event":
    // Events bereits gefiltert laden
    events = context.events
    
    // Weitere Filter anwenden
    filtered_events = filter(events, e =>
      evaluate_boolean(exists_node.where_clause, {
        contact: context.contact,
        event: e,
        events: context.events
      })
    )
    
    return |filtered_events| > 0
  
  else:
    return evaluate_exists_normal(exists_node, context)
```

### 2.3 Aggregat-Funktionen - Implementierung

**COUNT:**

```
evaluate_count(aggregate_node: AGGREGATE_NODE, context: CONTEXT) → Number:

  events = context.events
  
  // Filter anwenden
  filtered_events = filter(events, e =>
    evaluate_boolean(aggregate_node.where_clause, {
      contact: context.contact,
      event: e,
      events: events
    })
  )
  
  return |filtered_events|
```

**SUM:**

```
evaluate_sum(aggregate_node: AGGREGATE_NODE, context: CONTEXT) → Number:

  events = context.events
  
  // Filter anwenden
  filtered_events = filter(events, e =>
    evaluate_boolean(aggregate_node.where_clause, {
      contact: context.contact,
      event: e,
      events: events
    })
  )
  
  // Property extrahieren
  sum = 0
  ∀ e ∈ filtered_events:
    property_value = resolve_path(aggregate_node.property, {
      event: e,
      contact: context.contact
    })
    
    if property_value ∈ Number:
      sum += property_value
  
  return sum
```

**AVG, MAX, MIN analog implementieren**

---

## 3. SEGMENT-ENGINE VERTIEFUNG

### 3.1 Dynamische Segment-Berechnung

**Incremental Update:**

```
recalculate_segment_incremental(s: Segment) → Segment':

  if s.is_dynamic = false:
    // Statisches Segment, keine Berechnung
    return s
  
  // 1. Alte Segment-Mitglieder
  old_members = segment_contacts[s.id]  // Set<ContactID>
  
  // 2. Nur Kontakte prüfen, die sich geändert haben
  changed_contacts = get_changed_contacts_since(
    s.last_calculated_at,
    s.workspace_id
  )
  
  // 3. Auch neue Kontakte prüfen
  new_contacts = get_new_contacts_since(
    s.last_calculated_at,
    s.workspace_id
  )
  
  contacts_to_check = changed_contacts ∪ new_contacts
  
  // 4. Prüfe nur diese Kontakte
  new_members = Set<ContactID>()
  
  ∀ c ∈ contacts_to_check:
    if evaluate_segment_predicate(s.segment_query, c):
      new_members.add(c.id)
  
  // 5. Update Segment
  s'.segment_set = (old_members - contacts_to_check) ∪ new_members
  s'.contact_count = |s'.segment_set|
  s'.last_calculated_at = now()
  
  return s'

get_changed_contacts_since(since: Timestamp, workspace_id: UUID) → Set<ContactID>:

  // Kontakte mit geänderten Attributen
  changed_contacts = SELECT DISTINCT contact_id FROM contact_attributes
    WHERE workspace_id = workspace_id
      AND updated_at >= since
  
  // Kontakte mit neuen Events
  contacts_with_events = SELECT DISTINCT contact_id FROM events
    WHERE workspace_id = workspace_id
      AND event_time >= since
      AND contact_id IS NOT NULL
  
  return changed_contacts ∪ contacts_with_events
```

**Parallel-Berechnung:**

```
recalculate_segment_parallel(s: Segment, worker_count = 4) → Segment':

  // 1. Alle Kontakte des Workspaces partitionieren
  all_contacts = get_all_contacts(s.workspace_id)
  partitions = partition(all_contacts, worker_count)
  
  // 2. Parallel pro Partition berechnen
  results = PARALLEL_MAP(partitions, partition =>
    members = Set<ContactID>()
    ∀ c ∈ partition:
      if evaluate_segment_predicate(s.segment_query, c):
        members.add(c.id)
    return members
  )
  
  // 3. Ergebnisse zusammenführen
  all_members = UNION(results)
  
  s'.segment_set = all_members
  s'.contact_count = |all_members|
  s'.last_calculated_at = now()
  
  return s'
```

### 3.2 Segment-Caching

**Cache-Strategie:**

```
Segment-Cache:
  - Key: "segment:{workspace_id}:{segment_id}:members"
  - Value: Set<ContactID>
  - TTL: 1 Stunde (für dynamische Segmente)
  
Segment-Metadata-Cache:
  - Key: "segment:{workspace_id}:{segment_id}:metadata"
  - Value: {count: Number, last_calculated: Timestamp}
  - TTL: 10 Minuten

Invalidation:
  - Bei Contact-Update: Alle Segmente des Workspaces invalidieren
  - Bei Event-Insert: Nur relevante Segmente invalidieren (basierend auf Event-Type)
  - Bei Segment-Update: Segment-Cache invalidieren
```

**Cache-Invalidierung:**

```
invalidate_segment_cache(workspace_id: UUID, contact_id: UUID | null, event_type: String | null):

  if contact_id:
    // Kontakt-spezifische Invalidation
    segments = get_segments_for_workspace(workspace_id)
    ∀ s ∈ segments:
      cache.delete("segment:{workspace_id}:{s.id}:members")
      cache.delete("segment:{workspace_id}:{s.id}:metadata")
  
  else if event_type:
    // Event-spezifische Invalidation (nur relevante Segmente)
    segments = get_segments_using_event_type(workspace_id, event_type)
    ∀ s ∈ segments:
      cache.delete("segment:{workspace_id}:{s.id}:members")
      cache.delete("segment:{workspace_id}:{s.id}:metadata")
  
  else:
    // Komplette Workspace-Invalidation
    cache.delete_pattern("segment:{workspace_id}:*")
```

---

## 4. MESSAGING-SYSTEM VERTIEFUNG

### 4.1 Message-Queue-Architektur

**Priority-Queue-Implementierung:**

```
PriorityQueue<Message> {
  
  buckets: Map<Priority, Queue<Message>>
  // Priority 1-10, höher = wichtiger
  
  enqueue(message: Message):
    priority = message.priority ?? 5
    if priority not in buckets:
      buckets[priority] = Queue()
    buckets[priority].enqueue(message)
  
  dequeue() → Message | null:
    // Von höchster Priority
    for priority in [10, 9, 8, ..., 1]:
      if priority in buckets AND not buckets[priority].empty():
        message = buckets[priority].dequeue()
        
        // Prüfe scheduled_at
        if message.scheduled_at <= now():
          return message
        else:
          // Zu früh, wieder einreihen
          buckets[priority].enqueue(message)
    
    return null
  
  peek() → Message | null:
    // Nächste Message ohne zu entfernen
    for priority in [10, 9, 8, ..., 1]:
      if priority in buckets AND not buckets[priority].empty():
        message = buckets[priority].peek()
        if message.scheduled_at <= now():
          return message
    return null
}
```

**Distributed Queue (für Skalierung):**

```
Bei mehreren Worker-Instanzen:

Option 1: Redis Queue
  - Redis LIST als Queue
  - BLPOP für blocking pop
  - Priority via separate LISTs pro Priority

Option 2: RabbitMQ / AWS SQS
  - Exchange mit Priority-Routing
  - Separate Queues pro Priority
  - Consumer binden zu Queues

Option 3: Database Queue
  - messages Table mit status="queued"
  - SELECT FOR UPDATE SKIP LOCKED
  - Priority via ORDER BY
```

### 4.2 Rate-Limiting

**Token-Bucket-Algorithmus:**

```
RateLimiter {
  capacity: Number  // Maximale Tokens
  refill_rate: Number  // Tokens pro Sekunde
  tokens: Number
  last_refill: Timestamp
  
  check_limit() → Boolean:
    now_time = now()
    elapsed = now_time - last_refill
    
    // Tokens auffüllen
    tokens_to_add = elapsed * refill_rate
    tokens = min(capacity, tokens + tokens_to_add)
    last_refill = now_time
    
    if tokens >= 1:
      tokens -= 1
      return true  // Erlaubt
    else:
      return false  // Rate-Limit überschritten
}

Pro Channel:
  rate_limiter = RateLimiter(
    capacity: channel.config["rate_limit_per_minute"],
    refill_rate: channel.config["rate_limit_per_minute"] / 60
  )
  
  if not rate_limiter.check_limit():
    // Zu viele Nachrichten, warten oder zurückweisen
    return ERROR_RATE_LIMIT_EXCEEDED
```

**Per-Contact Rate-Limiting:**

```
check_contact_rate_limit(contact_id: UUID, channel_id: UUID, config: RateLimitConfig) → Boolean:

  key = "rate_limit:{contact_id}:{channel_id}"
  
  // Redis Counter mit TTL
  current_count = redis.incr(key)
  
  if current_count = 1:
    // Erste Nachricht, TTL setzen
    redis.expire(key, config.window_seconds)
  
  if current_count > config.max_per_window:
    return false  // Rate-Limit überschritten
  
  return true
```

### 4.3 Retry-Mechanismus

**Exponential Backoff:**

```
retry_message(message: Message, error: Error) → Message':

  message.retry_count++
  
  if message.retry_count >= message.max_retries:
    // Max Retries erreicht
    message.status = "failed"
    message.error_message = error.message
    return message
  
  // Exponential Backoff berechnen
  base_delay = 60  // 1 Minute
  backoff_delay = base_delay * (2 ^ (message.retry_count - 1))
  
  // Max Delay: 24 Stunden
  backoff_delay = min(backoff_delay, 86400)
  
  // Jitter hinzufügen (±20%)
  jitter = random(-0.2, 0.2) * backoff_delay
  final_delay = backoff_delay + jitter
  
  // Neu einreihen
  message.scheduled_at = now() + final_delay
  message.status = "queued"
  
  queue.enqueue(message)
  
  return message
```

**Retry-Kategorien:**

```
ERROR_CATEGORIES = {
  "temporary": ["timeout", "rate_limit", "server_error"],
  "permanent": ["invalid_phone", "invalid_email", "bounced"],
  "retryable": ["network_error", "provider_error"]
}

categorize_error(error: Error) → String:

  error_message_lower = error.message.toLowerCase()
  
  if any(keyword in error_message_lower for keyword in ERROR_CATEGORIES["permanent"]):
    return "permanent"
  else if any(keyword in error_message_lower for keyword in ERROR_CATEGORIES["retryable"]):
    return "retryable"
  else:
    return "temporary"

handle_retry(message: Message, error: Error):

  category = categorize_error(error)
  
  if category = "permanent":
    // Keine Retries bei permanenten Fehlern
    message.status = "failed"
    message.error_message = error.message
  else:
    // Retry mit Backoff
    retry_message(message, error)
```

---

## 5. PERFORMANCE-OPTIMIERUNGEN

### 5.1 Datenbank-Index-Strategie

**Kritische Indexes:**

```
contacts:
  - PRIMARY KEY (id)
  - INDEX (workspace_id, attributes->>'email')  // JSON-Index
  - INDEX (workspace_id, attributes->>'phone')
  - INDEX (workspace_id, created_at)
  - INDEX (workspace_id, updated_at)

events:
  - PRIMARY KEY (id)
  - INDEX (workspace_id, contact_id, event_time DESC)
  - INDEX (workspace_id, event_type, event_time DESC)
  - INDEX (workspace_id, contact_id, event_type, event_time DESC)
  - INDEX (event_time)  // Für globale Event-Queries

messages:
  - PRIMARY KEY (id)
  - INDEX (workspace_id, contact_id, created_at DESC)
  - INDEX (workspace_id, status, queued_at)
  - INDEX (workspace_id, channel_id, status)
  - INDEX (status, scheduled_at)  // Für Queue-Worker

journey_instances:
  - PRIMARY KEY (id)
  - INDEX (workspace_id, contact_id, status)
  - INDEX (workspace_id, journey_id, status)
  - INDEX (status, last_updated)  // Für Processor
  - INDEX (workspace_id, status, last_updated)
```

**Partitionierung:**

```
events Table:
  - Partition nach workspace_id (Hash-Partition)
  - Sub-Partition nach event_time (Range-Partition, monatlich)
  
Vorteil:
  - Schnellere Queries (nur relevante Partitionen)
  - Einfacheres Archivieren (alte Partitionen löschen)
  - Bessere Parallelität

messages Table:
  - Partition nach workspace_id
  - Sub-Partition nach created_at (täglich oder wöchentlich)
```

### 5.2 Caching-Strategien

**Multi-Level Cache:**

```
L1 Cache (Local, in-memory):
  - Kontakte (TTL: 5 Minuten)
  - Templates (TTL: 30 Minuten)
  - Channel-Configs (TTL: 10 Minuten)
  - Size-Limit: 100 MB

L2 Cache (Redis):
  - Kontakte (TTL: 5 Minuten)
  - Events (TTL: 1 Minute)
  - Segmente (TTL: 1 Stunde)
  - Journey-Definitionen (TTL: 10 Minuten)

Cache-Invalidierung:
  - Write-Through: Bei Update, Cache sofort aktualisieren
  - Write-Back: Bei Update, Cache später aktualisieren
  - TTL-basiert: Automatisches Verfallen
```

**Cache-Keys:**

```
Format: "{entity_type}:{workspace_id}:{id}"

Beispiele:
  - "contact:w123:c456"
  - "template:w123:t789"
  - "segment:w123:s321:members"
  - "journey:w123:j654"

Bulk-Keys:
  - "contacts:w123:ids:{contact_id_1},{contact_id_2},..."
  - "events:w123:c456:recent"
```

### 5.3 Query-Optimierung

**Batch-Loading:**

```
load_contacts_batch(contact_ids: Array<UUID>) → Map<UUID, Contact>:

  // 1. L1 Cache prüfen
  cached = {}
  missing_ids = []
  
  ∀ id ∈ contact_ids:
    if cached_contact = l1_cache.get("contact:" + id):
      cached[id] = cached_contact
    else:
      missing_ids.append(id)
  
  if |missing_ids| = 0:
    return cached
  
  // 2. L2 Cache prüfen
  l2_keys = map(missing_ids, id => "contact:" + id)
  l2_results = redis.mget(l2_keys)
  
  ∀ (id, result) ∈ zip(missing_ids, l2_results):
    if result:
      contact = deserialize(result)
      cached[id] = contact
      l1_cache.set("contact:" + id, contact, ttl=5min)
      missing_ids.remove(id)
  
  if |missing_ids| = 0:
    return cached
  
  // 3. Database-Load
  db_results = SELECT * FROM contacts WHERE id IN missing_ids
  
  ∀ contact ∈ db_results:
    cached[contact.id] = contact
    l1_cache.set("contact:" + contact.id, contact, ttl=5min)
    l2_cache.set("contact:" + contact.id, serialize(contact), ttl=5min)
  
  return cached
```

**Lazy Loading:**

```
load_events_lazy(contact_id: UUID, filters: EventFilters) → Array<Event>:

  // Nur wenn wirklich benötigt
  if filters.needed = false:
    return []
  
  // Cache-Key basierend auf Filtern
  cache_key = "events:" + contact_id + ":" + hash(filters)
  
  if cached = cache.get(cache_key):
    return cached
  
  events = SELECT * FROM events
    WHERE contact_id = contact_id
      AND (filters.start_time IS NULL OR event_time >= filters.start_time)
      AND (filters.end_time IS NULL OR event_time <= filters.end_time)
      AND (filters.event_type IS NULL OR event_type = filters.event_type)
    ORDER BY event_time DESC
    LIMIT filters.limit ?? 100
  
  cache.set(cache_key, events, ttl=1min)
  
  return events
```

---

## 6. FEHLERBEHANDLUNG & RESILIENZ

### 6.1 Circuit Breaker Pattern

**Für externe APIs (Channel-Provider):**

```
CircuitBreaker {
  state: "closed" | "open" | "half_open"
  failure_count: Number
  failure_threshold: Number = 5
  success_threshold: Number = 2
  timeout: Duration = 60s
  last_failure_time: Timestamp | null
  
  call(fn: Function) → Result:
    
    if state = "open":
      if now() - last_failure_time < timeout:
        return ERROR_CIRCUIT_OPEN
      else:
        // Versuche wieder
        state = "half_open"
        failure_count = 0
    
    try:
      result = fn()
      
      if state = "half_open":
        failure_count++
        if failure_count >= success_threshold:
          state = "closed"
          failure_count = 0
      
      return result
      
    catch error:
      failure_count++
      last_failure_time = now()
      
      if failure_count >= failure_threshold:
        state = "open"
      
      throw error
}

Pro Channel:
  circuit_breaker = CircuitBreaker()
  
  send_message(message):
    return circuit_breaker.call(() => 
      channel_adapter.send(message)
    )
```

### 6.2 Dead Letter Queue

**Für fehlgeschlagene Messages:**

```
dead_letter_queue = Queue<FailedMessage>

FailedMessage {
  original_message: Message
  error: Error
  failure_count: Number
  last_attempt: Timestamp
  next_retry: Timestamp | null
}

handle_failed_message(message: Message, error: Error):

  failed_message = FailedMessage(
    original_message: message,
    error: error,
    failure_count: message.retry_count,
    last_attempt: now()
  )
  
  // Kategorisiere Fehler
  category = categorize_error(error)
  
  if category = "permanent":
    // Direkt in Dead Letter Queue
    dead_letter_queue.enqueue(failed_message)
  else if message.retry_count >= message.max_retries:
    // Max Retries erreicht
    dead_letter_queue.enqueue(failed_message)
  else:
    // Später nochmal versuchen
    failed_message.next_retry = now() + calculate_backoff(message.retry_count)
    dead_letter_queue.enqueue(failed_message)
```

---

## ENDE DER VERTIEFUNGEN

**Diese Vertiefungen enthalten:**
- ✅ Detaillierte Algorithmen-Implementierungen
- ✅ Performance-Optimierungen
- ✅ Fehlerbehandlungs-Strategien
- ✅ Skalierungs-Ansätze

**Verwendung:**
- Für Senior-Entwickler
- Für Performance-Critical Components
- Für System-Architektur-Entscheidungen

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-01-27
