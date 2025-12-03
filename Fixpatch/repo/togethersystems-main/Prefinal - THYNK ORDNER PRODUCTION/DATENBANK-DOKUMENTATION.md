# 🗄️ THYNK ORDERS - Datenbank-Dokumentation

**Zweck:** Vollständige Dokumentation der Datenbank-Struktur, Schema und Migrationen  
**Aktuell:** localStorage | **Zukünftig:** IndexedDB / Server-Datenbank

---

## 📋 INHALTSVERZEICHNIS

1. [Aktuelle Datenbank (localStorage)](#aktuelle-datenbank-localstorage)
2. [Datenstruktur](#datenstruktur)
3. [Schema-Definition](#schema-definition)
4. [Migration zu Server-Datenbank](#migration-zu-server-datenbank)
5. [IndexedDB Alternative](#indexeddb-alternative)
6. [Datenbank-Operations](#datenbank-operations)

---

## 💾 AKTUELLE DATENBANK (localStorage)

### Storage-Keys

**Primary Keys:**
- `thynk_orders` - Alle Bestellungen (Array)
- `thynk_settings` - Einstellungen (Object)

### Struktur

```javascript
// localStorage['thynk_orders'] = Array von Order-Objekten
// localStorage['thynk_settings'] = Settings-Object
```

---

## 📊 DATENSTRUKTUR

### Order-Objekt (Komplett)

```javascript
{
  // Identifikation
  "id": "order-1234567890",                    // Eindeutige ID
  "order_number": "ORD-2024-01-15-ABC123",     // Bestellnummer (benutzerfreundlich)
  
  // Status
  "status": "pending",                         // pending | paid | shipped | cancelled
  "payment_status": "pending",                 // pending | paid | failed | refunded
  
  // Kunde
  "customer": {
    "name": "Max Mustermann",                  // Pflicht
    "email": "max@example.com",                // Pflicht
    "address": "Musterstraße 123",             // Optional
    "phone": "+49 123 456789",                 // Optional
    "company": "Firma GmbH",                   // Optional
    "vat_id": "DE123456789"                    // Optional (USt-IdNr.)
  },
  
  // Bestellpositionen
  "items": [
    {
      "id": "item-1234567890",                 // Eindeutige Item-ID
      "name": "Produkt Name",                  // Produktname
      "price": 29.99,                          // Einzelpreis
      "quantity": 1,                           // Menge
      "total": 29.99,                          // Gesamt (price * quantity)
      "sku": "PROD-001",                       // Optional: SKU
      "description": "Produktbeschreibung",    // Optional
      "tax_rate": 19.0,                        // Optional: MwSt-Satz
      "tax_amount": 4.79                       // Optional: MwSt-Betrag
    }
  ],
  
  // Finanzen
  "total_amount": 29.99,                       // Gesamtbetrag (netto)
  "tax_amount": 4.79,                          // Gesamt-MwSt
  "total_with_tax": 34.78,                     // Gesamtbetrag (brutto)
  "currency": "EUR",                           // Währung
  "payment_method": "credit_card",             // Optional: Zahlungsmethode
  
  // Zeiten
  "created_at": "2024-01-15T10:30:00.000Z",   // Erstellt am
  "updated_at": "2024-01-15T10:30:00.000Z",   // Aktualisiert am
  "paid_at": null,                             // Bezahlt am (wenn status = paid)
  "shipped_at": null,                          // Versendet am (wenn status = shipped)
  "cancelled_at": null,                        // Storniert am (wenn status = cancelled)
  
  // Zusätzliche Daten
  "notes": "Besondere Anweisungen",            // Optional: Notizen
  "metadata": {                                 // Optional: Metadaten
    "source": "web",
    "campaign": "summer2024",
    "referrer": "google.com"
  },
  
  // Versand
  "shipping": {                                // Optional: Versandinfo
    "method": "standard",
    "cost": 5.99,
    "tracking_number": "123456789",
    "address": {
      "street": "Lieferstraße 456",
      "city": "Berlin",
      "postal_code": "10115",
      "country": "DE"
    }
  }
}
```

### Settings-Objekt

```javascript
{
  "currency": "EUR",                           // Standard-Währung
  "currencySymbol": "€",                       // Währungssymbol
  "tax_rate": 19.0,                            // Standard-MwSt-Satz
  "language": "de",                            // Sprache
  "date_format": "DD.MM.YYYY",                 // Datumsformat
  "number_format": "de-DE",                    // Zahlenformat
  "auto_save": true,                           // Automatisches Speichern
  "notifications": {                           // Benachrichtigungen
    "email": true,
    "sound": false,
    "desktop": false
  },
  "export_format": "json",                     // json | csv | excel
  "backup_interval": 7                         // Backup alle X Tage
}
```

---

## 📐 SCHEMA-DEFINITION

### Order-Schema (TypeScript-like)

```typescript
interface Order {
  // Pflichtfelder
  id: string;                  // Format: "order-{timestamp}"
  order_number: string;        // Format: "ORD-{YYYY}-{MM}-{DD}-{RANDOM}"
  status: OrderStatus;         // pending | paid | shipped | cancelled
  payment_status: PaymentStatus; // pending | paid | failed | refunded
  customer: Customer;
  items: OrderItem[];
  total_amount: number;        // Netto-Betrag
  currency: string;            // ISO 4217 Code
  created_at: string;          // ISO 8601 Datum
  
  // Optionale Felder
  updated_at?: string;
  paid_at?: string;
  shipped_at?: string;
  cancelled_at?: string;
  tax_amount?: number;
  total_with_tax?: number;
  payment_method?: string;
  notes?: string;
  metadata?: Record<string, any>;
  shipping?: ShippingInfo;
}

interface Customer {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  company?: string;
  vat_id?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  sku?: string;
  description?: string;
  tax_rate?: number;
  tax_amount?: number;
}

interface ShippingInfo {
  method: string;
  cost: number;
  tracking_number?: string;
  address?: Address;
}

interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
```

---

## 🔄 MIGRATION ZU SERVER-DATENBANK

### SQL-Schema (für Server-Datenbank)

```sql
-- Orders Tabelle
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  total_amount REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  total_with_tax REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT,
  notes TEXT,
  metadata TEXT, -- JSON
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- Order Items Tabelle
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  total REAL NOT NULL,
  sku TEXT,
  description TEXT,
  tax_rate REAL,
  tax_amount REAL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Shipping Tabelle
CREATE TABLE shipping (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  cost REAL NOT NULL,
  tracking_number TEXT,
  street TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indizes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_shipping_order_id ON shipping(order_id);
```

### Migrations-Script

```javascript
async function migrateToServer(localOrders, apiUrl) {
    console.log(`Migrating ${localOrders.length} orders to server...`);
    
    const results = [];
    
    for (const order of localOrders) {
        try {
            // Order erstellen
            const orderResponse = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status,
                    payment_status: order.payment_status,
                    customer_name: order.customer.name,
                    customer_email: order.customer.email,
                    customer_address: order.customer.address,
                    customer_phone: order.customer.phone,
                    total_amount: order.total_amount,
                    tax_amount: order.tax_amount || 0,
                    total_with_tax: order.total_with_tax || order.total_amount,
                    currency: order.currency,
                    payment_method: order.payment_method,
                    notes: order.notes,
                    metadata: JSON.stringify(order.metadata || {}),
                    created_at: order.created_at
                })
            });
            
            const savedOrder = await orderResponse.json();
            
            // Items erstellen
            for (const item of order.items) {
                await fetch(`${apiUrl}/orders/${savedOrder.id}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            }
            
            // Shipping erstellen (falls vorhanden)
            if (order.shipping) {
                await fetch(`${apiUrl}/orders/${savedOrder.id}/shipping`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order.shipping)
                });
            }
            
            results.push({ order: order.order_number, status: 'success' });
        } catch (error) {
            results.push({ order: order.order_number, status: 'error', error: error.message });
        }
    }
    
    return results;
}
```

---

## 💿 INDEXEDDB ALTERNATIVE

### IndexedDB Setup

```javascript
let db;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('thynk_orders_db', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Orders Store
            if (!db.objectStoreNames.contains('orders')) {
                const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
                ordersStore.createIndex('order_number', 'order_number', { unique: true });
                ordersStore.createIndex('status', 'status', { unique: false });
                ordersStore.createIndex('customer_email', 'customer.email', { unique: false });
                ordersStore.createIndex('created_at', 'created_at', { unique: false });
            }
            
            // Items Store
            if (!db.objectStoreNames.contains('items')) {
                const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
                itemsStore.createIndex('order_id', 'order_id', { unique: false });
            }
            
            // Settings Store
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
    });
}
```

### IndexedDB Operations

```javascript
// Bestellung speichern
function saveOrderToIndexedDB(order) {
    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    return store.put(order);
}

