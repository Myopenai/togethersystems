# Tests manuell ausführen

Die Tests benötigen einen **laufenden lokalen Webserver** auf Port 9323.

## Schritt 1: Webserver starten

**Im TELCOMPETIOION Root-Verzeichnis:**

```bash
cd D:\TELCOMPETIOION
python -m http.server 9323
```

ODER mit PowerShell:

```powershell
cd D:\TELCOMPETIOION
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m http.server 9323"
```

## Schritt 2: Tests ausführen

**In einem NEUEN Terminal:**

```bash
cd D:\TELBOUISNINESSTESTS\businessconnecthub-playwright-tests-full
npx playwright test --project=Chromium
```

## Schritt 3: HTML-Report anzeigen (optional)

```bash
npx playwright show-report
```

## Schnelltest (nur ein Test)

```bash
cd D:\TELBOUISNINESSTESTS\businessconnecthub-playwright-tests-full
npx playwright test --project=Chromium tests/start.spec.ts
```

## Wichtige Hinweise

- ✅ Webserver **MUSS** auf Port 9323 laufen, bevor Tests gestartet werden
- ✅ Webserver im Hintergrund lassen, während Tests laufen
- ✅ Tests dauern ca. 2-5 Minuten (29 Tests insgesamt)
- ✅ Bei Timeout-Fehlern: Server prüfen ob er läuft

