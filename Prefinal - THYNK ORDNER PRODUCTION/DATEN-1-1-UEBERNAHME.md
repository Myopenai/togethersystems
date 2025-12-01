# THYNK ORDERS - 1:1 Datenübernahme von thynkorders.com

**Quelle:** https://thynkorders.com/#/userCenter  
**Zweck:** Vollständige technische Absicherung ALLER Firmen-Daten

---

## 🔐 KRITISCH WICHTIG

Alle Daten müssen **EXAKT 1:1** von thynkorders.com übernommen werden.  
**Keine Änderungen ohne Genehmigung!**

---

## 📋 SCHRITT-FÜR-SCHRITT ANLEITUNG

### Schritt 1: Zugriff auf thynkorders.com

1. Öffnen Sie: **https://thynkorders.com/#/userCenter**
2. Loggen Sie sich ein mit Ihren Credentials
3. Navigieren Sie durch alle Bereiche

---

### Schritt 2: Salesforce CRM Konfiguration sichern

#### A. Org-Informationen:

1. Gehen Sie zu: **Setup → Company Information**
2. Notieren Sie:
   - **Org-ID:** `00D...` (18-stellig)
   - **Instance URL:** `https://xxx.salesforce.com`
   - **API Version:** Meist `v59.0` oder aktuellste

3. Tragen Sie in `config/salesforce-config.json` ein:
```json
{
  "salesforce": {
    "org_id": "IHRE_ORG_ID_HIER",
    "instance_url": "https://ihre-instance.salesforce.com",
    "api_version": "v59.0"
  }
}
```

#### B. Connected App (OAuth):

1. Gehen Sie zu: **Setup → App Manager → New Connected App**
2. Oder finden Sie bestehende Connected App
3. Notieren Sie:
   - **Consumer Key (Client ID)**
   - **Consumer Secret (Client Secret)**
   - **Callback URL**

4. Tragen Sie in `config/salesforce-config.json` ein:
```json
{
  "auth": {
    "client_id": "IHRE_CLIENT_ID",
    "client_secret": "IHRE_CLIENT_SECRET",
    "redirect_uri": "https://thynkorders.com/callback"
  }
}
```

#### C. Custom Objects & Fields:

1. Gehen Sie zu: **Setup → Object Manager**
2. Finden Sie alle Custom Objects:
   - `Order__c`
   - `Order_Item__c`
   - `Product__c`
   - etc.

3. Für jedes Object:
   - Öffnen Sie das Object
   - Gehen Sie zu: **Fields & Relationships**
   - Listen Sie alle Field-Namen auf

4. Tragen Sie in `config/salesforce-config.json` ein:
```json
{
  "objects": {
    "orders": {
      "api_name": "Order__c",
      "fields": [
        "Id",
        "Name",
        "Order_Number__c",
        "Status__c",
        "Total_Amount__c",
        "... ALLE FIELDS HIER ..."
      ]
    }
  }
}
```

---

### Schritt 3: Dimensionen & Geschäftslogik sichern

#### A. Bestell-Workflow:

1. Gehen Sie zu: **Workflow-Administration** oder **Process Builder**
2. Finden Sie alle Workflow-Status
3. Notieren Sie die komplette Workflow-Kette

4. Tragen Sie in `config/dimensions-config.json` ein:
```json
{
  "dimensions": {
    "hospitality": {
      "business_logic": {
        "order_workflow": [
          "Status1",
          "Status2",
          "... ALLE STATUS HIER ..."
        ]
      }
    }
  }
}
```

#### B. Bestelltypen & Kategorien:

1. Gehen Sie zu: **Picklist Values** oder **Custom Settings**
2. Finden Sie:
   - Bestelltypen (Restaurant, Hotel, etc.)
   - Produktkategorien
   - Kunden-Segmente

3. Tragen Sie ALLE Werte in `config/dimensions-config.json` ein

---

### Schritt 4: Neuronale Netzwerke / AI sichern

#### A. AI-Modelle finden:

1. Prüfen Sie: **Einstein Analytics** oder **AI-Features**
2. Oder: **Custom Apex Classes** die AI verwenden
3. Notieren Sie:
   - Model-Namen
   - Training-Parameter
   - Prediction-Endpunkte

#### B. Konfiguration dokumentieren:

Tragen Sie in `config/neural-network-config.json` ein:
```json
{
  "neural_networks": {
    "recommendation_engine": {
      "type": "Einstein Recommendation",
      "model_id": "...",
      "parameters": {...}
    }
  }
}
```

---

### Schritt 5: User Center Konfiguration sichern

#### A. Rollen & Berechtigungen:

1. Gehen Sie zu: **Setup → Users → Roles**
2. Listen Sie alle Rollen auf
3. Für jede Rolle: Notieren Sie Permissions

4. Tragen Sie in `config/user-center-config.json` ein:
```json
{
  "user_center": {
    "user_roles": {
      "admin": {
        "permissions": ["permission1", "permission2", "..."]
      }
    }
  }
}
```

#### B. Dashboard-Konfiguration:

1. Gehen Sie zu: **Dashboards**
2. Öffnen Sie das User Center Dashboard
3. Notieren Sie alle Widgets und deren Konfiguration

---

## 🛠️ AUTOMATISCHES TOOL

### Manueller Import-Editor:

1. Öffnen Sie: **`scripts/manual-config-import.html`** im Browser
2. Loggen Sie sich in thynkorders.com ein (separates Tab)
3. Kopieren Sie alle Daten in den Import-Editor
4. Klicken Sie: **"✅ Alle Konfigurationen exportieren"**

---

## ✅ VALIDIERUNG

Nach der Übernahme:

1. ✅ JSON-Syntax prüfen (keine Fehler)
2. ✅ Alle Pflichtfelder gefüllt
3. ✅ Vergleich mit Original (1:1)
4. ✅ Backup erstellen

---

## 📁 DATEIEN ZU FÜLLEN

1. ✅ `config/salesforce-config.json`
2. ✅ `config/dimensions-config.json`
3. ✅ `config/neural-network-config.json`
4. ✅ `config/user-center-config.json`

---

## 🔒 SICHERHEIT

**WICHTIG:**
- ❌ **NIEMALS** API-Keys in Git committen!
- ✅ Verwenden Sie `.env` Dateien
- ✅ `.gitignore` ist bereits konfiguriert

---

## 📞 QUelle

Alle Daten stammen von: **https://thynkorders.com/#/userCenter**

---

**Status:** ⚠️ **MUSS MIT ECHTEN DATEN GEFÜLLT WERDEN**

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

