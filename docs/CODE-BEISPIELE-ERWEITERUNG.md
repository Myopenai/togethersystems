# Code-Beispiele Erweiterung – Together Systems

**LOGO:** `T,.&T,,.&T,,,.(C)TEL1.NL`  
**BRANDING:** Together Systems – International TTT  
**VERSION:** 1.0.0  
**DATUM:** 2025-01-15

---

## 📋 ÜBERSICHT

Diese Dokumentation erweitert die `GESAMTSYSTEM-MASTER-DOKUMENTATION.md` um konkrete Code-Beispiele für alle Hauptkomponenten.

---

## 🔐 VERSCHLÜSSELUNGSSYSTEME

### AES-256-GCM Verschlüsselung

```javascript
// settings/routines/encryption-examples.js

/**
 * AES-256-GCM Verschlüsselung - Production Standard
 * Gemäß INDUSTRIAL-FABRICATION-ROUTINE
 */
async function encryptWithAES256GCM(plaintext, userKey) {
  // Pre-Code-Verification: Settings-Ordner konsultieren
  const encryptionConfig = await loadSettingsConfig('encryption-config.json');
  
  // Key Derivation mit PBKDF2
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userKey),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 200000, // Gemäß Settings-Standard
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // IV generieren
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  // Verschlüsselung
  const plaintextBuffer = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    plaintextBuffer
  );
  
  // Resultat: { salt, iv, ciphertext }
  return {
    salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    ciphertext: Array.from(new Uint8Array(ciphertext))
      .map(b => b.toString(16).padStart(2, '0')).join('')
  };
}
```

---

## 🏦 BANKING-SYSTEME

### TPGA Telbank Transfer

```javascript
// TELBANK/transfer-example.js

/**
 * Telbank Transfer - Fiat ↔ Crypto
 * Gemäß TPGA-TELBANK-SYSTEM-OVERVIEW.md
 */
async function executeTelbankTransfer(transferData) {
  // Pre-Code-Verification
  await verifyWithSettingsManifest();
  
  const {
    flow, // 'inflow' | 'outflow'
    amount,
    currency,
    fromAddress,
    toAddress
  } = transferData;
  
  // MetaMask-Integration prüfen
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    // Transfer-Request an API
    const response = await fetch('/api/telbank/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        flow,
        amount,
        currency,
        from_address: fromAddress || accounts[0],
        to_address: toAddress,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Transfer failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Logging gemäß Console-Monitoring
    console.log('TELBANK_TRANSFER', {
      transfer_id: result.id,
      flow,
      amount,
      status: 'SUCCESS'
    });
    
    return result;
  } else {
    throw new Error('MetaMask not available');
  }
}
```

---

## 📈 BÖRSEN-SYSTEM

### Order-Matching-Engine

```javascript
// Exchange/order-matching-example.js

/**
 * Order-Matching-Algorithmus
 * Price-Time-Priority Matching
 */
function matchOrders(buyOrders, sellOrders) {
  // Pre-Code-Verification
  verifyWithSettingsManifest();
  
  // Sortierung: Price (beste zuerst), dann Time (älteste zuerst)
  const sortedBuys = buyOrders.sort((a, b) => {
    if (b.price !== a.price) return b.price - a.price; // Höchstpreis zuerst
    return a.created_at - b.created_at; // Älteste zuerst
  });
  
  const sortedSells = sellOrders.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price; // Niedrigstpreis zuerst
    return a.created_at - b.created_at; // Älteste zuerst
  });
  
  const trades = [];
  
  for (const buyOrder of sortedBuys) {
    if (buyOrder.filled_quantity >= buyOrder.quantity) continue;
    
    for (const sellOrder of sortedSells) {
      if (sellOrder.filled_quantity >= sellOrder.quantity) continue;
      if (buyOrder.price < sellOrder.price) break; // Kein Match möglich
      
      // Match gefunden
      const remainingBuy = buyOrder.quantity - buyOrder.filled_quantity;
      const remainingSell = sellOrder.quantity - sellOrder.filled_quantity;
      const tradeQuantity = Math.min(remainingBuy, remainingSell);
      const tradePrice = sellOrder.price; // Market-Order oder Limit-Order-Preis
      
      trades.push({
        buy_order_id: buyOrder.id,
        sell_order_id: sellOrder.id,
        asset_type: buyOrder.asset_type,
        asset_id: buyOrder.asset_id,
        price: tradePrice,
        quantity: tradeQuantity,
        executed_at: new Date().toISOString()
      });
      
      // Filled-Quantity aktualisieren
      buyOrder.filled_quantity += tradeQuantity;
      sellOrder.filled_quantity += tradeQuantity;
      
      if (buyOrder.filled_quantity >= buyOrder.quantity) break;
    }
  }
  
  return trades;
}
```

---

## 🎫 VOUCHER-SYSTEM

### Voucher-Generierung mit Behavior-Tracking

