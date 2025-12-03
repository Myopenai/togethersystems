# T,. SETTINGS-ORDNER BERATUNGS-ANALYSE
## Analyse, Empfehlungen & Erweiterungen für industrielle Fabriken

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**VERSION:** 1.0.0-BERATUNG  
**DATUM:** 2025-01-15  
**TYP:** Beratungsanalyse (kein Code)

---

## 📋 EXECUTIVE SUMMARY

Diese Analyse untersucht die Settings-Ordner-Struktur, gibt Empfehlungen zur Organisation und zeigt Erweiterungsmöglichkeiten für industrielle Fabrikinstallationen (Hardware, nicht nur Software).

**Kernfrage:** Ein Settings-Ordner oder mehrere? Was ist trackmäßig günstiger?

**Antwort:** **Ein zentraler Settings-Ordner mit modularen Unterordnern** ist die trackmäßig günstigste und wartbarste Lösung.

---

## 🔍 ANALYSE: SETTINGS-ORDNER-STRUKTUR

### 1. IDENTIFIZIERTE SETTINGS-ORDNER

#### 1.1 Hauptordner (Aktiv)
**Pfad:** `settings/` (Root-Verzeichnis)

**Struktur:**
```
settings/
├── api/                    # Settings-API (TypeScript)
├── config/                 # Konfigurationsdateien (12 JSON)
├── core/                   # Core-Module (23 TypeScript/JavaScript)
├── dashboard/              # Dashboard (HTML, CSS, JS)
├── database/               # Datenbank-Konfigurationen (4 JSON)
├── dimensions/             # Dimensions-System (2 TS, 1 JSON, 1 MD)
├── mcp/                    # MCP-System (3 TS, 2 MD, 1 JSON)
├── nodes/                  # Node-Konfigurationen (3 JSON)
├── policies/               # Compliance-Policies (1 JSON)
├── routines/               # Routinen (2 JS, 2 JSON)
├── schemas/                # JSON-Schemas (14 JSON, 1 TS)
├── scripts/                # Scripts (8 JS)
├── templates/              # Templates (1 JSON, 1 Template)
├── tests/                  # Tests (1 JS)
├── utils/                  # Utilities (3 JS)
├── versions/               # Versionierung (1 MD)
└── [60+ JSON-Dateien]      # Root-Level-Konfigurationen
```

**Gesamt:** ~150+ Dateien

#### 1.2 Backup-Ordner (Inaktiv)
**Pfade:**
- `backup/portal-2025-11-28-105610/Settings/`
- `backup/portal-2025-11-28-110820/Settings/`
- `TTT/PRODUCTION-PROCESS/backups/*/Settings/`

**Status:** Archiviert, nicht aktiv verwendet

**Empfehlung:** Diese können archiviert/entfernt werden, da sie nur Backups sind.

#### 1.3 Funktionale Unterordner

**Kritische Unterordner (behalten):**
- `core/` - Kern-Module (23 Dateien)
- `config/` - Konfigurationen (12 Dateien)
- `schemas/` - Validierungs-Schemas (15 Dateien)
- `routines/` - Wiederverwendbare Routinen (4 Dateien)
- `mcp/` - MCP-Integration (6 Dateien)

**Optionale Unterordner:**
- `api/` - API-Definitionen
- `dashboard/` - Dashboard-UI
- `database/` - Datenbank-Configs
- `dimensions/` - Dimensions-System
- `nodes/` - Node-Konfigurationen
- `policies/` - Compliance
- `scripts/` - Utility-Scripts
- `templates/` - Vorlagen
- `tests/` - Tests
- `utils/` - Utilities
- `versions/` - Versionierung

---

## 💡 EMPFEHLUNG: ORDNER-STRUKTUR

### Option 1: Ein zentraler Settings-Ordner (EMPFOHLEN)

**Vorteile:**
- ✅ **Trackmäßig günstigste Lösung**
- ✅ Einfache Wartung
- ✅ Klare Struktur
- ✅ Einfache Suche
- ✅ Konsistente Pfade
- ✅ Einfache Backup-Strategie

