// voucher-api-server.js
// Basis-API für Voucher & Termin-Geschäft (In-Memory, erweiterbar)
//
// Endpunkte:
//   POST /api/voucher/issue        - Neuen Voucher ausstellen
//   GET  /api/voucher/list        - Voucher auflisten (Filter: issuerUid, holderUid, status)
//   GET  /api/slots/available     - Verfügbare Slots für einen Voucher berechnen
//   POST /api/voucher/book        - Voucher auf einen konkreten Slot buchen
//   POST /api/voucher/cancel      - Buchung/Voucher stornieren
//
// Hinweis:
// - Dieses Backend arbeitet mit In-Memory-Speicher (für lokale Tests).
// - Für Produktion sollte eine echte Datenbank (z.B. Postgres/Supabase/Firebase) genutzt werden.

const express = require('express');

const app = express();
const PORT = Number(process.env.VOUCHER_PORT) || 3200;
const BASE_PATH = process.env.VOUCHER_API_BASE_PATH || '/api';

app.use(express.json());

// In-Memory-Speicher
/** @type {Array<any>} */
const vouchers = [];
/** @type {Array<any>} */
const bookings = [];

// Hilfsfunktionen
function isoToDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function generateVoucherId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `v-${ts}-${rand}`;
}

function generateBookingId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `b-${ts}-${rand}`;
}

// POST /api/voucher/issue
// Erwartet: Voucher-Objekt ohne voucherId; issuerUid MUSS gesetzt sein.
app.post(`${BASE_PATH}/voucher/issue`, (req, res) => {
  const v = req.body || {};
  if (!v.issuerUid) {
    return res.status(400).json({ error: 'issuerUid ist erforderlich' });
  }
  const now = new Date().toISOString();
  const voucher = {
    voucherId: v.voucherId || generateVoucherId(),
    issuerUid: v.issuerUid,
    serviceType: v.serviceType || 'generic.service',
    title: v.title || 'Unbenannter Service',
    description: v.description || '',
    durationMinutes: Number(v.durationMinutes) || 60,
    validFrom: v.validFrom || now,
    validUntil: v.validUntil || now,
    allowedSlots: Array.isArray(v.allowedSlots) ? v.allowedSlots : [],
    price: v.price || null,
    terms: v.terms || {},
    transferable: !!v.transferable,
    status: v.status || 'issued',
    holderUid: v.holderUid || null,
    createdAt: now,
  };
  vouchers.push(voucher);
  return res.json({ ok: true, voucher });
});

// GET /api/voucher/list
// Query-Parameter:
//   issuerUid, holderUid, status
app.get(`${BASE_PATH}/voucher/list`, (req, res) => {
  const { issuerUid, holderUid, status } = req.query;
  let list = vouchers.slice();
  if (issuerUid) {
    list = list.filter(v => v.issuerUid === issuerUid);
  }
  if (holderUid) {
    list = list.filter(v => v.holderUid === holderUid);
  }
  if (status) {
    list = list.filter(v => v.status === status);
  }
  return res.json({ items: list });
});

// Hilfsfunktion: einfache Slot-Generierung im Stundentakt zwischen validFrom und validUntil
function generateHourlySlots(voucher) {
  const from = isoToDate(voucher.validFrom);
  const until = isoToDate(voucher.validUntil);
  if (!from || !until || from >= until) return [];

  const slots = [];
  const durMs = (Number(voucher.durationMinutes) || 60) * 60 * 1000;
  let cursor = new Date(from.getTime());

  while (cursor.getTime() + durMs <= until.getTime()) {
    const startIso = cursor.toISOString();
    const endIso = new Date(cursor.getTime() + durMs).toISOString();

    // Prüfen, ob Slot bereits gebucht ist
    const alreadyBooked = bookings.some(
      b => b.voucherId === voucher.voucherId && b.slotStart === startIso && b.status === 'booked'
    );
    if (!alreadyBooked) {
      slots.push({
        slotId: `slot-${startIso}`,
        voucherId: voucher.voucherId,
        start: startIso,
        end: endIso,
      });
    }

    // Nächste Stunde
    cursor = new Date(cursor.getTime() + 60 * 60 * 1000);
  }

  return slots;
}

// GET /api/slots/available
// Query: voucherId=...
app.get(`${BASE_PATH}/slots/available`, (req, res) => {
  const { voucherId } = req.query;
  if (!voucherId) {
    return res.status(400).json({ error: 'voucherId ist erforderlich' });
  }
  const voucher = vouchers.find(v => v.voucherId === voucherId);
  if (!voucher) {
    return res.status(404).json({ error: 'Voucher nicht gefunden' });
  }
  const slots = generateHourlySlots(voucher);
  return res.json({ items: slots });
});

// POST /api/voucher/book
// Body: { voucherId, slotId, holderUid }
app.post(`${BASE_PATH}/voucher/book`, (req, res) => {
  const { voucherId, slotId, holderUid } = req.body || {};
  if (!voucherId || !slotId || !holderUid) {
    return res.status(400).json({ error: 'voucherId, slotId und holderUid sind erforderlich' });
  }
  const voucher = vouchers.find(v => v.voucherId === voucherId);
  if (!voucher) {
    return res.status(404).json({ error: 'Voucher nicht gefunden' });
  }
  if (voucher.status === 'consumed' || voucher.status === 'cancelled' || voucher.status === 'expired') {
    return res.status(400).json({ error: `Voucher hat Status ${voucher.status} und kann nicht gebucht werden` });
  }

  const slots = generateHourlySlots(voucher);
  const slot = slots.find(s => s.slotId === slotId);
  if (!slot) {
    return res.status(400).json({ error: 'Slot nicht verfügbar' });
  }

  const booking = {
    bookingId: generateBookingId(),
    voucherId,
    issuerUid: voucher.issuerUid,
    holderUid,
    slotId,
    slotStart: slot.start,
    slotEnd: slot.end,
    status: 'booked',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  voucher.status = 'booked';
  voucher.holderUid = holderUid;

  return res.json({ ok: true, booking, voucher });
});

// POST /api/voucher/cancel
// Body: { voucherId, bookingId, reason? }
app.post(`${BASE_PATH}/voucher/cancel`, (req, res) => {
  const { voucherId, bookingId, reason } = req.body || {};
  if (!voucherId && !bookingId) {
    return res.status(400).json({ error: 'voucherId oder bookingId ist erforderlich' });
  }

  let booking = null;
  if (bookingId) {
    booking = bookings.find(b => b.bookingId === bookingId);
  } else {
    booking = bookings.find(b => b.voucherId === voucherId && b.status === 'booked');
  }
  if (!booking) {
    return res.status(404).json({ error: 'Buchung nicht gefunden' });
  }

  booking.status = 'cancelled';
  booking.cancelReason = reason || null;
  booking.cancelledAt = new Date().toISOString();

  const voucher = vouchers.find(v => v.voucherId === booking.voucherId);
  if (voucher) {
    voucher.status = 'issued';
    voucher.holderUid = null;
  }

  return res.json({ ok: true, booking, voucher });
});

app.listen(PORT, () => {
  console.log(`Voucher API Server läuft auf Port ${PORT} (Basis-Pfad: ${BASE_PATH})`);
});


