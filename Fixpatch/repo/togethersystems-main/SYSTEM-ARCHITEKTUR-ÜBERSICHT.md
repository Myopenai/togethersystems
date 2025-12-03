# System-Architektur-Übersicht – Together Systems

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**BRANDING:** Together Systems – International TTT  
**VERSION:** 1.0.0  
**DATUM:** 2025-01-15

---

## 🏗️ GESAMTARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Portal  │  │ Manifest │  │Dashboard │  │  SUOS     │  │
│  │          │  │  Forum   │  │          │  │  System   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Telbank  │  │  Source  │  │Laboratory│  │  Legal   │  │
│  │          │  │  Code    │  │          │  │  Hub     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Presence │  │ Telbank  │  │ Manifest │  │  Auth    │  │
│  │   API    │  │   API    │  │   API    │  │  API     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Cloudflare│  │Cloudflare│  │Cloudflare│  │Cloudflare│  │
│  │ Workers  │  │    D1    │  │    R2    │  │   CDN    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              VERSCHLÜSSELUNGS-LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │AES-256- │  │ Ed25519  │  │HMAC-SHA256│  │  PBKDF2  │  │
│  │  GCM    │  │          │  │           │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 KOMPONENTEN-ÜBERSICHT

### Frontend-Komponenten
```javascript
{
  "portal": {
    "file": "index.html",
    "purpose": "Hauptportal",
    "features": ["Navigation", "Übersicht", "Links"]
  },
  "manifest-forum": {
    "file": "manifest-forum.html",
    "purpose": "Offline Forum",
    "features": ["Lokale Speicherung", "Export/Import", "Rich Media"]
  },
  "manifest-portal": {
    "file": "manifest-portal.html",
    "purpose": "Online Portal",
    "features": ["API-Integration", "Live-Updates", "Verifikation"]
  },
  "encryption-dashboard": {
    "file": "encryption-dashboard.html",
    "purpose": "Verschlüsselungs-Verwaltung",
    "features": ["Versionierung", "Supermarktleistungsschlüssel", "Statistiken"]
  },
  "suos-system": {
    "file": "suos-braintext-system.html",
    "purpose": "SUOS-offene Code-Bereitstellung",
    "features": ["Ein-Schlüssel-Freischaltung", "Entschlüsselung", "Quittung"]
  },
  "source-code-fach": {
    "file": "source-code-fach.html",
    "purpose": "Producer-Zugriff",
    "features": ["Code-Anzeige", "Download", "Verifikation"]
  },
  "laboratory": {
    "file": "encryption-laboratory.html",
    "purpose": "Forschungs-Labor",
    "features": ["Experimentelle Verschlüsselungen", "Zugang-Anfrage"]
  },
  "telbank": {
    "file": "TELBANK/index.html",
    "purpose": "TPGA Telbank",
    "features": ["MetaMask-Integration", "Transfers", "Liquiditäts-Management"]
  }
}
```

### Backend-Komponenten
```javascript
{
  "presence-api": {
    "file": "functions/api/presence/verify.js",
    "endpoint": "/api/presence/verify",
    "method": "POST",
    "purpose": "Token-Verifikation",
    "features": ["HMAC-SHA256", "Thinker-ID-Generierung", "Presence-Update"]
  },
  "telbank-api": {
    "file": "functions/api/telbank/transfers.js",
    "endpoint": "/api/telbank/transfers",
    "methods": ["GET", "POST"],
    "purpose": "Transfer-Verwaltung",
    "features": ["Transfer-Erstellung", "Transfer-Liste", "Status-Updates"]
  }
}
```

### Datenbank-Komponenten
```sql
{
  "presence": {
    "table": "presence",
    "columns": ["thinker_id", "token", "pair_code", "status", "last_seen", "room_id"],
    "purpose": "User-Präsenz",
    "indexes": ["thinker_id (PRIMARY)", "token"]
  },
  "transfers": {
    "table": "transfers",
    "columns": ["id", "flow", "amount", "currency", "from_address", "to_address", "status", "created_at", "updated_at"],
    "purpose": "Telbank-Transfers",
    "indexes": ["id (PRIMARY)", "created_at"]
  },
  "manifest_posts": {
    "table": "manifest_posts",
    "columns": ["id", "user_id", "title", "content", "media_urls", "created_at", "updated_at"],
    "purpose": "Manifest-Beiträge",
    "indexes": ["id (PRIMARY)", "user_id", "created_at"]
  }
}
```

---

## 🔄 DATENFLUSS

### User-Authentifizierung
```
User → Token generieren → HMAC-SHA256 → API → Verifikation → Thinker-ID → Presence Update
```

### Verschlüsselung
```
User-Key → PBKDF2 → AES-Key → AES-256-GCM → Verschlüsseltes Modul → Manifest → Signatur (Ed25519)
```

### Entschlüsselung
```
User-Key → PBKDF2 → AES-Key → Manifest laden → Signatur prüfen → AES-256-GCM → Entschlüsseltes Modul
```

### Transfer-Prozess
```
User → Transfer-Formular → API → Datenbank → Status Update → Response
```

