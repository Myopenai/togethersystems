# Hardware-Dokumentation - Raspberry Pi & HATs
## Detaillierte Anleitung für Dummies

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 📋 INHALTSVERZEICHNIS

1. [Raspberry Pi Grundlagen](#raspberry-pi-grundlagen)
2. [HATs (Hardware Attached on Top)](#hats)
3. [Energie-Messung (Solar, Brennstoffzelle)](#energie-messung)
4. [Beschaffungsquellen](#beschaffungsquellen)
5. [Montage & Anschlüsse](#montage--anschlüsse)
6. [Löten (wenn nötig)](#löten)
7. [Software-Setup](#software-setup)
8. [Troubleshooting](#troubleshooting)

---

## 🍓 RASPBERRY PI GRUNDLAGEN

### Was ist ein Raspberry Pi?

Ein **Raspberry Pi** ist ein kleiner, günstiger Computer (ca. 35-75€), der:
- Linux-basiert ist (Raspberry Pi OS)
- Über GPIO-Pins (General Purpose Input/Output) mit Hardware kommuniziert
- Perfekt für Home-Automation, Sensoren, und lokale Server ist

### Modelle

| Modell | RAM | Preis | Empfehlung |
|--------|-----|-------|------------|
| Raspberry Pi 4 (4GB) | 4GB | ~75€ | ✅ **Empfohlen** |
| Raspberry Pi 4 (8GB) | 8GB | ~95€ | Für anspruchsvolle Anwendungen |
| Raspberry Pi Zero 2 W | 512MB | ~15€ | Für einfache Projekte |

**Empfehlung:** Raspberry Pi 4 (4GB) für Apple-Pi System

---

## 🔌 HATS (HARDWARE ATTACHED ON TOP)

### Was sind HATs?

**HATs** sind Erweiterungsplatinen, die direkt auf den GPIO-Header des Raspberry Pi gesteckt werden.

### Wichtige HATs für Apple-Pi System

#### 1. Energie-Messung HAT

**Zweck:** Messung von Solar-Energie, Brennstoffzelle, Stromverbrauch

**Empfohlene HATs:**
- **I2C Energy Monitor HAT** (ca. 25€)
- **ADS1115 ADC HAT** (ca. 15€) + Stromwandler

**Funktionen:**
- Spannungsmessung (0-30V)
- Strommessung (0-30A)
- Leistungsberechnung (P = U × I)
- Energie-Integration (kWh)

#### 2. Sensor HAT

**Zweck:** Temperatur, Feuchtigkeit, Umgebungsdaten

**Empfohlene HATs:**
- **Sense HAT** (ca. 35€) - Offiziell von Raspberry Pi
- **Enviro pHAT** (ca. 20€)

**Funktionen:**
- Temperatur
- Luftfeuchtigkeit
- Luftdruck
- LED-Matrix (8×8)

#### 3. Relais HAT

**Zweck:** Schalten von Geräten (Lampen, Heizung, etc.)

**Empfohlene HATs:**
- **4-Channel Relay HAT** (ca. 15€)
- **8-Channel Relay HAT** (ca. 25€)

**⚠️ WICHTIG:** Nur für Niederspannung (12V/24V). **NIEMALS Netzspannung (230V) ohne Fachkraft!**

---

## ⚡ ENERGIE-MESSUNG

### Solar-Energie-Messung

**Hardware:**
1. **Stromwandler (Current Transformer, CT):**
   - Typ: SCT-013-030 (30A) oder SCT-013-000 (100A)
   - Preis: ca. 10-15€
   - Anschluss: Um Leiter wickeln (nicht-invasiv)

2. **Spannungsteiler:**
   - Für 230V → 3.3V (Raspberry Pi max. 3.3V!)
   - Widerstände: 1MΩ + 10kΩ
   - Preis: ca. 2€

3. **ADS1115 ADC HAT:**
   - 16-bit Analog-Digital-Wandler
   - I2C-Interface
   - Preis: ca. 15€

**Anschluss:**
```
Stromwandler → ADS1115 A0 (Strom)
Spannungsteiler → ADS1115 A1 (Spannung)
ADS1115 → Raspberry Pi (I2C: SDA, SCL, 3.3V, GND)
```

**Software:**
```python
# Beispiel-Code (vereinfacht)
import Adafruit_ADS1x15
import time

adc = Adafruit_ADS1x15.ADS1115()

while True:
    current = adc.read_adc(0)  # Strom
    voltage = adc.read_adc(1)   # Spannung
    power = current * voltage   # Leistung (W)
    energy += power * (1/3600)  # Energie (kWh)
    time.sleep(1)
```

### Brennstoffzelle-Messung

**Hardware:**
- **Wasserstoff-Flussmesser** (Mass Flow Controller)
- **Spannungs-/Strom-Messung** (wie bei Solar)
- **Temperatur-Sensor** (für Effizienz-Berechnung)

**Anschluss:**
Ähnlich wie Solar, zusätzlich:
- Flussmesser → ADS1115 A2
- Temperatur → I2C (z.B. DS18B20)

---

## 🛒 BESCHAFFUNGSQUELLEN

### Offizielle Distributoren

1. **Raspberry Pi:**
   - [raspberrypi.com](https://www.raspberrypi.com)
   - [Farnell/Element14](https://de.farnell.com)
   - [RS Components](https://de.rs-online.com)

2. **HATs & Zubehör:**
   - [Adafruit](https://www.adafruit.com) - Sehr gute Dokumentation
   - [SparkFun](https://www.sparkfun.com)
   - [Pimoroni](https://shop.pimoroni.com) - Spezialisiert auf Raspberry Pi

### Deutsche Händler

- **Conrad** - [conrad.de](https://www.conrad.de)
- **Reichelt** - [reichelt.de](https://www.reichelt.de)
- **Watterott** - [watterott.com](https://www.watterott.com)

### Amazon/eBay

⚠️ **Vorsicht:** Viele günstige HATs sind **Kopien** ohne Dokumentation. Für Anfänger: **Offizielle HATs** empfehlenswert.

---

## 🔧 MONTAGE & ANSCHLÜSSE

### Schritt 1: Raspberry Pi vorbereiten

1. **SD-Karte** (mind. 32GB, Class 10) mit **Raspberry Pi OS** flashen
2. **SSH aktivieren:** Leere Datei `ssh` auf Boot-Partition erstellen
3. **WLAN konfigurieren:** `wpa_supplicant.conf` auf Boot-Partition

### Schritt 2: HAT montieren

1. **Raspberry Pi ausschalten** (⚠️ WICHTIG!)
2. **HAT auf GPIO-Header stecken:**
   - GPIO-Header ist der 40-Pin-Stecker auf dem Raspberry Pi
   - HAT hat passende Buchse
   - **Richtung beachten:** Pin 1 (meist markiert) muss übereinstimmen
3. **Standoffs montieren** (falls mitgeliefert)
4. **Raspberry Pi einschalten**

### Schritt 3: Software installieren

```bash
# Auf Raspberry Pi
sudo apt update
sudo apt install -y python3-pip i2c-tools

# I2C aktivieren
sudo raspi-config
# → Interface Options → I2C → Enable

# HAT testen
i2cdetect -y 1
# Sollte HAT-Adresse anzeigen (z.B. 0x48 für ADS1115)
```

---

## 🔥 LÖTEN

### Wann ist Löten nötig?

- **NICHT nötig:** Wenn HATs bereits gelötet sind (meist der Fall)
- **Nötig:** Wenn Sie eigene Platinen bauen oder Kabel anlöten

### Sicherheitsregeln

1. **Augenschutz tragen** (Lötdampf, Spritzer)
2. **Gute Belüftung** (Fenster öffnen, Lüfter)
3. **Lötstation verwenden** (nicht Lötkolben mit offener Flamme)
4. **Temperatur:** 350-400°C (nicht zu heiß!)
5. **Flussmittel:** Verwenden, aber sparsam

### Grundlagen

1. **Lötkolben vorheizen** (2-3 Minuten)
2. **Lötstelle reinigen** (Isopropylalkohol)
3. **Lötzinn auftragen:**
   - Lötkolben kurz auf Lötstelle
   - Lötzinn hinzufügen (nicht auf Lötkolben!)
   - Lötkolben entfernen
4. **Ergebnis prüfen:**
   - Glänzend, nicht matt
   - Keine kalten Lötstellen (bröckelig)

### Tutorials

- [Adafruit - Learn to Solder](https://learn.adafruit.com/adafruit-guide-excellent-soldering)
- [SparkFun - How to Solder](https://learn.sparkfun.com/tutorials/how-to-solder)

---

## 💻 SOFTWARE-SETUP

### 1. Raspberry Pi OS installieren

```bash
# Mit Raspberry Pi Imager (Windows/Mac/Linux)
# Download: https://www.raspberrypi.com/software/

# 1. SD-Karte einstecken
# 2. Raspberry Pi Imager öffnen
# 3. OS auswählen: "Raspberry Pi OS (64-bit)"
# 4. SD-Karte auswählen
# 5. "Write" klicken
```

### 2. SSH & WLAN konfigurieren

**SSH aktivieren:**
- Leere Datei `ssh` (ohne Endung) auf Boot-Partition erstellen

**WLAN konfigurieren:**
- Datei `wpa_supplicant.conf` auf Boot-Partition:
```
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="IHR_WLAN_NAME"
    psk="IHR_WLAN_PASSWORT"
}
```

### 3. Docker installieren (für Apple-Pi Services)

```bash
# Auf Raspberry Pi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo apt install -y docker-compose
```

### 4. Apple-Pi Services starten

```bash
cd /opt/apple-pi
docker-compose -f infra/docker-compose.yml up -d
```

---

## 🔍 TROUBLESHOOTING

### Problem: HAT wird nicht erkannt

**Lösung:**
```bash
# I2C testen
i2cdetect -y 1

# Wenn leer: I2C aktivieren
sudo raspi-config
# → Interface Options → I2C → Enable

# Raspberry Pi neu starten
sudo reboot
```

### Problem: Falsche Messwerte

**Lösung:**
- **Kalibrierung prüfen:** Offset/Scale-Faktoren in Code anpassen
- **Verkabelung prüfen:** GND, 3.3V, SDA, SCL korrekt?
- **Spannung prüfen:** Raspberry Pi liefert 3.3V (nicht 5V!)

### Problem: Raspberry Pi startet nicht

**Lösung:**
- **SD-Karte prüfen:** Neu flashen
- **Stromversorgung:** Mind. 5V/3A (offizielles Netzteil)
- **HDMI:** Monitor anschließen, Fehlermeldungen lesen

---

## 📚 WEITERE RESSOURCEN

- **Raspberry Pi Dokumentation:** [raspberrypi.org/documentation](https://www.raspberrypi.org/documentation)
- **Adafruit Learn:** [learn.adafruit.com](https://learn.adafruit.com)
- **SparkFun Tutorials:** [learn.sparkfun.com](https://learn.sparkfun.com)

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt: 2025-01-27*


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
