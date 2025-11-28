# Together Systems – Meta-Transaktionsportal

## Gesamtbericht: Architektur, Beispiel-Flow Hypothekenmarkt & Geschäftsmodell

---

## Inhaltsübersicht

1. Zielbild & Architektur von Together Systems
   - Identität ohne klassische Accounts
   - Komponenten-Überblick (Frontend, Core, Backend)
   - Auth-/Identitätsfluss im Detail
2. Beispielbereich: Hypotheken- & Immobilienfinanzierung
   - Rollen & Akteure
   - Endkunden-Flow (vom ersten Besuch bis zum Deal)
   - JSON-Strukturen (Voucher & weitere Objekte)
   - REST-API-Endpunkte
   - Wabenräume & Raum-IDs
   - Gebührenmodell für diesen Use Case
3. Business Model Canvas – Together Systems als Meta-Transaktionsportal
   - Customer Segments
   - Value Proposition
   - Channels
   - Customer Relationships
   - Revenue Streams
   - Key Resources
   - Key Activities
   - Key Partners
   - Cost Structure
4. Erweiterbarkeit auf weitere Verticals
5. Fazit

---

## 1. Zielbild & Architektur von Together Systems

### 1.1. Zielbild

Together Systems ist ein **Meta-Transaktionsportal**, in dem Nutzer:

- **ohne klassische Registrierung** (kein E-Mail-Login, kein Passwort)
- mit **automatischer Identifizierung pro Browser/Manifest**
- in **Räumen (Waben)** miteinander in Kontakt treten,
- **Verträge und Vouchers** als JSON-Objekte austauschen und
- über angebundene **APIs und Signaling-Server** echte Geschäfte abwickeln können.

Dabei gilt:

- Die **Offline-Manifest-Datei** ist der „heilige Startpunkt“ und liefert die erste Verifikation.
- Das **Online-Portal** erkennt den Browser automatisch wieder.
- Die **Wabenräume** bilden die Raumlogik (Treffpunkte, Verhandlungsräume, Live-Sessions).
- Der **Legal-Hub** verknüpft Verträge, AGBs, Signaturen und archivierte Dokumente.

Ziel ist ein vollautomatisiertes System, in dem:

- `userId` einmalig lokal erzeugt wird,
- der Verifizierungsstatus durch das Offline-Manifest bestätigt wird,
- alle Links / Räume / API-Calls / WSS-Verbindungen **automatisch** die Identität mitführen,
- der User **nur noch kommuniziert und Entscheidungen trifft** – keine manuellen Registrierungen.

---

### 1.2. Komponenten-Überblick

#### Frontend (alles im Browser)

- **Portal-Start.html**  
  Einstieg, Dashboard, Daten-Übersicht, Berichte.

- **manifest-forum.html (Offline Manifest / Beiträge)**  
  Offline-Datenbank im Browser (localStorage), zum Erstellen von Beiträgen, Verträgen, Definitionsobjekten (z. B. Voucher-Typen, Produktbeschreibungen).

- **manifest-portal.html (Online-Portal)**  
  Online-Ansicht mit Feed, Live-Funktionen, Voucher- und Termindarstellung, Anbindung an APIs.

- **honeycomb.html (Wabenräume)**  
  Visuelle Raumlogik (A-1, B-2, …), jeder Raum kann einer Transaktion, einem Product-Cluster, einer Immobilie oder einem Event zugeordnet werden.

- **legal-hub.html (optional)**  
  Visualisiert Verträge, Signaturen, archivierte Vereinbarungen, Standardvertrags-Templates.

#### Shared Frontend-Core: `mot-core.js`

Dieses Modul wird in alle oben genannten HTML-Seiten eingebunden und stellt zentrale Funktionen bereit:

- **User-Identität**
  - `localStorage.mot_user_id_v1` – zufällig generierte, stabile User-ID pro Browser.
  - Option: `mot_device_keypair` (Public/Private-Key für Signaturen).

- **Verifikationslogik**
  - Auswertung des URL-Hashes `#mot=...&uid=...&ts=...&sig=...`.
  - Vergleich der HMAC-Signatur mit dem Shared Secret.
  - Persistenz des Verifizierungsstatus in `localStorage.mot_verified_v1`.

