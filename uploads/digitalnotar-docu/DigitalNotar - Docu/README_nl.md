
# 📘 Digitaal Notariaat – Gebruikershandleiding (Nederlands)

Welkom bij **Digitaal Notariaat** – een modern hulpmiddel voor het ondersteunen van notariële procedures.  
Het bevat ook krachtige browser-tools voor dagelijks gebruik.

---

## 🧰 Functies Overzicht

### 🏛️ Notariële Functies
| Functie | Beschrijving |
|---------|--------------|
| ✅ Identiteitsverificatie | Verificatie van persoonsgegevens en documenten (voor- en achterkant) |
| 📄 Documentnotarisering | Digitale notarisering en certificering met blockchain-hash |
| ✍️ Handtekeningauthenticatie | Gekwalificeerde elektronische handtekeningen (versleuteld) |
| 📦 Digitaal Archief | Veilige opslag van alle documenten met AES-256 |
| 📤 Export & Rapporten | Data-export voor autoriteiten (PDF, XML, JSON, Audit-Log) |
| 🔐 Twee-Factor Authenticatie | TOTP-gebaseerde beveiliging voor kritieke acties |
| 💾 Automatische Backups | 24u backups met checksum-validatie |
| 👥 Klantenbeheer | Ondersteuning voor 100.000+ klanten met indexering |
| 📊 Prestatie-Monitoring | Real-time systeemprestatie monitoring |

### 🌐 Browser-Tools
| Functie | Beschrijving |
|---------|--------------|
| 🔐 Wachtwoordbeheer | Beheer van inloggegevens, lokaal opgeslagen |
| 🚫 Advertentieblokkeerder | Blokkeert tracking- en advertentiescripts |
| 📸 Screenshot-Tool | Maakt screenshots van de website |
| 📊 SEO-Checker | Controleert paginastructuur (titel, meta, koppen) |
| ⚙️ Autofill-Engine | Vult formulieren automatisch in |
| 📤 Bestandsupload | Ondersteunt bestandsselectie & weergave |

---

## 🚀 One-Click Installatie

### Windows (install.bat)
```batch
@echo off
echo ========================================
echo    Digitaal Notariaat - Installatie
echo ========================================
echo.
echo [INFO] Start installatie...
echo [INFO] Controleer Node.js installatie...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js niet gevonden! Installeer Node.js van https://nodejs.org
    pause
    exit /b 1
)
echo [SUCCESS] Node.js gevonden!
echo.
echo [INFO] Installeer afhankelijkheden...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Installatie mislukt!
    pause
    exit /b 1
)
echo [SUCCESS] Afhankelijkheden geïnstalleerd!
echo.
echo [INFO] Start ontwikkelingsserver...
echo [INFO] Browser opent automatisch...
echo [INFO] Server draait op: http://localhost:5173
echo.
echo [SUCCESS] Installatie voltooid!
echo [INFO] Druk op STRG+C om te stoppen
echo.
call pnpm run dev
```

### Linux/macOS (install.sh)
```bash
#!/bin/bash

echo "========================================"
echo "   Digitaal Notariaat - Installatie"
echo "========================================"
echo

# Kleuren voor logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log-functie
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[${timestamp}] [INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[${timestamp}] [WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] [ERROR]${NC} $message"
            ;;
    esac
}

log "INFO" "Start installatie..."

# Controleer Node.js
log "INFO" "Controleer Node.js installatie..."
if ! command -v node &> /dev/null; then
    log "ERROR" "Node.js niet gevonden! Installeer Node.js van https://nodejs.org"
    exit 1
fi

log "SUCCESS" "Node.js gevonden! Versie: $(node --version)"

# Controleer pnpm
log "INFO" "Controleer pnpm installatie..."
if ! command -v pnpm &> /dev/null; then
    log "WARNING" "pnpm niet gevonden! Installeer pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        log "ERROR" "pnpm installatie mislukt!"
        exit 1
    fi
fi

log "SUCCESS" "pnpm gevonden! Versie: $(pnpm --version)"

# Installeer afhankelijkheden
log "INFO" "Installeer afhankelijkheden..."
pnpm install
if [ $? -ne 0 ]; then
    log "ERROR" "Installatie mislukt!"
    exit 1
fi

log "SUCCESS" "Afhankelijkheden geïnstalleerd!"

# Start ontwikkelingsserver
log "INFO" "Start ontwikkelingsserver..."
log "INFO" "Browser opent automatisch..."
log "INFO" "Server draait op: http://localhost:5173"
log "SUCCESS" "Installatie voltooid!"
log "INFO" "Druk op STRG+C om te stoppen"
echo

pnpm run dev
```

---

## 🖥️ Desktop-app gebruiken (Electron voor Windows/macOS/Linux)

