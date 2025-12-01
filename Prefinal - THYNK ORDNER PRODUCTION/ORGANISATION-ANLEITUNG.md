# 📁 THYNK ORIGINAL - Organisations-Anleitung

**Zweck:** Komplette Original-Ansicht lokal mit separaten Unterordnern  
**Struktur:** Übergeordneter Ordner mit "branding" und "system"

---

## 📁 VOLLSTÄNDIGE STRUKTUR

```
THYNK ORDNER PRODUCTION/
│
└── thynk-original/                    ← ÜBERGEORDNETER ORDNER
    │
    ├── branding/                      ← ORIGINAL-BRANDING
    │   ├── images/                    ← Bilder (separat organisiert)
    │   │   ├── logos/                ← Logos
    │   │   ├── icons/                ← Icons
    │   │   └── backgrounds/          ← Background-Bilder
    │   ├── css/                      ← CSS-Dateien
    │   ├── fonts/                    ← Custom Fonts
    │   └── config/                   ← Branding-Config
    │
    └── system/                        ← SYSTEM-DATEIEN
        ├── application/              ← Application-Logic
        └── config/                   ← System-Konfiguration
```

---

## 🎯 KONZEPT

### **Übergeordneter Ordner:**
- `thynk-original/` - Enthält alles

### **Zwei Hauptordner:**

1. **`branding/`** - Original-Branding
   - Alle Bilder separat in Unterordnern
   - Logos → `images/logos/`
   - Icons → `images/icons/`
   - Backgrounds → `images/backgrounds/`
   - CSS-Dateien → `css/`
   - Fonts → `fonts/`
   - Config → `config/`

2. **`system/`** - System-Dateien
   - Application-Logic → `application/`
   - System-Config → `config/`

---

## 🚀 EXTRAKTION & ORGANISATION

### Schritt 1: Branding extrahieren
1. Öffnen Sie: `scripts/extract-complete-thynk-branding.js`
2. Kopieren Sie in Browser-Konsole
3. Führen Sie aus: `extractCompleteThynkBranding()`
4. JSON-Datei wird heruntergeladen

### Schritt 2: Assets herunterladen
1. Öffnen Sie: `scripts/download-thynk-branding-assets.js`
2. Kopieren Sie in Browser-Konsole
3. Führen Sie aus: `downloadThynkBrandingAssets()`
4. Alle Bilder, CSS, Fonts werden heruntergeladen

### Schritt 3: Organisieren
1. Kopieren Sie alle heruntergeladenen Dateien in:
   - Logos → `thynk-original/branding/images/logos/`
   - Icons → `thynk-original/branding/images/icons/`
   - Backgrounds → `thynk-original/branding/images/backgrounds/`
   - CSS → `thynk-original/branding/css/`
   - Fonts → `thynk-original/branding/fonts/`
   - Config → `thynk-original/branding/config/`

---

## ✅ VORTEILE

- ✅ **Klar getrennt:** Branding ↔ System
- ✅ **Bilder separat:** In eigenen Unterordnern organisiert
- ✅ **1:1 Original:** Komplette Kopie von Online
- ✅ **Einfache Wartung:** Alles strukturiert
- ✅ **Modular:** Branding kann unabhängig geändert werden

---

## 📋 CHECKLISTE

Nach Extraktion:
- [ ] Alle Logos in `branding/images/logos/`
- [ ] Alle Icons in `branding/images/icons/`
- [ ] Alle Backgrounds in `branding/images/backgrounds/`
- [ ] Alle CSS-Dateien in `branding/css/`
- [ ] Alle Fonts in `branding/fonts/`
- [ ] Config in `branding/config/`
- [ ] System-Dateien in `system/`

---

**Quelle:** https://thynkorders.com

