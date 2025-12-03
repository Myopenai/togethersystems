# 📚 THYNK ORDERS - Volledige Documentatie (Nederlands)

**Versie:** 1.0.0  
**Datum:** $(Get-Date -Format "yyyy-MM-dd")  
**Status:** Volledige Systeem-Documentatie

---

## 📋 INHOUDSOPGAVE

1. [Introductie](#introductie)
2. [Snelle Start](#snelle-start)
3. [Systeem-Overzicht](#systeem-overzicht)
4. [Installatie & Deployment](#installatie--deployment)
5. [Gebruikershandleiding](#gebruikershandleiding)
6. [Configuratie](#configuratie)
7. [Database](#database)
8. [API-Documentatie](#api-documentatie)
9. [Aanpassingen & Wijzigingen](#aanpassingen--wijzigingen)
10. [Probleemoplossing](#probleemoplossing)
11. [Ontwikkelaars-Documentatie](#ontwikkelaars-documentatie)

---

## 🎯 INTRODUCTIE

### Wat is THYNK ORDERS?

THYNK ORDERS is een volledig, lokaal bestelsysteem dat direct in de browser werkt. Het heeft **GEEN server** nodig en kan direct na het openen worden gebruikt.

### Hoofdfuncties

- ✅ **Lokaal Systeem** - Werkt volledig offline in de browser
- ✅ **Klik & Start** - Gewoon openen en beginnen
- ✅ **Volledige Functionaliteit** - Bestellingen, Winkelwagen, Statistieken
- ✅ **Export/Import** - Gegevens opslaan en herstellen
- ✅ **Responsive Ontwerp** - Werkt op desktop en mobiel

---

## 🚀 SNELSTART

### Stap 1: Bestand openen

1. Open het bestand: **`THYNK-ORDERS-COMPLETE.html`**
2. Dubbelklik is voldoende!
3. De applicatie opent automatisch in de browser

### Stap 2: Eerste bestelling maken

1. Ga naar het tabblad **"➕ Nieuwe Bestelling"**
2. Voer een product in (Naam, Prijs, Aantal)
3. Klik op **"➕ Naar Winkelwagen"**
4. Voer klantgegevens in
5. Klik op **"✅ Bestelling Maken"**

### Stap 3: Klaar!

De bestelling is gemaakt en opgeslagen!

---

## 📊 SYSTEEM-OVERZICHT

### Architectuur

```
THYNK ORDERS (Standalone HTML)
├── Frontend (HTML, CSS, JavaScript)
│   ├── Tab-Navigatie
│   ├── Bestellingen-Beheer
│   ├── Winkelwagen-Systeem
│   └── Statistieken
├── Gegevens-Opslag (localStorage)
│   ├── Bestellingen
│   └── Instellingen
└── Export/Import (JSON)
```

### Hoofdcomponenten

1. **Bestellingen-Beheerder**
   - Maken, Bewerken, Verwijderen
   - Statusbeheer
   - Details weergeven

2. **Winkelwagen-Systeem**
   - Meerdere producten
   - Aantallen & Prijzen
   - Totaalberekening

3. **Statistieken**
   - Totaalomzet
   - Aantal bestellingen
   - Status-Overzicht

4. **Gegevensbeheer**
   - Export (Backup)
   - Import (Herstel)
   - Gegevens verwijderen

---

## 📦 INSTALLATIE & DEPLOYMENT

### Lokale Installatie

**GEEN installatie nodig!**

Gewoon:
1. Bestand `THYNK-ORDERS-COMPLETE.html` kopiëren
2. Dubbelklik om te openen
3. Klaar!

### Deployment-Opties

#### Optie 1: Lokaal (Aanbevolen)
- Bestand op computer opslaan
- Altijd beschikbaar
- Geen server nodig

#### Optie 2: Cloud-Opslag
- Bestand uploaden naar cloud (Google Drive, Dropbox)
- Overal toegankelijk
- Synchronisatie mogelijk

#### Optie 3: Webserver
- Bestand uploaden naar webserver
- Toegang van overal
- Server vereist

---

## 👤 GEBRUIKERSHANDLEIDING

### Tab 1: Bestellingen 📋

**Functies:**
- Alle bestellingen weergeven
- Bestelling bekijken (👁️)
- Status wijzigen (✏️)
- Bestelling verwijderen (🗑️)
- Gegevens exporteren (💾)
- Gegevens importeren (📥)

**Handleiding:**
1. Alle bestellingen worden automatisch weergegeven
2. Klik op **👁️** om details te zien
3. Klik op **✏️** om status te wijzigen:
   - 1 = pending (in afwachting)
   - 2 = paid (betaald)
   - 3 = shipped (verzonden)
   - 4 = cancelled (geannuleerd)

### Tab 2: Nieuwe Bestelling ➕

**Functies:**
- Producten aan winkelwagen toevoegen
- Winkelwagen beheren
- Klantgegevens invoeren
- Bestelling maken

**Handleiding:**
1. Voer productnaam in
2. Voer prijs in (bijv. 29.99)
3. Voer aantal in (bijv. 1)
4. Klik op **"➕ Naar Winkelwagen"**
5. Herhaal voor meer producten
6. Voer klantgegevens in:
   - Naam (verplicht)
   - E-mail (verplicht)
   - Adres (optioneel)
   - Telefoon (optioneel)
7. Klik op **"✅ Bestelling Maken"**

### Tab 3: Statistieken 📊

**Weergave:**
- Totaal Bestellingen
- Totaalomzet
- In afwachting
- Betaald

### Tab 4: Instellingen ⚙️

**Functies:**
- Valuta kiezen (EUR, USD, GBP)
- Gegevens exporteren (Backup)
- Gegevens importeren (Herstel)
- Alle gegevens verwijderen
- Systeeminformatie weergeven

---

## ⚙️ CONFIGURATIE

### Valuta wijzigen

1. Ga naar **"⚙️ Instellingen"**
2. Kies gewenste valuta
3. Klik op **"💾 Instellingen Opslaan"**

### Gegevens exporteren

1. Ga naar **"⚙️ Instellingen"**
2. Klik op **"💾 Backup Maken"**
3. JSON-bestand wordt gedownload
4. Dit bestand veilig bewaren!

### Gegevens importeren

1. Ga naar **"⚙️ Instellingen"**
2. Klik op **"📥 Backup Herstellen"**
3. Selecteer JSON-bestand
4. Gegevens worden geladen

---

## 🗄️ DATABASE

### Lokale Gegevensopslag (localStorage)

THYNK ORDERS gebruikt **Browser localStorage** voor gegevensopslag:

**Opslag-Keys:**
- `thynk_orders` - Alle bestellingen
- `thynk_settings` - Instellingen

### Gegevensstructuur

#### Bestelling (Order):
```json
{
  "id": "order-1234567890",
  "order_number": "ORD-2024-01-15-ABC123",
  "status": "pending",
  "payment_status": "pending",
  "customer": {
    "name": "Jan Jansen",
    "email": "jan@voorbeeld.nl",
    "address": "Voorbeeldstraat 123",
    "phone": "+31 20 1234567"
  },
  "items": [
    {
      "id": "1234567890",
      "name": "Product Naam",
      "price": 29.99,
      "quantity": 1,
      "total": 29.99
    }
  ],
  "total_amount": 29.99,
  "currency": "EUR",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Gegevensbeveiliging

**BELANGRIJK:** localStorage-gegevens kunnen verloren gaan bij:
- Browser-cache wissen
- Browser wisselen
- Computer wisselen

**Oplossing:** Regelmatig back-ups maken!

---

## 🔧 AANPASSINGEN & WIJZIGINGEN

### Ontwerp aanpassen

**CSS-Variabelen wijzigen:**

Het bestand bevat inline CSS. Zoek naar:

```css
:root {
  --primary-color: #4CAF50;
  --background: #0a0a0a;
  --text-color: #e0e0e0;
}
```

### Functies uitbreiden

**Nieuwe functies toevoegen:**

1. Open `THYNK-ORDERS-COMPLETE.html` in een editor
2. Zoek naar de `<script>`-tag
3. Voeg nieuwe functies toe
4. Sla het bestand op

**Voorbeeld - Nieuwe functie:**
```javascript
function mijnNieuweFunctie() {
    // Uw code hier
    alert('Hallo!');
}
```

### Tab toevoegen

1. Zoek naar `.tabs` in HTML
2. Voeg nieuwe tab-knop toe:
```html
<button class="tab" onclick="showTab('mijnTab')">Mijn Tab</button>
```

3. Voeg tab-inhoud toe:
```html
<div id="mijnTab-tab" class="tab-content section">
    <h2>Mijn Tab</h2>
    <!-- Inhoud hier -->
</div>
```

### Database-Migratie

**Van localStorage naar server:**

1. Exporteer alle gegevens
2. Maak server-API
3. Importeer gegevens in server
4. Wijzig localStorage-aanroepen naar API-aanroepen

---

## 🔌 API-DOCUMENTATIE

### Lokale Functies

#### `getOrders()`
Geeft alle bestellingen terug.
```javascript
const orders = getOrders();
```

#### `createOrder()`
Maakt een nieuwe bestelling.
```javascript
createOrder(); // Gebruikt formuliergegevens
```

#### `loadOrders()`
Laadt en toont alle bestellingen.
```javascript
loadOrders();
```

#### `exportData()`
Exporteert alle gegevens als JSON.
```javascript
exportData();
```

#### `importData()`
Importeert gegevens uit JSON-bestand.
```javascript
importData();
```

---

## 🛠️ ONTWIKKELAARS-DOCUMENTATIE

### Code-Structuur

```
THYNK-ORDERS-COMPLETE.html
├── <head>
│   ├── Meta-Tags
│   └── <style> (Alle CSS inline)
└── <body>
    ├── Container
    │   ├── Header
    │   ├── Tabs
    │   └── Tab-Contents
    └── <script> (Alle JavaScript inline)
        ├── Globale Variabelen
        ├── Initialisatie
        ├── Tab-Navigatie
        ├── Winkelwagen-Functies
        ├── Bestellingen-Functies
        ├── Statistieken-Functies
        └── Export/Import-Functies
```

### Belangrijke Functies

#### Winkelwagen
- `addProductToCart()` - Product toevoegen
- `updateCartDisplay()` - Winkelwagen weergeven
- `removeFromCart(index)` - Product verwijderen

#### Bestellingen
- `createOrder()` - Bestelling maken
- `getOrders()` - Alle bestellingen ophalen
- `loadOrders()` - Bestellingen weergeven
- `viewOrder(id)` - Bestelling weergeven
- `updateOrderStatus(id)` - Status wijzigen
- `deleteOrder(id)` - Bestelling verwijderen

#### Gegevensbeheer
- `exportData()` - Export
- `importData()` - Import
- `clearAllData()` - Alle gegevens verwijderen

---

## 🐛 PROBLEEMOPLOSSING

### Probleem: Gegevens verdwenen

**Oorzaak:** localStorage is gewist

**Oplossing:**
1. Controleer of backup aanwezig is
2. Importeer backup
3. Maak regelmatig back-ups!

### Probleem: Functie werkt niet

**Oorzaak:** JavaScript-fout

**Oplossing:**
1. Open browser-console (F12)
2. Controleer foutmeldingen
3. Controleer of alle functies aanwezig zijn

### Probleem: Stijlen zien er verkeerd uit

**Oorzaak:** CSS-conflicten

**Oplossing:**
1. Controleer browser-compatibiliteit
2. Update browser
3. Probeer andere browser

---

## 📞 SUPPORT

### Hulp krijgen

1. Lees deze documentatie
2. Controleer `ANLEITUNG-FUER-DUMMIES.md` (Duits, maar vergelijkbaar)
3. Controleer browser-console op fouten

### Veelgestelde Vragen

**V: Kan ik het bestand op een andere computer gebruiken?**  
A: Ja! Kopieer het bestand en de gegevens (Export/Import).

**V: Verlies ik gegevens bij browser-wissel?**  
A: Ja, localStorage is browser-specifiek. Exporteer van tevoren!

**V: Kan ik meerdere gebruikers gebruiken?**  
A: Momenteel slechts één gebruiker per browser. Voor meerdere: server-versie nodig.

---

**Versie:** 1.0.0  
**Laatste Update:** $(Get-Date -Format "yyyy-MM-dd")

