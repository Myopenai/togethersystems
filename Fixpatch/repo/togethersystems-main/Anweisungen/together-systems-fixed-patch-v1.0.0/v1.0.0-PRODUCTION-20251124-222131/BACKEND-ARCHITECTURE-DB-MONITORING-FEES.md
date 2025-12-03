## Backend-Architektur für DB, Monitoring & Fees (1:1 übernehmbar)

Dieses Dokument beschreibt, wie die aktuell In‑Memory arbeitenden Module (Presence, Voucher, Hypothek, Telbank)
in eine echte relationale Datenbank (z. B. Postgres/Supabase, Cloudflare D1) und ein Monitoring/Fee‑System
überführt werden können – so, dass die bestehenden HTTP‑APIs weitgehend unverändert bleiben.

---

### 1. Kern-Tabellen (Datenmodell)

#### 1.1 Identitäten & Sessions

- **thinkers**
  - `id               uuid PK` – interne ID
  - `public_id        text UNIQUE` – abgeleitet aus Token (z. B. hashed)
  - `created_at       timestamptz`
  - `meta             jsonb` – optionale Profilinfos

- **presence_sessions**
  - `id               uuid PK`
  - `thinker_id       uuid FK -> thinkers(id)`
  - `pair_code        text` – Stichwort (projekt_alpha, familie, …)
  - `status           text` – 'online' | 'offline'
  - `room_id          text` – aktuell zugewiesener Raum (z. B. voucher:V-..., wabe:A-1)
  - `last_seen_at     timestamptz`
  - `created_at       timestamptz`

- **rooms**
  - `id               text PK` – z. B. 'mortgage:offer:O-2025-0001'
  - `type             text` – 'text' | 'video' | 'file' | 'contract' | 'mixed'
  - `owner_id         uuid FK -> thinkers(id)`
  - `meta             jsonb` – z. B. { "source": "mortgage", "voucher_id": "v-..." }
  - `created_at       timestamptz`

#### 1.2 Voucher & Slots

- **vouchers**
  - `id               text PK` – z. B. v-<ts>-<rand> (wie aktuell)
  - `issuer_id        uuid FK -> thinkers(id)`
  - `holder_id        uuid FK -> thinkers(id) NULL`
  - `service_type     text` – z. B. consulting.session, realestate.viewing
  - `title            text`
  - `description      text`
  - `duration_minutes integer`
  - `valid_from       timestamptz`
  - `valid_until      timestamptz`
  - `price_amount     bigint NULL` – cents
  - `price_currency   text NULL` – 'EUR', 'USD', …
  - `status           text` – 'issued' | 'booked' | 'consumed' | 'cancelled' | 'expired'
  - `transferable     boolean`
  - `terms            jsonb` – AGB, Branchen‑Template‑ID, etc.
  - `created_at       timestamptz`

- **voucher_bookings**
  - `id               text PK` – b-<ts>-<rand>
  - `voucher_id       text FK -> vouchers(id)`
  - `issuer_id        uuid FK -> thinkers(id)`
  - `holder_id        uuid FK -> thinkers(id)`
  - `slot_start       timestamptz`
  - `slot_end         timestamptz`
  - `status           text` – 'booked' | 'cancelled'
  - `cancel_reason    text NULL`
  - `created_at       timestamptz`
  - `cancelled_at     timestamptz NULL`

- **voucher_templates**
  - `id               text PK` – 'consulting', 'therapy', …
  - `service_type     text`
  - `title            text`
  - `default_duration integer`
  - `default_terms    jsonb`

> Mapping: Der aktuelle In‑Memory‑Voucher‑Server liest/schreibt in `vouchers` und `voucher_bookings`.
> Die neuen Branchen‑Templates im Portal entsprechen Einträgen in `voucher_templates`.

#### 1.3 Verträge (Legal Hub)

