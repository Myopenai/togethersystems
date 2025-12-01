# THYNK ORDNER - Vollständige API-Routen Übersicht

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

---

## 📋 ALLE IMPLEMENTIERTEN API-ENDPOINTS

### ✅ Orders API

#### `POST /api/orders`
**Beschreibung:** Neue Bestellung erstellen

**Request Body:**
```json
{
  "site_id": "site-123",
  "items": [
    {
      "product_id": "prod-1",
      "quantity": 2
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "Street 123"
  },
  "payment_method": "mollie",
  "currency": "EUR"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "order": {
      "id": "order-...",
      "order_number": "ORD-20250101-ABC123",
      "status": "pending",
      "total_amount": 100.00,
      ...
    }
  }
}
```

**Datei:** `functions/api/orders/index.js`

---

#### `GET /api/orders`
**Beschreibung:** Liste aller Bestellungen

**Query Parameters:**
- `site_id` (required)
- `status` (optional)
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Datei:** `functions/api/orders/index.js`

---

#### `GET /api/orders/[orderId]`
**Beschreibung:** Bestellung abrufen mit allen Details

**Datei:** `functions/api/orders/[orderId].js`

---

#### `PUT /api/orders/[orderId]`
**Beschreibung:** Bestellung aktualisieren

**Request Body:**
```json
{
  "status": "paid",
  "payment_status": "paid",
  "customer": {...}
}
```

**Datei:** `functions/api/orders/[orderId].js`

---

#### `DELETE /api/orders/[orderId]`
**Beschreibung:** Bestellung löschen (soft delete - Status auf 'cancelled')

**Datei:** `functions/api/orders/[orderId].js`

---

### ✅ Order Items API

#### `GET /api/orders/[orderId]/items`
**Beschreibung:** Alle Items einer Bestellung abrufen

**Datei:** `functions/api/orders/[orderId]/items.js`

---

#### `POST /api/orders/[orderId]/items`
**Beschreibung:** Item zu Bestellung hinzufügen

**Request Body:**
```json
{
  "product_id": "prod-1",
  "quantity": 2,
  "name": "Product Name",
  "unit_price": 50.00
}
```

**Datei:** `functions/api/orders/[orderId]/items.js`

---

### ✅ Payments API (Mollie)

#### `POST /api/payments/mollie/create`
**Beschreibung:** Zahlung bei Mollie erstellen

**Request Body:**
```json
{
  "order_id": "order-123",
  "amount": 100.00,
  "currency": "EUR",
  "description": "Order #123",
  "redirect_url": "https://..."
}
```

**Datei:** `functions/api/payments/mollie.js`

---

#### `GET /api/payments/mollie/[paymentId]`
**Beschreibung:** Zahlungsstatus abrufen

**Datei:** `functions/api/payments/mollie.js`

---

#### `POST /api/payments/mollie/webhook`
**Beschreibung:** Webhook-Handler für Mollie-Callbacks

**Datei:** `functions/api/payments/mollie.js`

---

### ✅ Notifications API

#### `POST /api/notifications/email`
**Beschreibung:** E-Mail-Benachrichtigung senden

**Request Body:**
```json
{
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "template": "order-confirmation",
  "data": {
    "customer_name": "John Doe",
    "order_number": "ORD-123",
    "total_amount": 100.00,
    "status": "pending"
  },
  "order_id": "order-123"
}
```

**Templates:**
- `order-confirmation` - Bestellbestätigung
- `order-status-update` - Status-Update

**Datei:** `functions/api/notifications/email.js`

---

### ✅ Health Check API

#### `GET /api/health`
**Beschreibung:** System-Status und Health Check

**Response:**
```json
{
  "ok": true,
  "service": "thynk-order",
  "status": "running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

**Datei:** `functions/api/health.js`

---

## 🔒 SICHERHEIT

**Hinweis:** Alle Routinen sind OHNE Verschlüsselung implementiert (wie angefragt).

- API-Key-Prüfung ist optional (wird übersprungen wenn kein TS_API_KEY gesetzt)
- Keine HTTPS-Erzwingung
- Keine Verschlüsselung der Datenbank-Verbindungen
- Development-Modus aktiviert wenn keine Keys gesetzt sind

---

## 🚀 STARTEN

```bash
cd "THYNK ORDNER PRODUCTION"
chmod +x start-thynk-order-server.sh
./start-thynk-order-server.sh
```

Oder mit Node.js direkt:
```bash
node server.js
```

---

## 📞 KONTAKT

| Informatie | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

**Dokument Version:** 1.0  
**Stand:** $(Get-Date -Format "yyyy-MM-dd")