- **Hilfsfunktionen**
  - `getUserContext()` → `{ uid, verified }`.
  - `parseHashParams()` → Hash-Parameter aus URL.
  - Hilfen zum Erzeugen verifizierter Links (z. B. `#wabe=cell-7&uid=...`).
  - Optionale API- & WSS-Helfer für einheitliches Anhängen von `uid`.

#### Backend-Komponenten

- **Manifest API (REST)**
  - `GET /api/manifest/list` – Beiträge/Objekte (z. B. Posts, Voucher, Verträge) laden.
  - `POST /api/manifest/submit` – Beiträge/Objekte aus dem Offline-Manifest ins Backend übertragen.

- **Domänenspezifische APIs**
  - z. B. `POST /api/voucher/issue`, `GET /api/voucher/list`, `POST /api/hypotheken/anfrage` usw.

- **Signaling-Server (WSS)**
  - z. B. `wss://signaling.deine-seite.tld`.
  - Rooms: `honeycomb:cell-7`, `deal:XYZ`, `mortgage:HOUSE-123`, etc.
  - Verteilt Nachrichten (Chat, WebRTC-Signaling, Event-Updates) an alle Clients im gleichen Raum.

- **Optional: File Storage**
  - S3-/MinIO-kompatible Speicher für PDFs, gescannte Dokumente, signierte Verträge.

#### Identität

- Keine klassischen Accounts
  - Keine E-Mail-Verifikation, kein Passwort-Login.

- Identität = Kombination aus:
  - `localStorage.mot_user_id_v1` (zufällige, stabile ID pro Browser),
  - optionalem `mot_device_keypair` (für kryptografische Signaturen),
  - HMAC-Verifikation über das Offline-Manifest (einmalige „Einführung“ ins System).

---

### 1.3. Auth-/Identitätsfluss

#### 1.3.1. Erste Benutzung (Offline-Manifest)

1. User öffnet `manifest-forum.html` lokal.
2. Script prüft: existiert `localStorage.mot_user_id_v1`?
   - Wenn **nein** → neue `userId` generieren (z. B. 128-Bit Random, Base62/Base58 codiert).
   - Optional: zusätzlich Schlüsselpaar (Public/Private Key) erzeugen und lokal speichern.
3. User ist damit **lokal eindeutig bekannt**, aber noch nicht im Online-Portal verifiziert.

#### 1.3.2. „Portal öffnen (verifiziert)“

Beim Klick auf einen Button im Offline-Manifest:

- Das Manifest kennt einen gemeinsamen Token `MOT_ACCESS_TOKEN`.
- Es erzeugt einen signierten Link:

```text
ts   = Date.now()
mot  = MOT_ACCESS_TOKEN
uid  = mot_user_id_v1
base = mot + "." + uid + "." + ts
sig  = HMAC-SHA256(base, MOT_SHARED_SECRET)

URL: manifest-portal.html#mot=...&uid=...&ts=...&sig=...
```

#### 1.3.3. Online-Portal: Verifikation

Beim Laden von `manifest-portal.html`:

1. Hash-Parameter `mot`, `uid`, `ts`, `sig` werden ausgelesen.
2. Überprüfung:
   - `ts` ist nicht älter als z. B. 5 Minuten.
   - `sig == HMAC-SHA256(mot + "." + uid + "." + ts, MOT_SHARED_SECRET)`.
3. Wenn gültig:
   - `localStorage.mot_user_id_v1 = uid` (falls nicht vorhanden).
   - `localStorage.mot_verified_v1 = { mot, uid, ts, sig }`.
   - interner Zustand: `verified = true`.

#### 1.3.4. Spätere Besuche ohne Hash

Kommt der User später erneut ins Online-Portal (ohne Hash):

- Das Portal liest `localStorage.mot_verified_v1` und `mot_user_id_v1`.
- Wenn vorhanden und akzeptabel (z. B. nicht abgelaufen oder per Policy gültig):
  - `verified = true`.

Ergebnis:

- Das **Offline-Manifest** ist der einzige Ort, an dem die initiale Verifikation stattfindet.
- Danach läuft alles über **localStorage + HMAC-Signatur** vollautomatisiert.

---

## 2. Beispielbereich: Hypotheken- & Immobilienfinanzierung

Wir wählen den Bereich **Hypothekenmarkt / Immobilienfinanzierung** als Beispiel und bauen darauf:

- einen **kompletten Flow**,
- konkrete **JSON-Strukturen (Voucher & Objekte)**,
- **API-Endpunkte**,
- **Wabenräume**,
- ein **Gebührenmodell**.

