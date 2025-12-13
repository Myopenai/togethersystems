# T,. Automatische Port-Suche - FIX

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`

## Problem

- Fester Port (8080) → funktioniert nicht wenn Port belegt ist
- Jeder Computer hat verschiedene belegte Ports
- System muss flexibel sein

## Lösung

**Automatische Port-Suche:**
- Startet bei gewünschtem Port (z.B. 8080)
- Prüft ob Port frei ist
- Wenn belegt → sucht nächsten freien Port
- Findet automatisch einen freien Port (bis zu 1000 Ports prüfen)

## Code-Änderung

```go
func findFreePort(startPort int) (int, error) {
    for port := startPort; port < startPort+1000; port++ {
        addr := fmt.Sprintf(":%d", port)
        listener, err := net.Listen("tcp", addr)
        if err == nil {
            listener.Close()
            return port, nil
        }
    }
    return 0, fmt.Errorf("kein freier Port gefunden")
}
```

## Verwendung

### Standard (sucht ab Port 8080):
```powershell
.\ostosos-server.exe
```

### Mit Start-Port:
```powershell
.\ostosos-server.exe 9000
```
(Sucht ab Port 9000)

## Ausgabe

```
========================================
OSTOSOS Server
========================================
Server laeuft auf: http://localhost:8083
Verzeichnis: D:\...
========================================
```

**Der Server zeigt automatisch den gefundenen Port an!**

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems


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
