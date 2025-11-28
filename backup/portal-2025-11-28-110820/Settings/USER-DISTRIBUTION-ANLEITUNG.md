# 📦 User Distribution System - Anleitung

**Producer:** tell1.nl  
**GoFundMe:** https://www.gofundme.com/f/magnitudo

---

## 🎯 Überblick

Das User Distribution System ermöglicht es Usern, eine **vollständige, produktionsfähige Kopie** des Settings-Ordners zu erhalten, mit:

- ✅ **Unique Identifier** - Automatisch generiert
- ✅ **Notarielle Verifizierung** - Digital signiert
- ✅ **Portal-Host Versionierung** - Immer aktuell
- ✅ **Vollständige Funktionalität** - 1:1 produktionsfähig
- ❌ **KEIN Source-Code-Zugriff** - Source bleibt verschlossen

---

## 🔑 User Key System

### **WICHTIG: User Key**

Der User Key ist wie ein **Erbvertrag bei einer Bank**:

- ✅ **Einmalig generiert** beim Erstellen der Distribution
- ✅ **Notariell geschützt** - kann notariell bestätigt werden
- ❌ **Bei Verlust: User selbst verantwortlich**
- ✅ **Mit Key: Volle Funktionalität**

### **Key Generierung**

```javascript
// User generiert eigenen Key (nicht vom Server)
const userKey = crypto.randomBytes(32).toString('hex');
// User muss diesen Key SICHER aufbewahren!
```

---

## 📥 Distribution Erstellen

### **1. Distribution anfordern**

```bash
POST /api/settings/create-distribution
Content-Type: application/json

{
  "userKey": "USER_GENERATED_KEY_HERE"
}
```

### **2. Response**

```json
{
  "success": true,
  "distribution": {
    "distributionId": "user-1234567890-abc123",
    "userKey": "USER_KEY",
    "downloadUrl": "https://portal-host/api/settings/distribution/user-1234567890-abc123?version=1.0.1234567890&key=HASH",
    "notarySignature": "notary:...",
    "timestamp": "2025-11-25T..."
  },
  "important": {
    "message": "BEWAHREN SIE IHREN USER KEY SICHER AUF!",
    "warning": "Bei Verlust des Keys ist der User selbst verantwortlich.",
    "capabilities": [
      "Eigene Netzwerke aufbauen",
      "Portale erstellen",
      "Kopien versionieren",
      "Settings-Ordner aufbauen",
      "1:1 produktionsfähig"
    ]
  }
}
```

---

## 🔓 Distribution Verwenden

### **Mit User Key entschlüsseln**

```javascript
import { UserDistributionManager } from './Settings/core/user-distribution';

const manager = new UserDistributionManager('./Settings', 'https://portal-host', db);
const graph = await manager.loadDistribution(distributionId, userKey);

// Graph ist vollständig funktionsfähig
// Source-Code bleibt verschlossen
```

---

## 🎯 User Capabilities

### **Was User KANN:**

- ✅ Eigene Netzwerke aufbauen
- ✅ Portale erstellen
- ✅ Kopien versionieren
- ✅ Settings-Ordner aufbauen
- ✅ 1:1 produktionsfähig
- ✅ Vollständige Funktionalität
- ✅ Implementationen, Erweiterungen, Design
- ✅ Alle Features nutzen

### **Was User NICHT kann:**

- ❌ Source-Code einsehen
- ❌ Source-Code modifizieren
- ❌ Source-Code kopieren

**Aber:** Volle Funktionalität trotzdem möglich!

---

## 🔐 Notarielle Verifizierung

### **Automatische Verifizierung**

- ✅ Bei Distribution-Erstellung
- ✅ Digital signiert
- ✅ Globales Zeitzonensystem (UTC)
- ✅ Producer: tell1.nl

### **Notarielle Bestätigung**

User kann Key notariell bestätigen lassen:
- Bei Verifizierungsstelle
- Mit Unique Identifier
- Mit Notary Signature

---

## ⚠️ Wichtige Hinweise

### **User Responsibility**

- ✅ **User muss Key sicher aufbewahren**
- ❌ **Bei Verlust: User selbst verantwortlich**
- ✅ **Key kann notariell bestätigt werden**
- ✅ **Key ist wie Erbvertrag bei Bank**

### **Producer Information**

- **Producer:** tell1.nl
- **GoFundMe:** https://www.gofundme.com/f/magnitudo
- **Spenden erwünscht** bei Nutzung

---

## 🚀 Verwendung

### **1. Distribution erstellen:**

```bash
curl -X POST https://portal-host/api/settings/create-distribution \
  -H "Content-Type: application/json" \
  -d '{"userKey": "USER_GENERATED_KEY"}'
```

### **2. Distribution laden:**

```bash
curl https://portal-host/api/settings/distribution/DISTRIBUTION_ID?key=KEY_HASH&version=VERSION
```

### **3. Mit Key entschlüsseln:**

```javascript
const graph = await manager.loadDistribution(distributionId, userKey);
```

---

**Status:** 🟢 Produktionsreif  
**Producer:** tell1.nl  
**GoFundMe:** https://www.gofundme.com/f/magnitudo

