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

