# Manifest-Hive Game System
## Vollständige Lösung - Komplettes Beispielprojekt

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## 🎯 ÜBERSICHT

Das Manifest-Hive Game System ist eine vollständige Lösung für kulturell eingebettete Spiele in Wabenräumen. Es umfasst:

- **Ritual-Flow:** Friedensversprechen und Raum-Erstellung
- **HiveRooms:** Wabenräume für Spiele
- **Game-Engine:** Spiele-Definitionen und -Sessions
- **Echtzeit-Kommunikation:** WebSocket für Chat und Spiel-Aktionen
- **Community-Features:** Musik, Merchandise, Events

---

## 📁 ORDNERSTRUKTUR

```
manifest-hive-game-system/
├── database/
│   └── schema.sql              # SQL-Schema
├── api/
│   └── server.ts               # Express + WebSocket Server
├── frontend/
│   ├── ritual-wizard.html      # Ritual-Flow Wizard
│   └── hive-room.html          # Wabenraum-Interface
├── games/
│   └── definitions/            # Spiel-Definitionen (JSON)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 QUICK START

### 1. Installation

```bash
cd manifest-hive-game-system
npm install
```

### 2. Datenbank Setup

```bash
# PostgreSQL starten
createdb manifest_hive

# Schema importieren
psql manifest_hive < database/schema.sql
```

### 3. Server starten

```bash
npm run dev
```

Server läuft auf: `http://localhost:3000`

### 4. Frontend öffnen

```bash
# Ritual-Wizard
open frontend/ritual-wizard.html

# Oder via HTTP-Server
python -m http.server 8000
# Dann: http://localhost:8000/frontend/ritual-wizard.html
```

---

## 🎮 FEATURES

### Ritual-Flow
1. **Intro:** Frieden & Spiel
2. **Glückszahl:** 1-999
3. **Wabenstil:** Ruhig, Feierlich, Kreativ, Futuristisch
4. **Friedensversprechen:** Bestätigung
5. **Raum-Erstellung:** Automatisch

### HiveRooms
- **Visibility:** PRIVATE, GROUP_LINK, PUBLIC_NUMBER
- **Teilnehmer:** Owner, Player, Moderator, Auditor, Guest
- **Chat:** Echtzeit-Nachrichten
- **Spiele:** Katalog und Sessions

### Spiele
- **Schach:** Klassisches Strategiespiel
- **Wabenstrategie:** Futuristisches Hex-Spiel
- **Friedenspfeife:** Kooperatives Ritual-Spiel

---

## 🔌 API ENDPOINTS

### Ritual
- `POST /ritual/start` - Ritual starten
- `POST /ritual/confirm_intro` - Intro bestätigen
- `POST /ritual/set_lucky_number` - Glückszahl setzen
- `POST /ritual/select_style` - Stil wählen
- `POST /ritual/confirm_promise` - Versprechen bestätigen
- `POST /ritual/complete` - Ritual abschließen

### HiveRooms
- `POST /hive/create` - Raum erstellen
- `GET /hive/public?theme=...` - Öffentliche Räume
- `POST /hive/join` - Raum beitreten
- `POST /hive/leave` - Raum verlassen

### Games
- `GET /games/catalog?epoch=...&category=...` - Spiel-Katalog
- `POST /games/start` - Spiel starten
- `GET /games/session/:id` - Session abrufen
- `POST /games/action` - Spiel-Aktion

### WebSocket
- `join_room` - Raum beitreten
- `chat_message` - Chat-Nachricht
- `game_action` - Spiel-Aktion
- `system_event` - System-Event

---

## 🎨 FRONTEND-KOMPONENTEN

### RitualWizard
- 5-Schritte-Wizard
- Progress-Anzeige
- API-Integration

### HiveRoomView
- Teilnehmerliste
- Spielbereich
- Chat-Panel
- WebSocket-Integration

---

## 🎶 COMMUNITY-FEATURES

### Community-Mus
- Klangsequenz beim Eintritt
- Raum-spezifische Musik
- Ritual-Musik

### Merchandise
- Physische Brettspiele
- Kleidung
- Digitale Badges

### Hybrid-Events
- Mixed Reality Spielabende
- Öffentliche Hive-Marktplätze

---

## 🚀 ZUKUNFTSERWEITERUNG

- **VR/AR Clients:** Holographische Räume
- **Brain-Computer-Interfaces:** Direkte Gedankensteuerung
- **Neue Rituale:** Kulturabhängige Einleitungen
- **Plug-in-System:** Erweiterbare Spiele und Rituale

---

## 📊 DATENBANK-SCHEMA

- `users` - Benutzer
- `hive_rooms` - Wabenräume
- `games` - Spiel-Definitionen
- `game_sessions` - Laufende Sessions
- `rituals` - Ritual-Dokumentation
- `room_members` - Raum-Mitglieder
- `chat_messages` - Chat-Nachrichten
- `game_actions` - Spiel-Aktionen

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt: 2025-01-27*


