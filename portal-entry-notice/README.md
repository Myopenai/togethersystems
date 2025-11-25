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


