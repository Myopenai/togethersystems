# BACKUPS-Ordner dauerhaft verschieben

## Problem
Der BACKUPS-Ordner (35.2 MB) verhindert das Deployment, da Cloudflare Pages nur Dateien bis 25 MB unterstützt.

## Lösung: BACKUPS dauerhaft außerhalb verschieben

### Schritt 1: BACKUPS verschieben
Führe aus:
```powershell
.\move-backups-out.ps1
```

Dies verschiebt den BACKUPS-Ordner nach:
```
D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\TOGETHERSYSTEMS-BACKUPS
```

### Schritt 2: Deployment durchführen
Nach dem Verschieben:
```powershell
.\deploy.ps1
```

## ✅ Vorteile
- ✅ BACKUPS ist dauerhaft außerhalb des Projekts
- ✅ Keine Deployment-Probleme mehr
- ✅ BACKUPS bleibt erhalten (nur an anderem Ort)
- ✅ Kein temporäres Verschieben nötig

## 📍 Neuer Speicherort
```
D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\TOGETHERSYSTEMS-BACKUPS
```

Der BACKUPS-Ordner bleibt erhalten, ist aber nicht mehr Teil des Projekts.

