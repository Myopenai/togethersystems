# THYNK ORDNER - Server Setup & Deployment

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

---

## 🚀 SERVER STARTEN

### Linux/Mac:

```bash
cd "THYNK ORDNER PRODUCTION"
chmod +x start-thynk-order-server.sh
./start-thynk-order-server.sh
```

### Windows (PowerShell):

```powershell
cd "THYNK ORDNER PRODUCTION"
bash start-thynk-order-server.sh
```

### Oder direkt mit Node.js:

```bash
node server.js
```

---

## 📁 API ENDPOINTS

### Orders:
- `POST /api/orders` - Neue Bestellung erstellen
- `GET /api/orders` - Liste aller Bestellungen
- `GET /api/orders/[orderId]` - Bestellung abrufen
- `PUT /api/orders/[orderId]` - Bestellung aktualisieren
- `DELETE /api/orders/[orderId]` - Bestellung löschen

### Order Items:
- `GET /api/orders/[orderId]/items` - Items einer Bestellung
- `POST /api/orders/[orderId]/items` - Item hinzufügen

### Payments:
- `POST /api/payments/mollie/create` - Zahlung erstellen
- `GET /api/payments/mollie/[paymentId]` - Zahlungsstatus abrufen
- `POST /api/payments/mollie/webhook` - Webhook-Handler

### Notifications:
- `POST /api/notifications/email` - E-Mail senden

### Health:
- `GET /api/health` - System-Status

---

## ⚙️ KONFIGURATION

### Umgebungsvariablen:

```bash
export PORT=8787
export TS_API_KEY=your-api-key-here
export MOLLIE_API_KEY=your-mollie-key
export SENDGRID_API_KEY=your-sendgrid-key
export FROM_EMAIL=noreply@yoursite.com
```

### Development Mode:

Wenn keine API-Keys gesetzt sind, läuft das System im Development-Modus:
- Keine API-Key-Prüfung
- E-Mails werden nur geloggt (nicht gesendet)
- Payment wird simuliert

---

## 📝 BEISPIEL-REQUESTS

### Bestellung erstellen:

```bash
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-123",
    "items": [
      {"product_id": "prod-1", "quantity": 2}
    ],
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

### Health Check:

```bash
curl http://localhost:8787/api/health
```

---

## 🔧 ANFORDERUNGEN

- Node.js 18+
- npm oder yarn
- Cloudflare D1 Database (oder SQLite für lokal)
- (Optional) Mollie API Key für Zahlungen
- (Optional) SendGrid API Key für E-Mails

---

## 📞 KONTAKT

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

