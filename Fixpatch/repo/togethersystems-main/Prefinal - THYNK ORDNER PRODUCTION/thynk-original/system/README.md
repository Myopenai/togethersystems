# ⚙️ SYSTEM - System-Dateien

**Zweck:** Application-Logic und System-Konfiguration  
**Trennung:** Getrennt vom Branding für einfache Wartung

---

## 📁 STRUKTUR

```
system/
├── application/           → Application-Logic
│   └── [app-dateien]     → JavaScript, HTML, etc.
└── config/                → System-Konfiguration
    └── [config-dateien]   → System-Settings
```

---

## 🎯 KONZEPT

- ✅ **Application-Logic** getrennt vom Branding
- ✅ **System-Config** für Einstellungen
- ✅ Einfache Wartung
- ✅ Modulares System

---

## 📋 VERWENDUNG

Die Application lädt:
- Branding aus `../branding/`
- System-Logic aus `application/`
- Config aus `config/`

Alles sauber getrennt!

---

**Status:** ✅ Bereit für System-Dateien

