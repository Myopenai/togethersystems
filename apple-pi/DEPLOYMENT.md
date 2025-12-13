# Apple-Pi Deployment - Services auf Raspberry Pi deployen
## Vollständige Anleitung

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🚀 QUICK START

### 1. Raspberry Pi vorbereiten

```bash
# Auf Raspberry Pi
sudo apt update
sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo apt install -y docker-compose

# Projekt klonen
cd /opt
sudo git clone <IHR-REPO> apple-pi
sudo chown -R $USER:$USER apple-pi
cd apple-pi/apple-pi
```

### 2. Services bauen und starten

```bash
# Services bauen
docker-compose -f infra/docker-compose.yml build

# Services starten
docker-compose -f infra/docker-compose.yml up -d

# Status prüfen
docker-compose -f infra/docker-compose.yml ps
```

### 3. Zugriff testen

```bash
# Vom Mac/iOS
curl -k https://apple-pi.local/notary/manifest
```

---

## 📋 VOLLSTÄNDIGE ANLEITUNG

### Schritt 1: Raspberry Pi OS installieren

1. **Raspberry Pi Imager** herunterladen
2. **Raspberry Pi OS (64-bit)** auswählen
3. **SD-Karte** (mind. 32GB) flashen
4. **SSH aktivieren:** Leere Datei `ssh` auf Boot-Partition
5. **WLAN konfigurieren:** `wpa_supplicant.conf` auf Boot-Partition

### Schritt 2: Erste Anmeldung

```bash
# SSH-Verbindung (vom Mac)
ssh pi@raspberrypi.local

# Passwort ändern
passwd

# Hostname setzen (optional)
sudo hostnamectl set-hostname apple-pi
```

### Schritt 3: System aktualisieren

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

### Schritt 4: Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Neu einloggen oder:
newgrp docker

# Docker testen
docker run hello-world
```

### Schritt 5: Projekt deployen

```bash
# Projekt-Verzeichnis erstellen
sudo mkdir -p /opt/apple-pi
sudo chown $USER:$USER /opt/apple-pi
cd /opt/apple-pi

# Projekt klonen (oder SCP/RSYNC)
git clone <IHR-REPO> .
cd apple-pi

# Services bauen
docker-compose -f infra/docker-compose.yml build

# Services starten
docker-compose -f infra/docker-compose.yml up -d
```

### Schritt 6: TLS-Zertifikate erstellen

```bash
# Zertifikate-Verzeichnis
mkdir -p infra/certs

# Self-Signed Certificate erstellen
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infra/certs/server.key \
  -out infra/certs/server.crt \
  -subj "/CN=apple-pi.local"
```

### Schritt 7: mDNS konfigurieren (optional)

```bash
# Avahi installieren
sudo apt install -y avahi-daemon

# Service-Datei erstellen
sudo nano /etc/avahi/services/apple-pi.service
```

Inhalt:
```xml
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>Apple-Pi</name>
  <service>
    <type>_https._tcp</type>
    <port>443</port>
  </service>
</service-group>
```

```bash
# Avahi neu starten
sudo systemctl restart avahi-daemon
```

---

## 🔍 TROUBLESHOOTING

### Problem: Services starten nicht

```bash
# Logs prüfen
docker-compose -f infra/docker-compose.yml logs

# Einzelnen Service neu starten
docker-compose -f infra/docker-compose.yml restart notary-core
```

### Problem: Port bereits belegt

```bash
# Port prüfen
sudo netstat -tulpn | grep 443

# Service stoppen, der Port belegt
sudo systemctl stop <service>
```

### Problem: Zertifikat-Fehler

```bash
# Zertifikat neu erstellen
cd infra/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/CN=apple-pi.local"
```

---

## 📊 MONITORING

### Service-Status prüfen

```bash
# Alle Services
docker-compose -f infra/docker-compose.yml ps

# Logs
docker-compose -f infra/docker-compose.yml logs -f

# Ressourcen-Verbrauch
docker stats
```

### Health-Checks

```bash
# Notary-Core
curl -k https://apple-pi.local/notary/manifest

# Startup-Core
curl -k https://apple-pi.local/startup/products
```

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV


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