**Struktur:**
```
settings/
├── manifest.json           # Zentrales Manifest
├── core/                   # Kern-Module
├── config/                 # Konfigurationen
├── schemas/                # Schemas
├── routines/               # Routinen
├── industrial/             # NEU: Industrielle Fabriken
│   ├── hardware/          # Hardware-Anbindungen
│   ├── signals/           # Signalgeber
│   ├── switches/          # Schaltmodule
│   └── protocols/         # Kommunikations-Protokolle
└── [Root-Level JSON]      # Wichtige Konfigurationen
```

**Nachteile:**
- ⚠️ Viele Dateien in einem Ordner (lösbar durch Unterordner)

### Option 2: Mehrere Settings-Ordner (NICHT EMPFOHLEN)

**Nachteile:**
- ❌ **Trackmäßig teurer** (mehr Pfade, mehr Wartung)
- ❌ Inkonsistente Struktur
- ❌ Schwierigere Suche
- ❌ Komplexere Backup-Strategie
- ❌ Risiko von Duplikaten

**Fazit:** Option 1 ist deutlich günstiger und wartbarer.

---

## 🏭 ERWEITERUNGEN: INDUSTRIELLE FABRIKEN

### 1. HARDWARE-ANBINDUNGEN

#### 1.1 Schaltmodule (Switches)

**Anforderungen:**
- **Eingänge:** Digital (0/1), Analog (0-10V, 4-20mA), Frequenz
- **Ausgänge:** Relais, Transistor, SSR (Solid State Relay)
- **Protokolle:** Modbus RTU/TCP, Profinet, EtherCAT, OPC-UA, MQTT
- **Sicherheit:** Galvanische Trennung, Überlastschutz

**Integration in Settings:**
```json
{
  "industrial": {
    "switches": {
      "modbus": {
        "enabled": true,
        "protocol": "Modbus RTU/TCP",
        "ports": ["/dev/ttyUSB0", "192.168.1.100:502"],
        "devices": [
          {
            "id": "switch-001",
            "type": "digital-input",
            "address": 1,
            "function": "read-coils"
          },
          {
            "id": "switch-002",
            "type": "digital-output",
            "address": 2,
            "function": "write-single-coil"
          }
        ]
      },
      "opcua": {
        "enabled": true,
        "endpoint": "opc.tcp://192.168.1.100:4840",
        "security": "none/basic128rsa15",
        "nodes": [
          {
            "id": "ns=2;s=Switch1",
            "name": "Production Line Switch 1",
            "type": "boolean"
          }
        ]
      }
    }
  }
}
```

#### 1.2 Signalgeber (Signal Generators)

**Anforderungen:**
- **Test-Signale:** Für Test-Situationen (Simulation)
- **Real-Signale:** Für Realsituationen (Live-Daten)
- **Formate:** Digital, Analog, PWM, Frequenz, Serial
- **Protokolle:** MQTT, WebSocket, HTTP REST, OPC-UA

**Integration in Settings:**
```json
{
  "industrial": {
    "signals": {
      "test": {
        "enabled": true,
        "mode": "simulation",
        "generators": [
          {
            "id": "test-signal-001",
            "type": "digital",
            "pattern": "square",
            "frequency": 1.0,
            "amplitude": 1.0
          },
          {
            "id": "test-signal-002",
            "type": "analog",
            "pattern": "sine",
            "frequency": 50.0,
            "amplitude": 5.0,
            "offset": 2.5
          }
        ]
      },
      "real": {
        "enabled": true,
        "mode": "live",
        "sources": [
          {
            "id": "real-signal-001",
            "type": "modbus",
            "device": "switch-001",
            "address": 1,
            "polling-interval": 100
          },
          {
            "id": "real-signal-002",
            "type": "opcua",
            "node": "ns=2;s=TemperatureSensor1",
            "polling-interval": 1000
          }
        ]
      }
    }
  }
}
```

#### 1.3 Industrielle Protokolle

**Unterstützte Protokolle:**

1. **Modbus RTU/TCP**
   - Standard in der Industrie
   - Einfache Integration
   - Weit verbreitet

2. **OPC-UA**
   - Moderne, sichere Lösung
   - Plattform-unabhängig
   - Semantic Information Model

3. **Profinet**
   - Real-Time Ethernet
   - Hohe Performance
   - Siemens-Standard

4. **EtherCAT**
   - Real-Time Ethernet
   - Sehr hohe Performance
   - Beckhoff-Standard

5. **MQTT**
   - IoT-Standard
   - Leichtgewichtig
   - Cloud-fähig

