
# 📘 Digital Notary – User Guide (English)

Welcome to **Digital Notary** – a modern tool for supporting notarial procedures.  
It also includes powerful browser tools for everyday use.

---

## 🧰 Features Overview

### 🏛️ Notarial Functions
| Function | Description |
|----------|-------------|
| ✅ Identity Verification | Verification of personal data and documents (front and back) |
| 📄 Document Notarization | Digital notarization and certification with blockchain hash |
| ✍️ Signature Authentication | Qualified electronic signatures (encrypted) |
| 📦 Digital Archive | Secure storage of all documents with AES-256 |
| 📤 Export & Reports | Data export for authorities (PDF, XML, JSON, Audit-Log) |
| 🔐 Two-Factor Authentication | TOTP-based security for critical actions |
| 💾 Automatic Backups | 24h backups with checksum validation |
| 👥 Client Management | Support for 100,000+ clients with indexing |
| 📊 Performance Monitoring | Real-time system performance monitoring |

### 🌐 Browser Tools
| Function | Description |
|----------|-------------|
| 🔐 Password Manager | Management of login data, locally stored |
| 🚫 Ad Blocker | Blocks tracking and advertising scripts |
| 📸 Screenshot Tool | Takes screenshots of the website |
| 📊 SEO Checker | Checks page structure (title, meta, headings) |
| ⚙️ Autofill Engine | Automatically fills out forms |
| 📤 File Upload | Supports file selection & display |

---

## 🚀 One-Click Installation

### Windows (install.bat)
```batch
@echo off
echo ========================================
echo    Digital Notary - Installation
echo ========================================
echo.
echo [INFO] Starting installation...
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found!
echo.
echo [INFO] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed!
echo.
echo [INFO] Starting development server...
echo [INFO] Browser will open automatically...
echo [INFO] Server running on: http://localhost:5173
echo.
echo [SUCCESS] Installation completed!
echo [INFO] Press CTRL+C to stop
echo.
call pnpm run dev
```

### Linux/macOS (install.sh)
```bash
#!/bin/bash

echo "========================================"
echo "   Digital Notary - Installation"
echo "========================================"
echo

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log function
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

log "INFO" "Starting installation..."

# Check Node.js
log "INFO" "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    log "ERROR" "Node.js not found! Please install Node.js from https://nodejs.org"
    exit 1
fi

log "SUCCESS" "Node.js found! Version: $(node --version)"

# Check pnpm
log "INFO" "Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    log "WARNING" "pnpm not found! Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        log "ERROR" "pnpm installation failed!"
        exit 1
    fi
fi

log "SUCCESS" "pnpm found! Version: $(pnpm --version)"

# Install dependencies
log "INFO" "Installing dependencies..."
pnpm install
if [ $? -ne 0 ]; then
    log "ERROR" "Installation failed!"
    exit 1
fi

log "SUCCESS" "Dependencies installed!"

# Start development server
log "INFO" "Starting development server..."
log "INFO" "Browser will open automatically..."
log "INFO" "Server running on: http://localhost:5173"
log "SUCCESS" "Installation completed!"
log "INFO" "Press CTRL+C to stop"
echo

pnpm run dev
```

---

## 🖥️ Desktop App Usage (Electron for Windows/macOS/Linux)

### Prerequisites:
- [Install Node.js](https://nodejs.org) (recommended version 18 or higher)
- [Install pnpm](https://pnpm.io/installation) (will be installed automatically)

### 1. Installation
- **Windows**: Double-click `install.bat`
- **Mac/Linux**: Open terminal and enter:
```bash
chmod +x install.sh
./install.sh
```

### 2. Start application
After installation, the main window opens automatically.

---

## 🌐 Browser Extension Usage

### For Google Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. "Load unpacked extension"
4. Select folder `DigitalNotary_InstallerReady`

### For Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. "Load temporary add-on"
3. Select `manifest.json` in project folder

---

## 🔐 Security Features

### Two-Factor Authentication (2FA)
- **TOTP-based** - Compatible with Google Authenticator, Authy
- **Critical actions protected**: Identity verification, document notarization, signatures, export, deletions
- **One-time verification** - Session remains active until browser closure
- **Demo codes**: 6-digit codes ending with "123" (e.g., 000123)

### Automatic Backups
- **24-hour interval** - Automatic backups every 24 hours
- **Manual backups** - Immediate backup creation on demand
- **JSON format** - Complete data exports with metadata
- **Checksum validation** - Data integrity verification
- **Timestamp** - Backup history with date/time

### Encrypted Data Storage
- **AES-256 encryption** - Military-grade encryption for all data
- **Encrypted signatures** - Digital signatures are additionally encrypted
- **Salt-based encryption** - Enhanced security through salt generation
- **Local storage** - All data remains on your system

---

## 👥 Client Management

### Scalability
- **100,000+ clients** - Support for large notary offices
- **Client indexing** - Fast search and filtering
- **Performance optimization** - Automatic database optimization
- **Priority management** - Categorize clients by priority

### Advanced Features
- **Client search** - Full-text search in all client data
- **Priority filters** - Filter by urgency (low, medium, high, urgent)
- **Appointment management** - Overview of upcoming appointments
- **Notary assignment** - Assign clients to specific notaries

---

## 📊 Performance Monitoring

### System Status
- **Real-time monitoring** - Live status of all system components
- **Performance metrics** - Search times, filter times, storage size
- **Optimization recommendations** - Automatic improvement suggestions
- **Database statistics** - Detailed database performance analysis

### Compliance
- **GDPR compliant** - Full GDPR compliance
- **eIDAS regulation** - Fulfillment of eIDAS requirements
- **Notary regulations** - Compliance with German notary regulations

---

## 🌐 Browser Tools

The application also includes powerful browser tools:

### 🔐 Password Manager
- Secure local storage of login data
- Automatic password generation
- Search function and categorization
- Encrypted data storage

### 🚫 Ad Blocker
- Blocks tracking and advertising scripts
- Real-time statistics on blocked requests
- Customizable blocking rules
- Protection against malware and phishing

### 📸 Screenshot Tool
- Complete page screenshots
- Various formats (PNG, JPEG, WebP)
- Responsive views (Desktop, Tablet, Mobile)
- Automatic download

### 📊 SEO Checker
- Page structure analysis
- Meta tags and headings verification
- Performance evaluation
- Accessibility checks

### ⚙️ Autofill Engine
- Intelligent form recognition
- Multiple user profiles
- Automatic contact data filling
- Credit card data support

### 📤 File Upload
- Drag & Drop support
- Multiple file formats (PDF, images, documents)
- Preview and validation
- Progress indicator

---

## 🔧 Technical Details

### System Requirements
- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Operating System**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Architecture
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: Local SQLite with encryption
- **Encryption**: AES-256 with Salt
- **Authentication**: TOTP-based 2FA

### Security
- **Encryption**: AES-256 for all sensitive data
- **Authentication**: Two-factor authentication
- **Backups**: Automatic encrypted backups
- **Compliance**: GDPR, eIDAS, Notary regulations

---

## 📞 Support

For questions or issues:
- **Email**: support@digital-notary.com
- **Documentation**: Complete documentation in project
- **Issues**: GitHub Issues for bug reports

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.


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
