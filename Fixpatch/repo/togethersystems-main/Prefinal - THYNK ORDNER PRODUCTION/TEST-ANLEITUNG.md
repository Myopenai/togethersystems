# 🧪 TEST-ANLEITUNG - ALLE SCRIPTS TESTEN

**Zweck:** Vollständige Anleitung zum Testen aller Deployment-Scripts

---

## 🚀 SCHNELLSTART

### Alle Tests auf einmal:
```bash
./RUN-ALL-TESTS.sh
```

---

## 📋 EINZELNE TESTS

### 1. Dokumentationen prüfen

```bash
# Prüfe ob alle Dokumentationen vorhanden sind
ls -la DOKUMENTATION-*.md README-*.md
```

### 2. Deployment-Script testen (Linux/macOS)

```bash
# Teste DEPLOY-ALL.sh
chmod +x DEPLOY-ALL.sh
./DEPLOY-ALL.sh

# Prüfe Ergebnis
ls -la THYNK-ORDERS-FINAL/
```

### 3. Deployment-Script testen (Windows)

**CMD:**
```cmd
DEPLOY-ALL.bat
```

**PowerShell:**
```powershell
.\DEPLOY-ALL.ps1
```

### 4. Playwright-Tests

```bash
cd tests
npm install
npx playwright install --with-deps chromium
npx playwright test
```

### 5. Settings-Apps

```bash
./tests/start-all-settings-applications.sh
```

---

## ✅ WAS WIRD GETESTET?

### Dokumentationen:
- ✅ Alle DE-Dokumentationen vorhanden?
- ✅ Alle NL-Dokumentationen vorhanden?
- ✅ Alle EN-Dokumentationen vorhanden?

### Deployment-Scripts:
- ✅ Script kann ausgeführt werden?
- ✅ Ordner-Struktur wird erstellt?
- ✅ Alle Dateien werden kopiert?
- ✅ index.html ist vorhanden?

### Playwright:
- ✅ Application lädt?
- ✅ Tabs funktionieren?
- ✅ Theme-Switcher funktioniert?
- ✅ Bestellung erstellen funktioniert?

### Settings:
- ✅ Settings-Ordner vorhanden?
- ✅ Settings-Manifest vorhanden?
- ✅ Monitoring-Systeme aktiv?

---

**Status:** ✅ **Alle Test-Scripts bereit!**


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