6. **HTTP REST**
   - Web-Standard
   - Einfache Integration
   - Universell

7. **WebSocket**
   - Echtzeit-Kommunikation
   - Bidirektional
   - Web-fähig

### 2. ANBINDUNGS-ARCHITEKTUR

#### 2.1 Hardware-Abstraktions-Layer (HAL)

**Zweck:** Einheitliche Schnittstelle für alle Hardware-Typen

**Struktur:**
```
settings/industrial/
├── hardware/
│   ├── hal.json            # Hardware-Abstraktions-Layer Config
│   ├── devices/            # Geräte-Definitionen
│   │   ├── switches.json
│   │   ├── sensors.json
│   │   ├── actuators.json
│   │   └── controllers.json
│   └── protocols/         # Protokoll-Konfigurationen
│       ├── modbus.json
│       ├── opcua.json
│       ├── profinet.json
│       ├── ethercat.json
│       └── mqtt.json
├── signals/
│   ├── test/              # Test-Signal-Generatoren
│   │   ├── digital.json
│   │   ├── analog.json
│   │   └── frequency.json
│   └── real/               # Real-Signal-Quellen
│       ├── modbus.json
│       ├── opcua.json
│       └── mqtt.json
└── switches/
    ├── digital.json        # Digitale Schaltmodule
    ├── analog.json         # Analoge Schaltmodule
    └── frequency.json      # Frequenz-Schaltmodule
```

#### 2.2 Signalgeber-Integration

**Test-Situationen:**
- **Simulation:** Generierte Test-Signale
- **Replay:** Aufgenommene Signale abspielen
- **Pattern:** Vordefinierte Signal-Muster

**Real-Situationen:**
- **Live-Daten:** Echte Hardware-Daten
- **Streaming:** Echtzeit-Datenstrom
- **Buffering:** Daten-Pufferung für Offline-Analyse

**Integration in Portal:**
- **Dashboard:** Live-Anzeige von Signalen
- **Logging:** Historische Daten
- **Alerts:** Warnungen bei Grenzwerten
- **Analytics:** Datenanalyse und Trends

### 3. SCHALTMODULE-ANBINDUNG

#### 3.1 Digitale Schaltmodule

**Eingänge:**
- **24V Digital Input:** Standard in der Industrie
- **5V TTL:** Für Mikrocontroller
- **Optokoppler:** Galvanische Trennung

**Ausgänge:**
- **Relais:** Mechanische Schalter
- **Transistor:** Schnelle Schalter
- **SSR:** Solid State Relay (keine beweglichen Teile)

**Anbindung:**
- **Modbus:** Standard-Protokoll
- **GPIO:** Direkter Hardware-Zugriff
- **I2C/SPI:** Für Embedded-Systeme

#### 3.2 Analoge Schaltmodule

**Eingänge:**
- **0-10V:** Standard-Analog-Eingang
- **4-20mA:** Strom-Loop (robust)
- **Thermocouple:** Temperatur-Messung
- **RTD:** Widerstands-Temperatur-Messung

**Ausgänge:**
- **0-10V:** Standard-Analog-Ausgang
- **4-20mA:** Strom-Loop-Ausgang
- **PWM:** Pulsweiten-Modulation

#### 3.3 Frequenz-Schaltmodule

**Eingänge:**
- **Frequenz:** 0-100 kHz
- **Encoder:** Inkremental, Absolut
- **Tachometer:** Drehzahl-Messung

**Ausgänge:**
- **Frequenz:** Variable Frequenz
- **PWM:** Pulsweiten-Modulation
- **Step/Direction:** Schrittmotor-Steuerung

### 4. PARALLEL-ANSCHLUSS-MÖGLICHKEITEN

#### 4.1 Multi-Protocol Support

**Gleichzeitige Unterstützung:**
- **Modbus + OPC-UA:** Parallel betreibbar
- **MQTT + WebSocket:** Beide gleichzeitig
- **HTTP REST + gRPC:** Kombinierbar

**Vorteil:** Flexibilität für verschiedene Fabriken

#### 4.2 Multi-Device Support

**Gleichzeitige Anbindung:**
- **Mehrere Modbus-Geräte:** Über verschiedene Ports/Adressen
- **Mehrere OPC-UA-Server:** Über verschiedene Endpoints
- **Hybrid-Setup:** Modbus + OPC-UA + MQTT gleichzeitig

