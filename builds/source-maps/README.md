# Source Maps System - TogetherSystems

## 🎯 Übersicht

**Kostenloses Source Maps System** für Cursor.com & Edge/Chrome DevTools - ohne Azure DevOps.

---

## ✅ Features

- ✅ **Kostenlos** - Kein Azure DevOps Account nötig
- ✅ **Automatisch** - DevTools finden Source Maps selbst
- ✅ **Cursor.com** - Native Unterstützung
- ✅ **MCP Integration** - Automatischer Sync
- ✅ **Auto-Fix** - Löst alle Probleme automatisch
- ✅ **Multi-Build-Tool** - Webpack, Vite, Esbuild, Rollup

---

## 🚀 Schnellstart

### 1. Setup

```powershell
.\setup-source-maps.ps1 -All
```

### 2. Auto-Fix (löst alle Probleme)

```powershell
.\auto-fix-source-maps.ps1
```

### 3. In bestehendes Projekt integrieren

```powershell
.\integrate-source-maps.ps1 -ProjectPath "C:\path\to\project" -BuildTool "all"
```

---

## 📋 Dateien

- `source-map-config.json` - Hauptkonfiguration
- `webpack.config.js` - Webpack Setup
- `vite.config.js` - Vite Setup
- `setup-source-maps.ps1` - Haupt-Setup Script
- `auto-fix-source-maps.ps1` - Auto-Fix Script
- `integrate-source-maps.ps1` - Integration Script
- `CURSOR-SOURCE-MAPS.md` - Vollständige Dokumentation

---

## 🌐 Hosting

### Lokal
```
http://localhost:9323/source-maps/
```

### Cursa.com
```
https://cursa.com/your-project/source-maps/
```

### Webserver
```
https://tel1.nl/source-maps/
```

---

## 🔧 Build-Tools

### Webpack
```powershell
.\setup-source-maps.ps1 -Webpack
```

### Vite
```powershell
.\setup-source-maps.ps1 -Vite
```

### Esbuild
```powershell
.\setup-source-maps.ps1 -Esbuild
```

---

## ✅ Ergebnis

**Vorher:**
```
bundle.js (minified, schwer zu debuggen)
```

**Nachher:**
```
bundle.js
//# sourceMappingURL=bundle.js.map

bundle.js.map (zeigt Original-Code)
```

**DevTools zeigen:**
- ✅ Original-Code (nicht minified)
- ✅ Original-Dateinamen
- ✅ Original-Zeilen-Nummern
- ✅ Breakpoints im Original-Code

---

## 🎯 Cursor.com

**Automatisch aktiviert:**
- Source Maps werden erkannt
- Original-Code wird angezeigt
- Debugging funktioniert
- Kein Login nötig

---

## 🔐 MCP Server

**Automatischer Sync:**
- `fabrikation-centrale` MCP Server
- Source Maps werden synchronisiert
- Hosting auf MCP Server möglich

---

## 🚨 Problem-Lösung

**Alle Probleme automatisch lösen:**
```powershell
.\auto-fix-source-maps.ps1
```

**Prüft:**
- ✅ Source Maps Verzeichnis
- ✅ Source Mapping URLs
- ✅ CORS Headers
- ✅ Erreichbarkeit

---

**Fabrikation Standard TÜV MCP** - Alles funktioniert selbstständig!

---

**Version:** 1.0.0  
**TogetherSystems International TTT**


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
