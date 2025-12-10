# Apple-Pi System - Lokales Setup
## Vollständige Implementierung für alle privaten Anwendungen A-Z

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🎯 ÜBERSICHT

Das Apple-Pi System ist ein lokales Setup für alle privaten Anwendungen:
- **Mac/Apple:** User-Interface, Office, Excel-Wissenschaft, Visualisierung
- **Raspberry Pi:** Always-on-Home-Server, Datenbanken, APIs, Home-Automation

---

## 📁 STRUKTUR

```
apple-pi/
├── specs/              # Spec Mirror (A-Z JSON/YAML Schemas)
│   ├── domain/        # Domain-Schemas (AA, BA, EE, NN, PP, etc.)
│   └── api/           # OpenAPI/GraphQL Schemas
├── services/          # Containerisierte Services
│   ├── fin-core/      # Finanzlogik, Buchungssätze
│   ├── ins-core/      # Versicherungsverträge
│   ├── house-core/    # Haushaltsbuch, Energie, Zähler
│   ├── notary-core/   # Digitalnotar & Verifikation
│   └── startup-core/  # Startup-Produktübergabe
├── infra/             # Infrastructure (Docker, Traefik)
│   ├── docker-compose.yml
│   └── certs/         # TLS-Zertifikate
└── clients/           # Client-Integration (macOS/iOS)
    ├── shortcuts/     # Apple Shortcuts
    └── swift/         # Swift CLI Tools
```

---

## 🚀 QUICK START

### 1. Raspberry Pi Setup

```bash
# Auf Raspberry Pi
cd /opt/apple-pi
docker-compose -f infra/docker-compose.yml up -d
```

### 2. Mac/iOS Client

```bash
# Shortcuts verwenden oder Swift CLI
swift clients/swift/notary-manifest.swift
```

---

## 📊 A-Z FUNKTIONSALPHABET

| Code | Bereich | Apple-Seite | Pi-Service |
|------|---------|-------------|------------|
| AA | Account/Identity | iCloud Keychain | User-DB, Rollen |
| BA | Bankkonto | Numbers/Bank-App | fin-core |
| EE | Energie (Solar, Brennstoffzelle) | Home-App | house-core |
| NN | Notar / Notator | Signatur | notary-core |
| PP | Produkt-Perfektion | Projekt-Management | startup-core |

---

## 🔐 SICHERHEIT

- **Client-Zertifikate (mTLS):** Nur vertrauenswürdige Geräte
- **Verschlüsselte Speicherung:** LUKS/dm-crypt
- **Backups:** BorgBackup/Restic
- **VPN (optional):** WireGuard

---

## 📖 DOKUMENTATION

- **Hardware:** Siehe `HARDWARE-DOKUMENTATION.md`
- **API:** Siehe `specs/api/openapi.yaml`
- **Schemas:** Siehe `specs/domain/`

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV


