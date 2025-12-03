# T,. SETTINGS – INDUSTRIELLE FABRIKEN ERWEITERUNG
## Detaillierte Erweiterungsplanung für Hardware-Anbindungen

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**VERSION:** 1.0.0-ERWEITERUNG  
**DATUM:** 2025-01-15  
**TYP:** Erweiterungsplanung (kein Code)

---

## 🏭 ÜBERSICHT: INDUSTRIELLE FABRIKEN-INTEGRATION

### Ziel
Das System soll über Softwareproduktion hinauswachsen und **vollständige Anschlussmöglichkeiten für alle verifizierten industriellen Fabrikinstallationen** bieten - nicht nur Software, sondern auch Hardware.

### Kernanforderungen
1. **Schaltmodule:** Alle Schaltmodule sollen Anschlussparallelmöglichkeiten haben
2. **Signalgeber:** Für Test- und Realsituationen
3. **Hardware-Integration:** Anbindung an Logik, Intelligenz und Macht des Softwarepakets
4. **Portal-Integration:** Signalgeber als Ausgabe für Test- und Realsituationen
5. **Potenzielle Käufer:** Online-Bestätigung, dass alles funktioniert

---

## 🔌 SCHALTMODULE-ANBINDUNGEN

### 1. Digitale Schaltmodule

#### 1.1 Eingänge
**Typen:**
- **24V Digital Input:** Standard in der Industrie (SPS, PLC)
- **5V TTL:** Für Mikrocontroller (Arduino, Raspberry Pi)
- **Optokoppler:** Galvanische Trennung (Sicherheit)

**Anbindung:**
- **Modbus:** Standard-Protokoll für industrielle Automatisierung
- **GPIO:** Direkter Hardware-Zugriff (Raspberry Pi, BeagleBone)
- **I2C/SPI:** Für Embedded-Systeme

**Settings-Struktur:**
```json
{
  "industrial": {
    "switches": {
      "digital": {
        "inputs": [
          {
            "id": "di-001",
            "name": "Production Line Start Button",
            "type": "24v-digital",
            "protocol": "modbus",
            "address": 10001,
            "function": "read-discrete-inputs",
            "safety": {
              "galvanic-isolation": true,
              "overload-protection": true
            }
          }
        ],
        "outputs": [
          {
            "id": "do-001",
            "name": "Production Line Motor Control",
            "type": "relay",
            "protocol": "modbus",
            "address": 1,
            "function": "write-single-coil",
            "safety": {
              "emergency-stop": true,
              "overload-protection": true
            }
          }
        ]
      }
    }
  }
}
```

#### 1.2 Ausgänge
**Typen:**
- **Relais:** Mechanische Schalter (robust, langsam)
- **Transistor:** Schnelle Schalter (hohe Frequenz)
- **SSR:** Solid State Relay (keine beweglichen Teile, langlebig)

**Anwendungen:**
- **Motoren:** Start/Stop, Richtung
- **Lampen:** Beleuchtung, Warnleuchten
- **Ventile:** Pneumatik, Hydraulik
- **Heizungen:** Temperatur-Regelung

### 2. Analoge Schaltmodule

#### 2.1 Eingänge
**Typen:**
- **0-10V:** Standard-Analog-Eingang
- **4-20mA:** Strom-Loop (robust, störungsresistent)
- **Thermocouple:** Temperatur-Messung (K-Typ, J-Typ, etc.)
- **RTD:** Widerstands-Temperatur-Messung (Pt100, Pt1000)

**Anwendungen:**
- **Temperatur:** Öfen, Kühlanlagen, Prozesse
- **Druck:** Druckmessung, Vakuum
- **Durchfluss:** Flüssigkeiten, Gase
- **Position:** Lineare/rotative Position

**Settings-Struktur:**
```json
{
  "industrial": {
    "switches": {
      "analog": {
        "inputs": [
          {
            "id": "ai-001",
            "name": "Furnace Temperature",
            "type": "thermocouple-k",
            "protocol": "modbus",
            "address": 30001,
            "function": "read-input-registers",
            "range": {
              "min": 0,
              "max": 1200,
              "unit": "celsius"
            },
            "calibration": {
              "offset": 0,
              "gain": 1.0
            }
          }
        ],
        "outputs": [
          {
            "id": "ao-001",
            "name": "Motor Speed Control",
            "type": "0-10v",
            "protocol": "modbus",
            "address": 40001,
            "function": "write-single-register",
            "range": {
              "min": 0,
              "max": 10,
              "unit": "volts"
            }
          }
        ]
      }
    }
  }
}
```

#### 2.2 Ausgänge
**Typen:**
- **0-10V:** Standard-Analog-Ausgang
- **4-20mA:** Strom-Loop-Ausgang
- **PWM:** Pulsweiten-Modulation (für Motoren, Heizungen)

