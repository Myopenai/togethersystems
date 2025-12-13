# Source Maps für Cursor.com - Vollständige Anleitung

## 🎯 Übersicht

**Kostenlos, ohne Azure DevOps** - Source Maps werden direkt auf deinem Webserver oder Cursa.com gehostet. Edge/Chrome DevTools finden sie automatisch.

---

## ✅ Was wird erstellt?

1. **Source Maps** (`.map` Dateien) beim Build
2. **Source Mapping URL** Kommentar in kompilierten JS-Dateien
3. **CORS Headers** für Source Maps Zugriff
4. **Automatische Hosting** auf Webserver/Cursa.com

---

## 🚀 Schnellstart

### 1. Setup ausführen

```powershell
cd builds\source-maps
.\setup-source-maps.ps1 -All
```

### 2. Build mit Source Maps

**Webpack:**
```powershell
.\setup-source-maps.ps1 -Webpack
```

**Vite:**
```powershell
.\setup-source-maps.ps1 -Vite
```

**Esbuild:**
```powershell
.\setup-source-maps.ps1 -Esbuild
```

### 3. Auto-Fix (löst alle Probleme)

```powershell
.\auto-fix-source-maps.ps1
```

---

## 📋 Build-Tool Konfiguration

### Webpack

**webpack.config.js:**
```javascript
module.exports = {
  devtool: 'source-map', // Generiert separate .map Dateien
  output: {
    sourceMapFilename: '[name].js.map'
  }
};
```

**Ergebnis:**
- `bundle.js` mit Kommentar: `//# sourceMappingURL=bundle.js.map`
- `bundle.js.map` wird erstellt

### Vite

**vite.config.js:**
```javascript
export default defineConfig({
  build: {
    sourcemap: true // Generiert separate .map Dateien
  }
});
```

**Ergebnis:**
- `dist/bundle.js` mit Source Map Kommentar
- `dist/bundle.js.map` wird erstellt

### Esbuild

```javascript
esbuild.build({
  sourcemap: true,
  sourcesContent: true
});
```

---

## 🌐 Hosting

### Lokal (localhost)

**Verzeichnis:**
```
builds/source-maps/
```

**URL:**
```
http://localhost:9323/source-maps/
```

**Edge/Chrome DevTools:**
- Finden Source Maps automatisch
- Kein Login nötig
- Kostenlos

### Cursa.com

**Upload:**
1. Source Maps zu Cursa.com hochladen
2. URL: `https://cursa.com/your-project/source-maps/`
3. DevTools finden automatisch

### Webserver (tel1.nl)

**Upload:**
1. Source Maps zu Webserver hochladen
2. URL: `https://tel1.nl/source-maps/`
3. CORS Headers werden automatisch gesetzt

---

## 🔧 Automatische Integration

### Source Mapping URL wird automatisch hinzugefügt

**In kompilierten JS-Dateien:**
```javascript
// Dein Code...
//# sourceMappingURL=bundle.js.map
```

**DevTools finden automatisch:**
- Edge DevTools: ✅
- Chrome DevTools: ✅
- Cursor.com: ✅

### CORS Headers

**.htaccess (Apache):**
```apache
<FilesMatch "\.map$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>
```

**Nginx:**
```nginx
location ~ \.map$ {
    add_header Access-Control-Allow-Origin "*";
    add_header Content-Type "application/json";
}
```

---

## 🎯 Cursor.com Unterstützung

### Automatisch aktiviert

1. **Source Maps werden erkannt:**
   - Cursor.com liest Source Mapping URL
   - Lädt Source Maps automatisch
   - Zeigt Original-Code in DevTools

2. **Debugging:**
   - Breakpoints im Original-Code
   - Stack Traces zeigen Original-Dateien
   - Kein Azure DevOps nötig

3. **Auto-Fix:**
   - `auto-fix-source-maps.ps1` löst alle Probleme
   - Fabrikation Standard TÜV MCP

---

## 🔐 MCP Server Integration

### Automatischer Sync

**MCP Server:**
- `fabrikation-centrale`
- Sync Source Maps automatisch
- Hosting auf MCP Server möglich

**Konfiguration:**
```json
{
  "mcp": {
    "enabled": true,
    "server": "fabrikation-centrale",
    "autoSync": true
  }
}
```

---

## ✅ Checkliste

- [ ] Source Maps generiert (`.map` Dateien)
- [ ] Source Mapping URL in JS-Dateien
- [ ] CORS Headers gesetzt
- [ ] Source Maps auf Webserver/Cursa.com
- [ ] DevTools finden Source Maps automatisch
- [ ] Cursor.com unterstützt Source Maps

---

## 🚨 Problem-Lösung

### Problem: Source Maps werden nicht gefunden

**Lösung:**
```powershell
.\auto-fix-source-maps.ps1
```

**Prüft automatisch:**
- ✅ Source Maps Verzeichnis existiert
- ✅ Source Mapping URL vorhanden
- ✅ CORS Headers gesetzt
- ✅ Source Maps erreichbar

### Problem: CORS Fehler

**Lösung:**
- `.htaccess` wird automatisch erstellt
- CORS Headers werden gesetzt
- `Access-Control-Allow-Origin: *`

### Problem: Source Maps nicht aktuell

**Lösung:**
```powershell
.\setup-source-maps.ps1 -All -Deploy
```

---

## 📊 Beispiel

### Vorher (ohne Source Maps):
```
bundle.js (minified, schwer zu debuggen)
```

### Nachher (mit Source Maps):
```
bundle.js
//# sourceMappingURL=bundle.js.map

bundle.js.map (zeigt Original-Code)
```

**DevTools zeigen:**
- Original-Code (nicht minified)
- Original-Dateinamen
- Original-Zeilen-Nummern

---

## 🎯 Zusammenfassung

✅ **Kostenlos** - Kein Azure DevOps nötig  
✅ **Automatisch** - DevTools finden Source Maps selbst  
✅ **Cursor.com** - Native Unterstützung  
✅ **MCP Integration** - Automatischer Sync  
✅ **Auto-Fix** - Alle Probleme werden automatisch gelöst  

**Fabrikation Standard TÜV MCP** - Alles funktioniert selbstständig!

---

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
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
