# PuTTY Setup für Digital Notary - Keine Passwort-Eingabe mehr!

## 🚀 PuTTY-Konfiguration ohne Passwort

### Schritt 1: PuTTY öffnen
1. Starten Sie PuTTY
2. Geben Sie die Verbindungsdaten ein:
   - **Host Name:** `45.87.81.214`
   - **Port:** `65002`
   - **Connection type:** `SSH`

### Schritt 2: SSH-Schlüssel konfigurieren
1. Gehen Sie zu: **Connection > SSH > Auth > Credentials**
2. Klicken Sie auf **Browse** bei **Private key file for authentication**
3. Wählen Sie: `C:\Users\Gebruiker\.ssh\id_rsa_notar`
4. Klicken Sie auf **Open**

### Schritt 3: Session speichern
1. Gehen Sie zurück zu **Session**
2. Geben Sie unter **Saved Sessions:** `DigitalNotary` ein
3. Klicken Sie auf **Save**

### Schritt 4: Verbindung testen
1. Klicken Sie auf **Open**
2. PuTTY sollte sich ohne Passwort verbinden!

## 🔧 Automatische Verbindung

### Batch-Datei verwenden:
```bash
.\putty-session.bat
```

### Oder direkt PuTTY starten:
```bash
putty -load "DigitalNotary"
```

## 📁 Datei-Transfer mit PSCP

### Dateien hochladen:
```bash
pscp -P 65002 -i "C:\Users\Gebruiker\.ssh\id_rsa_notar" datei.txt u972026836@45.87.81.214:/home/u972026836/
```

### Dateien herunterladen:
```bash
pscp -P 65002 -i "C:\Users\Gebruiker\.ssh\id_rsa_notar" u972026836@45.87.81.214:/home/u972026836/datei.txt ./
```

## ✅ Vorteile von PuTTY

- **Keine Passwort-Eingabe** mehr
- **Gespeicherte Sessions** für schnellen Zugriff
- **Sichere SSH-Schlüssel** Authentifizierung
- **Einfacher Datei-Transfer** mit PSCP
- **Stabile Verbindungen** ohne Timeout

## 🎯 Nächste Schritte

1. **PuTTY konfigurieren** (siehe oben)
2. **Session speichern** als "DigitalNotary"
3. **Verbindung testen** ohne Passwort
4. **App starten** über PuTTY-Session

## 🔗 Links

- **PuTTY Download:** https://www.chiark.greenend.org.uk/~sgtatham/putty/
- **PuTTY Dokumentation:** https://www.chiark.greenend.org.uk/~sgtatham/putty/docs.html


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
