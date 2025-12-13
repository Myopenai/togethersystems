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