```javascript
// Voucher/voucher-generation-example.js

/**
 * Voucher-Generierung basierend auf User-Verhalten
 * Gemäß Voucher-System-Spezifikation
 */
async function generateVoucherForUser(userId, checkoutContext) {
  // Pre-Code-Verification
  await verifyWithSettingsManifest();
  
  // Behavior-Tracking analysieren
  const userBehavior = await analyzeUserBehavior(userId);
  
  // Voucher-Parameter berechnen
  const voucherConfig = {
    discount_type: calculateDiscountType(userBehavior),
    discount_value: calculateDiscountValue(userBehavior, checkoutContext),
    min_purchase: calculateMinPurchase(checkoutContext.cartTotal),
    valid_from: new Date().toISOString(),
    valid_until: calculateValidUntil(userBehavior.urgency),
    trigger_timing: calculateTriggerTiming(userBehavior) // 'before_checkout' | 'after_checkout'
  };
  
  // Voucher generieren
  const voucher = {
    id: generateVoucherId(),
    user_id: userId,
    code: generateVoucherCode(),
    ...voucherConfig,
    status: 'active',
    created_at: new Date().toISOString()
  };
  
  // In Datenbank speichern
  await saveVoucherToDatabase(voucher);
  
  return voucher;
}

function calculateDiscountType(userBehavior) {
  // Logik: percentage für treue Kunden, fixed für neue
  if (userBehavior.total_orders > 10) {
    return 'percentage';
  }
  return 'fixed';
}

function calculateTriggerTiming(userBehavior) {
  // Logik: vor Checkout wenn Cart-Abandonment-Rate hoch
  if (userBehavior.cart_abandonment_rate > 0.5) {
    return 'before_checkout';
  }
  return 'after_checkout';
}
```

---

## 🌐 API-INTEGRATIONEN

### Deutsche Bank API – Payment Initiation

```javascript
// Banking/deutsche-bank-api-example.js

/**
 * Deutsche Bank API - Payment Initiation
 * Gemäß PSD2 / ISO 20022 Standards
 */
async function initiateDeutscheBankPayment(paymentData) {
  // Pre-Code-Verification
  await verifyWithSettingsManifest();
  
  const {
    amount,
    currency,
    creditor_account,
    creditor_name,
    remittance_information
  } = paymentData;
  
  // OAuth 2.0 Token abrufen
  const accessToken = await getDeutscheBankAccessToken();
  
  // Payment Request gemäß ISO 20022
  const paymentRequest = {
    instructedAmount: {
      amount: amount.toFixed(2),
      currency: currency
    },
    creditorAccount: {
      iban: creditor_account
    },
    creditorName: creditor_name,
    remittanceInformationUnstructured: remittance_information,
    requestedExecutionDate: new Date().toISOString().split('T')[0]
  };
  
  // API-Call
  const response = await fetch('https://api.db.com/v1/payments/sepa-credit-transfers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': generateRequestId(),
      'PSU-IP-Address': await getClientIP()
    },
    body: JSON.stringify(paymentRequest)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment initiation failed: ${error.errorMessage}`);
  }
  
  const result = await response.json();
  
  // Logging
  console.log('DEUTSCHE_BANK_PAYMENT', {
    payment_id: result.transactionId,
    status: result.transactionStatus,
    amount,
    currency
  });
  
  return result;
}
```

---

## 💾 DATENBANK-OPERATIONEN

### Negative Asset Pool - Abfrage

```javascript
// Database/negative-asset-query-example.js

/**
 * Negative Asset Pool Query
 * Gemäß TELBANK Architektur
 */
async function queryNegativeAssetPool(filters) {
  // Pre-Code-Verification
  await verifyWithSettingsManifest();
  
  const {
    bank_id,
    asset_class,
    min_amount,
    max_amount,
    status
  } = filters;
  
  // SQL-Query (Cloudflare D1)
  const query = `
    SELECT 
      n.neg_asset_id,
      n.bank_id,
      b.name AS bank_name,
      n.asset_type_id,
      at.code AS asset_class,
      n.nominal_amount,
      n.currency_code,
      n.event_date,
      n.status,
      n.risk_score
    FROM negative_asset n
    JOIN bank b ON n.provider_bank_id = b.bank_id
    JOIN asset_type at ON n.asset_type_id = at.asset_type_id
    WHERE 
      (? IS NULL OR n.provider_bank_id = ?)
      AND (? IS NULL OR at.code = ?)
      AND (? IS NULL OR n.nominal_amount >= ?)
      AND (? IS NULL OR n.nominal_amount <= ?)
      AND (? IS NULL OR n.status = ?)
    ORDER BY n.nominal_amount ASC, n.event_date DESC
  `;
  
  const result = await db.prepare(query).bind(
    bank_id, bank_id,
    asset_class, asset_class,
    min_amount, min_amount,
    max_amount, max_amount,
    status, status
  ).all();
  
  return result.results;
}
```

---

**Erstellt:** 2025-01-15  
**Version:** 1.0.0  
**BRANDING:** T,.&T,,.&T,,,.(C)TEL1.NL

