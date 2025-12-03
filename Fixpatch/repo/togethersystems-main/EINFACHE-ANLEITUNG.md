# 🚀 EINFACHE ANLEITUNG - Schritt für Schritt

## ✅ SCHRITT 1: Gehe zum Browser (NICHT PowerShell!)

1. Öffne deinen **Browser** (Chrome, Edge, Firefox, etc.)
2. Gehe zu: **https://github.com/new**
3. **Logge dich ein** (falls nicht eingeloggt)

---

## ✅ SCHRITT 2: Repository erstellen (im Browser)

1. **Repository name:** `togethersystems-portal`
2. **Description:** (optional) "TogetherSystems Portal"
3. Wähle **Public** oder **Private**
4. **WICHTIG:** Lasse alle Checkboxen **UNANGEKREUZT**:
   - ❌ "Add a README file"
   - ❌ "Add .gitignore"
   - ❌ "Choose a license"
5. Klicke **"Create repository"**

---

## ✅ SCHRITT 3: URL kopieren (im Browser)

Nach dem Erstellen siehst du eine Seite mit Befehlen.

**Kopiere diese URL:**
```
https://github.com/DEIN-USERNAME/togethersystems-portal.git
```

**WICHTIG:** Ersetze `DEIN-USERNAME` mit deinem **echten GitHub-Username**!

**Beispiel:** Wenn dein Username "raymondtel" ist:
```
https://github.com/raymondtel/togethersystems-portal.git
```

---

## ✅ SCHRITT 4: Zurück zu PowerShell

Jetzt gehst du zurück zu PowerShell und führst diese Befehle aus:

```powershell
# Alten Remote entfernen
git remote remove origin

# Neuen Remote mit DEINER echten URL hinzufügen
# ERsetze DEIN-USERNAME mit deinem echten GitHub-Username!
git remote add origin https://github.com/DEIN-USERNAME/togethersystems-portal.git

# Prüfen ob korrekt
git remote -v
```

**Beispiel (wenn dein Username "raymondtel" ist):**
```powershell
git remote remove origin
git remote add origin https://github.com/raymondtel/togethersystems-portal.git
git remote -v
```

---

## ✅ SCHRITT 5: Code pushen

```powershell
git push -u origin main
```

**Falls Authentifizierung erforderlich:**
- GitHub wird nach Username/Password fragen
- **Username:** Dein GitHub-Username
- **Password:** Verwende **Personal Access Token** (nicht dein Passwort!)
- Token erstellen: https://github.com/settings/tokens
- Scopes: `repo` (vollständiger Zugriff)

---

## 🔍 Wie finde ich meinen GitHub-Username?

1. Gehe zu: https://github.com
2. Klicke auf dein **Profilbild** (rechts oben)
3. Dein Username steht unter deinem Namen
4. **ODER:** Gehe zu https://github.com/settings/profile
5. Dein Username steht ganz oben

---

## ✅ ZUSAMMENFASSUNG

**Du musst:**
1. ✅ **Im Browser** zu https://github.com/new gehen
2. ✅ Repository erstellen
3. ✅ URL kopieren
4. ✅ **Zurück zu PowerShell** gehen
5. ✅ Remote mit echter URL korrigieren
6. ✅ Code pushen

**Nächster Schritt:** Gehe jetzt im Browser zu https://github.com/new!


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







