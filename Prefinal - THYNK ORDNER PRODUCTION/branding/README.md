# 🎨 THYNK ORDERS - Branding-System

**Zweck:** Separates Branding-System für einfache Modifikation und Erweiterung  
**Ziel:** 1:1 wie die Online-Version von thynkorders.com

---

## 📁 ORDNER-STRUKTUR

```
branding/
├── css/                    → Alle Stylesheets
│   ├── main.css           → Haupt-Stylesheet
│   ├── themes/            → Theme-Varianten
│   └── components/        → Component-spezifische Styles
├── js/                     → Branding-JavaScript
│   ├── branding.js        → Haupt-Branding-Logic
│   └── themes.js          → Theme-Wechsler
├── images/                 → Logo, Icons, Bilder
│   ├── logo.png
│   ├── favicon.ico
│   └── icons/
├── fonts/                  → Custom Fonts
│   └── custom-fonts/
├── config/                 → Branding-Konfiguration
│   ├── brand-config.json  → Haupt-Config
│   └── colors.json        → Farb-Palette
└── README.md
```

---

## 🎯 KONZEPT

### Modulares System:
- ✅ Branding komplett getrennt von Application-Logic
- ✅ Einfache Modifikation ohne Code-Änderungen
- ✅ Theme-System für verschiedene Varianten
- ✅ 1:1 Kopie des Online-Brandings möglich

### Integration:
Die Application lädt automatisch alle Branding-Dateien aus diesem Ordner.

---

## 📋 DATEIEN

### CSS:
- `css/main.css` - Haupt-Stylesheet (1:1 von thynkorders.com)
- `css/themes/` - Verschiedene Theme-Varianten
- `css/components/` - Component-spezifische Styles

### JavaScript:
- `js/branding.js` - Branding-Logic (Logo-Laden, Theme-Apply, etc.)
- `js/themes.js` - Theme-System

### Images:
- `images/logo.png` - Haupt-Logo
- `images/favicon.ico` - Favicon
- `images/icons/` - Alle Icons

### Config:
- `config/brand-config.json` - Komplette Branding-Konfiguration
- `config/colors.json` - Farb-Palette (1:1 von Online)

---

## 🔧 VERWENDUNG

Die Application lädt automatisch:
```html
<link rel="stylesheet" href="branding/css/main.css">
<script src="branding/js/branding.js"></script>
```

Oder dynamisch:
```javascript
// Lädt Branding-Konfiguration
const branding = await fetch('branding/config/brand-config.json').then(r => r.json());
applyBranding(branding);
```

---

## 🎨 1:1 ÜBERNAHME VON thynkorders.com

Alle Branding-Dateien werden direkt von thynkorders.com extrahiert und hier gespeichert.

---

## 📝 MODIFIKATION

Um Branding zu ändern:
1. Öffnen Sie `branding/config/brand-config.json`
2. Ändern Sie die Werte
3. Speichern Sie - Application aktualisiert automatisch!

---

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

