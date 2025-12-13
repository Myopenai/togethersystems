# 📚 Think Orders - Volledig Handboek voor Beginners (Nederlands)

## 🎯 Voor complete beginners - Stap voor stap

Dit handboek legt **alles vanaf het begin** uit - ook als u nog nooit een terminal of test-suite heeft gezien.

---

## 📋 Inhoudsopgave

1. [Wat is een Terminal?](#1-wat-is-een-terminal)
2. [Terminal openen - Stap voor stap](#2-terminal-openen-stap-voor-stap)
3. [Basis Terminal Commando's](#3-basis-terminal-commando)
4. [Tests installeren - Stap voor stap](#4-tests-installeren-stap-voor-stap)
5. [Tests uitvoeren - Stap voor stap](#5-tests-uitvoeren-stap-voor-stap)
6. [Test-resultaten begrijpen](#6-test-resultaten-begrijpen)
7. [Eigen tests toevoegen](#7-eigen-tests-toevoegen)
8. [Uitbreidingsmogelijkheden](#8-uitbreidingsmogelijkheden)
9. [Probleemoplossing](#9-probleemoplossing)
10. [Verder leren](#10-verder-leren)

---

## 1. Wat is een Terminal?

### Eenvoudig uitgelegd

Een **Terminal** is een **tekst-interface** naar uw computer. In plaats van klikken, typt u **commando's als tekst**.

**Vergelijking:**
- **Grafische interface (GUI)**: U klikt met de muis op iconen
- **Terminal (CLI)**: U typt commando's in

### Waarom Terminal?

- ✅ **Sneller** - Directe commando's
- ✅ **Preciezer** - Exacte controle
- ✅ **Automatiseerbaar** - Herhaalbare stappen
- ✅ **Professioneel** - Standaard bij ontwikkelaars

---

## 2. Terminal openen - Stap voor stap

### Windows

#### Methode 1: PowerShell (Aanbevolen)

1. **Windows-toets indrukken** (toets met Windows-logo)
2. **"PowerShell"** typen
3. **"Windows PowerShell"** klikken
4. **Klaar!** Zwart venster opent

#### Methode 2: CMD (Command Prompt)

1. **Windows-toets + R** indrukken
2. **"cmd"** invoeren
3. **Enter** indrukken
4. **Klaar!**

#### Methode 3: Via Verkenner

1. **Verkenner** openen
2. Navigeer naar map: `THYNK ORDNER PRODUCTION`
3. **Adresbalk aanklikken** (waar het pad staat)
4. **"powershell"** invoeren
5. **Enter** indrukken
6. **Klaar!**

### Wat ziet u?

```
PS D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION>
```

**Uitleg:**
- `PS` = PowerShell (soort terminal)
- De lange tekst daarna = **Uw huidige map** (Working Directory)
- `>` = Klaar voor commando's

### ⚠️ BELANGRIJK: Pad met spaties

Als uw pad **spaties** bevat (zoals `THYNK ORDNER PRODUCTION`), moet u **aanhalingstekens** gebruiken:

```powershell
cd "THYNK ORDNER PRODUCTION"
```

**NIET zo:**
```powershell
cd THYNK ORDNER PRODUCTION  ❌ FOUT!
```

**Maar zo:**
```powershell
cd "THYNK ORDNER PRODUCTION"  ✅ GOED!
```

---

## 3. Basis Terminal Commando's

### cd - Map wisselen

**Betekenis:** Change Directory (map wisselen)

**Voorbeeld:**
```powershell
cd "tests\think-orders"
```

**Wat gebeurt er:** U gaat naar de map `tests\think-orders`

**Tip:** Tab-toets indrukken voor automatisch aanvullen!

### ls / dir - Bestanden tonen

**Windows PowerShell:**
```powershell
ls
```
of
```powershell
dir
```

**Wat gebeurt er:** U ziet alle bestanden en mappen in de huidige map

**Voorbeeld-uitvoer:**
```
    Directory: D:\...\tests\think-orders

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        15.01.2024     10:00                helpers
-a----        15.01.2024     10:00            1234 package.json
-a----        15.01.2024     10:00            5678 playwright.config.ts
```

### cd .. - Een map terug

```powershell
cd ..
```

**Wat gebeurt er:** U gaat een map terug (naar boven)

**Voorbeeld:**
- U bent in: `tests\think-orders`
- Na `cd ..`: U bent in `tests`
- Na `cd ..` nogmaals: U bent in `THYNK ORDNER PRODUCTION`

### pwd - Huidige map tonen

**Windows PowerShell:**
```powershell
pwd
```
of
```powershell
Get-Location
```

**Wat gebeurt er:** U ziet uw huidige pad

**Voorbeeld-uitvoer:**
```
Path
----
D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION\tests\think-orders
```

### cls / Clear-Host - Scherm wissen

```powershell
cls
```
of
```powershell
Clear-Host
```

**Wat gebeurt er:** Terminal-scherm wordt leeg (alle vorige uitvoer verdwijnt)

### Tip: Automatisch aanvullen met Tab

1. **Beginletters typen** (bijv. `cd te`)
2. **Tab-toets indrukken**
3. **Terminal vult automatisch aan** (bijv. naar `cd tests`)

**Meerdere keren Tab indrukken** = Wisselt tussen mogelijkheden

---

## 4. Tests installeren - Stap voor stap

### Stap 1: Node.js installeren

**BELANGRIJK:** Node.js moet geïnstalleerd zijn!

#### Controleren of Node.js geïnstalleerd is:

```powershell
node --version
```

**Als wordt getoond:** `v20.10.0` (of vergelijkbaar)
✅ **Node.js is geïnstalleerd!**

**Als wordt getoond:** `'node' wordt niet herkend...`
❌ **Node.js moet geïnstalleerd worden!**

#### Node.js installeren:

1. **Browser openen**
2. Ga naar: **https://nodejs.org/**
3. **Download-knop klikken** (LTS versie aanbevolen)
4. **Installatiebestand downloaden**
5. **Installatie uitvoeren:**
   - Dubbelklik op `.msi` bestand
   - "Next" klikken (meerdere keren)
   - "Install" klikken
   - Wachten tot klaar
   - "Finish" klikken
6. **Terminal OPNIEUW starten** (belangrijk!)
7. Controleren: `node --version`

#### NPM controleren:

```powershell
npm --version
```

**Als wordt getoond:** `10.2.3` (of vergelijkbaar)
✅ **NPM is geïnstalleerd!**

### Stap 2: Naar test-map gaan

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION\tests\think-orders"
```

**OF stap voor stap:**

```powershell
cd "THYNK ORDNER PRODUCTION"
cd tests
cd think-orders
```

### Stap 3: Controleren of u in de juiste map bent

```powershell
ls
```

**U zou moeten zien:**
- `package.json`
- `playwright.config.ts`
- `think-orders.spec.ts`
- `helpers/` (map)
- `README.md`

### Stap 4: Dependencies installeren

```powershell
npm install
```

**Wat gebeurt er:**
- Terminal downloadt automatisch alle benodigde programma's
- Dit kan **2-5 minuten** duren
- U ziet veel regels met downloads

**Wacht tot u ziet:**
```
added 123 packages, and audited 124 packages in 2m
```

**✅ Klaar!** Dependencies zijn geïnstalleerd.

### Stap 5: Browsers installeren

```powershell
npx playwright install
```

**Wat gebeurt er:**
- Playwright installeert automatisch browsers (Chromium, Firefox, WebKit)
- Dit kan **5-10 minuten** duren
- U ziet voortgangsindicatoren

**Wacht tot u ziet:**
```
✓ Successfully installed Chromium
✓ Successfully installed Firefox
✓ Successfully installed WebKit
```

**✅ Klaar!** Browsers zijn geïnstalleerd.

---

## 5. Tests uitvoeren - Stap voor stap

### Eenvoudigste methode: Alle tests

```powershell
npm test
```

**Wat gebeurt er:**
- Alle tests worden één voor één uitgevoerd
- Terminal toont voortgang
- Aan het einde ziet u een samenvatting

**Voorbeeld-uitvoer:**
```
Running 30 tests using 5 workers

  ✓ tests/think-orders/think-orders.spec.ts:12:3 › Navigation › Home-Seite sollte laden (2.1s)
  ✓ tests/think-orders/think-orders.spec.ts:15:3 › Navigation › Navigation zu User Center (1.8s)
  ...
  
  30 passed (120s)
```

**✅ Alle tests geslaagd!**

### Met browser zichtbaar (headed mode)

```powershell
npm run test:headed
```

**Wat gebeurt er:**
- Browser-vensters openen automatisch
- U **ziet** hoe tests worden uitgevoerd
- Goed voor begrip en debugging

### Alleen bepaalde browser

```powershell
npm run test:chromium    # Alleen Google Chrome
npm run test:firefox     # Alleen Firefox
npm run test:webkit      # Alleen Safari
npm run test:mobile      # Alleen Mobile tests
```

### Debug-modus (Langzaam, stap voor stap)

```powershell
npm run test:debug
```

**Wat gebeurt er:**
- Browser opent
- Test loopt **stap voor stap**
- U kunt elke stap observeren
- Goed voor beginners om te begrijpen

**Om door te gaan:** Klik op "Resume" in debug-console of druk op `F8`

### UI-modus (Visueel)

```powershell
npm run test:ui
```

**Wat gebeurt er:**
- Browser opent met **visuele interface**
- U ziet alle tests in een lijst
- U kunt tests individueel selecteren
- Zeer gebruiksvriendelijk!

---

## 6. Test-resultaten begrijpen

### Geslaagde tests

```
✓ Navigation › Home-Seite sollte laden (2.1s)
```

**Betekenis:**
- `✓` = Test **geslaagd**
- `Navigation › Home-Seite sollte laden` = Test-naam
- `(2.1s)` = Duur in seconden

### Gefaalde tests

```
✗ Orders › Order erstellen sollte funktionieren (5.3s)
   Error: expect(received).toBeVisible()
   Expected: visible
   Received: hidden
```

**Betekenis:**
- `✗` = Test **gefaald**
- `Error:` = Foutmelding
- `Expected: visible` = Verwacht was: zichtbaar
- `Received: hidden` = Werkelijk was: verborgen

### Samenvatting

Aan het einde ziet u:

```
  30 passed (120s)
```

**Betekenis:**
- `30` = Aantal geslaagde tests
- `passed` = alle geslaagd
- `(120s)` = Totale duur: 2 minuten

### Test-rapport bekijken

```powershell
npm run test:report
```

**Wat gebeurt er:**
- Browser opent automatisch
- U ziet een **HTML-rapport**
- Met screenshots bij fouten
- Met video's bij fouten
- Met gedetailleerde informatie

---

## 7. Eigen tests toevoegen

### Stap 1: Bestand openen

Open met een **teksteditor** (Notepad++, VS Code, etc.):

```
tests\think-orders\think-orders.spec.ts
```

### Stap 2: Test toevoegen

Voeg aan het einde van het bestand toe:

```typescript
test.describe('Mijn nieuwe tests', () => {
  test('Mijn eerste test', async ({ page }) => {
    // Test-code hier
  });
});
```

### Stap 3: Test uitvoeren

```powershell
npm test
```

**Zie `ERWEITERUNGS-ANLEITUNG.md` voor gedetailleerde voorbeelden!**

---

## 8. Uitbreidingsmogelijkheden

### A) Nieuwe features testen

Als u nieuwe features aan de app toevoegt, voeg ook tests toe.

**Voorbeeld:** Nieuwe pagina "Rapporten"
→ Nieuw test-blok in `think-orders.spec.ts`

### B) Performance-tests

Testen hoe snel de app is:

```typescript
test('Pagina laadt snel', async ({ page }) => {
  const startTime = Date.now();
  await page.goto(...);
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // Onder 2 seconden
});
```

### C) Accessibility-tests

Testen of de app toegankelijk is voor iedereen:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('Pagina is toegankelijk', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page);
});
```

**→ Zie `ERWEITERUNGS-ANLEITUNG.md` voor meer!**

---

## 9. Probleemoplossing

### Probleem: "node wordt niet herkend"

**Oplossing:**
1. Node.js installeren: https://nodejs.org/
2. Terminal **OPNIEUW starten**
3. Opnieuw proberen

### Probleem: "npm wordt niet herkend"

**Oplossing:**
1. NPM is onderdeel van Node.js
2. Node.js volledig opnieuw installeren
3. Terminal OPNIEUW starten

### Probleem: Tests falen

**Oplossing:**
1. Controleren of HTML-bestand bestaat:
   ```powershell
   ls "..\..\THYNK-ORDERS-COMPLETE-ALL-PAGES.html"
   ```
2. Browsers installeren:
   ```powershell
   npx playwright install
   ```
3. Met `--headed` uitvoeren om te zien wat er gebeurt:
   ```powershell
   npm run test:headed
   ```

### Probleem: "CORS-fouten"

**Oplossing:**
- Tests werken met `file://` protocol
- Als fouten optreden, HTML-bestand controleren

### Probleem: Tests lopen te langzaam

**Oplossing:**
- Normaal: 30 tests = 2-5 minuten
- Als veel langzamer: Internetverbinding controleren

---

## 10. Verder leren

### Officiële documentatie

- **Playwright:** https://playwright.dev/
  - Volledige documentatie
  - Voorbeelden
  - API-referentie

### Leermiddelen

- **MDN Web Docs:** https://developer.mozilla.org/
  - Web-technologieën leren
  - JavaScript-basis

- **W3Schools:** https://www.w3schools.com/
  - HTML, CSS, JavaScript tutorials
  - Stap-voor-stap handleidingen

### Terminal leren

- **Windows PowerShell documentatie:**
  https://learn.microsoft.com/powershell/

- **Command Line Crash Course:**
  https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line

### Test-automatisering

- **Test Automation University:**
  https://testautomationu.applitools.com/

- **Playwright Learning Path:**
  https://playwright.dev/docs/intro

### Community & Ondersteuning

- **Playwright Discord:**
  https://discord.gg/playwright

- **Stack Overflow:**
  https://stackoverflow.com/questions/tagged/playwright

### Wetenschappelijke bronnen

- **IEEE Software Testing:**
  https://www.computer.org/csdl/journal/st

- **ACM Digital Library - Testing:**
  https://dl.acm.org/topic/ccs2012/10003552

### Overheid & Standaarden

- **NIST - Software Testing:**
  https://www.nist.gov/software-quality-group

- **ISO/IEC Standards:**
  https://www.iso.org/standard/45142.html

### Onderwijsinstellingen

- **MIT OpenCourseWare - Software Engineering:**
  https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/

- **Stanford CS Cursussen:**
  https://cs.stanford.edu/

- **Harvard CS50:**
  https://cs50.harvard.edu/

---

## ✅ Checklist voor beginners

- [ ] Terminal geopend
- [ ] Node.js geïnstalleerd (`node --version`)
- [ ] NPM geïnstalleerd (`npm --version`)
- [ ] In juiste map (`ls` toont `package.json`)
- [ ] Dependencies geïnstalleerd (`npm install`)
- [ ] Browsers geïnstalleerd (`npx playwright install`)
- [ ] Eerste test uitgevoerd (`npm test`)
- [ ] Test-rapport bekeken (`npm run test:report`)

---

## 🎓 Volgende stappen

1. ✅ **Basis begrijpen** (u bent hier!)
2. ✅ **Tests uitvoeren** (`npm test`)
3. ✅ **Uitbreidingshandleiding lezen** (`ERWEITERUNGS-ANLEITUNG.md`)
4. ✅ **Eigen tests schrijven**
5. ✅ **Ervaring opdoen**

---

**Veel succes! 🚀**

**Bij vragen:** Lees `ERWEITERUNGS-ANLEITUNG.md` of de verdergaande bronnen hierboven.


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
