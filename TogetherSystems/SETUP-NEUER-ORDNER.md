# T,. Setup-Anleitung für neuen Ordner

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE

---

## 🚀 Schnellstart (3 Schritte)

### Schritt 1: Dateien kopieren

Kopiere diese Dateien in deinen neuen Ordner:

- ✅ `.cursor-settings.json`
- ✅ `cursor-setup-complete.json`
- ✅ `.env` (falls du eine hast)

### Schritt 2: Cursor.com öffnen

1. Öffne Cursor.com
2. Klicke auf: **File → Open Folder**
3. Wähle deinen neuen Ordner aus

### Schritt 3: Verifizieren

1. Öffne Einstellungen: `Ctrl + ,` (Windows) / `Cmd + ,` (Mac)
2. Prüfe: Wird dein alternatives Model verwendet?
3. Fertig! ✅

---

## 📋 Vollständige Checkliste

### Vorbereitung (Einmalig)

- [ ] OpenRouter-Account erstellt: https://openrouter.ai
- [ ] API-Key erstellt und gespeichert
- [ ] Umgebungsvariable gesetzt: `setx CURSOR_API_KEY 'dein-key'` (Windows) oder `export CURSOR_API_KEY='dein-key'` (Mac/Linux)
- [ ] `.env`-Datei erstellt (falls Umgebungsvariable nicht funktioniert): `CURSOR_API_KEY=dein-key`

### Für jeden neuen Ordner

- [ ] Neuen Ordner erstellt
- [ ] `.cursor-settings.json` in den Ordner kopiert
- [ ] `cursor-setup-complete.json` in den Ordner kopiert
- [ ] `.env`-Datei erstellt (falls nicht global)
- [ ] Cursor.com geöffnet und Ordner ausgewählt
- [ ] Verifiziert, dass alternatives Model verwendet wird

---

## 🔧 Was passiert, wenn ich diese Dateien kopiere?

### `.cursor-settings.json`

Diese Datei sagt Cursor.com:
- Welches AI-Modell verwendet werden soll
- Welche Einstellungen (Temperatur, etc.)
- Welche Features aktiviert sind

### `cursor-setup-complete.json`

Diese Datei enthält:
- Vollständige Konfiguration
- Anweisungen für jeden Schritt
- Alternative Provider-Informationen
- Troubleshooting-Tipps

### `.env`

Diese Datei enthält:
- Deinen API-Key (sicher gespeichert)
- Wird NICHT ins Internet hochgeladen (durch .gitignore geschützt)

---

## ✅ Verifizierung

### Wie prüfe ich, ob es funktioniert?

1. **Öffne Cursor.com**
2. **Öffne Einstellungen:** `Ctrl + ,` (Windows) / `Cmd + ,` (Mac)
3. **Suche nach:** "Model" oder "AI Provider"
4. **Prüfe:** Steht dort "OpenRouter" oder "DeepSeek Coder"?
5. **Teste:** Tippe etwas in Cursor und schaue, ob es funktioniert

### Was sollte ich sehen?

- ✅ **Provider:** OpenRouter (oder dein gewählter Provider)
- ✅ **Model:** DeepSeek Coder (oder dein gewähltes Model)
- ✅ **API Key:** Sollte gesetzt sein (wird als `***` angezeigt)

---

## 🆘 Probleme?

### Cursor verwendet immer noch ChatGPT

**Lösung:**
1. Prüfe: Ist `.cursor-settings.json` im Root-Ordner?
2. Prüfe: Ist der API-Key richtig eingetragen?
3. Lösung: Starte Cursor.com neu

### "API Key invalid"

**Lösung:**
1. Prüfe: Ist dein API-Key richtig kopiert? (Keine Leerzeichen!)
2. Prüfe: Ist dein OpenRouter-Account aktiv?
3. Prüfe: Hast du Credits auf deinem Account?

### "Model not found"

**Lösung:**
1. Prüfe: Ist der Model-Name richtig geschrieben?
2. Prüfe: Ist das Model auf OpenRouter verfügbar?
3. Lösung: Nutze einen anderen Model-Namen (siehe `cursor-setup-complete.json`)

---

## 📚 Weitere Informationen

Für **detaillierte Erklärungen** (auch für absolute Anfänger), siehe:

- **[DUMMY-ANLEITUNG-CURSOR-AI-KONFIGURATION.md](./docs/DUMMY-ANLEITUNG-CURSOR-AI-KONFIGURATION.md)**

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

