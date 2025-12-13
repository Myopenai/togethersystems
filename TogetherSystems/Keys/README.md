# TogetherSystems T,. - Kryptographische Schlüsselverwaltung

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE

---

## 🔐 Überblick

Dieser Ordner enthält die **kryptographische Schlüsselverwaltung** für TogetherSystems. Die Verschlüsselung liegt auf **Ordner-Ebene** - der gesamte `TogetherSystems/` Ordner ist verschlüsselt.

---

## 🏗️ Verschlüsselungsprinzip: T,.&T,,.&T,,,.T.

### Schichten

1. **T,.** (Level 1)
   - **Algorithmus:** AES-256
   - **Zweck:** Basis-Verschlüsselung
   - **Anwendung:** Alle Dateien im Ordner

2. **T,,.** (Level 2)
   - **Algorithmus:** ChaCha20-Poly1305
   - **Zweck:** Erweiterte Verschlüsselung
   - **Anwendung:** Sensitive Daten

3. **T,,,.** (Level 3)
   - **Algorithmus:** RSA-4096
   - **Zweck:** Schlüssel-Austausch
   - **Anwendung:** Kommunikation

4. **T,,,,.** (Level 4)
   - **Algorithmus:** Elliptic Curve
   - **Zweck:** Signatur und Authentifizierung
   - **Anwendung:** Verifikation

### Unendliche Kette

Jede Schicht verschlüsselt die vorherige, unendlich rekursiv:
```
T,. → T,,. → T,,,. → T,,,,. → T,. → ...
```

---

## 🔑 Schlüssel-Modelle

### Modell 1: Content-Addressed Signing (CAS)

**Beschreibung:** Jeder Ordner/Datei hat einen Hash-basierten Schlüssel

**Vorteile:**
- Deterministisch
- Reproduzierbar
- Keine zentrale Schlüsselverwaltung nötig

**Nachteile:**
- Hash-Kollisionen theoretisch möglich (praktisch unwahrscheinlich)

**Anwendung:**
- Hauptordner-Verschlüsselung
- Datei-Integrität

---

### Modell 2: Hierarchische Schlüssel-Struktur

**Beschreibung:** Master-Key verschlüsselt Sub-Keys, Sub-Keys verschlüsseln Dateien

**Vorteile:**
- Klare Hierarchie
- Einzelne Schlüssel können rotiert werden
- Granulare Kontrolle

**Nachteile:**
- Master-Key ist Single Point of Failure
- Komplexere Verwaltung

**Anwendung:**
- Multi-User-Szenarien
- Rollen-basierte Zugriffe

---

### Modell 3: Voucher-basiertes Passwort-System

**Beschreibung:** Voucher (Token) für Passwort-Freischaltung, ähnlich think.cloud

**Vorteile:**
- Einfach für User
- Bezahlung vorab möglich
- Verifikation online möglich

**Nachteile:**
- Externe Voucher-Verwaltung nötig
- Online-Verbindung für Verifikation

**Anwendung:**
- User-Freischaltung
- Produkt-Aktivierung

---

### Modell 4: Alphabet-ID-System

**Beschreibung:** User-ID nur aus Buchstaben A-Z, als Nachnamensersatz

**Vorteile:**
- Global verständlich
- Keine Sonderzeichen
- Kulturell neutral

**Nachteile:**
- Begrenzte Kombinationen (26^n)
- Bei 8 Milliarden Usern: längere IDs nötig

**Anwendung:**
- User-Identifikation
- Passwort-Generierung

---

## 🔒 Ordner-Integrität

### Merkle-Root

Der gesamte `TogetherSystems/` Ordner hat einen **Merkle-Root**, der:
- Alle Dateien einschließt
- Bei jeder Änderung neu berechnet wird
- In `Keys/merkle-root.json` gespeichert wird

### Verifikation

```bash
# Merkle-Root berechnen
npm run calculate-merkle-root

# Merkle-Root verifizieren
npm run verify-merkle-root
```

---

## 🚫 Manipulationsschutz

**Prinzip:** Nur der **Inventor** (du) kann den Ordner manipulieren.

**Mechanismen:**
1. **Kryptographische Signatur:** Alle Änderungen müssen signiert sein
2. **Merkle-Root:** Jede Änderung ändert den Root
3. **Audit-Clock:** Alle Änderungen sind sekundengenau protokolliert
4. **Provenance:** Vollständige Chain-of-Custody

---

## 📝 Verwendung

### Schlüssel generieren

```bash
cd Keys
npm run generate-keys
```

### Ordner verschlüsseln

```bash
npm run encrypt-folder
```

### Ordner entschlüsseln

```bash
npm run decrypt-folder
```

### Merkle-Root berechnen

```bash
npm run calculate-merkle-root
```

---

## 🔗 Links

- **Architektur:** `../Docs/ARCHITECTURE.md`
- **Manifest:** `../factory.manifest.yaml`
- **Portal:** `../Portal/index.html`

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
