# T,. SYSTEM-KONFIGURATION - VOLLSTÄNDIG
## Brand Assets, Endpoints, Images, Policies & Legal

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**VERSION:** 1.0.0  
**DATUM:** 2025-01-15  
**STATUS:** ✅ Vollständig

---

## 1. LABELING: BRAND ASSETS

### 1.1. Logo & Branding

**Primäres Logo:**
```
T,.&T,,.&T,,,.(C)TEL1.NL
```

**Vollständiges Branding:**
```
.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
```

**Brand Assets Verzeichnis:**
- `assets/branding/` - Branding-Assets (PNG, SVG)
- `assets/branding/de_rechtspraak.png` - Demo-Branding-Assets
- `assets/branding/de_rechtspraak.svg` - SVG-Varianten

**Branding-Informationen:**
- **Producer:** TEL1.NL
- **WhatsApp:** 0031613803782
- **ORCID:** https://orcid.org/0009-0003-1328-2430
- **GoFundMe:** https://www.gofundme.com/f/magnitudo
- **Businessplan:** https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf

### 1.2. App Name

**Haupt-App-Namen:**
- **Vollständiger Name:** "Portal – Start"
- **Kurzname:** "Portal"
- **System-Name:** "Together Systems"
- **OS-Name:** "OSTOSOS - Together Systems OS"
- **Microsoft-Integration:** "Microsoft Operating System"

**Varianten:**
- `manifest.webmanifest`: "Portal – Start" / "Portal"
- `manifest-portal.webmanifest`: "Portal – Start" / "Portal"
- `OSTOSOS-ANKUENDIGUNG.html`: "OSTOSOS"
- `settings/microsoft/BETRIEBSSYSTEM-MANIFEST.json`: "Microsoft Operating System"

### 1.3. Signing Identities (Windows/macOS)

**Aktueller Status:**
- ⚠️ **Noch nicht implementiert** - Signing Identities müssen noch erstellt werden

**Erforderliche Signing Identities:**

**Windows:**
- Code Signing Certificate (EV oder Standard)
- Publisher Name: "TEL1.NL" oder "Together Systems"
- Timestamp Server: Optional (für Langzeit-Gültigkeit)

**macOS:**
- Apple Developer ID Certificate
- Developer ID Application Certificate
- Developer ID Installer Certificate (für Installer-Pakete)
- Notarization: Erforderlich für macOS 10.15+

**Empfohlene Konfiguration:**
```json
{
  "signing": {
    "windows": {
      "certificate": "code-signing-cert.pfx",
      "timestamp_server": "http://timestamp.digicert.com",
      "publisher": "TEL1.NL"
    },
    "macos": {
      "developer_id": "Developer ID Application: TEL1.NL (XXXXXXXXXX)",
      "installer_cert": "Developer ID Installer: TEL1.NL (XXXXXXXXXX)",
      "notarization": {
        "enabled": true,
        "apple_id": "developer@tel1.nl",
        "team_id": "XXXXXXXXXX"
      }
    }
  }
}
```

**Hinweis:** Signing Identities müssen über einen Apple Developer Account und einen Code Signing Certificate Provider erworben werden.

---

## 2. ENDPOINTS: PORTAL URLs & PWA INSTALL

### 2.1. Portal URLs

**Haupt-Portale:**
- **Offline-Portal:** `index.html`
- **Manifest-Forum:** `manifest-forum.html`
- **Online-Portal:** `manifest-portal.html`
- **Wabenräume:** `honeycomb.html`
- **Legal-Hub:** `legal-hub.html`
- **TELBANK:** `TELBANK/index.html`
- **OSTOSOS:** `OSTOSOS-ANKUENDIGUNG.html`

**Deployment URLs:**
- **GitHub Pages:** `https://myopenai.github.io/togethersystems/`
- **Cloudflare Pages:** (Konfigurierbar)
- **Lokaler Server:** `http://localhost:9323/`

### 2.2. PWA Install Endpoints

**Web Manifest Dateien:**
- `manifest.webmanifest` - Haupt-Manifest
- `manifest-portal.webmanifest` - Portal-Manifest

