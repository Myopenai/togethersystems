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
