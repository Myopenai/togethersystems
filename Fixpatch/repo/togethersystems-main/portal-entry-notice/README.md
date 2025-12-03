# Portal-Einstiegs-Hinweis (Baustellenmodus)

Dieses Paket implementiert einen Einstiegs-Hinweis für das Together Systems Portal, der beim ersten Besuch angezeigt wird.

## Integration

1. Kopiere die Dateien in dein Portal-Root:
   - `css/style.css`
   - `js/config.js`
   - `js/entryNotice.js`

2. Füge in deiner Portal-Startseite (z.B. `index.html`, `manifest-portal.html`) ein:

```html
<head>
  <link rel="stylesheet" href="./portal-entry-notice/css/style.css">
</head>
<body>
  <!-- Portal-Inhalt -->
  
  <script src="./portal-entry-notice/js/config.js"></script>
  <script src="./portal-entry-notice/js/entryNotice.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      PortalEntryNotice.init();
    });
  </script>
</body>
```

## Konfiguration

Passe `js/config.js` an:
- `portalName`: Name des Portals
- `githubUrl`: Link zum GitHub-Repository
- `showOnEveryVisit`: `true` = bei jedem Besuch anzeigen, `false` = nur einmal bis "Verstanden" geklickt

## Features

- ✅ Zeigt Baustellenmodus-Hinweis beim ersten Besuch
- ✅ Speichert "Verstanden"-Status in localStorage
- ✅ Buttons: "Verstanden", "Später", "Mehr erfahren"
- ✅ Vollständig anpassbar über Config


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