### 2.1. Rollen & Akteure

- **Kreditnehmer (Borrower)**
  - Privatperson oder Unternehmen, das eine Immobilie finanzieren will.

- **Kreditgeber / Bank / FinTech (Lender)**
  - Stellt Hypothekenangebote, prüft Bonität, schließt Kreditverträge.

- **Investoren** (optional)
  - Kaufen Anteile an Hypotheken (Tranches) oder Refinanzierungspapieren.

- **Gutachter / Makler / Notare / Legal**
  - Beteiligt an der Wertermittlung, Vertragsgestaltung, Beurkundung.

- **Together Systems Portal**
  - Meta-Ebene: Identität, Räume, Kommunikation, Dokumentation.
  - Kein zwingender Kreditgeber – kann aber White-Label-Technologie für Banken sein.

---

### 2.2. Endkunden-Flow (Borrower) – vom ersten Besuch bis zum Deal

1. **Erstkontakt**
   - User öffnet das Portal (z. B. `Portal-Start.html` oder `manifest-portal.html`).
   - Wenn er über das Offline-Manifest kommt → verifizierte Sitzung.

2. **Objekt-Erfassung**
   - User erfasst Daten zu Immobilie und Bedarf:
     - Adresse, Typ (Haus, Wohnung, etc.), Kaufpreis, Eigenkapital, gewünschte Laufzeit, etc.
   - Diese Daten werden zunächst **lokal im Manifest** gespeichert.

3. **Anfrage als Voucher/Objekt**
   - Aus den lokalen Daten erzeugt das Manifest ein **Hypothekenanfrage-Objekt** (`MortgageApplication`) und optional einen **Anfrage-Voucher** („Recht auf Angebote zu erhalten“).
   - Dieses Objekt wird über `POST /api/hypotheken/anfrage` an die API gesendet.

4. **Banken/FinTechs antworten mit Angeboten**
   - Kreditgeber erhalten die Anfrage (intern via Matching/Rules).
   - Sie erstellen **Hypothekenangebot-Voucher** (`MortgageOfferVoucher`) mit Konditionen.
   - Diese werden über `POST /api/hypotheken/angebot` im System registriert und dem Borrower zugeordnet.

5. **Vergleich & Verhandlung**
   - Im Portal sieht der Borrower alle Angebote strukturiert:
     - Zins, Tilgung, Laufzeit, Nebenkosten.
   - Zu jedem Angebot existiert ein **Wabenraum** – z. B. `mortgage:offer:O-2025-0001` – für Nachfragen, Chat, Video, Dokumentenaustausch.

6. **Auswahl & Vorvertrag**
   - Borrower wählt ein Angebot aus und akzeptiert den **Offer-Voucher**.
   - Zustand wechselt zu `accepted`, ein **Vertrags-Voucher** (z. B. `MortgageContractVoucher`) wird generiert.
   - In einem weiteren Wabenraum (z. B. `mortgage:contract:HOUSE-123`) werden Vertragsdetails finalisiert.

7. **Bonitäts- & Identprüfung** (KYC/AML)
   - Technisch läuft dies über weitere Dokumente/Prozesse im gleichen Portal/Wabenraum.
   - Formal (rechtlich) liegt Verantwortung bei Bank/FinTech; Together Systems stellt nur die Infrastruktur.

8. **Finale Beurkundung / Notar**
   - Rechtlich verbindliche Unterzeichnung erfolgt ggf. beim Notar oder über qualifizierte eSign-Dienste.
   - Legal-Hub verknüpft Dokumente, Protokolle, Wabenraum-ID und Voucher-ID.

9. **Nachlauf / Service**
   - Spätere Änderungen (Sondertilgung, Umschuldung) können wieder über Voucher und Wabenräume gemanagt werden.

---

### 2.3. JSON-Strukturen

Im Folgenden exemplarische JSON-Strukturen. Sie sind bewusst generisch, damit sie auf unterschiedliche Rechtsräume adaptierbar sind.

#### 2.3.1. Objekt: Immobilie (`Property`)

