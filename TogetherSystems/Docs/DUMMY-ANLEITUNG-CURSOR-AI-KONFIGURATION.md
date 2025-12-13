# T,. Dummy-Anleitung: Cursor.com mit alternativen AI-Anbietern konfigurieren

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE  
**Datum:** 2025-01-15  
**Zielgruppe:** Absolute Anfänger (Dummies)

---

## 🎯 Was ist das Problem?

### Aktuelle Situation

- **Cursor.com** ist standardmäßig nur mit **ChatGPT** verbunden
- **ChatGPT kostet Geld** (Betriebskosten)
- Du willst **nicht 100% abhängig** von ChatGPT sein
- Du willst **alternative AI-Anbieter** nutzen (kostenlos oder günstiger)

### Lösung

Diese Anleitung zeigt dir, wie du Cursor.com so konfigurierst, dass es mit **alternativen AI-Anbietern** arbeitet, während du Cursor.com weiterhin als **zentrales AI-Code-Modul** nutzt.

---

## 📚 Was ist eine Konsole? (Für absolute Anfänger)

### Was ist eine Konsole?

Eine **Konsole** (auch "Terminal" oder "Eingabeaufforderung" genannt) ist ein **Textfenster**, in dem du **Befehle eingeben** kannst, um deinen Computer zu steuern.

### Wie öffne ich eine Konsole?

#### Windows

1. Drücke die **Windows-Taste** (⌨️)
2. Tippe: `cmd` oder `PowerShell`
3. Drücke **Enter**
4. Ein schwarzes Fenster öffnet sich → Das ist die Konsole!

#### Mac

1. Drücke **Cmd + Leertaste** (⌨️)
2. Tippe: `Terminal`
3. Drücke **Enter**
4. Ein Fenster öffnet sich → Das ist die Konsole!

#### Linux

1. Drücke **Ctrl + Alt + T**
2. Ein Fenster öffnet sich → Das ist die Konsole!

### Was kann ich in der Konsole machen?

- **Befehle eingeben** (z.B. `cd` = wechsle Ordner)
- **Dateien erstellen** (z.B. `echo "Text" > datei.txt`)
- **Programme starten** (z.B. `npm install`)

**Wichtig:** In der Konsole tippst du Befehle und drückst **Enter**, dann passiert etwas!

---

## 🔧 Schritt 1: Alternative AI-Anbieter verstehen

### Was sind alternative AI-Anbieter?

**Alternative AI-Anbieter** sind **andere Firmen**, die ähnliche Dienste wie ChatGPT anbieten, aber oft **günstiger oder kostenlos** sind.

### Welche gibt es?

#### 1. OpenRouter (Empfohlen für Anfänger)

- **Was ist das?** Eine Plattform, die viele verschiedene AI-Modelle anbietet
- **Kosten:** Teilweise kostenlos, teilweise sehr günstig
- **Vorteil:** Ein Account, viele Modelle
- **Website:** https://openrouter.ai

#### 2. Groq

- **Was ist das?** Sehr schnelle AI-Modelle
- **Kosten:** Teilweise kostenlos
- **Vorteil:** Extrem schnell
- **Website:** https://groq.com

#### 3. Anthropic (Claude)

- **Was ist das?** Claude AI (ähnlich wie ChatGPT)
- **Kosten:** Bezahlt, aber günstiger als ChatGPT
- **Vorteil:** Sehr gute Qualität
- **Website:** https://anthropic.com

#### 4. DeepSeek

- **Was ist das?** Kostenloses AI-Modell für Code
- **Kosten:** Kostenlos
- **Vorteil:** Speziell für Programmierung
- **Website:** https://deepseek.com

---

## 📝 Schritt 2: Account erstellen (Schritt für Schritt)

### OpenRouter Account erstellen

1. **Öffne deinen Browser** (Chrome, Firefox, etc.)
2. **Gehe zu:** https://openrouter.ai
3. **Klicke auf:** "Sign Up" oder "Registrieren"
4. **Gib ein:**
   - Deine E-Mail-Adresse
   - Ein Passwort
5. **Bestätige deine E-Mail** (schaue in dein E-Mail-Postfach)
6. **Fertig!** Du hast jetzt einen OpenRouter-Account

### API-Key erstellen

1. **Logge dich ein** bei OpenRouter
2. **Klicke auf:** "Keys" oder "API Keys"
3. **Klicke auf:** "Create Key" oder "Neuen Schlüssel erstellen"
4. **Gib einen Namen ein:** z.B. "Cursor-Key"
5. **Kopiere den Schlüssel** (wichtig: Du siehst ihn nur einmal!)
   - Beispiel: `sk-or-v1-abc123def456...`
