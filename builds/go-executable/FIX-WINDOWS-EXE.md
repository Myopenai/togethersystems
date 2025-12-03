# Windows EXE Problem - FIX

**Problem:** Windows EXE öffnet sich, schließt sofort wieder, keine Fehlermeldung sichtbar.

**Ursache:** Das `-H windowsgui` Flag versteckt die Konsole, deshalb sieht man Fehler nicht.

**Lösung:** Build OHNE `-H windowsgui` Flag, damit Fehlermeldungen sichtbar sind.

---

## Schnell-Fix

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\builds\go-executable"
.\build-windows-console.ps1
```

Diese Version zeigt Fehlermeldungen in der Konsole!

---

## Testen

```powershell
cd build\windows-amd64
.\ostosos-server.exe 8080
```

Jetzt siehst du die Fehlermeldung, falls etwas nicht funktioniert.

---

## Permanent Fix

Ändere in `build-all.ps1`:

**Alt:**
```powershell
go build -ldflags="-s -w -H windowsgui" ...
```

**Neu:**
```powershell
go build -ldflags="-s -w" ...
```

(Das `-H windowsgui` entfernen)

---

## Wenn Port belegt ist

Falls Port 8080 belegt ist, verwende anderen Port:

```powershell
.\ostosos-server.exe 8081
```

---

## Fehler beheben

**Problem:** Port bereits belegt
- Lösung: Anderen Port verwenden (8081, 8082, etc.)

**Problem:** Keine Berechtigung
- Lösung: PowerShell als Administrator starten

**Problem:** index.html nicht gefunden
- Lösung: EXE in Verzeichnis mit index.html ausführen

---

**T,.&T,,.&T,,,.T.**