```json
{
  "propertyId": "house-123",
  "ownerUid": "user-abc",        
  "type": "single-family-house", 
  "address": {
    "street": "Musterstraße 1",
    "zip": "12345",
    "city": "Musterstadt",
    "country": "DE"
  },
  "purchasePrice": {
    "amount": 45000000,
    "currency": "EUR"
  },
  "ownCapital": {
    "amount": 9000000,
    "currency": "EUR"
  },
  "meta": {
    "livingAreaSqm": 140,
    "plotSizeSqm": 380,
    "yearBuilt": 1998
  }
}
```

#### 2.3.2. Objekt: Hypothekenanfrage (`MortgageApplication`)

```json
{
  "applicationId": "app-2025-0001",
  "borrowerUid": "user-abc",
  "propertyId": "house-123",
  "desiredLoan": {
    "amount": 36000000,
    "currency": "EUR"
  },
  "desiredDurationYears": 20,
  "desiredRateType": "fixed",
  "maxInterestRate": 0.04,
  "submissionTs": "2025-02-01T10:15:00Z",
  "status": "open",               
  "visibility": "private",        
  "meta": {
    "employmentStatus": "employee",
    "netIncomeMonthly": 380000,
    "otherLoans": []
  }
}
```

#### 2.3.3. Voucher: Hypothekenangebot (`MortgageOfferVoucher`)

```json
{
  "voucherId": "mort-offer-2025-0001",
  "type": "mortgage-offer",
  "applicationId": "app-2025-0001",
  "issuerId": "bank-xyz",      
  "holderUid": "user-abc",     
  "status": "offered",         

  "loan": {
    "amount": 36000000,
    "currency": "EUR"
  },
  "interest": {
    "nominalRate": 0.032,
    "effectiveRate": 0.0335,
    "fixedYears": 15
  },
  "repayment": {
    "initialRate": 0.02,
    "specialPaymentsAllowed": true,
    "specialPaymentMaxPerYear": 500000
  },
  "fees": {
    "processingFee": 60000,
    "valuationFee": 30000,
    "otherFees": []
  },

  "validity": {
    "validFrom": "2025-02-01T12:00:00Z",
    "validUntil": "2025-02-10T23:59:59Z"
  },

  "termsRef": "https://bank-xyz.de/terms/mortgage-standard-v1.pdf",

  "roomRefs": {
    "negotiationRoomId": "mortgage:offer:mort-offer-2025-0001",
    "contractRoomId": null
  }
}
```

#### 2.3.4. Optional: Hypotheken-Tranche für Investoren (`MortgageTrancheVoucher`)

```json
{
  "voucherId": "mort-tranche-2025-0001-A",
  "type": "mortgage-tranche",
  "underlyingOfferId": "mort-offer-2025-0001",
  "issuerId": "bank-xyz",
  "holderUid": null,
  "status": "offered",

  "nominalAmount": {
    "amount": 1000000,
    "currency": "EUR"
  },
  "expectedYield": 0.028,
  "riskClass": "A",
  "durationYears": 10,

  "validity": {
    "validFrom": "2025-02-02T00:00:00Z",
    "validUntil": "2025-03-01T23:59:59Z"
  },

  "roomRefs": {
    "investorRoomId": "mortgage:tranche:mort-tranche-2025-0001-A"
  }
}
```

#### 2.3.5. Vertrags-Voucher (`MortgageContractVoucher`)

```json
{
  "voucherId": "mort-contract-2025-0001",
  "type": "mortgage-contract",
  "applicationId": "app-2025-0001",
  "offerVoucherId": "mort-offer-2025-0001",
  "lenderId": "bank-xyz",
  "borrowerUid": "user-abc",

  "status": "draft",           
  "signedByBorrower": false,
  "signedByLender": false,
  "signedByNotary": false,

  "documentRefs": {
    "draftPdf": "s3://contracts/drafts/mort-contract-2025-0001.pdf",
    "signedPdf": null
  },

  "roomRefs": {
    "contractRoomId": "mortgage:contract:mort-contract-2025-0001"
  }
}
```

---

### 2.4. REST-API-Endpunkte (Beispiel-Design)

Die folgenden Endpunkte illustrieren, wie das Backend mit dem Frontend (Manifest & Portal) spricht.

#### 2.4.1. Hypothekenanfrage anlegen

`POST /api/hypotheken/anfrage`

- **Headers**: `X-MOT-User: <uid>`
- **Body**: `MortgageApplication`

**Response (vereinfacht)**

```json
{
  "ok": true,
  "applicationId": "app-2025-0001"
}
```

