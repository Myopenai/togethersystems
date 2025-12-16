# TogetherSystems – Fix & Playwright-Setup

## Was wurde gefixt?

**Datei:** `TELBANK/telbank-app.js`  
**Funktion:** `renderFlows()` (am Ende der Klasse `TpgaTelbankApp`)

**Fehler:** Kaputte String-Konkatenation mit falscher Klammerung beim Setzen von `this.$flowCount.textContent`.

**Fix:** `"(N flows)"` wird jetzt sauber gebaut:
```javascript
this.$flowCount.textContent =
  "(" +
  this.flows.length.toString() +
  (this.flows.length === 1 ? " flow" : " flows") +
  ")";
```

## Warum war das ein Problem?

Das File hatte unbalancierte Klammern → **JavaScript-Parserfehler**.

Im schlimmsten Fall lädt das ganze Script nicht:
- ❌ Telbank-UI funktioniert nicht
- ❌ Playwright-Tests gegen Telbank brechen ggf. mit seltsamen Fehlermeldungen ab

## Stand der restlichen Codebasis (ohne node_modules)

Alle eigenen `.js`-Files (ohne `node_modules`) wurden maschinell geprüft auf:
- ✅ **Klammer-Balance** `()`, `{}`, `[]` → alles OK nach dem Fix
- ✅ **"NOT IMPLEMENTED"**, **"DUMMY"**, **"TODO"**, **"FIXME"** → keine relevanten Treffer in deinem eigenen Code (nur im Playwright-Report-HTML)

---

## Wie bringt man Playwright lokal zum Laufen?

Im Projekt gibt es:
- `businessconnecthub-playwright-tests-full/` mit `playwright.config.ts`

### Schritte:

```bash
# (1) ins Test-Projekt wechseln
cd businessconnecthub-playwright-tests-full

# (2) Dependencies installieren
npm install

# (3) Browser-Binaries installieren
npx playwright install
```

**Server starten (Root vom Projekt):**
```bash
# im Projekt-Root
wrangler pages dev .

# oder dein lokales Setup, das auf http://localhost:9323/ läuft
```

**Dann in einem zweiten Terminal:**
```bash
# (4) Playwright-Tests ausführen
cd businessconnecthub-playwright-tests-full

npx playwright test --project=Chromium

# oder alle Browser:
npx playwright test
```

### Wichtig:

In `playwright.config.ts` steht:
```typescript
baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323/',
```

Wenn dein lokaler Server anders läuft (z. B. `http://127.0.0.1:8788/`), dann:
```bash
export PLAYWRIGHT_BASE_URL="http://127.0.0.1:8788/"
npx playwright test
```

---

## Checkliste für "CI grün" (GitHub Actions + Playwright + env vars)

### 3.1 GitHub-Repo sauber halten

- ✅ `node_modules` nicht commiten (ist in `.gitignore` eh vorgesehen)
- ✅ Sicherstellen, dass folgende Dinge im Repo sind:
  - `package.json` (Root)
  - `businessconnecthub-playwright-tests-full/package.json`
  - `businessconnecthub-playwright-tests-full/playwright.config.ts`
  - `functions/` (Workers/Pages Functions)
  - `d1-schema.sql`

### 3.2 GitHub Action für Tests (Playwright)

Siehe `.github/workflows/playwright.yml` (bereits erstellt)

**Wichtig:**
- Node-Version passt (20)
- Dev-Server läuft (`npx http-server . -p 9323`)
- `PLAYWRIGHT_BASE_URL` zeigt auf den lokalen Port

### 3.3 GitHub Action für Deploy (Cloudflare)

Siehe `.github/workflows/deploy.yml` (bereits vorhanden)

**GitHub Secrets müssen gesetzt sein:**
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- ggf. `CLOUDFLARE_PROJECT_NAME` / `CLOUDFLARE_PAGES_PROJECT`

### 3.4 Runtime-Umgebung (Cloudflare / env vars)

**In Cloudflare Pages/Workers müssen gesetzt sein:**
- ✅ D1 Binding existiert als `DB`
- ✅ `TS_API_KEY` als Environment Variable gesetzt

**Dann laufen:**
- `/api/telbank/transfers`
- `/api/voucher/*`
- `/api/mortgage/*`
- `/api/telemetry`
- `/api/autofix/*`
- `/api/contracts/*` (so weit ohne R2 genutzt)
- `/api/presence/*`
- `/ws` (WebSocket) – unabhängig von D1

---

## Zu deiner grundsätzlichen Frage: "Kann ich ZIP in neuen Ordner auf Localhost legen und von da aus pushen?"

**Ja.** Und zwar so:

Der Upload, den du mir gegeben hast, ist bereits ein vollständiges Projekt mit `.git`-Ordner.

Du kannst:
1. Das ZIP `togethersystems-fixed.zip` lokal entpacken
2. In dem Ordner ein neues Git-Repo anlegen (oder den vorhandenen `.git` verwenden, wenn du den mitkopierst)
3. Das Ganze in ein neues oder bestehendes GitHub-Repo pushen

**Wichtig ist nur:**
- Das GitHub-Repo, das du für Deploy benutzt, muss den Code-Stand enthalten, den du wirklich live haben willst
- Cloudflare Pages ist immer nur an ein konkretes Repo/Projekt gebunden – wohin du pushst, ist egal, solange Cloudflare das richtige Repo zieht
- Du musst keine Worker-Dateien umbauen. Das Routing `/api/...` und `/ws` ist sauber


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







