# 🔧 GIT AUTHENTIFIZIERUNG FIX

## ❌ Problem:
```
remote: Permission to myopenai/togethersystems.git denied to ViewunitySystem.
fatal: unable to access 'https://github.com/myopenai/togethersystems.git/': The requested URL returned error: 403
```

**Ursache:** Git verwendet falsche Credentials (ViewunitySystem statt myopenai)

---

## ✅ LÖSUNG: Git Credentials zurücksetzen

### Option 1: Windows Credential Manager (Empfohlen)

1. **Windows Credential Manager öffnen:**
   - Drücke `Windows + R`
   - Tippe: `control /name Microsoft.CredentialManager`
   - Oder: Windows-Suche → "Credential Manager"

2. **Git Credentials finden:**
   - Klicke auf **"Windows Credentials"**
   - Suche nach: `git:https://github.com`
   - Oder: `github.com`

3. **Alte Credentials entfernen:**
   - Klicke auf den Eintrag
   - Klicke **"Remove"** oder **"Edit"**
   - Entferne alle GitHub-Credentials

4. **Neu authentifizieren:**
   - Führe `git push` aus
   - GitHub fragt nach Username/Password
   - **Username:** `myopenai`
   - **Password:** Verwende **Personal Access Token** (nicht dein Passwort!)

---

### Option 2: Git Credential Helper zurücksetzen (PowerShell)

```powershell
# Git Credential Helper zurücksetzen
git config --global --unset credential.helper
git config --global credential.helper manager-core

# Oder für Windows:
git config --global credential.helper wincred
```

---

### Option 3: Personal Access Token erstellen

1. **Gehe zu:** https://github.com/settings/tokens
2. Klicke **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** z.B. "TogetherSystems Deployment"
4. **Expiration:** Wähle Ablaufzeit (z.B. 90 Tage oder "No expiration")
5. **Scopes:** Aktiviere **`repo`** (vollständiger Zugriff)
6. Klicke **"Generate token"**
7. **Kopiere den Token** (wird nur einmal angezeigt!)

**Beispiel Token:** `ghp_abc123def456ghi789jkl012mno345pqr678`

---

## ✅ SCHRITT 4: Mit Token pushen

### Methode 1: Token als Password verwenden
```powershell
git push -u origin main
```

Wenn nach Password gefragt wird:
- **Username:** `myopenai`
- **Password:** Füge deinen **Personal Access Token** ein (nicht dein GitHub-Passwort!)

### Methode 2: Token in URL einbetten (temporär)
```powershell
git remote set-url origin https://myopenai:DEIN_TOKEN@github.com/myopenai/togethersystems.git
git push -u origin main
```

**WICHTIG:** Ersetze `DEIN_TOKEN` mit deinem echten Token!

**Nach erfolgreichem Push:** Token aus URL entfernen (Sicherheit):
```powershell
git remote set-url origin https://github.com/myopenai/togethersystems.git
```

---

## ✅ SCHRITT 5: Prüfen ob erfolgreich

```powershell
git push -u origin main
```

**Erfolgreich wenn:**
```
Enumerating objects: 147, done.
Counting objects: 100% (147/147), done.
...
To https://github.com/myopenai/togethersystems.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Permission denied" weiterhin
- Prüfe ob Token `repo` Scope hat
- Prüfe ob Username korrekt ist (`myopenai`)
- Prüfe ob Repository existiert: https://github.com/myopenai/togethersystems

### Problem: "Repository not found"
- Prüfe ob Repository existiert
- Prüfe ob du Zugriff hast
- Prüfe Repository-Name: `togethersystems` (nicht `togethersystems-portal`)

### Problem: Token funktioniert nicht
- Token muss `repo` Scope haben
- Token muss noch gültig sein (nicht abgelaufen)
- Token muss für Account `myopenai` erstellt sein

---

## ✅ ZUSAMMENFASSUNG

**Du musst:**
1. ✅ Alte Git Credentials entfernen (Windows Credential Manager)
2. ✅ Personal Access Token erstellen (https://github.com/settings/tokens)
3. ✅ Token mit `repo` Scope
4. ✅ `git push` ausführen
5. ✅ Token als Password verwenden

**Nächster Schritt:** Erstelle Personal Access Token und pushe!


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
