# Git Push Lösung - Remote Änderungen integrieren

## Problem
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs
```

**Ursache:** Der Remote (GitHub) hat Änderungen, die lokal nicht vorhanden sind.

## Lösung: 3 Optionen

### Option 1: Pull mit Merge (empfohlen)
```powershell
# 1. Remote Änderungen holen und mergen
git pull origin main --allow-unrelated-histories

# 2. Falls Konflikte auftreten, diese lösen, dann:
git add .
git commit -m "Merge remote changes"

# 3. Dann pushen
git push origin main
```

### Option 2: Pull mit Rebase (sauberer History)
```powershell
# 1. Remote Änderungen holen und auf lokale Commits anwenden
git pull --rebase origin main

# 2. Falls Konflikte auftreten, diese lösen, dann:
git add .
git rebase --continue

# 3. Dann pushen
git push origin main
```

### Option 3: Force Push (NUR wenn du sicher bist!)
⚠️ **WARNUNG:** Überschreibt Remote-Änderungen!

```powershell
# NUR wenn du 100% sicher bist, dass deine lokalen Änderungen wichtiger sind!
git push --force origin main
```

---

## Empfohlene Vorgehensweise

**Schritt 1:** Remote Änderungen ansehen
```powershell
git fetch origin
git log HEAD..origin/main --oneline
```

**Schritt 2:** Pull mit Merge
```powershell
git pull origin main --allow-unrelated-histories
```

**Schritt 3:** Falls Konflikte → lösen, dann:
```powershell
git add .
git commit -m "Merge: Integriere Remote-Änderungen"
git push origin main
```

---

## Schnelllösung (Copy & Paste)

```powershell
# 1. Remote Änderungen holen
git pull origin main --allow-unrelated-histories

# 2. Falls erfolgreich, pushen
git push origin main
```

Falls Konflikte auftreten, melde dich und ich helfe beim Lösen!