**Anwendungen:**
- **Motoren:** Geschwindigkeits-Regelung
- **Heizungen:** Leistungs-Regelung
- **Ventile:** Positions-Regelung
- **Lampen:** Helligkeits-Regelung

### 3. Frequenz-Schaltmodule

#### 3.1 Eingänge
**Typen:**
- **Frequenz:** 0-100 kHz (für Drehzahl-Messung)
- **Encoder:** Inkremental, Absolut (für Positions-Messung)
- **Tachometer:** Drehzahl-Messung

**Anwendungen:**
- **Drehzahl:** Motoren, Turbinen, Pumpen
- **Position:** Lineare/rotative Position
- **Durchfluss:** Durchfluss-Messung

**Settings-Struktur:**
```json
{
  "industrial": {
    "switches": {
      "frequency": {
        "inputs": [
          {
            "id": "fi-001",
            "name": "Motor RPM",
            "type": "frequency",
            "protocol": "modbus",
            "address": 30001,
            "function": "read-input-registers",
            "range": {
              "min": 0,
              "max": 3000,
              "unit": "rpm"
            }
          }
        ],
        "outputs": [
          {
            "id": "fo-001",
            "name": "Variable Frequency Drive",
            "type": "pwm",
            "protocol": "modbus",
            "address": 40001,
            "function": "write-single-register",
            "range": {
              "min": 0,
              "max": 100,
              "unit": "percent"
            }
          }
        ]
      }
    }
  }
}
```

#### 3.2 Ausgänge
**Typen:**
- **Frequenz:** Variable Frequenz (für Motoren)
- **PWM:** Pulsweiten-Modulation
- **Step/Direction:** Schrittmotor-Steuerung

**Anwendungen:**
- **Motoren:** Geschwindigkeits-Regelung
- **Schrittmotoren:** Präzise Positionierung
- **Servomotoren:** Positions-Regelung

---

## 📡 SIGNALGEBER-SYSTEM

### 1. Test-Signale (Für potenzielle Käufer)

#### 1.1 Simulation
**Zweck:** Für Leute, die das System noch nicht haben und überlegen, es anzuschaffen

**Features:**
- **Generierte Signale:** Ohne Hardware
- **Demo-Modus:** Vorführung der Funktionalität
- **Online-Bestätigung:** Bestätigung, dass alles funktioniert
- **Test-Szenarien:** Vordefinierte Test-Szenarien

**Settings-Struktur:**
```json
{
  "industrial": {
    "signals": {
      "test": {
        "enabled": true,
        "mode": "simulation",
        "generators": [
          {
            "id": "test-digital-001",
            "name": "Test Digital Signal",
            "type": "digital",
            "pattern": "square",
            "frequency": 1.0,
            "amplitude": 1.0,
            "duty-cycle": 50,
            "description": "Square wave for testing digital inputs"
          },
          {
            "id": "test-analog-001",
            "name": "Test Analog Signal",
            "type": "analog",
            "pattern": "sine",
            "frequency": 50.0,
            "amplitude": 5.0,
            "offset": 2.5,
            "description": "Sine wave for testing analog inputs"
          },
          {
            "id": "test-frequency-001",
            "name": "Test Frequency Signal",
            "type": "frequency",
            "pattern": "constant",
            "frequency": 1000.0,
            "description": "Constant frequency for testing frequency inputs"
          }
        ],
        "scenarios": [
          {
            "id": "scenario-production-line",
            "name": "Production Line Simulation",
            "description": "Simulates a complete production line",
            "signals": [
              "test-digital-001",
              "test-analog-001",
              "test-frequency-001"
            ],
            "duration": 3600,
            "repeat": true
          }
        ]
      }
    }
  }
}
```

#### 1.2 Demo-Modus im Portal
**Features:**
- **Live-Dashboard:** Anzeige von Test-Signalen
- **Visualisierung:** Grafische Darstellung
- **Interaktivität:** User kann Signale starten/stoppen
- **Online-Verfügbar:** Keine Installation nötig

**Integration:**
- **Portal:** Demo-Modus im Portal
- **API:** Test-Signal-API
- **Dashboard:** Live-Anzeige

### 2. Real-Signale (Für echte Fabriken)

#### 2.1 Live-Daten
**Zweck:** Für echte Fabriken mit Hardware

**Features:**
- **Live-Hardware-Daten:** Echte Hardware-Daten
- **Streaming:** Echtzeit-Datenstrom
- **Buffering:** Daten-Pufferung
- **Analytics:** Datenanalyse und Trends