**Vorteil:** Skalierbarkeit für große Fabriken

#### 4.3 Redundanz & Failover

**Features:**
- **Primary/Secondary:** Automatisches Failover
- **Load Balancing:** Verteilung auf mehrere Geräte
- **Health Monitoring:** Automatische Erkennung von Ausfällen

---

## 🎯 EMPFEHLUNG: TRACKMÄSSIG GÜNSTIGSTE LÖSUNG

### Empfehlung: Ein zentraler Settings-Ordner

**Begründung:**

1. **Wartbarkeit:**
   - Ein Ort für alle Konfigurationen
   - Einfache Suche und Navigation
   - Konsistente Pfade

2. **Trackmäßig günstig:**
   - Weniger Pfade zu verwalten
   - Einfacheres Backup
   - Einfacheres Deployment
   - Weniger Risiko von Inkonsistenzen

3. **Skalierbarkeit:**
   - Modulare Unterordner für Erweiterungen
   - Klare Struktur
   - Einfache Erweiterung um neue Module

4. **Konsistenz:**
   - Ein Manifest (`settings-manifest.json`)
   - Einheitliche Struktur
   - Einfache Validierung

### Optimierte Struktur

```
settings/
├── settings-manifest.json      # Zentrales Manifest
├── core/                       # Kern-Module (23 Dateien)
├── config/                     # Konfigurationen (12 Dateien)
├── schemas/                    # Schemas (15 Dateien)
├── routines/                   # Routinen (4 Dateien)
├── mcp/                        # MCP-Integration (6 Dateien)
├── industrial/                 # NEU: Industrielle Fabriken
│   ├── hardware/               # Hardware-Anbindungen
│   │   ├── hal.json
│   │   ├── devices/
│   │   │   ├── switches.json
│   │   │   ├── sensors.json
│   │   │   ├── actuators.json
│   │   │   └── controllers.json
│   │   └── protocols/
│   │       ├── modbus.json
│   │       ├── opcua.json
│   │       ├── profinet.json
│   │       ├── ethercat.json
│   │       └── mqtt.json
│   ├── signals/                # Signalgeber
│   │   ├── test/
│   │   │   ├── digital.json
│   │   │   ├── analog.json
│   │   │   └── frequency.json
│   │   └── real/
│   │       ├── modbus.json
│   │       ├── opcua.json
│   │       └── mqtt.json
│   └── switches/               # Schaltmodule
│       ├── digital.json
│       ├── analog.json
│       └── frequency.json
└── [Root-Level JSON]           # Wichtige Konfigurationen
```

---

## 🏭 ERWEITERUNGEN: INDUSTRIELLE FABRIKEN

### 1. HARDWARE-INTEGRATION

#### 1.1 Schaltmodule (Switches)

**Anforderungen:**
- **Eingänge:** Digital (0/1), Analog (0-10V, 4-20mA), Frequenz
- **Ausgänge:** Relais, Transistor, SSR (Solid State Relay)
- **Protokolle:** Modbus RTU/TCP, Profinet, EtherCAT, OPC-UA, MQTT
- **Sicherheit:** Galvanische Trennung, Überlastschutz

**Integration:**
- **Settings:** `settings/industrial/switches/`
- **API:** REST API für Schaltmodule
- **Dashboard:** Live-Anzeige im Portal
- **Logging:** Historische Daten

#### 1.2 Signalgeber (Signal Generators)

**Test-Situationen:**
- **Simulation:** Generierte Test-Signale
- **Replay:** Aufgenommene Signale abspielen
- **Pattern:** Vordefinierte Signal-Muster

**Real-Situationen:**
- **Live-Daten:** Echte Hardware-Daten
- **Streaming:** Echtzeit-Datenstrom
- **Buffering:** Daten-Pufferung

**Integration:**
- **Settings:** `settings/industrial/signals/`
- **API:** REST API für Signalgeber
- **Dashboard:** Live-Anzeige im Portal
- **Analytics:** Datenanalyse und Trends

#### 1.3 Industrielle Protokolle