**Manifest-Konfiguration:**
```json
{
  "name": "Portal – Start",
  "short_name": "Portal",
  "start_url": "./Portal – Start.html",
  "display": "standalone",
  "background_color": "#0f1419",
  "theme_color": "#0f1419",
  "icons": [
    {
      "src": "./icon.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**PWA Install-URLs:**
- **Install-Endpoint:** Automatisch über Browser (bei HTTPS)
- **Service Worker:** `sw.js` - Für Offline-Funktionalität
- **Install-Prompt:** Browser-generiert (Chrome, Edge, Safari)

### 2.3. Status API Endpoints

**Presence API:**
- **Base Path:** `/api/presence` (konfigurierbar via `PRESENCE_API_BASE_PATH`)
- **Verify:** `POST /api/presence/verify` - Token-Verifikation
- **Heartbeat:** `POST /api/presence/heartbeat` - Präsenz-Update
- **Match:** `POST /api/presence/match` - Partner-Matching
- **Catalog:** `GET /api/presence/catalog/apis` - API-Katalog

**Voucher API:**
- **Base Path:** `/api/voucher`
- **List:** `GET /api/voucher/list?holderUid=...`
- **Issue:** `POST /api/voucher/issue`
- **Update:** `POST /api/voucher/update`

**Hypotheken API:**
- **Base Path:** `/api/hypotheken`
- **Anfrage:** `POST /api/hypotheken/anfrage`
- **Angebot:** `POST /api/hypotheken/angebot`
- **Vertrag:** `POST /api/hypotheken/vertrag`

**TELBANK API:**
- **Base Path:** `/api/telbank`
- **Transfers:** `POST /api/telbank/transfers`
- **Status:** `GET /api/telbank/status`

**WebSocket Signaling:**
- **Endpoint:** `wss://signaling.deine-seite.tld` (konfigurierbar)
- **Rooms:** Dynamisch via `room_id` (z.B. `mortgage:offer:O-2025-0001`)

**Health Check:**
- **Endpoint:** `/api/health` (optional)
- **Status:** `GET /api/status` (optional)

---

## 3. IMAGES: BASE VM/CONTAINER IMAGES

### 3.1. OSTOSOS Guest Image

**Status:**
- ⚠️ **Noch nicht erstellt** - Dockerfile und Container-Images müssen noch erstellt werden

**Empfohlene Konfiguration:**

**Dockerfile (OSTOSOS Guest Image):**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

**Container Registry:**
- **Docker Hub:** `tel1nl/ostosos-guest:latest`
- **GitHub Container Registry:** `ghcr.io/tel1nl/ostosos-guest:latest`
- **Private Registry:** (Konfigurierbar)

### 3.2. Build Contexts

**Empfohlene Struktur:**
```
docker/
├── ostosos-guest/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker-compose.yml
├── portal/
│   ├── Dockerfile
│   └── nginx.conf
└── telbank/
    ├── Dockerfile
    └── docker-compose.yml
```

**VM Images:**
- ⚠️ **Noch nicht erstellt** - VM Images müssen noch erstellt werden
- **Empfohlene Formate:** OVA, VMDK, QCOW2
- **Hypervisor:** VirtualBox, VMware, QEMU/KVM

**Container Images:**
- **Base Image:** `node:20-alpine` oder `ubuntu:22.04`
- **Runtime:** Node.js 20+, npm/yarn
- **Web Server:** Nginx (optional)

---

## 4. POLICY DEFAULTS: RESOURCE CAPS & STORAGE MESH

### 4.1. Resource Caps per Device Class

**Aktuelle Policy-Definitionen:**
- `settings/schemas/policy.route.json` - Policy-Routing-Schema
- `settings/schemas/encryption.policy.json` - Verschlüsselungs-Policy
- `settings/nodes/example-policy-route.json` - Beispiel-Policy

**Empfohlene Resource Caps:**