**Settings-Struktur:**
```json
{
  "industrial": {
    "signals": {
      "real": {
        "enabled": true,
        "mode": "live",
        "sources": [
          {
            "id": "real-modbus-001",
            "name": "Production Line Modbus",
            "type": "modbus",
            "protocol": "modbus-tcp",
            "endpoint": "192.168.1.100:502",
            "device": "switch-001",
            "address": 1,
            "polling-interval": 100,
            "timeout": 5000,
            "retries": 3
          },
          {
            "id": "real-opcua-001",
            "name": "Production Line OPC-UA",
            "type": "opcua",
            "protocol": "opcua",
            "endpoint": "opc.tcp://192.168.1.100:4840",
            "node": "ns=2;s=TemperatureSensor1",
            "polling-interval": 1000,
            "security": "basic128rsa15"
          },
          {
            "id": "real-mqtt-001",
            "name": "Production Line MQTT",
            "type": "mqtt",
            "protocol": "mqtt",
            "broker": "mqtt://192.168.1.100:1883",
            "topic": "factory/sensors/temperature",
            "qos": 1,
            "retain": false
          }
        ],
        "processing": {
          "buffering": true,
          "buffer-size": 1000,
          "analytics": true,
          "trends": true,
          "alerts": true
        }
      }
    }
  }
}
```

#### 2.2 Portal-Integration
**Features:**
- **Live-Dashboard:** Anzeige von Real-Signalen
- **Visualisierung:** Grafische Darstellung
- **Historische Daten:** Langzeit-Trends
- **Alerts:** Warnungen bei Grenzwerten

**Integration:**
- **Portal:** Live-Dashboard im Portal
- **API:** Real-Signal-API
- **Dashboard:** Live-Anzeige + Historische Daten

---

## 🔗 PARALLEL-ANSCHLUSS-MÖGLICHKEITEN

### 1. Multi-Protocol Support

#### 1.1 Gleichzeitige Unterstützung
**Kombinationen:**
- **Modbus + OPC-UA:** Parallel betreibbar
- **MQTT + WebSocket:** Beide gleichzeitig
- **HTTP REST + gRPC:** Kombinierbar
- **Alle Protokolle:** Gleichzeitig möglich

**Vorteil:** Flexibilität für verschiedene Fabriken

**Settings-Struktur:**
```json
{
  "industrial": {
    "hardware": {
      "protocols": {
        "parallel-support": true,
        "active-protocols": [
          "modbus",
          "opcua",
          "mqtt",
          "websocket"
        ],
        "resource-sharing": {
          "cpu": "fair-share",
          "memory": "dynamic",
          "network": "bandwidth-limited"
        }
      }
    }
  }
}
```

### 2. Multi-Device Support

#### 2.1 Gleichzeitige Anbindung
**Features:**
- **Mehrere Modbus-Geräte:** Über verschiedene Ports/Adressen
- **Mehrere OPC-UA-Server:** Über verschiedene Endpoints
- **Hybrid-Setup:** Modbus + OPC-UA + MQTT gleichzeitig

**Vorteil:** Skalierbarkeit für große Fabriken

**Settings-Struktur:**
```json
{
  "industrial": {
    "hardware": {
      "devices": {
        "max-concurrent": 100,
        "load-balancing": true,
        "failover": true,
        "devices": [
          {
            "id": "device-001",
            "protocol": "modbus",
            "endpoint": "192.168.1.100:502",
            "priority": "high"
          },
          {
            "id": "device-002",
            "protocol": "opcua",
            "endpoint": "opc.tcp://192.168.1.101:4840",
            "priority": "medium"
          }
        ]
      }
    }
  }
}
```

### 3. Redundanz & Failover

#### 3.1 Primary/Secondary
**Features:**
- **Automatisches Failover:** Bei Ausfall des Primary
- **Health Monitoring:** Automatische Erkennung von Ausfällen
- **Load Balancing:** Verteilung auf mehrere Geräte

**Settings-Struktur:**
```json
{
  "industrial": {
    "hardware": {
      "redundancy": {
        "enabled": true,
        "mode": "primary-secondary",
        "failover-time": 1000,
        "health-check-interval": 5000,
        "devices": [
          {
            "id": "device-primary",
            "role": "primary",
            "protocol": "modbus",
            "endpoint": "192.168.1.100:502"
          },
          {
            "id": "device-secondary",
            "role": "secondary",
            "protocol": "modbus",
            "endpoint": "192.168.1.101:502"
          }
        ]
      }
    }
  }
}
```

---

## 🎯 ANBINDUNG AN LOGIK, INTELLIGENZ & MACHT

### 1. Software-zu-Hardware-Brücke

#### 1.1 Signalgeber als Ausgabe
**Zweck:** Anbindung an Logik, Intelligenz und Macht des Softwarepakets