### Vereisten:
- [Node.js installeren](https://nodejs.org) (aanbevolen versie 18 of hoger)
- [pnpm installeren](https://pnpm.io/installation) (wordt automatisch geïnstalleerd)

### 1. Installatie
- **Windows**: Dubbelklik op `install.bat`
- **Mac/Linux**: Open terminal en voer in:
```bash
chmod +x install.sh
./install.sh
```

### 2. Applicatie starten
Na de installatie opent het hoofdvenster automatisch.

---

## 🌐 Browser-extensie gebruiken

### Voor Google Chrome:
1. Open `chrome://extensions/`
2. "Ontwikkelaarsmodus" inschakelen
3. "Uitgepakte extensie laden"
4. Selecteer map `DigitalNotary_InstallerReady`

### Voor Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. "Tijdelijke add-on laden"
3. Selecteer `manifest.json` in projectmap

---

## 🔐 Beveiligingsfuncties

### Twee-Factor Authenticatie (2FA)
- **TOTP-gebaseerd** - Compatibel met Google Authenticator, Authy
- **Kritieke acties beschermd**: Identiteitsverificatie, documentnotarisering, handtekeningen, export, verwijderingen
- **Eenmalige verificatie** - Sessie blijft actief tot browser-sluiting
- **Demo-codes**: 6-cijferige codes die eindigen op "123" (bijv. 000123)

### Automatische Backups
- **24-uurs interval** - Automatische backups elke 24 uur
- **Handmatige backups** - Onmiddellijke backup-aanmaak op verzoek
- **JSON-formaat** - Volledige data-exports met metadata
- **Checksum-validatie** - Data-integriteit wordt gecontroleerd
- **Tijdstempel** - Backup-geschiedenis met datum/tijd

### Versleutelde Dataopslag
- **AES-256 versleuteling** - Militaire versleuteling voor alle data
- **Versleutelde handtekeningen** - Digitale handtekeningen worden extra versleuteld
- **Salt-gebaseerde versleuteling** - Verhoogde beveiliging door salt-generatie
- **Lokale opslag** - Alle data blijft op uw systeem

---

## 👥 Klantenbeheer

### Schaalbaarheid
- **100.000+ klanten** - Ondersteuning voor grote notariskantoren
- **Klant-indexering** - Snelle zoekacties en filtering
- **Prestatie-optimalisatie** - Automatische database-optimalisatie
- **Prioriteitsbeheer** - Categoriseer klanten op prioriteit

### Geavanceerde functies
- **Klantzoekactie** - Volledige tekstzoekactie in alle klantgegevens
- **Prioriteitsfilters** - Filter op urgentie (laag, gemiddeld, hoog, dringend)
- **Afsprakenbeheer** - Overzicht van aankomende afspraken
- **Notaris-toewijzing** - Wijs klanten toe aan specifieke notarissen

---

## 📊 Prestatie-Monitoring

### Systeemstatus
- **Real-time monitoring** - Live status van alle systeemcomponenten
- **Prestatiemetrieken** - Zoektijden, filtertijden, opslaggrootte
- **Optimalisatie-aanbevelingen** - Automatische verbeteringsvoorstellen
- **Database-statistieken** - Gedetailleerde database-prestatieanalyse

### Compliance
- **AVG-conform** - Volledige AVG-compliance
- **eIDAS-verordening** - Vervulling van eIDAS-vereisten
- **Notarisreglement** - Conformiteit met Nederlandse notarisvoorschriften

---

## 🌐 Browser-Tools

De applicatie bevat ook krachtige browser-tools:

### 🔐 Wachtwoordbeheer
- Veilige lokale opslag van inloggegevens
- Automatische wachtwoordgeneratie
- Zoekfunctie en categorisering
- Versleutelde dataopslag

### 🚫 Advertentieblokkeerder
- Blokkeert tracking- en advertentiescripts
- Real-time statistieken over geblokkeerde verzoeken
- Aanpasbare blokkeringsregels
- Bescherming tegen malware en phishing

### 📸 Screenshot-Tool
- Volledige pagina-screenshots
- Verschillende formaten (PNG, JPEG, WebP)
- Responsieve weergaven (Desktop, Tablet, Mobile)
- Automatische download

### 📊 SEO-Checker
- Paginastructuuranalyse
- Controle van meta-tags en koppen
- Prestatie-evaluatie
- Toegankelijkheidscontroles

### ⚙️ Autofill-Engine
- Intelligente formulierherkenning
- Meerdere gebruikersprofielen
- Automatisch invullen van contactgegevens
- Ondersteuning voor creditcardgegevens

### 📤 Bestandsupload
- Drag & Drop ondersteuning
- Meerdere bestandsformaten (PDF, afbeeldingen, documenten)
- Voorvertoning en validatie
- Voortgangsindicator

---

## 🔧 Technische Details

### Systeemvereisten
- **Node.js**: Versie 18 of hoger
- **pnpm**: Versie 8 of hoger
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Besturingssysteem**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Architectuur
- **Frontend**: React 18 met TypeScript
- **Backend**: Node.js met Express
- **Database**: Lokale SQLite met versleuteling
- **Versleuteling**: AES-256 met Salt
- **Authenticatie**: TOTP-gebaseerde 2FA

### Beveiliging
- **Versleuteling**: AES-256 voor alle gevoelige data
- **Authenticatie**: Twee-factor authenticatie
- **Backups**: Automatische versleutelde backups
- **Compliance**: AVG, eIDAS, Notarisreglement

---

## 📞 Ondersteuning

Voor vragen of problemen:
- **E-mail**: support@digitaal-notariaat.nl
- **Documentatie**: Volledige documentatie in project
- **Issues**: GitHub Issues voor bug-rapporten

---

## 📄 Licentie

Dit project is gelicentieerd onder de MIT-licentie. Zie LICENSE-bestand voor details.
