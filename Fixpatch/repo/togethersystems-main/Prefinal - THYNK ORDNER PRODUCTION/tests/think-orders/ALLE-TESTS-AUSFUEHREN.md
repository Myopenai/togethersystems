# 🧪 Alle Tests ausführen - Anleitung

## 🎯 So führen Sie alle Tests aus

Diese Anleitung zeigt Ihnen, wie Sie alle Tests für die Think Orders Applikation ausführen.

---

## 🚀 Methode 1: Doppelklick (Einfachste)

### Windows PowerShell:

1. **Doppelklick** auf: `run-tests.ps1`
2. **Fertig!** Script führt automatisch aus:
   - ✅ Prüft Node.js
   - ✅ Prüft NPM
   - ✅ Installiert Dependencies (falls nötig)
   - ✅ Installiert Browser (falls nötig)
   - ✅ Führt alle Tests aus
   - ✅ Zeigt Ergebnis

### Windows CMD:

1. **Doppelklick** auf: `run-tests.bat`
2. **Fertig!** Script führt automatisch aus

---

## 🚀 Methode 2: Terminal (Manuell)

### Schritt 1: Terminal öffnen

**Windows:**
- Windows-Taste drücken
- "PowerShell" eingeben
- Enter drücken

### Schritt 2: Zum Ordner wechseln

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION\tests\think-orders"
```

**ODER Schritt für Schritt:**

```powershell
cd "THYNK ORDNER PRODUCTION"
cd tests
cd think-orders
```

### Schritt 3: Prüfen ob richtig

```powershell
ls
```

**Sie sollten sehen:** `package.json`

### Schritt 4: Dependencies installieren (falls nötig)

```powershell
npm install
```

**Warten bis fertig:** 2-5 Minuten

### Schritt 5: Browser installieren (falls nötig)

```powershell
npx playwright install
```

**Warten bis fertig:** 5-10 Minuten

### Schritt 6: Tests ausführen

```powershell
npm test
```

**Warten bis fertig:** 2-5 Minuten

### Schritt 7: Report ansehen (optional)

```powershell
npm run test:report
```

---

## 📊 Was Sie sehen werden

### Während Tests laufen:

```
Running 30 tests using 5 workers

  ✓ Navigation › Home-Seite sollte laden (2.1s)
  ✓ Navigation › Navigation zu User Center (1.8s)
  ✓ Home Dashboard › Quick Stats sollten angezeigt werden (1.5s)
  ...
```

### Am Ende:

```
  30 passed (120s)

To open last HTML report run:
  npx playwright show-report
```

**✅ Alle Tests erfolgreich!**

---

## 🎯 Verschiedene Modi

### Alle Tests (Standard):

```powershell
npm test
```

### Mit Browser sichtbar:

```powershell
npm run test:headed
```

**Was passiert:** Browser-Fenster öffnen sich, Sie sehen Tests laufen

### Debug-Modus:

```powershell
npm run test:debug
```

**Was passiert:** Test läuft Schritt für Schritt, Sie können jeden Schritt beobachten

### UI-Modus (Visuell):

```powershell
npm run test:ui
```

**Was passiert:** Visuelle Oberfläche mit allen Tests

### Nur bestimmter Browser:

```powershell
npm run test:chromium    # Nur Chrome
npm run test:firefox     # Nur Firefox
npm run test:webkit      # Nur Safari
npm run test:mobile      # Nur Mobile
```

---

## ✅ Erwartete Ergebnisse

### Erfolgreiche Tests:

- **30+ Tests** laufen durch
- **Alle bestanden** (passed)
- **Keine Fehler**
- **Dauer:** 2-5 Minuten

### Bei Fehlern:

- **Rote Fehlermeldungen** werden angezeigt
- **Screenshots** werden erstellt (bei Fehlern)
- **Videos** werden erstellt (bei Fehlern)
- **Report** zeigt Details

---

## 📋 Checkliste

- [ ] Terminal geöffnet
- [ ] Im richtigen Ordner (`ls` zeigt `package.json`)
- [ ] Node.js installiert (`node --version`)
- [ ] Dependencies installiert (`npm install`)
- [ ] Browser installiert (`npx playwright install`)
- [ ] Tests ausgeführt (`npm test`)
- [ ] Report angesehen (`npm run test:report`)

---

## 🐛 Probleme?

### "node ist nicht erkannt"
→ Node.js installieren: https://nodejs.org/
→ Terminal NEU starten

### "npm ist nicht erkannt"
→ NPM ist Teil von Node.js
→ Node.js komplett neu installieren

### Tests laufen nicht
→ Prüfen ob HTML-Datei existiert
→ Prüfen ob im richtigen Ordner
→ Browser installieren: `npx playwright install`

### Tests schlagen fehl
→ Mit `--headed` ausführen um zu sehen was passiert
→ Report ansehen für Details

**→ Siehe `HANDBUCH-DE-KOMPLETT.md` → Troubleshooting für Details**

---

## 🎉 Fertig!

Nach erfolgreichem Ausführen haben Sie:
- ✅ Alle Tests durchlaufen
- ✅ Alle Funktionen getestet
- ✅ Test-Report erstellt
- ✅ Screenshots/Videos bei Fehlern

**Viel Erfolg! 🚀**


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