**Features:**
- **Portal → Hardware:** Signale vom Portal an Hardware senden
- **Hardware → Portal:** Daten von Hardware ins Portal
- **Bidirektional:** Vollständige Kommunikation

**Integration:**
- **Portal:** Signalgeber im Portal
- **API:** Signalgeber-API
- **Hardware:** Hardware-Anbindung

#### 1.2 Intelligenz-Layer
**Features:**
- **KI-Integration:** Neuronale Netzwerke für Mustererkennung
- **Predictive Maintenance:** Vorhersage von Wartungsbedarf
- **Optimization:** Automatische Optimierung von Prozessen

**Integration:**
- **Settings:** `settings/industrial/intelligence/`
- **Portal:** KI-Dashboard im Portal
- **API:** KI-API

### 2. Macht-Layer (Power Layer)

#### 2.1 Kontrolle & Steuerung
**Features:**
- **Vollständige Kontrolle:** Über alle angeschlossenen Geräte
- **Zentrale Steuerung:** Von einem Portal aus
- **Automatisierung:** Automatische Steuerung basierend auf Logik

**Integration:**
- **Settings:** `settings/industrial/power/`
- **Portal:** Kontroll-Panel im Portal
- **API:** Power-API

---

## 📊 ERWEITERUNGS-STRUKTUR

### Empfohlene Settings-Struktur

```
settings/
├── settings-manifest.json
├── industrial/                    # NEU: Industrielle Fabriken
│   ├── hardware/                 # Hardware-Anbindungen
│   │   ├── hal.json              # Hardware-Abstraktions-Layer
│   │   ├── devices/               # Geräte-Definitionen
│   │   │   ├── switches.json     # Schaltmodule
│   │   │   ├── sensors.json      # Sensoren
│   │   │   ├── actuators.json    # Aktoren
│   │   │   └── controllers.json  # Controller
│   │   └── protocols/            # Protokoll-Konfigurationen
│   │       ├── modbus.json
│   │       ├── opcua.json
│   │       ├── profinet.json
│   │       ├── ethercat.json
│   │       └── mqtt.json
│   ├── signals/                  # Signalgeber
│   │   ├── test/                 # Test-Signale
│   │   │   ├── digital.json
│   │   │   ├── analog.json
│   │   │   └── frequency.json
│   │   └── real/                 # Real-Signale
│   │       ├── modbus.json
│   │       ├── opcua.json
│   │       └── mqtt.json
│   ├── switches/                 # Schaltmodule
│   │   ├── digital.json
│   │   ├── analog.json
│   │   └── frequency.json
│   ├── intelligence/             # KI-Integration
│   │   ├── neural-networks.json
│   │   ├── predictive-maintenance.json
│   │   └── optimization.json
│   └── power/                    # Macht-Layer
│       ├── control.json
│       ├── automation.json
│       └── monitoring.json
└── [Bestehende Struktur]
```

---

## 🎯 FÜR POTENZIELLE KÄUFER

### Online-Bestätigungssystem

**Zweck:** Für Leute, die das System noch nicht haben und überlegen, es anzuschaffen

**Features:**

1. **Test-Signal-Generatoren:**
   - Simulation ohne Hardware
   - Demo-Modus im Portal
   - Vorführung der Funktionalität
   - Online-Bestätigung, dass alles funktioniert

2. **Live-Demo:**
   - Interaktive Demo im Portal
   - Test-Szenarien
   - Visualisierung von Signalen

3. **Bestätigung:**
   - Online-Bestätigung, dass alles funktioniert
   - Test-Report
   - Funktionalitäts-Nachweis

**Integration:**
- **Portal:** Demo-Modus im Portal
- **API:** Test-Signal-API
- **Dashboard:** Live-Anzeige

---

## 📋 ZUSAMMENFASSUNG

### Empfehlung: Ein zentraler Settings-Ordner

**Begründung:**
- ✅ Trackmäßig günstigste Lösung
- ✅ Einfachste Wartung
- ✅ Konsistente Struktur
- ✅ Skalierbar für Erweiterungen

### Erweiterungen: Industrielle Fabriken

**Neue Struktur:**
```
settings/industrial/
├── hardware/        # Hardware-Anbindungen
├── signals/         # Signalgeber (Test & Real)
├── switches/        # Schaltmodule
├── intelligence/    # KI-Integration
└── power/           # Macht-Layer
```

**Vorteile:**
- Klare Trennung Software/Hardware
- Einfache Erweiterung
- Modulare Struktur
- Parallel-Anschluss-Möglichkeiten

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0-ERWEITERUNG  
**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

---

**T,. SETTINGS – INDUSTRIELLE FABRIKEN ERWEITERUNG**