#### 2.4.2. Hypothekenanfragen des Borrowers abrufen

`GET /api/hypotheken/anfrage/list?role=borrower`

- liest `X-MOT-User` und liefert alle Anfragen dieses Nutzers.

```json
{
  "applications": [
    { "applicationId": "app-2025-0001", "status": "open", ... }
  ]
}
```

#### 2.4.3. Angebote (Vouchers) für eine Anfrage anlegen (Bank-Seite)

`POST /api/hypotheken/angebot`

- **Headers**: `X-MOT-User: bank-xyz`
- **Body**: `MortgageOfferVoucher`

```json
{
  "ok": true,
  "voucherId": "mort-offer-2025-0001"
}
```

#### 2.4.4. Angebote für einen Borrower auflisten

`GET /api/hypotheken/angebot/list?applicationId=app-2025-0001`

```json
{
  "offers": [
    { "voucherId": "mort-offer-2025-0001", "status": "offered", ... }
  ]
}
```

#### 2.4.5. Angebot annehmen (Offer-Voucher → Contract-Voucher)

`POST /api/hypotheken/angebot/accept`

**Body**

```json
{
  "voucherId": "mort-offer-2025-0001"
}
```

**Server-Logik**

- Prüft:
  - noch gültig (`validUntil` nicht überschritten),
  - Status = `offered`,
  - gehört zu diesem Borrower.
- Erzeugt `MortgageContractVoucher` mit Status `draft`.

**Response**

```json
{
  "ok": true,
  "contractVoucherId": "mort-contract-2025-0001"
}
```

#### 2.4.6. Vertragsstatus aktualisieren (Signatur-Events)

`POST /api/hypotheken/vertrag/update-status`

```json
{
  "contractVoucherId": "mort-contract-2025-0001",
  "action": "signed-by-borrower"
}
```

Der Server setzt intern Flags (`signedByBorrower`, `signedByLender`, etc.) und speichert ggf. signierte PDFs.

#### 2.4.7. Tranche-Voucher für Investoren bereitstellen (optional)

`POST /api/hypotheken/tranche/issue`

```json
{
  "underlyingOfferId": "mort-offer-2025-0001",
  "nominalAmount": { "amount": 1000000, "currency": "EUR" },
  "expectedYield": 0.028,
  "riskClass": "A",
  "durationYears": 10
}
```

Response mit `voucherId` etc. Analog: `GET /api/hypotheken/tranche/list`.

---

### 2.5. Wabenräume & Raum-IDs

Die Wabenräume sind die **visuelle und logische Klammer** um alle Transaktionsschritte.

#### 2.5.1. Raumkonventionen

- **Property-Raum**: `mortgage:property:<propertyId>`
  - Nutzung: allgemeine Infos, Exposé, Rückfragen, Besichtigungsorganisation.

- **Anfrage-Raum**: `mortgage:application:<applicationId>`
  - Nutzung: Rückfragen der Bank, Upload von Unterlagen, Live-Call zwischen Borrower & Bank.

- **Angebots-Raum**: `mortgage:offer:<voucherId>`
  - Pro konkretem Angebot; Detailverhandlungen, Feintuning.

- **Vertrags-Raum**: `mortgage:contract:<contractVoucherId>`
  - Letzte Abstimmungen, Vertragslesung, Signatur-Prozess, Notar-Terminkoordination.

- **Investor-Raum** (optional): `mortgage:tranche:<trancheVoucherId>`
  - Diskussion zwischen Bank und Investoren über die Konditionen der Tranche.

Jeder dieser Räume kann physisch auf **honeycomb.html** abgebildet werden:

- Entweder per 
  - fixer Zuordnung: eine bestimmte Wabe (A-1, A-2, …) steht für eine Immobilie,
  - oder dynamisch: Waben werden pro Deal zugewiesen.

Die Links sehen dann z. B. so aus:

```text
https://portal.together-systems.com/honeycomb.html#wabe=A-2&roomId=mortgage:offer:mort-offer-2025-0001&uid=<borrowerUid>
```

Das JavaScript in `honeycomb.html` liest `roomId` und `uid` aus dem Hash, markiert die Wabe, stellt per WSS die Verbindung her und zeigt Chat/Video/Signaling an.

---

### 2.6. Gebührenmodell für den Hypotheken-Use-Case