---

## 🔐 SICHERHEITS-ARCHITEKTUR

### Verschlüsselungs-Ebenen
```
Layer 1: User-Key (Input)
    ↓
Layer 2: PBKDF2 Key Derivation (200.000 Iterationen)
    ↓
Layer 3: AES-256-GCM Verschlüsselung
    ↓
Layer 4: Ed25519 Signatur (Producer)
    ↓
Layer 5: Manifest (Metadaten + Signatur)
```

### Authentifizierungs-Ebenen
```
Layer 1: Token-Generierung (localStorage)
    ↓
Layer 2: HMAC-SHA256 Signatur
    ↓
Layer 3: API-Verifikation
    ↓
Layer 4: Thinker-ID-Generierung
    ↓
Layer 5: Presence-Update
```

---

## 📊 STORAGE-ARCHITEKTUR

### LocalStorage-Struktur
```javascript
{
  "mot_user_id_v1": "user-id-string",
  "mot_device_keypair": "ed25519-keypair (optional)",
  "activationReceipt": "receipt-json",
  "supermarketKey": "key-json",
  "console-logs": "logs-array"
}
```

### Datenbank-Struktur
```sql
-- Presence
presence (thinker_id PRIMARY KEY, token, pair_code, status, last_seen, room_id)

-- Transfers
transfers (id PRIMARY KEY, flow, amount, currency, from_address, to_address, status, created_at, updated_at)

-- Manifest Posts
manifest_posts (id PRIMARY KEY, user_id, title, content, media_urls, created_at, updated_at)
```

### Cloudflare R2 (Object Storage)
```
bucket: together-systems-assets
structure:
  /encrypted-modules/
    /v1.0.0/
      module.enc
      manifest.json
  /signatures/
    /producer.pub
  /backups/
    /YYYY-MM-DD/
      backup.json
```

---

## 🌐 NETZWERK-ARCHITEKTUR

### CDN-Struktur
```
User Request
    ↓
Cloudflare CDN (Global)
    ↓
GitHub Pages (Origin)
    ↓
Response (Cached/Origin)
```

### API-Struktur
```
User Request
    ↓
Cloudflare Workers (Edge)
    ↓
Cloudflare D1 (Database)
    ↓
Cloudflare R2 (Storage)
    ↓
Response
```

---

## 🔧 KONFIGURATIONS-ARCHITEKTUR

### Settings-Ordner-Struktur
```
settings/
├── settings-manifest.json          # Hauptmanifest
├── config/
│   ├── encryption-config.json      # Verschlüsselungs-Config
│   ├── encryption-versioning.json  # Verschlüsselungs-Versionierung
│   └── deployment-config.json      # Deployment-Config
├── schemas/
│   └── encryption.policy.json     # Verschlüsselungs-Policy
└── CONSOLE-MONITORING-SYSTEM.json  # Konsole-Monitoring
```

### Konfigurations-Hierarchie
```
1. Settings-Manifest (Root)
    ↓
2. Config-Files (Spezifisch)
    ↓
3. Schema-Files (Validierung)
    ↓
4. Runtime-Config (Dynamisch)
```

---

## 🚀 DEPLOYMENT-ARCHITEKTUR

### Frontend-Deployment
```
Local Development
    ↓
Git Commit & Push
    ↓
GitHub Repository
    ↓
GitHub Pages (Auto-Deploy)
    ↓
Cloudflare CDN (Propagation)
    ↓
User (Global)
```

### Backend-Deployment
```
Local Development
    ↓
Wrangler Build
    ↓
Cloudflare Workers Deploy
    ↓
Cloudflare Edge Network
    ↓
User (Global)
```

---

## 📈 MONITORING-ARCHITEKTUR

### Monitoring-Layer
```
Application Layer
    ↓
Console-Monitoring (Client)
    ↓
Error-Detection
    ↓
Settings-Ordner (Lösungen)
    ↓
Auto-Fix (wenn möglich)
    ↓
Logging (localStorage + Server)
```

### Error-Flow
```
Error Occurs
    ↓
Error-Detection
    ↓
Pattern-Matching
    ↓
Known Error? → Yes → Auto-Fix
    ↓ No
Settings-Ordner konsultieren
    ↓
Solution Generation
    ↓
Manual Fix
    ↓
Pattern Store Update
```

---

## 🔗 INTEGRATIONS-ARCHITEKTUR

### Externe Integrationen
```
Together Systems
    ├── ORCID (Identitätsverifikation)
    ├── WhatsApp (Kommunikation)
    ├── GoFundMe (Finanzierung)
    ├── GitHub (Code-Hosting)
    ├── Cloudflare (Infrastruktur)
    └── MetaMask (Krypto-Wallet, geplant)
```

### API-Integrationen
```
Frontend
    ├── Presence API → Cloudflare Workers
    ├── Telbank API → Cloudflare Workers
    ├── Manifest API → Cloudflare Workers
    └── External APIs → Direct (ORCID, etc.)
```

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0  
**Producer:** Raymond Demitrio Tel
