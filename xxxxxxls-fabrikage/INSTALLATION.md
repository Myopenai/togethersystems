# XXXXXXLS FABRIKAGE - INSTALLATION & QUICK START

## 🚀 EIN-KLICK INSTALLATION

### Windows (PowerShell)

```powershell
cd "xxxxxxls-fabrikage"
npm install
npm run dev
```

### Linux/Mac (Bash)

```bash
cd xxxxxxls-fabrikage
npm install
npm run dev
```

---

## 📋 VORAUSSETZUNGEN

- **Node.js** (Version 14 oder höher)
- **npm** (kommt mit Node.js)

### Node.js Installation prüfen:

```bash
node --version
npm --version
```

Falls nicht installiert: https://nodejs.org/

---

## 🎯 SCHNELLSTART

1. **Verzeichnis wechseln:**
   ```bash
   cd xxxxxxls-fabrikage
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Server starten:**
   ```bash
   npm run dev
   ```

4. **Browser öffnen:**
   ```
   http://localhost:5173
   ```

---

## ✅ VERIFICATION

Nach dem Start sollte folgendes erscheinen:

```
═══════════════════════════════════════════════════════════
  XXXXXXLS Fabrikage System
  Running on http://localhost:5173
  Version: 1.0.0
═══════════════════════════════════════════════════════════
```

---

## 🔧 TROUBLESHOOTING

### Port bereits belegt?

Port ändern:
```bash
PORT=3000 npm run dev
```

### Dependencies Fehler?

Cache löschen und neu installieren:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Windows: PowerShell Execution Policy?

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📁 DATEIEN ÜBERSICHT

Nach Installation sollten folgende Dateien vorhanden sein:

```
xxxxxxls-fabrikage/
├── node_modules/        # Dependencies (nach npm install)
├── package.json        # Projekt-Konfiguration
├── server.js           # Express Server
├── README.md          # Dokumentation
├── INSTALLATION.md    # Diese Datei
└── public/            # Frontend-Dateien
    ├── index.html
    ├── assets/
    └── apps/
```

---

## 🎨 ERSTE SCHRITTE

1. **Dashboard öffnen:** http://localhost:5173
2. **Node-Editor testen:** http://localhost:5173/apps/node.html
3. **Bubble-Scene ansehen:** http://localhost:5173/apps/bubble.html
4. **API testen:** http://localhost:5173/api/health

---

## 🔗 WEITERE INFORMATIONEN

- Vollständige Dokumentation: `README.md`
- API-Dokumentation: `/downloads/` im Browser
- System Status: `/api/health`

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 1.0.0