Ziel: **Endnutzer (Borrower) zahlen nichts**, Einnahmen kommen überwiegend von Banken/Investoren und ggf. Dienstleistern.

Mögliche Komponenten:

1. **Plattformgebühr pro abgeschlossenem Kredit**
   - z. B. **0,2–1,0 %** des Kreditvolumens,
   - wird von der Bank an Together Systems gezahlt.

2. **Gebühr pro Investor-Tranche (optional)**
   - pro platzierter Tranche eine kleine Fee (z. B. 0,1–0,3 % des Nominalbetrags).

3. **White-Label-Lizenzen**
   - Banken/FinTechs, die die gesamte Plattform unter eigener Marke nutzen, zahlen
     - Setup-Gebühr,
     - monatliche SaaS-Lizenz,
     - optional Support & SLA.

4. **Premium-Funktionen**
   - Erweiterte Reporting- & Analytics-Funktionen für Banken und Investoren:
     - Dashboard für Konversionsraten,
     - Pipeline-Management,
     - Risiko-Heatmaps.

5. **Partner-Fees**
   - Makler, Notare, Gutachter können über die Plattform angebunden werden.
   - Bei erfolgreichen Vermittlungen erhält Together Systems eine Vermittlungsgebühr.

---

## 3. Business Model Canvas – Together Systems als Meta-Transaktionsportal

In diesem Abschnitt beschreiben wir Together Systems mit den klassischen 9 Bausteinen des Business Model Canvas.

### 3.1. Customer Segments (Kundensegmente)

1. **B2B – Finanzinstitute & FinTechs**
   - Banken, Versicherer, Hypothekenvermittler, Leasinggesellschaften.
   - Nutzen das Portal als **Frontdoor** für Beratungen, Angebote und Vertragsabschlüsse.

2. **B2B – Dienstleister & lokale Geschäfte**
   - Coaches, Berater, Ärzte, Handwerker, Werkstätten, Agenturen, Kanzleien.
   - Nutzen das System für Termin-Geschäfte, Paketangebote und laufende Betreuung.

3. **B2B – Plattformen & Online-Shops**
   - Große Marktplätze, E-Commerce-Händler, SaaS-Anbieter.
   - Nutzen Together Systems als **Meta-Layer** für Verhandlungen, B2B-Deals, Sammelbestellungen.

4. **B2B – Industriekunden & Logistiker**
   - Produktionsunternehmen, Speditionen, Maschinenverleiher.
   - Nutzen das System als Kapazitäts- und Zeitbörsen (Maschinenzeit, Lager, Transport).

5. **Endnutzer / Prosumer**
   - Privatpersonen, die Hypotheken, Beratung, Services, Produkte anfragen.
   - Profitieren von **accountloser Nutzung** und einem zentralen Kommunikations- & Vertragsraum.

---

### 3.2. Value Proposition (Werteversprechen)

1. **Accountlose Nutzung – „einfach Browser öffnen und loslegen“**
   - Keine Registrierungshürde.
   - Identität kommt aus dem Offline-Manifest + Browser.

2. **Einheitliche Transaktionslogik über alle Branchen**
   - Voucher + Räume + Legal-Hub bilden ein universelles Muster:
     - Zeitbasierte Leistungen,
     - finanzielle Verpflichtungen,
     - Lieferrechte,
     - Lizenzrechte.

3. **Local-first Datenhaltung & Transparenz**
   - Nutzer behalten Kontrolle über ihre Daten.
   - Nichts wird heimlich synchronisiert.
   - Export/Backup als JSON/HTML/PDF jederzeit möglich.

4. **Nahtlose Verbindung von Kommunikation & Vertrag**
   - Wabenräume (= Kommunikationsräume) sind direkt mit Vouchers/Verträgen verknüpft.
   - Keine Trennung zwischen „Chat hier“ und „Vertrag irgendwo im E-Mail-Anhang“.

5. **White-Label-fähige Infrastruktur**
   - Unternehmen können das System mit eigenem Branding nutzen.
   - Integration in bestehende Backends/Signaling-Server/APIs.

6. **Skalierbarer Geschäftsmodell-Baukasten**
   - Von Hypotheken bis Maschinenzeit, von Coaching bis Großhandel – alles auf denselben Grundbausteinen.

---

### 3.3. Channels (Kanäle)

1. **Direkter Zugriff über Web**
   - Portal-Startseite, Manifest-Forum, Honeycomb.