**Unterstützte Protokolle:**
1. **Modbus RTU/TCP** - Standard in der Industrie
2. **OPC-UA** - Moderne, sichere Lösung
3. **Profinet** - Real-Time Ethernet (Siemens)
4. **EtherCAT** - Real-Time Ethernet (Beckhoff)
5. **MQTT** - IoT-Standard
6. **HTTP REST** - Web-Standard
7. **WebSocket** - Echtzeit-Kommunikation

**Integration:**
- **Settings:** `settings/industrial/hardware/protocols/`
- **API:** Protokoll-spezifische APIs
- **Dashboard:** Protokoll-Status im Portal

### 2. ANBINDUNGS-ARCHITEKTUR

#### 2.1 Hardware-Abstraktions-Layer (HAL)

**Zweck:** Einheitliche Schnittstelle für alle Hardware-Typen

**Komponenten:**
- **Device Drivers:** Geräte-spezifische Treiber
- **Protocol Adapters:** Protokoll-Adapter
- **Signal Processors:** Signal-Verarbeitung
- **Data Loggers:** Daten-Logging

**Integration:**
- **Settings:** `settings/industrial/hardware/hal.json`
- **API:** HAL-API für Hardware-Zugriff
- **Dashboard:** Hardware-Status im Portal

#### 2.2 Parallel-Anschluss-Möglichkeiten

**Multi-Protocol Support:**
- **Gleichzeitige Unterstützung:** Modbus + OPC-UA + MQTT
- **Flexibilität:** Verschiedene Fabriken können verschiedene Protokolle nutzen
- **Skalierbarkeit:** Mehrere Geräte gleichzeitig

**Multi-Device Support:**
- **Gleichzeitige Anbindung:** Mehrere Geräte über verschiedene Protokolle
- **Hybrid-Setup:** Modbus + OPC-UA + MQTT gleichzeitig
- **Redundanz:** Primary/Secondary mit automatischem Failover

### 3. SIGNALGEBER FÜR TEST- UND REALSITUATIONEN

#### 3.1 Test-Signale

**Zweck:** Für potenzielle Käufer, die das System noch nicht haben

**Features:**
- **Simulation:** Generierte Test-Signale ohne Hardware
- **Demo-Modus:** Vorführung der Funktionalität
- **Online-Bestätigung:** Bestätigung, dass alles funktioniert
- **Test-Szenarien:** Vordefinierte Test-Szenarien

**Integration:**
- **Settings:** `settings/industrial/signals/test/`
- **Portal:** Demo-Modus im Portal
- **API:** Test-Signal-API

#### 3.2 Real-Signale

**Zweck:** Für echte Fabriken mit Hardware

**Features:**
- **Live-Daten:** Echte Hardware-Daten
- **Streaming:** Echtzeit-Datenstrom
- **Buffering:** Daten-Pufferung
- **Analytics:** Datenanalyse und Trends

**Integration:**
- **Settings:** `settings/industrial/signals/real/`
- **Portal:** Live-Dashboard im Portal
- **API:** Real-Signal-API

---

## 📊 KOSTEN-NUTZEN-ANALYSE

### Option 1: Ein zentraler Settings-Ordner

**Kosten:**
- **Wartung:** Niedrig (ein Ort)
- **Backup:** Niedrig (ein Ordner)
- **Deployment:** Niedrig (ein Pfad)
- **Entwicklung:** Niedrig (konsistente Struktur)

**Nutzen:**
- **Wartbarkeit:** Hoch
- **Konsistenz:** Hoch
- **Skalierbarkeit:** Hoch
- **Trackmäßig:** Sehr günstig

**Gesamtbewertung:** ⭐⭐⭐⭐⭐ (5/5)

### Option 2: Mehrere Settings-Ordner

**Kosten:**
- **Wartung:** Hoch (mehrere Orte)
- **Backup:** Hoch (mehrere Ordner)
- **Deployment:** Hoch (mehrere Pfade)
- **Entwicklung:** Hoch (inkonsistente Struktur)

**Nutzen:**
- **Wartbarkeit:** Niedrig
- **Konsistenz:** Niedrig
- **Skalierbarkeit:** Niedrig
- **Trackmäßig:** Teuer

**Gesamtbewertung:** ⭐ (1/5)

**Fazit:** Option 1 ist deutlich günstiger und wartbarer.

---

## 🚀 ERWEITERUNGS-ROADMAP