**Device Classes:**
```json
{
  "device_classes": {
    "mobile": {
      "cpu_cores": 2,
      "memory_mb": 2048,
      "storage_gb": 16,
      "network_mbps": 10,
      "battery_optimization": true
    },
    "tablet": {
      "cpu_cores": 4,
      "memory_mb": 4096,
      "storage_gb": 64,
      "network_mbps": 50,
      "battery_optimization": true
    },
    "desktop": {
      "cpu_cores": 8,
      "memory_mb": 8192,
      "storage_gb": 256,
      "network_mbps": 100,
      "battery_optimization": false
    },
    "server": {
      "cpu_cores": 16,
      "memory_mb": 32768,
      "storage_gb": 1024,
      "network_mbps": 1000,
      "battery_optimization": false
    },
    "embedded": {
      "cpu_cores": 1,
      "memory_mb": 512,
      "storage_gb": 4,
      "network_mbps": 1,
      "battery_optimization": true
    }
  }
}
```

**Resource Limits:**
- **CPU:** Prozentuale Nutzung pro Device Class
- **Memory:** Maximaler RAM-Verbrauch
- **Storage:** Maximaler Speicherplatz
- **Network:** Bandbreiten-Limit
- **Battery:** Optimierung für mobile Geräte

### 4.2. Storage Mesh Policy

**Storage Mesh Konfiguration:**
```json
{
  "storage_mesh": {
    "enabled": true,
    "replication_factor": 3,
    "consistency_level": "eventual",
    "encryption": {
      "enabled": true,
      "algorithm": "AES-256-GCM",
      "key_rotation": "30d"
    },
    "backup": {
      "enabled": true,
      "interval": "24h",
      "retention": "90d"
    },
    "sync": {
      "enabled": true,
      "interval": "5m",
      "conflict_resolution": "last_write_wins"
    },
    "quota": {
      "per_user_gb": 10,
      "per_device_gb": 50,
      "max_total_gb": 1000
    }
  }
}
```

**Storage Policies:**
- **Replication:** Daten werden auf mehreren Nodes repliziert
- **Consistency:** Eventual Consistency (Standard)
- **Encryption:** AES-256-GCM Verschlüsselung
- **Backup:** Automatische Backups alle 24 Stunden
- **Sync:** Synchronisation alle 5 Minuten
- **Quota:** Speicher-Limits pro User/Device

**Mesh Network:**
- **P2P:** Peer-to-Peer Verbindungen
- **WebRTC:** Real-time Kommunikation
- **DHT:** Distributed Hash Table für Discovery
- **NAT Traversal:** ICE/STUN/TURN für Verbindungen

---

## 5. LEGAL: CONSENT COPY & PRIVACY MESSAGING

### 5.1. Consent Copy

**Aktuelle Legal-Texte:**
- `legal-hub.html` - Legal-Hub mit rechtlichen Hinweisen
- `LEGAL/VERTRAGS-VORLAGEN-PAKET.md` - Vertrags-Vorlagen
- `LEGAL/STANDARD-VERSICHERUNGSVERTRAG-MODELL-FALL.md` - Versicherungsvertrag

**Consent Copy (Friendly Care):**

**Datenschutz-Einwilligung:**
```
Wir respektieren Ihre Privatsphäre und Datenhoheit.

Diese Anwendung arbeitet nach dem Prinzip der Offline-Souveränität:
- Ihre Daten werden primär lokal in Ihrem Browser gespeichert
- Keine Zwangs-Registrierung oder Login-Pflicht
- Optionale Synchronisation nur mit Ihrer ausdrücklichen Zustimmung
- Sie können Ihre Daten jederzeit exportieren (JSON/HTML/PDF)

Durch die Nutzung dieser Anwendung stimmen Sie zu:
- Lokale Speicherung Ihrer Daten im Browser
- Optionale Nutzung von Online-Funktionen (nur bei Aktivierung)
- Verwendung von Cookies für Funktionalität (kein Tracking)

Sie können jederzeit:
- Ihre Daten exportieren
- Lokale Daten löschen
- Online-Funktionen deaktivieren
```