2. **White-Label-Portale**
   - Banken, Plattformen, Händler bekommen eigene Domains/Frontends auf derselben Engine.

3. **Integrationen & APIs**
   - REST-APIs und WSS für Einbindung in bestehende Systeme (CRM, ERP, Banking-Backends).

4. **Partnernetzwerk**
   - Kooperationen mit FinTechs, Payment-Anbietern, Marktplätzen.

5. **Developer-Ökosystem**
   - Dokumentation & SDKs für Dritte, die eigene Verticals/Flows auf Together Systems bauen wollen.

---

### 3.4. Customer Relationships (Kundenbeziehungen)

1. **Self-Service für Endnutzer**
   - Klarer, intuitiver Einstieg über Offline-Manifest & Portal-Start.
   - Hilfetexte, Wizard-ähnliche Flows (z. B. Hypotheken-Assistent, Termin-Assistent).

2. **Account-Management & Support für B2B-Kunden**
   - Persönliche Ansprechpartner für Banken, Plattformen, große Händler.
   - Onboarding-Workshops, Integrationssupport.

3. **Community & Feedback-Kanäle**
   - Feedbackräume als Waben für Power-User & Partner.

4. **SLAs & Premium-Support**
   - Für große B2B-Kunden garantierte Reaktionszeiten, Betriebs-SLAs, eigene Staging-Umgebungen.

---

### 3.5. Revenue Streams (Einnahmequellen)

1. **Transaktionsgebühren (B2B)**
   - z. B. pro vermitteltem Kredit, abgeschlossener Versicherung, verkaufter Tranche, gebuchtem Kapazitätsslot.

2. **SaaS-Lizenzen (White-Label)**
   - Monatliche Gebühren pro Organisation/Marke/Instanz.
   - Preisstaffel je nach Useranzahl, Transaktionsvolumen oder Feature-Set.

3. **Premium-Module**
   - Analytics-Modul,
   - Export-/Integrationsmodule (z. B. Buchhaltung, CRM, BI),
   - erweiterte Sicherheits- und Compliance-Funktionen.

4. **Partner- & Referral-Fees**
   - Umsatzbeteiligung durch angebundene Payment-, KYC-, Signatur- und Plattformpartner.

5. **Custom Projects & Consulting**
   - Implementierung spezieller Workflows für große Kunden,
   - Migrationsprojekte von bestehenden Legacy-Systemen auf Together Systems.

---

### 3.6. Key Resources (Schlüsselressourcen)

1. **Technologische Plattform**
   - Frontend-Module (Manifest, Portal, Honeycomb, Legal-Hub).
   - Shared Core (`mot-core.js`) für Identität, Verifikation, API/WSS-Integration.
   - Backend-Services (APIs, Signaling, Storage).

2. **Architektur-Know-how**
   - Design von generischen Vouchern, Raumlogiken, Vertragsworkflows.

3. **Rechtliches & Compliance-Wissen**
   - Gestaltung der Schnittstellen zu regulierten Partnern (Banken, Versicherern).

4. **Partnernetzwerk**
   - FinTechs, Payment-Provider, Notare, Kanzleien, Marktplätze.

5. **Marke & Community**
   - Vertrauen in „Together Systems“ als faire, offene und möglichst neutrale Meta-Plattform.

---

### 3.7. Key Activities (Schlüsselaktivitäten)

1. **Plattform-Entwicklung & Betrieb**
   - Weiterentwicklung der Frontend-Module, APIs, Signaling-Infrastruktur.
   - Betrieb, Monitoring, Skalierung.

2. **Domänenspezifische Template-Entwicklung**
   - Hypotheken-Templates,
   - Termin-/Voucher-Templates für Services,
   - Maschinen-/Kapazitäts-Templates etc.

3. **Partner-Integration & Support**
   - Anbindung neuer Banken, Shops, Plattformen.
   - Integrationstests, Zertifizierungen.

4. **Sicherheit & Datenschutz**
   - Hardening, Verschlüsselung, Auditing, Datenschutzkonzepte.

5. **Business Development**
   - Identifikation neuer Verticals, Go-to-Market-Strategien, Kooperationsmodelle.

---

### 3.8. Key Partners (Schlüsselpartner)

1. **Finanzinstitute & FinTechs**
   - Banken, Versicherer, Hypothekenvermittler, Trading-Plattformen.