// Alle Bestellungen abrufen
function getAllOrdersFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Bestellung nach Status suchen
function getOrdersByStatus(status) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const index = store.index('status');
        const request = index.getAll(status);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
```

---

## 🔧 DATENBANK-OPERATIONS

### CRUD-Operationen

#### CREATE (Erstellen)

```javascript
function createOrder(orderData) {
    const order = {
        id: 'order-' + Date.now(),
        order_number: generateOrderNumber(),
        ...orderData,
        created_at: new Date().toISOString()
    };
    
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    
    return order;
}
```

#### READ (Lesen)

```javascript
function getOrder(orderId) {
    const orders = getOrders();
    return orders.find(o => o.id === orderId);
}

function getAllOrders() {
    return getOrders();
}

function getOrdersByStatus(status) {
    const orders = getOrders();
    return orders.filter(o => o.status === status);
}
```

#### UPDATE (Aktualisieren)

```javascript
function updateOrder(orderId, updates) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
        orders[index] = {
            ...orders[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return orders[index];
    }
    
    return null;
}
```

#### DELETE (Löschen)

```javascript
function deleteOrder(orderId) {
    const orders = getOrders().filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
}
```

### Queries & Filter

```javascript
// Bestellungen nach Datum filtern
function getOrdersByDateRange(startDate, endDate) {
    const orders = getOrders();
    return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
    });
}

// Bestellungen nach Kunde suchen
function getOrdersByCustomer(email) {
    const orders = getOrders();
    return orders.filter(o => o.customer.email === email);
}

// Statistiken berechnen
function calculateStatistics() {
    const orders = getOrders();
    return {
        total: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length
    };
}
```

---

## 🔄 DATENBANK-MIGRATION

### Von localStorage zu IndexedDB

```javascript
async function migrateLocalStorageToIndexedDB() {
    await initIndexedDB();
    
    const localOrders = getOrders();
    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    
    for (const order of localOrders) {
        await new Promise((resolve, reject) => {
            const request = store.put(order);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    console.log(`Migrated ${localOrders.length} orders to IndexedDB`);
}
```

### Von localStorage zu Server

Siehe: [Migrations-Script oben](#migrations-script)

---

## 📋 CHECKLISTE

### Datenbank-Design:
- [x] ✅ Order-Schema definiert
- [x] ✅ Customer-Schema definiert
- [x] ✅ OrderItem-Schema definiert
- [x] ✅ Settings-Schema definiert

### Migration:
- [ ] ⏳ localStorage → IndexedDB
- [ ] ⏳ localStorage → Server-DB
- [ ] ⏳ Backup-System

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** $(Get-Date -Format "yyyy-MM-dd")