### Phase 1: Settings-Konsolidierung (Sofort)
- ✅ Ein zentraler Settings-Ordner
- ✅ Backup-Ordner archivieren
- ✅ Struktur optimieren

### Phase 2: Industrielle Hardware-Integration (Kurzfristig)
- ⏳ Hardware-Abstraktions-Layer (HAL)
- ⏳ Modbus-Integration
- ⏳ OPC-UA-Integration
- ⏳ MQTT-Integration

### Phase 3: Signalgeber-System (Mittelfristig)
- ⏳ Test-Signal-Generatoren
- ⏳ Real-Signal-Quellen
- ⏳ Signal-Processing
- ⏳ Signal-Analytics

### Phase 4: Schaltmodule-Integration (Mittelfristig)
- ⏳ Digitale Schaltmodule
- ⏳ Analoge Schaltmodule
- ⏳ Frequenz-Schaltmodule
- ⏳ Multi-Protocol Support

### Phase 5: Vollständige Fabrik-Integration (Langfristig)
- ⏳ Vollständige Hardware-Integration
- ⏳ Redundanz & Failover
- ⏳ Skalierung für große Fabriken
- ⏳ Cloud-Integration

---

## 💼 FÜR POTENZIELLE KÄUFER

### Online-Bestätigungssystem

**Zweck:** Für Leute, die das System noch nicht haben und überlegen, es anzuschaffen

**Features:**
1. **Test-Signal-Generatoren:**
   - Simulation ohne Hardware
   - Demo-Modus im Portal
   - Vorführung der Funktionalität

2. **Online-Bestätigung:**
   - Bestätigung, dass alles funktioniert
   - Live-Demo im Portal
   - Test-Szenarien

3. **Signalgeber für Test-Situationen:**
   - Generierte Test-Signale
   - Vordefinierte Test-Szenarien
   - Online-Verfügbar

4. **Signalgeber für Real-Situationen:**
   - Live-Hardware-Daten
   - Echtzeit-Datenstrom
   - Nach Kauf verfügbar

**Integration:**
- **Portal:** Demo-Modus im Portal
- **API:** Test-Signal-API
- **Dashboard:** Live-Anzeige

---

## 📋 ZUSAMMENFASSUNG & EMPFEHLUNGEN

### Empfehlung 1: Ein zentraler Settings-Ordner

**Begründung:**
- Trackmäßig günstigste Lösung
- Einfachste Wartung
- Konsistente Struktur
- Skalierbar für Erweiterungen

### Empfehlung 2: Industrielle Erweiterungen

**Neue Struktur:**
```
settings/industrial/
├── hardware/        # Hardware-Anbindungen
├── signals/         # Signalgeber (Test & Real)
└── switches/       # Schaltmodule
```

**Vorteile:**
- Klare Trennung Software/Hardware
- Einfache Erweiterung
- Modulare Struktur

### Empfehlung 3: Parallel-Anschluss-Möglichkeiten

**Features:**
- Multi-Protocol Support (Modbus + OPC-UA + MQTT)
- Multi-Device Support
- Redundanz & Failover

**Vorteile:**
- Flexibilität für verschiedene Fabriken
- Skalierbarkeit für große Fabriken
- Robustheit durch Redundanz

### Empfehlung 4: Signalgeber für Test & Real

**Test-Situationen:**
- Simulation ohne Hardware
- Demo-Modus für potenzielle Käufer
- Online-Bestätigung

**Real-Situationen:**
- Live-Hardware-Daten
- Echtzeit-Datenstrom
- Nach Kauf verfügbar

---

## 🎯 NÄCHSTE SCHRITTE

1. **Settings-Konsolidierung:**
   - Backup-Ordner archivieren
   - Struktur optimieren
   - Manifest aktualisieren

2. **Industrielle Erweiterungen:**
   - `settings/industrial/` Ordner erstellen
   - Hardware-Abstraktions-Layer definieren
   - Protokoll-Integrationen planen

3. **Signalgeber-System:**
   - Test-Signal-Generatoren implementieren
   - Real-Signal-Quellen planen
   - Portal-Integration vorbereiten

4. **Schaltmodule-Integration:**
   - Digitale Schaltmodule planen
   - Analoge Schaltmodule planen
   - Multi-Protocol Support implementieren

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0-BERATUNG  
**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

---

**T,. SETTINGS-ORDNER BERATUNGS-ANALYSE**

