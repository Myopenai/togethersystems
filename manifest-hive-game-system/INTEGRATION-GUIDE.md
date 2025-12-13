# Manifest-Hive Game System - Integrations-Guide

## Spiel-Button in alle Apps integrieren

### Option 1: JavaScript-Komponente (Empfohlen)

```html
<!-- In deiner HTML-Datei -->
<script src="/manifest-hive-game-system/frontend/js/game-entry-button.js"></script>
<div id="game-entry-container"></div>
<script>
  ManifestHiveGameEntry.init('#game-entry-container');
</script>
```

### Option 2: Auto-Init mit Data-Attribut

```html
<div data-manifest-hive-game-entry="#game-entry-container"></div>
<div id="game-entry-container"></div>
<script src="/manifest-hive-game-system/frontend/js/game-entry-button.js"></script>
```

### Option 3: Manuell einbinden

```html
<button onclick="window.ManifestHiveGameEntry.startRitual()">
  <div class="hex-icon">✨</div>
  <span>Spiel eröffnen</span>
</button>
<script src="/manifest-hive-game-system/frontend/js/game-entry-button.js"></script>
```

## Wo der Button erscheinen soll

### In Chat-Interfaces
```html
<div class="chat-actions">
  <button>Nachricht senden</button>
  <div id="game-entry-chat"></div>
</div>
<script>
  ManifestHiveGameEntry.init('#game-entry-chat');
</script>
```

### In Profilseiten
```html
<div class="profile-actions">
  <div id="game-entry-profile"></div>
</div>
<script>
  ManifestHiveGameEntry.init('#game-entry-profile');
</script>
```

### In Gruppenräumen
```html
<div class="group-actions">
  <div id="game-entry-group"></div>
</div>
<script>
  ManifestHiveGameEntry.init('#game-entry-group');
</script>
```

### Als Systemhinweis
```html
<div class="system-suggestion">
  <p>Möchtet ihr das Gespräch mit einem Spiel fortsetzen?</p>
  <div id="game-entry-suggestion"></div>
</div>
<script>
  ManifestHiveGameEntry.init('#game-entry-suggestion');
</script>
```

## API-Integration

### Öffentliche Wabenräume abrufen
```javascript
fetch('/api/hive/public/numbers')
  .then(r => r.json())
  .then(data => {
    console.log('Öffentliche Räume:', data.numbers);
  });
```

### Spiel vorschlagen
```javascript
fetch('/api/games/suggest?context=silence&player_count=4')
  .then(r => r.json())
  .then(data => {
    console.log('Spielvorschläge:', data.suggestions);
  });
```

### Raum per Nummer beitreten
```javascript
fetch('/api/hive/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: 777,
    user_id: 'USER_ID'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('Raum beigetreten:', data);
  });
```

## Community-Mus Integration

```html
<script src="/manifest-hive-game-system/community/music-system.js"></script>
<script>
  const music = new CommunityMusicSystem();
  music.init();
  music.playEntryTone('ruhig'); // ruhig, feierlich, kreativ, futuristisch
</script>
```

## Merchandise Integration

```html
<script src="/manifest-hive-game-system/community/merchandise-system.js"></script>
<script>
  const merch = new MerchandiseSystem();
  const products = merch.getCatalog('BOARD_GAME', 'ANCIENT_EGYPT');
  console.log('Brettspiele:', products);
</script>
```

## CSS-Anpassung

Falls du das Design anpassen möchtest:

```css
.manifest-hive-game-entry-btn {
  /* Deine eigenen Styles */
}
```

## Vollständige Integration in React/Vue/Angular

### React
```jsx
import { useEffect } from 'react';

function GameEntryButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/manifest-hive-game-system/frontend/js/game-entry-button.js';
    script.onload = () => {
      window.ManifestHiveGameEntry.init('#game-entry');
    };
    document.body.appendChild(script);
  }, []);
  
  return <div id="game-entry"></div>;
}
```

### Vue
```vue
<template>
  <div id="game-entry"></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = '/manifest-hive-game-system/frontend/js/game-entry-button.js';
    script.onload = () => {
      window.ManifestHiveGameEntry.init('#game-entry');
    };
    document.body.appendChild(script);
  }
}
</script>
```

## Repositories

Diese Integration funktioniert in:
- ✅ MyOpenAI Repos
- ✅ ViewunitySystem Repos
- ✅ ViewUnitySystemT Repos
- ✅ Alle anderen Apps mit HTML/JavaScript

## Support

Bei Fragen zur Integration: Siehe `manifest-hive-game-system/README.md`


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
