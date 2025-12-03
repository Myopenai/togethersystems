# 🔧 THYNK ORDERS - Umbau & Anpassungen Anleitung

**Zweck:** Detaillierte Anleitung für Umbau-Maßnahmen, Konfigurationen und Anpassungen  
**Für:** Entwickler, Administratoren, Anpasser

---

## 📋 INHALTSVERZEICHNIS

1. [Grundlegendes](#grundlegendes)
2. [Design-Anpassungen](#design-anpassungen)
3. [Funktions-Erweiterungen](#funktions-erweiterungen)
4. [Datenbank-Anpassungen](#datenbank-anpassungen)
5. [API-Integration](#api-integration)
6. [Konfiguration erweitern](#konfiguration-erweitern)
7. [Von lokal zu Server](#von-lokal-zu-server)

---

## 🎯 GRUNDLEGENDES

### Datei-Struktur verstehen

```
THYNK-ORDERS-COMPLETE.html
├── <head>
│   ├── <meta> Tags
│   └── <style> → ALLE CSS (inline)
└── <body>
    ├── Container
    │   ├── Header
    │   ├── Tabs (Navigation)
    │   └── Tab-Contents (Inhalt)
    └── <script>
        ├── Globale Variablen
        ├── Initialisierung
        └── Funktionen
```

**Wichtig:**
- Alles in EINER Datei
- CSS ist inline (im `<style>`-Tag)
- JavaScript ist inline (im `<script>`-Tag)
- Keine externen Abhängigkeiten

---

## 🎨 DESIGN-ANPASSUNGEN

### Farben ändern

**Methode 1: Direkt im CSS**

Suchen Sie nach:
```css
background: #0a0a0a;  /* Hintergrund */
color: #e0e0e0;       /* Text */
background: #4CAF50;  /* Buttons */
```

Ändern Sie die Werte:
```css
background: #1a1a1a;  /* Dunklerer Hintergrund */
color: #ffffff;       /* Weißer Text */
background: #2196F3;  /* Blaue Buttons */
```

**Methode 2: CSS-Variablen (empfohlen)**

Fügen Sie am Anfang des `<style>`-Tags hinzu:
```css
:root {
  --primary-color: #4CAF50;
  --secondary-color: #555;
  --background-color: #0a0a0a;
  --text-color: #e0e0e0;
  --card-background: #111;
  --border-color: #333;
}
```

Dann ersetzen Sie alle Farbwerte durch Variablen:
```css
background: var(--primary-color);
color: var(--text-color);
```

### Layout ändern

**Container-Breite:**
```css
.container {
  max-width: 1400px; /* Ändern Sie hier */
}
```

**Spalten-Grid:**
```css
.grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  /* Ändern Sie minmax(300px, 1fr) für andere Breiten */
}
```

### Schriftarten ändern

Suchen Sie nach:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Ändern Sie zu:
```css
font-family: 'Arial', 'Helvetica', sans-serif;
/* Oder: font-family: 'Roboto', sans-serif; */
```

---

## ⚙️ FUNKTIONS-ERWEITERUNGEN

### Neue Funktion hinzufügen

**Schritt 1: Funktion im Script erstellen**

Suchen Sie nach dem Ende der bestehenden Funktionen und fügen Sie hinzu:
```javascript
function meineNeueFunktion() {
    // Ihre Logik hier
    alert('Neue Funktion!');
}
```

**Schritt 2: Funktion aufrufen**

Im HTML oder in einem Button:
```html
<button class="btn" onclick="meineNeueFunktion()">Neue Funktion</button>
```

### Neues Tab hinzufügen

**Schritt 1: Tab-Button hinzufügen**

Suchen Sie nach `.tabs` und fügen Sie hinzu:
```html
<button class="tab" onclick="showTab('meinTab')">Mein Tab</button>
```

**Schritt 2: Tab-Content hinzufügen**

Fügen Sie nach den anderen Tab-Contents hinzu:
```html
<div id="meinTab-tab" class="tab-content section">
    <h2>Mein Tab</h2>
    <p>Inhalt hier...</p>
    <button class="btn" onclick="meineFunktion()">Aktion</button>
</div>
```

### Bestellungsfelder erweitern

**Schritt 1: Input-Felder hinzufügen**

In der "Neue Bestellung" Sektion:
```html
<input type="text" id="newField" placeholder="Neues Feld">
```

**Schritt 2: In createOrder() einbinden**

Suchen Sie nach `createOrder()` und fügen Sie hinzu:
```javascript
const newField = document.getElementById('newField').value;
order.new_field = newField; // Zu Order-Objekt hinzufügen
```

### Export-Format ändern

**Excel-Export hinzufügen:**

Installieren Sie eine Bibliothek oder erstellen Sie CSV:
```javascript
function exportToExcel() {
    const orders = getOrders();
    let csv = 'Bestellnummer,Kunde,Betrag\n';
    
    orders.forEach(order => {
        csv += `${order.order_number},${order.customer.name},${order.total_amount}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bestellungen.csv';
    link.click();
}
```

---

## 🗄️ DATENBANK-ANPASSUNGEN

### Daten-Struktur erweitern

**Neue Felder zur Bestellung:**

1. Ändern Sie `createOrder()`:
```javascript
const order = {
    // ... bestehende Felder ...
    new_field: document.getElementById('newField').value,
    metadata: {
        source: 'web',
        campaign: 'summer2024'
    }
};
```

2. Beim Laden anzeigen:
```javascript
function viewOrder(orderId) {
    const order = getOrders().find(o => o.id === orderId);
    // Zeigen Sie order.new_field an
    console.log(order.new_field);
}
```

### Neue Status hinzufügen

**Schritt 1: Status definieren**

```javascript
const STATUS_MAP = {
    '1': 'pending',
    '2': 'paid',
    '3': 'shipped',
    '4': 'cancelled',
    '5': 'delivered',  // NEU
    '6': 'returned'    // NEU
};
```

**Schritt 2: Status-CSS hinzufügen**

```css
.status-delivered { background: #00BCD4; color: #fff; }
.status-returned { background: #9E9E9E; color: #fff; }
```

### Datenbank-Migration

**Von localStorage zu IndexedDB:**

1. IndexedDB-Setup:
```javascript
let db;
const request = indexedDB.open('thynk_orders_db', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('orders', { keyPath: 'id' });
    objectStore.createIndex('order_number', 'order_number', { unique: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
};
```

2. Daten migrieren:
```javascript
function migrateToIndexedDB() {
    const orders = getOrders();
    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    
    orders.forEach(order => {
        store.add(order);
    });
}
```

---

## 🔌 API-INTEGRATION

### Server-API verbinden

**Schritt 1: API-Endpunkt definieren**

```javascript
const API_BASE_URL = 'https://your-api.com/api';
```

**Schritt 2: Fetch-Funktion erstellen**

```javascript
async function fetchFromAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}
```

**Schritt 3: Bestellung an Server senden**

```javascript
async function createOrderWithAPI() {
    const order = {
        // ... Order-Daten ...
    };
    
    // Lokal speichern
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    
    // An Server senden
    const result = await fetchFromAPI('/orders', 'POST', order);
    if (result) {
        console.log('Order saved on server:', result);
    }
}
```

### Offline-Funktionalität

**Queue für Offline-Requests:**

```javascript
const offlineQueue = [];

function queueRequest(endpoint, method, data) {
    offlineQueue.push({ endpoint, method, data, timestamp: Date.now() });
    localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
}

function processOfflineQueue() {
    if (!navigator.onLine) return;
    
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.forEach(request => {
        fetchFromAPI(request.endpoint, request.method, request.data)
            .then(() => {
                // Erfolgreich gesendet, aus Queue entfernen
                const newQueue = queue.filter(r => r !== request);
                localStorage.setItem('offline_queue', JSON.stringify(newQueue));
            });
    });
}

// Bei Online-Verbindung verarbeiten
window.addEventListener('online', processOfflineQueue);
```

---

## ⚙️ KONFIGURATION ERWEITERN

### Konfigurationsdatei erstellen

**config.js erstellen:**

```javascript
window.THYNK_CONFIG = {
    currency: {
        default: 'EUR',
        symbol: '€',
        decimalPlaces: 2
    },
    order: {
        numberFormat: 'ORD-{YYYY}-{MM}-{DD}-{RANDOM}',
        defaultStatus: 'pending',
        autoIncrement: true
    },
    ui: {
        theme: 'dark',
        language: 'de',
        itemsPerPage: 20
    },
    features: {
        exportEnabled: true,
        importEnabled: true,
        statisticsEnabled: true
    }
};
```

**In HTML einbinden:**

```html
<script src="config.js"></script>
<script>
    // Verwenden Sie die Konfiguration
    const currency = window.THYNK_CONFIG.currency.default;
</script>
```

### Einstellungen erweitern

**Neue Einstellung hinzufügen:**

1. Im Settings-Tab:
```html
<select id="theme">
    <option value="dark">Dark</option>
    <option value="light">Light</option>
</select>
```

2. Speichern:
```javascript
function saveSettings() {
    settings.theme = document.getElementById('theme').value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
```

3. Anwenden:
```javascript
function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
}
```

---

## 🚀 VON LOKAL ZU SERVER

### Schritt 1: Backend erstellen

**Node.js/Express Beispiel:**

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/orders', async (req, res) => {
    const order = req.body;
    // In Datenbank speichern
    const savedOrder = await db.orders.insert(order);
    res.json(savedOrder);
});

app.get('/api/orders', async (req, res) => {
    const orders = await db.orders.findAll();
    res.json(orders);
});
```

### Schritt 2: Frontend anpassen

**API-URL konfigurieren:**

```javascript
const API_URL = 'https://your-server.com/api';
```

**Alle localStorage-Calls durch API-Calls ersetzen:**

```javascript
// ALT (localStorage):
localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

// NEU (API):
await fetch(`${API_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(order)
});
```

### Schritt 3: Hybrid-Lösung

**Lokal UND Server:**

```javascript
async function saveOrder(order) {
    // 1. Lokal speichern (Offline-First)
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    
    // 2. An Server senden (falls online)
    if (navigator.onLine) {
        try {
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                body: JSON.stringify(order)
            });
        } catch (error) {
            console.error('Server sync failed, saved locally');
        }
    }
}
```

---

## 📋 CHECKLISTE FÜR UMBAU

### Vor dem Umbau:
- [ ] Backup erstellen (Datei kopieren)
- [ ] Änderungen dokumentieren
- [ ] Test-Umgebung einrichten

### Während des Umbaus:
- [ ] Schritt für Schritt vorgehen
- [ ] Jeden Schritt testen
- [ ] Fehler dokumentieren

### Nach dem Umbau:
- [ ] Alle Funktionen testen
- [ ] Dokumentation aktualisieren
- [ ] Backup aufbewahren

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** $(Get-Date -Format "yyyy-MM-dd")