6. **Speichere den Schlüssel** in einer Textdatei (z.B. `mein-api-key.txt`)

**Wichtig:** Der API-Key ist wie ein Passwort. Teile ihn NIEMALS mit anderen!

---

## ⚙️ Schritt 3: Cursor.com konfigurieren

### Cursor.com öffnen

1. **Öffne Cursor.com** (falls noch nicht installiert, lade es herunter: https://cursor.com)
2. **Klicke auf:** ⚙️ (Einstellungen) oder drücke `Ctrl + ,` (Windows) / `Cmd + ,` (Mac)

### Settings öffnen

1. **Suche nach:** "Model" oder "AI Provider"
2. **Klicke auf:** "Model Settings" oder "AI Provider Settings"

### Custom Model hinzufügen

1. **Klicke auf:** "Add Custom Model" oder "Custom Model hinzufügen"
2. **Wähle:** "OpenRouter" oder "Custom API"
3. **Gib ein:**
   - **Name:** z.B. "DeepSeek Coder"
   - **API URL:** `https://openrouter.ai/api/v1/chat/completions`
   - **API Key:** Dein OpenRouter API-Key (aus Schritt 2)
   - **Model:** z.B. `deepseek/deepseek-coder` oder `meta-llama/llama-3.1-70b-instruct`

### Model als Standard setzen

1. **Wähle dein neues Model** aus der Liste
2. **Klicke auf:** "Set as Default" oder "Als Standard setzen"
3. **Fertig!** Cursor.com verwendet jetzt dein alternatives Model

---

## 📁 Schritt 4: Vorkonfiguration für neue Ordner erstellen

### Was ist eine Vorkonfiguration?

Eine **Vorkonfiguration** ist eine **Datei**, die alle Einstellungen enthält, die du für ein neues Projekt brauchst.

### Datei erstellen

1. **Öffne einen Text-Editor** (Notepad, VS Code, etc.)
2. **Erstelle eine neue Datei** mit dem Namen: `.cursor-settings.json`
3. **Kopiere diesen Inhalt:**

```json
{
  "model": {
    "provider": "openrouter",
    "apiKey": "DEIN_API_KEY_HIER",
    "model": "deepseek/deepseek-coder",
    "temperature": 0.2,
    "maxTokens": 4000
  },
  "features": {
    "autocomplete": true,
    "chat": true,
    "composer": true
  }
}
```

4. **Ersetze:** `DEIN_API_KEY_HIER` mit deinem echten API-Key
5. **Speichere die Datei** im **Root-Ordner** deines Projekts

### Was macht diese Datei?

- **`model.provider`:** Sagt Cursor, welchen Anbieter du nutzt
- **`model.apiKey`:** Dein API-Key (wie ein Passwort)
- **`model.model`:** Welches AI-Modell du nutzen willst
- **`model.temperature`:** Wie kreativ das AI sein soll (0.0 = sehr genau, 1.0 = sehr kreativ)
- **`model.maxTokens`:** Maximale Antwortlänge

---

## 🚀 Schritt 5: Neuen Ordner mit alternativem AI starten

### Checkliste für neue Ordner

Wenn du einen **neuen Ordner** (Projekt) startest, mache folgendes:

#### 1. Ordner erstellen

1. **Erstelle einen neuen Ordner** auf deinem Computer
2. **Benenne ihn:** z.B. "Mein-Neues-Projekt"

#### 2. Vorkonfigurations-Datei kopieren

1. **Kopiere die Datei:** `.cursor-settings.json` (aus Schritt 4)
2. **Füge sie ein** in deinen neuen Ordner

#### 3. Cursor.com öffnen

1. **Öffne Cursor.com**
2. **Klicke auf:** "File" → "Open Folder"
3. **Wähle deinen neuen Ordner** aus
4. **Fertig!** Cursor.com verwendet jetzt deine Vorkonfiguration

#### 4. Verifizieren

1. **Öffne die Einstellungen** in Cursor (`Ctrl + ,` / `Cmd + ,`)
2. **Prüfe:** Wird dein alternatives Model verwendet?
3. **Teste:** Tippe etwas in Cursor und schaue, ob es funktioniert

---

## 📋 Schritt 6: Detaillierte Konfigurations-Datei

### Erweiterte Konfiguration

Erstelle eine Datei namens: `cursor-ai-config.json`

```json
{
  "version": "1.0.0",
  "provider": "openrouter",
  "apiKey": "DEIN_API_KEY_HIER",
  "models": {
    "default": "deepseek/deepseek-coder",
    "autocomplete": "deepseek/deepseek-coder",
    "chat": "meta-llama/llama-3.1-70b-instruct",
    "composer": "deepseek/deepseek-coder"
  },
  "settings": {
    "temperature": 0.2,
    "maxTokens": 4000,
    "topP": 0.95,
    "frequencyPenalty": 0.0,
    "presencePenalty": 0.0
  },
  "fallback": {
    "enabled": true,
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

### Was bedeuten die Einstellungen?

- **`temperature`:** Wie kreativ (0.0 = sehr genau, 1.0 = sehr kreativ)
- **`maxTokens`:** Maximale Antwortlänge
- **`topP`:** Wie viele Optionen das AI berücksichtigt
- **`frequencyPenalty`:** Bestraft wiederholte Wörter
- **`presencePenalty`:** Bestraft bereits genannte Themen
- **`fallback`:** Falls das Haupt-Model nicht funktioniert, nutze dieses

---

## 🔐 Schritt 7: API-Key sicher speichern

### Warum ist das wichtig?

Dein **API-Key** ist wie ein **Passwort**. Wenn jemand ihn hat, kann er **auf deine Rechnung** zugreifen!

### Wie speichere ich ihn sicher?

#### Option 1: Umgebungsvariable (Empfohlen)

1. **Öffne die Konsole** (siehe "Was ist eine Konsole?" oben)
2. **Windows:**
   ```cmd
   setx CURSOR_API_KEY "dein-api-key-hier"
   ```
3. **Mac/Linux:**
   ```bash
   export CURSOR_API_KEY="dein-api-key-hier"
   ```
4. **In der Konfigurations-Datei:**
   ```json
   {
     "apiKey": "${CURSOR_API_KEY}"
   }
   ```

#### Option 2: Separate Datei (Einfacher)

1. **Erstelle eine Datei:** `.env` (mit einem Punkt am Anfang!)
2. **Schreibe hinein:**
   ```
   CURSOR_API_KEY=dein-api-key-hier
   ```
3. **Wichtig:** Füge `.env` zu `.gitignore` hinzu (damit es nicht ins Internet hochgeladen wird!)

---

## 📖 Schritt 8: Verfügbare Modelle (OpenRouter)

### Kostenlose Modelle

- **`deepseek/deepseek-coder`** - Sehr gut für Code
- **`meta-llama/llama-3.1-8b-instruct`** - Kleines, schnelles Model
- **`google/gemma-2-9b-it`** - Google's kostenloses Model

### Günstige Modelle

- **`meta-llama/llama-3.1-70b-instruct`** - Sehr gut, ~$0.50 pro 1M Tokens
- **`anthropic/claude-3-haiku`** - Schnell und günstig, ~$0.25 pro 1M Tokens

### Premium-Modelle (Teurer, aber sehr gut)

- **`anthropic/claude-3.5-sonnet`** - Sehr gut, ~$3.00 pro 1M Tokens
- **`openai/gpt-4`** - Sehr gut, ~$30.00 pro 1M Tokens

### Wie wähle ich das richtige Model?

- **Für Code:** `deepseek/deepseek-coder` (kostenlos) oder `meta-llama/llama-3.1-70b-instruct` (günstig)
- **Für allgemeine Fragen:** `meta-llama/llama-3.1-70b-instruct` (günstig)
- **Für komplexe Aufgaben:** `anthropic/claude-3.5-sonnet` (teurer, aber sehr gut)

---

## 🛠️ Schritt 9: Troubleshooting (Probleme lösen)

### Problem: "API Key invalid"

**Lösung:**
1. **Prüfe:** Ist dein API-Key richtig kopiert? (Keine Leerzeichen am Anfang/Ende!)
2. **Prüfe:** Ist dein OpenRouter-Account aktiv?
3. **Prüfe:** Hast du Credits auf deinem Account?

### Problem: "Model not found"

**Lösung:**
1. **Prüfe:** Ist der Model-Name richtig geschrieben?
2. **Prüfe:** Ist das Model auf OpenRouter verfügbar?
3. **Teste:** Nutze einen anderen Model-Namen

### Problem: "Rate limit exceeded"

**Lösung:**
1. **Warte:** 1-2 Minuten
2. **Prüfe:** Hast du zu viele Anfragen gestellt?
3. **Lösung:** Nutze ein kostenloses Model oder kaufe mehr Credits

### Problem: Cursor verwendet immer noch ChatGPT

**Lösung:**
1. **Prüfe:** Ist deine `.cursor-settings.json` im Root-Ordner?
2. **Prüfe:** Ist der API-Key richtig eingetragen?
3. **Lösung:** Starte Cursor.com neu

---

## 📝 Schritt 10: Komplette Vorkonfigurations-Datei

### Datei: `cursor-setup-complete.json`

Erstelle diese Datei im **Root-Ordner** deines Projekts:

```json
{
  "cursor": {
    "version": "1.0.0",
    "provider": "openrouter",
    "apiKey": "${CURSOR_API_KEY}",
    "models": {
      "default": "deepseek/deepseek-coder",
      "autocomplete": "deepseek/deepseek-coder",
      "chat": "meta-llama/llama-3.1-70b-instruct",
      "composer": "deepseek/deepseek-coder"
    },
    "settings": {
      "temperature": 0.2,
      "maxTokens": 4000,
      "topP": 0.95
    }
  },
  "instructions": {
    "step1": "Erstelle OpenRouter-Account: https://openrouter.ai",
    "step2": "Erstelle API-Key auf OpenRouter",
    "step3": "Setze Umgebungsvariable: setx CURSOR_API_KEY 'dein-key'",
    "step4": "Kopiere diese Datei in deinen Projekt-Ordner",
    "step5": "Öffne Cursor.com und wähle 'Open Folder'",
    "step6": "Cursor verwendet jetzt dein alternatives Model!"
  }
}
```

---

## ✅ Checkliste für neue Ordner

### Bevor du startest

- [ ] OpenRouter-Account erstellt
- [ ] API-Key erstellt und gespeichert
- [ ] Umgebungsvariable gesetzt (oder `.env`-Datei erstellt)
- [ ] `cursor-setup-complete.json` erstellt
- [ ] Cursor.com installiert

### Für jeden neuen Ordner

- [ ] Neuen Ordner erstellt
- [ ] `cursor-setup-complete.json` in den Ordner kopiert
- [ ] `.env`-Datei erstellt (falls nicht global)
- [ ] Cursor.com geöffnet und Ordner ausgewählt
- [ ] Verifiziert, dass alternatives Model verwendet wird

---

## 🎓 Zusammenfassung (Für Dummies)

### Was hast du gelernt?

1. **Was ist eine Konsole?** → Ein Textfenster, in dem du Befehle eingibst
2. **Was sind alternative AI-Anbieter?** → Andere Firmen wie OpenRouter, die günstiger sind
3. **Wie erstelle ich einen Account?** → Gehe zu openrouter.ai und registriere dich
4. **Wie konfiguriere ich Cursor.com?** → Füge deinen API-Key in den Einstellungen hinzu
5. **Wie erstelle ich eine Vorkonfiguration?** → Erstelle eine `.cursor-settings.json`-Datei
6. **Wie starte ich einen neuen Ordner?** → Kopiere die Vorkonfiguration in den neuen Ordner

### Wichtigste Schritte

1. **Account erstellen** bei OpenRouter
2. **API-Key erstellen** und sicher speichern
3. **Vorkonfigurations-Datei erstellen** mit deinem API-Key
4. **Für jeden neuen Ordner:** Datei kopieren und Cursor öffnen

---

## 📞 Hilfe & Support

### Wenn etwas nicht funktioniert

1. **Lies diese Anleitung nochmal** (manchmal übersieht man etwas)
2. **Prüfe die Troubleshooting-Sektion** (Schritt 9)
3. **Teste mit einem anderen Model** (vielleicht ist das Model nicht verfügbar)
4. **Starte Cursor.com neu** (manchmal hilft das)

### Nützliche Links

- **OpenRouter:** https://openrouter.ai
- **OpenRouter Models:** https://openrouter.ai/models
- **Cursor.com:** https://cursor.com
- **Cursor.com Docs:** https://docs.cursor.com

---

## 🤖 Wie ich dich (den AI-Assistenten) anweise

### Was musst du mir sagen?

**Einfachste Version:**
```
Erstelle mir die komplette Vorkonfiguration für Cursor.com mit OpenRouter.
```

**Mit spezifischen Wünschen:**
```
Erstelle mir die Vorkonfiguration mit OpenRouter, ich will DeepSeek Coder 
als Standard-Modell verwenden.
```

**Für neuen Ordner:**
```
Erstelle mir die Dateien für einen neuen Ordner mit OpenRouter.
```

### Was passiert dann?

Ich erstelle automatisch:
- ✅ `.cursor-settings.json` (Cursor-Einstellungen)
- ✅ `cursor-setup-complete.json` (Vollständige Konfiguration)
- ✅ `SETUP-NEUER-ORDNER.md` (Anleitung für neue Ordner)
- ✅ `.env.example` (Beispiel für API-Key)

**Für detaillierte Anleitung, siehe:**
- **[WIE-ICH-DICH-ANWEISE.md](./WIE-ICH-DICH-ANWEISE.md)** - Genau erklärt, was du mir sagen musst

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

**Diese Anleitung wurde speziell für absolute Anfänger geschrieben. Wenn du etwas nicht verstehst, lies es nochmal langsam durch!**


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