- **contracts**
  - `id               uuid PK`
  - `name             text` – Anzeigename (z. B. „Hypothekenvertrag #123“)
  - `mime_type        text`
  - `byte_size        bigint`
  - `storage_url      text` – z. B. S3/Backblaze/Cloudflare R2 Pfad
  - `hash_sha256      text` – Integritäts‑Prüfsumme
  - `created_by       uuid FK -> thinkers(id)`
  - `created_at       timestamptz`

- **contract_links**
  - `id               uuid PK`
  - `contract_id      uuid FK -> contracts(id)`
  - `voucher_id       text FK -> vouchers(id) NULL`
  - `room_id          text FK -> rooms(id) NULL`
  - `role             text` – 'primary', 'annex', 'offer', 'application'
  - `created_at       timestamptz`

> Der aktuelle Legal‑Hub speichert nur eine lokale Liste in `localStorage`. 
> In Produktion würden Uploads in `contracts` landen, die Zuordnung zu Voucher/Raum in `contract_links`.

#### 1.4 Hypotheken‑Vertical

- **properties**
  - `id               text PK` – 'house-123'
  - `address          text`
  - `meta             jsonb`

- **mortgage_applications**
  - `id               text PK`
  - `property_id      text FK -> properties(id)`
  - `borrower_id      uuid FK -> thinkers(id)`
  - `desired_loan     bigint` – in cents
  - `currency         text`
  - `duration_years   integer`
  - `rate_type        text` – 'fixed' | 'variable'
  - `max_interest     numeric(6,4)`
  - `status           text` – 'open' | 'offered' | 'accepted' | 'rejected'
  - `meta             jsonb`
  - `created_at       timestamptz`

- **mortgage_offers**
  - `id               text PK`
  - `application_id   text FK -> mortgage_applications(id)`
  - `lender_id        uuid FK -> thinkers(id)`
  - `interest_rate    numeric(6,4)`
  - `monthly_payment  bigint` – cents
  - `status           text` – 'open' | 'accepted' | 'withdrawn'
  - `created_at       timestamptz`

- **mortgage_contracts**
  - `id               text PK`
  - `offer_id         text FK -> mortgage_offers(id)`
  - `contract_id      uuid FK -> contracts(id)`
  - `status           text` – 'draft' | 'signed' | 'archived'
  - `created_at       timestamptz`

#### 1.5 Telbank & Transfers

- **transfers**
  - `id               text PK` – tx‑… (wie aktueller Cloudflare‑Store)
  - `direction        text` – 'in' | 'out'
  - `wallet_address   text`
  - `network          text` – 'Ethereum Mainnet', 'Polygon', …
  - `crypto_amount    numeric(36,18)`
  - `crypto_symbol    text`
  - `fiat_amount      bigint` – cents
  - `fiat_currency    text`
  - `external_account text` – IBAN, Skrill‑Konto, Referenz
  - `meta             jsonb`
  - `status           text` – 'logged' | 'settled'
  - `created_at       timestamptz`
  - `updated_at       timestamptz`

---

### 2. Monitoring & Logging

#### 2.1 Ereignis-Log

- **events**
  - `id               uuid PK`
  - `type             text` – z. B. 'presence.heartbeat', 'voucher.book', 'mortgage.offer', 'transfer.logged'
  - `actor_id         uuid FK -> thinkers(id) NULL`
  - `subject_type     text` – 'voucher' | 'room' | 'contract' | 'transfer'
  - `subject_id       text`
  - `meta             jsonb`
  - `created_at       timestamptz`

Alle bestehenden Endpunkte können beim Erfolg einen Eintrag in `events` erzeugen:

- `/api/presence/heartbeat` → `type='presence.heartbeat'`
- `/api/presence/match` → `type='presence.match'`
- `/api/voucher/book` → `type='voucher.book'`
- `/api/telbank/transfers` (POST) → `type='transfer.logged'`

#### 2.2 Statistiken / Dashboards

Auf Basis der Tabellen:

- **Presence Dashboard**
  - Aktive Sessions: `SELECT COUNT(*) FROM presence_sessions WHERE status='online' AND last_seen_at > now() - interval '1 minute';`
  - Beliebte Pair‑Codes: `SELECT pair_code, COUNT(*) FROM presence_sessions GROUP BY pair_code ORDER BY COUNT(*) DESC;`

- **Voucher & Termine Dashboard**
  - Buchungen pro Tag: `SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM voucher_bookings GROUP BY day ORDER BY day DESC;`
  - Auslastung pro Template: Join `vouchers` mit `voucher_templates`.

- **Hypotheken Dashboard**
  - Offene Anträge, angenommene Angebote, durchschnittliche Zins‑Sätze.

- **Telbank Dashboard**
  - Summe In/Out pro Tag/Netzwerk/Währung.

Diese Queries können in Supabase‑Dashboards, Metabase, Grafana oder als einfache Admin‑Views im Portal verwendet werden.

---

### 3. Fees & Abrechnung

#### 3.1 Fee-Konfiguration

- **fees**
  - `id               text PK` – 'voucher.booking', 'transfer.logged', …
  - `scope            text` – 'voucher', 'transfer', 'room', 'mortgage'
  - `percentage       numeric(6,4)` – z. B. 0.02 für 2 %
  - `fixed_amount     bigint` – fixer Betrag in cents (optional)
  - `currency         text` – Standardwährung für fixe Fees
  - `active           boolean`
  - `meta             jsonb`

#### 3.2 Fee-Events & Settlements

- **fee_events**
  - `id               uuid PK`
  - `fee_id           text FK -> fees(id)`
  - `subject_type     text` – 'voucher_booking' | 'transfer' | …
  - `subject_id       text`
  - `amount_cents     bigint`
  - `currency         text`
  - `created_at       timestamptz`

- **settlements**
  - `id               uuid PK`
  - `beneficiary_id   uuid FK -> thinkers(id)` – wer bekommt die Fee (z. B. TogetherSystems‑Pfeiler)
  - `period_from      date`
  - `period_to        date`
  - `total_cents      bigint`
  - `currency         text`
  - `status           text` – 'open' | 'invoiced' | 'paid'
  - `created_at       timestamptz`

> Beispiel: Beim erfolgreichen `/api/voucher/book` wird:
> 1) Die Buchung geschrieben.
> 2) Aus `fees` der passende Eintrag (z. B. 'voucher.booking') geladen.
> 3) Ein `fee_events`‑Eintrag erzeugt (z. B. 2 % des Voucher‑Preises).
> 4) Später fasst ein Cron‑Job alle Fee‑Events zu einem `settlement` zusammen.

