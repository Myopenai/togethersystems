# THYNK ORDERS - Browser-basierte Daten-Extraktion

**Quelle:** https://thynkorders.com/#/userCenter  
**Methode:** Direkt im Browser - 1:1 Extraktion

---

## 🚀 SCHNELLSTART

### Schritt 1: Einloggen
1. Öffnen Sie: **https://thynkorders.com/#/sign-in**
2. Username: **Gentlyoverdone**
3. Password: **WebMaster8/**
4. Captcha eingeben (falls nötig)
5. Einloggen

### Schritt 2: Browser-Konsole öffnen
1. Drücken Sie **F12** (Developer Tools)
2. Gehen Sie zum Tab **"Console"**

### Schritt 3: Extraktions-Script ausführen
1. Kopieren Sie den Inhalt von: **`scripts/browser-extraction-script.js`**
2. Fügen Sie in die Browser-Konsole ein
3. Drücken Sie **Enter**
4. Führen Sie aus: **`extractAllThynkData()`**

### Schritt 4: Daten herunterladen
- Automatisch wird eine JSON-Datei heruntergeladen
- Diese enthält ALLE extrahierten Daten

---

## 📋 WAS WIRD EXTRAHIERT?

1. ✅ **Salesforce-Konfigurationen**
   - Org-ID
   - Instance URL
   - API-Version
   - User-ID

2. ✅ **LocalStorage & SessionStorage**
   - Alle gespeicherten Daten
   - Konfigurationen
   - Session-Informationen

3. ✅ **API-Endpunkte**
   - Alle aufgerufenen APIs
   - Request-URLs
   - Methoden

4. ✅ **Window-Objekte**
   - Alle thynk/salesforce/order-bezogenen Objekte
   - Config-Objekte
   - Framework-Informationen

5. ✅ **Network-Requests**
   - Alle API-Calls
   - Request-Details

---

## 🔧 ALTERNATIVE: MANUELLE EXTRAKTION

### Über Browser DevTools:

1. **Network-Tab:**
   - Öffnen Sie DevTools → Network
   - Filtern Sie nach "api" oder "salesforce"
   - Exportieren Sie als HAR-Datei

2. **Application-Tab:**
   - Öffnen Sie DevTools → Application
   - Local Storage → Exportieren
   - Session Storage → Exportieren

3. **Console:**
   - Führen Sie aus: `JSON.stringify(localStorage, null, 2)`
   - Kopieren Sie das Ergebnis

---

## 📁 SPEICHERUNG

Die extrahierten Daten werden gespeichert in:
- `exports/full-extraction/thynk-orders-complete-extraction-*.json`

---

## 🔐 SICHERHEIT

**WICHTIG:**
- ❌ Session-IDs und Tokens werden automatisch maskiert
- ✅ Alle Daten bleiben lokal auf Ihrem Computer
- ✅ Keine Übertragung an externe Server

---

## 📞 QUelle

Alle Daten stammen von: **https://thynkorders.com/#/userCenter**

---

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