**Nutzungsbedingungen:**
```
Together Systems – Nutzungsbedingungen

1. Offline-First Prinzip
   - Daten bleiben primär lokal in Ihrem Browser
   - Keine zentrale Datensammlung ohne Ihre Zustimmung

2. Bring Your Own Server
   - Sie können eigene Server/Hubs betreiben
   - Keine Abhängigkeit von zentralen Diensten

3. Kryptografische Sicherheit
   - HMAC-Token für Verifikation
   - Optionale Verschlüsselung Ihrer Daten

4. Keine Rechtsberatung
   - Diese Anwendung ersetzt keine Rechtsberatung
   - Für rechtliche Fragen konsultieren Sie einen Anwalt
```

### 5.2. Privacy Messaging (Friendly Care)

**Privacy Policy (User-Friendly):**

**Kurzfassung:**
```
🔒 Ihre Daten gehören Ihnen

✓ Lokale Speicherung im Browser
✓ Keine Zwangs-Registrierung
✓ Export jederzeit möglich
✓ Optionale Online-Funktionen
✓ Kein Tracking
```

**Detaillierte Privacy Policy:**
```
PRIVACY POLICY – Together Systems

1. Datenhoheit
   - Alle Daten bleiben in Ihrem Browser (localStorage)
   - Keine automatische Übertragung an Server
   - Sie entscheiden, was geteilt wird

2. Keine Registrierung
   - Keine E-Mail-Adresse erforderlich
   - Kein Passwort nötig
   - Lokale User-ID wird automatisch generiert

3. Optionale Synchronisation
   - Online-Funktionen nur bei Aktivierung
   - Sie wählen, welche Daten synchronisiert werden
   - Jederzeit deaktivierbar

4. Export & Löschung
   - Datenexport als JSON/HTML/PDF
   - Komplette Löschung möglich
   - Keine Datenrückgewinnung nach Löschung

5. Cookies & Tracking
   - Nur funktionale Cookies (kein Tracking)
   - Keine Werbe-Cookies
   - Keine Analytics ohne Zustimmung

6. Sicherheit
   - HMAC-Token für Verifikation
   - Optionale Verschlüsselung
   - Keine Weitergabe an Dritte

7. Kontakt
   - Fragen? Kontaktieren Sie uns:
   - WhatsApp: 0031613803782
   - ORCID: https://orcid.org/0009-0003-1328-2430
```

**Cookie-Banner (Friendly):**
```
🍪 Cookies & Datenschutz

Wir verwenden nur funktionale Cookies für:
✓ Speicherung Ihrer Präferenzen
✓ Offline-Funktionalität
✓ Sicherheit

Kein Tracking, keine Werbung.

[Akzeptieren] [Ablehnen] [Mehr erfahren]
```

**GDPR-Compliance:**
- ✅ Recht auf Auskunft
- ✅ Recht auf Löschung
- ✅ Recht auf Datenübertragbarkeit
- ✅ Recht auf Widerspruch
- ✅ Datenschutz-Folgenabschätzung (optional)

---

## 6. ZUSAMMENFASSUNG

### 6.1. Status

**✅ Vollständig:**
- Brand Assets (Logo, App Name)
- Portal URLs
- PWA Install Endpoints
- Status API Endpoints
- Legal Texte (Consent Copy, Privacy Messaging)

**⚠️ Noch zu erstellen:**
- Signing Identities (Windows/macOS)
- Dockerfile & Container Images
- VM Images
- Resource Caps Policy (detailliert)
- Storage Mesh Policy (detailliert)

### 6.2. Nächste Schritte

1. **Signing Identities:**
   - Apple Developer Account erstellen
   - Code Signing Certificate erwerben
   - Signing-Config erstellen

2. **Container Images:**
   - Dockerfile für OSTOSOS Guest Image erstellen
   - Build-Kontext definieren
   - Container Registry konfigurieren

3. **VM Images:**
   - VM-Template erstellen
   - OVA/VMDK/QCOW2 exportieren
   - Hypervisor-Kompatibilität testen

4. **Policies:**
   - Resource Caps detailliert definieren
   - Storage Mesh Policy implementieren
   - Policy-Engine testen

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0  
**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

---

**T,. SYSTEM-KONFIGURATION - VOLLSTÄNDIG**