---

### 4. Migration von In-Memory zu DB (Schritt-für-Schritt)

1. **Tabellen anlegen**  
   - DDL in Postgres/Supabase oder D1 anlegen (siehe obige Tabellen).

2. **Backends umstellen**
   - `presence-api-server.js`: `Map` → Queries auf `thinkers` + `presence_sessions`.
   - `voucher-api-server.js`: Arrays `vouchers`, `bookings` → Tabellen `vouchers`, `voucher_bookings`.
   - `mortgage-api-server.js`: interne Maps → Tabellen `properties`, `mortgage_applications`, `mortgage_offers`, `mortgage_contracts`.
   - `functions/api/telbank/transfers.js`: `memoryStore` → Tabelle `transfers`.

3. **APIs stabil halten**
   - JSON‑Formate der Responses beibehalten (Feldnamen aus den Tabellen direkt spiegeln).
   - Nur interne Speicherung ändern, nicht die äußeren Routen.

4. **Monitoring aktivieren**
   - In jedem Endpunkt nach dem erfolgreichen Write zusätzlich einen `events`‑Eintrag erzeugen.
   - Optionale Export‑Pfade (`/api/admin/stats/...`) können reine SELECT‑Abfragen sein.

5. **Fees schichtweise einschalten**
   - Zuerst nur `fees`/`fee_events` füllen, aber keine echten Abbuchungen durchführen.
   - Nach Testphase `settlements` erstellen und im Portal‑Admin sichtbar machen.

Damit ist der Weg von der aktuellen Demo‑Infrastruktur (In‑Memory, Cloudflare‑Function, Node‑Server) zu einer stabilen,
abrechnungsfähigen Plattform klar und 1:1 in eine reale Datenbank übertragbar. 