2. **Technologie-Partner**
   - Cloud-Anbieter (Hosting, Storage),
   - Payment-Provider,
   - WebRTC/Signaling-Plattformen.

3. **Juristische Partner**
   - Kanzleien, Notare, Legal-Tech-Anbieter.

4. **Branchen-Plattformen & Verbände**
   - Immobilienverbände, Händlerverbände, SaaS-Communities.

5. **Implementierungspartner**
   - Agenturen, Integratoren, Systemhäuser, die Together Systems beim Kunden einführen.

---

### 3.9. Cost Structure (Kostenstruktur)

1. **Technologie & Infrastruktur**
   - Serverkosten (APIs, WSS, Storage),
   - Entwicklungs- und Testumgebungen,
   - Monitoring & Logging.

2. **Personal**
   - Entwicklung (Frontend, Backend, DevOps),
   - Produkt & UX,
   - Vertrieb, Partner-Management,
   - Support & Operations.

3. **Compliance & Rechtliches**
   - Rechtsberatung, Gutachten, Zertifizierungen.

4. **Marketing & Vertrieb**
   - Website, Content, Konferenzen, Partnerprogramme.

5. **Allgemeine Verwaltungskosten**
   - Office, Tools, Versicherungen, Buchhaltung.

---

## 4. Erweiterbarkeit auf weitere Verticals

Die gewählte Architektur – **Identität + Voucher + Wabenräume + Legal-Hub** – ist bewusst generisch.

Das bedeutet:

- Ein Hypothekenvoucher kann durch einen **Fahrzeugfinanzierungs-Voucher** ersetzt werden, ohne die Core-Logik zu ändern.
- Ein Termin-Voucher für einen **Coaching-Call** funktioniert technisch identisch wie ein Slot-Voucher für eine **CNC-Maschine**.
- Ein Lizenz-Voucher für **Software/Content/IP** kann denselben Lebenszyklus haben wie ein Ticket-Voucher für ein **Event**.

Beispiele für weitere Verticals, die auf derselben Struktur aufsetzen:

- Fahrzeug-Ankauf & Finanzierung
- Maschinen- und Kapazitätsbörsen
- Beratungs- & Coaching-Plattformen
- B2B-Beschaffung & Sammelbestellungen (Demand Aggregation)
- Events & Memberships
- Notar-ähnliche Vertrags-Workflows und Legal-Tech-Angebote

Jeder neue Bereich benötigt primär:

1. Ein **JSON-Schema für den jeweiligen Voucher-Typ**.
2. Eine Handvoll **spezifischer API-Endpunkte**.
3. Eine sinnvolle **Wabenraum-Topologie** (z. B. pro Deal, pro Objekt, pro Event).
4. Ein eigenes **Preis-/Gebührenmodell**.

Alles andere – Identität, Verifikation, Speicher, Live-Kommunikation – ist bereits durch Together Systems abgedeckt.

---

## 5. Fazit

Dieser Bericht fasst Together Systems als **Meta-Transaktionsportal** zusammen, das:

- ohne klassische Accounts auskommt,
- Identität und Verifikation über das Offline-Manifest und `mot-core.js` organisiert,
- mit Wabenräumen eine intuitive Raumlogik für Kommunikation und Transaktionen bereitstellt,
- mit Vouchern & JSON-Strukturen ein universelles Muster für Geschäfte (Zeit, Geld, Rechte) bildet,
- über APIs & WSS sowohl Offline- als auch Online-Komponenten miteinander verbindet,
- sich auf unterschiedliche Branchen skalieren lässt – vom Hypothekenmarkt bis zum Maschinenbau.

Der detaillierte Hypotheken-Flow zeigt exemplarisch, wie aus diesen Bausteinen ein vollständiges, marktreifes Geschäftsmodell entstehen kann – inklusive:

- klarer JSON-Datenmodelle,
- konkreter API-Endpunkte,
- definierter Wabenräume,
- sowie eines monetarisierbaren Gebührenmodells.

Das Business Model Canvas ordnet diese technische Architektur in einen betriebswirtschaftlichen Rahmen ein und zeigt, wie Together Systems als **Kern-Infrastruktur für zahlreiche digitale Geschäftsmodelle** dienen kann – mit freiem Zugang für Endnutzer, starker B2B-Monetarisierung und hoher Flexibilität für zukünftige Verticals.


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
