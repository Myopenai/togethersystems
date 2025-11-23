// mortgage-api-server.js
// Basis-API für den Hypotheken- & Immobilienfinanzierungs-Flow (In-Memory)
//
// Enthält:
//   - Properties (Immobilienobjekte)
//   - MortgageApplications (Anfragen)
//   - MortgageOfferVouchers (Angebote)
//   - MortgageContractVouchers (Vertragsstatus)
//
// Endpunkte (unter BASE_PATH):
//   POST {BASE_PATH}/hypotheken/anfrage         - Neue Hypothekenanfrage anlegen
//   GET  {BASE_PATH}/hypotheken/anfrage/list   - Anfragen für Borrower/Lender listen
//   POST {BASE_PATH}/hypotheken/angebot        - Angebot (Offer-Voucher) anlegen
//   GET  {BASE_PATH}/hypotheken/angebot/list   - Angebote zu Application/Borrower listen
//   POST {BASE_PATH}/hypotheken/angebot/accept - Angebot annehmen → Contract-Voucher erzeugen
//   POST {BASE_PATH}/hypotheken/vertrag/update-status - Vertragsstatus/Sig-Flags aktualisieren
//
// Hinweis:
// - In-Memory für lokale Tests; für Produktion sollte eine DB genutzt werden.

const express = require('express');

const app = express();
const PORT = Number(process.env.MORTGAGE_PORT) || 3300;
const BASE_PATH = process.env.MORTGAGE_API_BASE_PATH || '/api';

app.use(express.json());

// In-Memory-„Datenbank“
/** @type {Array<any>} */
const properties = [];
/** @type {Array<any>} */
const applications = [];
/** @type {Array<any>} */
const offers = [];
/** @type {Array<any>} */
const contracts = [];

function nowIso() {
  return new Date().toISOString();
}

function genId(prefix) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${rand}`;
}

// Hilfsfunktion: Nutzer aus Header ermitteln
function getUserFromReq(req) {
  return req.header('X-MOT-User') || null;
}

// POST /api/hypotheken/anfrage
app.post(`${BASE_PATH}/hypotheken/anfrage`, (req, res) => {
  const borrowerUid = getUserFromReq(req);
  if (!borrowerUid) {
    return res.status(400).json({ error: 'X-MOT-User (borrowerUid) ist erforderlich' });
  }
  const body = req.body || {};
  const applicationId = body.applicationId || genId('app');

  const appObj = {
    applicationId,
    borrowerUid,
    propertyId: body.propertyId || null,
    desiredLoan: body.desiredLoan || null,
    desiredDurationYears: Number(body.desiredDurationYears) || null,
    desiredRateType: body.desiredRateType || null,
    maxInterestRate: typeof body.maxInterestRate === 'number' ? body.maxInterestRate : null,
    submissionTs: body.submissionTs || nowIso(),
    status: body.status || 'open',
    visibility: body.visibility || 'private',
    meta: body.meta || {},
  };
  applications.push(appObj);
  return res.json({ ok: true, applicationId, application: appObj });
});

// GET /api/hypotheken/anfrage/list?role=borrower|lender
app.get(`${BASE_PATH}/hypotheken/anfrage/list`, (req, res) => {
  const role = (req.query.role || 'borrower').toString();
  const uid = getUserFromReq(req);
  if (!uid) {
    return res.status(400).json({ error: 'X-MOT-User ist erforderlich' });
  }

  let list;
  if (role === 'borrower') {
    list = applications.filter(a => a.borrowerUid === uid);
  } else if (role === 'lender') {
    // Sehr einfach: alle Applikationen, in echter Umgebung würde Matching/Filter gelten
    list = applications.slice();
  } else {
    return res.status(400).json({ error: 'role muss borrower oder lender sein' });
  }

  return res.json({ applications: list });
});

// POST /api/hypotheken/angebot
app.post(`${BASE_PATH}/hypotheken/angebot`, (req, res) => {
  const issuerId = getUserFromReq(req);
  if (!issuerId) {
    return res.status(400).json({ error: 'X-MOT-User (issuerId) ist erforderlich' });
  }
  const body = req.body || {};
  if (!body.applicationId) {
    return res.status(400).json({ error: 'applicationId ist erforderlich' });
  }
  const application = applications.find(a => a.applicationId === body.applicationId);
  if (!application) {
    return res.status(404).json({ error: 'Anfrage nicht gefunden' });
  }

  const voucherId = body.voucherId || genId('mort-offer');
  const offer = {
    voucherId,
    type: 'mortgage-offer',
    applicationId: application.applicationId,
    issuerId,
    holderUid: application.borrowerUid,
    status: body.status || 'offered',
    loan: body.loan || application.desiredLoan || null,
    interest: body.interest || null,
    repayment: body.repayment || null,
    fees: body.fees || null,
    validity: body.validity || { validFrom: nowIso(), validUntil: null },
    termsRef: body.termsRef || null,
    roomRefs: body.roomRefs || {},
    createdAt: nowIso(),
  };
  offers.push(offer);
  return res.json({ ok: true, voucherId, offer });
});

// GET /api/hypotheken/angebot/list?applicationId=...&role=borrower|lender
app.get(`${BASE_PATH}/hypotheken/angebot/list`, (req, res) => {
  const uid = getUserFromReq(req);
  if (!uid) {
    return res.status(400).json({ error: 'X-MOT-User ist erforderlich' });
  }
  const { applicationId, role = 'borrower' } = req.query;

  let list = offers.slice();
  if (applicationId) {
    list = list.filter(o => o.applicationId === applicationId);
  }
  if (role === 'borrower') {
    list = list.filter(o => o.holderUid === uid);
  } else if (role === 'lender') {
    list = list.filter(o => o.issuerId === uid);
  }

  return res.json({ offers: list });
});

// POST /api/hypotheken/angebot/accept
// Body: { voucherId }
app.post(`${BASE_PATH}/hypotheken/angebot/accept`, (req, res) => {
  const borrowerUid = getUserFromReq(req);
  if (!borrowerUid) {
    return res.status(400).json({ error: 'X-MOT-User (borrowerUid) ist erforderlich' });
  }
  const { voucherId } = req.body || {};
  if (!voucherId) {
    return res.status(400).json({ error: 'voucherId ist erforderlich' });
  }
  const offer = offers.find(o => o.voucherId === voucherId);
  if (!offer) {
    return res.status(404).json({ error: 'Angebot nicht gefunden' });
  }
  if (offer.holderUid !== borrowerUid) {
    return res.status(403).json({ error: 'Dieses Angebot gehört nicht zu diesem Borrower' });
  }

  offer.status = 'accepted';

  const contractVoucherId = genId('mort-contract');
  const contract = {
    voucherId: contractVoucherId,
    type: 'mortgage-contract',
    applicationId: offer.applicationId,
    offerVoucherId: offer.voucherId,
    lenderId: offer.issuerId,
    borrowerUid,
    status: 'draft',
    signedByBorrower: false,
    signedByLender: false,
    signedByNotary: false,
    documentRefs: {
      draftPdf: null,
      signedPdf: null,
    },
    roomRefs: {
      contractRoomId: `mortgage:contract:${contractVoucherId}`,
    },
    createdAt: nowIso(),
  };
  contracts.push(contract);

  return res.json({ ok: true, contractVoucherId, contract, offer });
});

// POST /api/hypotheken/vertrag/update-status
// Body: { contractVoucherId, action }
app.post(`${BASE_PATH}/hypotheken/vertrag/update-status`, (req, res) => {
  const actorUid = getUserFromReq(req);
  if (!actorUid) {
    return res.status(400).json({ error: 'X-MOT-User ist erforderlich' });
  }
  const { contractVoucherId, action } = req.body || {};
  if (!contractVoucherId || !action) {
    return res.status(400).json({ error: 'contractVoucherId und action sind erforderlich' });
  }
  const contract = contracts.find(c => c.voucherId === contractVoucherId);
  if (!contract) {
    return res.status(404).json({ error: 'Contract-Voucher nicht gefunden' });
  }

  // Sehr einfache Demo-Logik; in echt müssten Rollen geprüft werden
  if (action === 'signed-by-borrower') {
    contract.signedByBorrower = true;
  } else if (action === 'signed-by-lender') {
    contract.signedByLender = true;
  } else if (action === 'signed-by-notary') {
    contract.signedByNotary = true;
  }

  // Status ableiten
  if (contract.signedByBorrower && contract.signedByLender && contract.signedByNotary) {
    contract.status = 'signed';
  } else if (contract.signedByBorrower && contract.signedByLender) {
    contract.status = 'partially-signed';
  } else {
    contract.status = 'draft';
  }

  return res.json({ ok: true, contract });
});

app.listen(PORT, () => {
  console.log(`Mortgage API Server läuft auf Port ${PORT} (Basis-Pfad: ${BASE_PATH})`);
});

// mortgage-api-server.js
// Basis-API für Hypotheken- & Immobilienfinanzierung (In-Memory, erweiterbar)
//
// Endpunkte (unter BASE_PATH, z.B. /api):
//   POST {BASE_PATH}/hypotheken/anfrage         - Hypothekenanfrage (MortgageApplication) anlegen
//   GET  {BASE_PATH}/hypotheken/anfrage/list   - Anfragen für Borrower/Lender auflisten
//   POST {BASE_PATH}/hypotheken/angebot        - Hypothekenangebot (MortgageOfferVoucher) anlegen
//   GET  {BASE_PATH}/hypotheken/angebot/list   - Angebote zu einer Anfrage auflisten
//   POST {BASE_PATH}/hypotheken/angebot/accept - Angebot annehmen → Vertrags-Voucher erzeugen
//   POST {BASE_PATH}/hypotheken/vertrag/update-status - Vertragsstatus aktualisieren
//
// Hinweis:
// - Dieses Backend arbeitet mit In-Memory-Speicher (für lokale Tests).
// - Für Produktion sollte eine echte Datenbank genutzt werden.

const express = require('express');

const app = express();
const PORT = Number(process.env.MORTGAGE_PORT) || 3300;
const BASE_PATH = process.env.MORTGAGE_API_BASE_PATH || '/api';

app.use(express.json());

// In-Memory-Speicher
/** @type {Array<any>} */
const properties = [];
/** @type {Array<any>} */
const applications = [];
/** @type {Array<any>} */
const offers = [];
/** @type {Array<any>} */
const contracts = [];

function generateId(prefix) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${rand}`;
}

function nowIso() {
  return new Date().toISOString();
}

// Helper: aktuellen User aus Header holen
function getUserFromReq(req) {
  return (req.headers['x-mot-user'] || '').toString() || null;
}

// POST /api/hypotheken/anfrage
// Erwartet: MortgageApplication-ähnliches Objekt im Body.
app.post(`${BASE_PATH}/hypotheken/anfrage`, (req, res) => {
  const borrowerUid = getUserFromReq(req);
  if (!borrowerUid) {
    return res.status(400).json({ error: 'X-MOT-User Header (borrowerUid) ist erforderlich' });
  }

  const body = req.body || {};
  const appId = body.applicationId || generateId('app');

  const appObj = {
    applicationId: appId,
    borrowerUid,
    propertyId: body.propertyId || null,
    desiredLoan: body.desiredLoan || null,
    desiredDurationYears: Number(body.desiredDurationYears) || null,
    desiredRateType: body.desiredRateType || null,
    maxInterestRate: typeof body.maxInterestRate === 'number' ? body.maxInterestRate : null,
    submissionTs: nowIso(),
    status: body.status || 'open',
    visibility: body.visibility || 'private',
    meta: body.meta || {},
  };

  applications.push(appObj);
  return res.json({ ok: true, applicationId: appId, application: appObj });
});

// GET /api/hypotheken/anfrage/list?role=borrower|lender
app.get(`${BASE_PATH}/hypotheken/anfrage/list`, (req, res) => {
  const uid = getUserFromReq(req);
  const role = (req.query.role || 'borrower').toString();
  if (!uid) {
    return res.status(400).json({ error: 'X-MOT-User Header ist erforderlich' });
  }

  let list = [];
  if (role === 'borrower') {
    list = applications.filter(a => a.borrowerUid === uid);
  } else if (role === 'lender') {
    // In einem echten System würden wir hier Anfragen anzeigen, die zu einem Lender passen.
    // Für Demo-Zwecke: alle offenen Anfragen.
    list = applications.filter(a => a.status === 'open');
  } else {
    return res.status(400).json({ error: 'Ungültige Rolle, erwarte borrower oder lender' });
  }

  return res.json({ applications: list });
});

// POST /api/hypotheken/angebot
// Erwartet: MortgageOfferVoucher im Body, X-MOT-User = issuerId (Bank/FinTech)
app.post(`${BASE_PATH}/hypotheken/angebot`, (req, res) => {
  const issuerId = getUserFromReq(req);
  if (!issuerId) {
    return res.status(400).json({ error: 'X-MOT-User Header (issuerId) ist erforderlich' });
  }

  const body = req.body || {};
  if (!body.applicationId) {
    return res.status(400).json({ error: 'applicationId ist erforderlich' });
  }

  const appObj = applications.find(a => a.applicationId === body.applicationId);
  if (!appObj) {
    return res.status(404).json({ error: 'Application nicht gefunden' });
  }

  const voucherId = body.voucherId || generateId('mort-offer');
  const offerObj = {
    voucherId,
    type: 'mortgage-offer',
    applicationId: body.applicationId,
    issuerId,
    holderUid: appObj.borrowerUid,
    status: 'offered',
    loan: body.loan || null,
    interest: body.interest || null,
    repayment: body.repayment || null,
    fees: body.fees || null,
    validity: body.validity || null,
    termsRef: body.termsRef || null,
    roomRefs: body.roomRefs || {
      negotiationRoomId: `mortgage:offer:${voucherId}`,
      contractRoomId: null,
    },
    createdAt: nowIso(),
  };

  offers.push(offerObj);
  return res.json({ ok: true, voucherId, offer: offerObj });
});

// GET /api/hypotheken/angebot/list?applicationId=...
app.get(`${BASE_PATH}/hypotheken/angebot/list`, (req, res) => {
  const { applicationId } = req.query;
  if (!applicationId) {
    return res.status(400).json({ error: 'applicationId ist erforderlich' });
  }
  const list = offers.filter(o => o.applicationId === applicationId);
  return res.json({ offers: list });
});

// POST /api/hypotheken/angebot/accept
// Body: { voucherId }
// Erzeugt MortgageContractVoucher und markiert Offer als accepted.
app.post(`${BASE_PATH}/hypotheken/angebot/accept`, (req, res) => {
  const borrowerUid = getUserFromReq(req);
  if (!borrowerUid) {
    return res.status(400).json({ error: 'X-MOT-User Header (borrowerUid) ist erforderlich' });
  }

  const { voucherId } = req.body || {};
  if (!voucherId) {
    return res.status(400).json({ error: 'voucherId ist erforderlich' });
  }

  const offerObj = offers.find(o => o.voucherId === voucherId);
  if (!offerObj) {
    return res.status(404).json({ error: 'Offer nicht gefunden' });
  }
  if (offerObj.holderUid !== borrowerUid) {
    return res.status(403).json({ error: 'Offer gehört nicht zu diesem Borrower' });
  }
  if (offerObj.status !== 'offered') {
    return res.status(400).json({ error: `Offer hat Status ${offerObj.status} und kann nicht akzeptiert werden` });
  }

  offerObj.status = 'accepted';

  const contractVoucherId = generateId('mort-contract');
  const contractObj = {
    voucherId: contractVoucherId,
    type: 'mortgage-contract',
    applicationId: offerObj.applicationId,
    offerVoucherId: offerObj.voucherId,
    lenderId: offerObj.issuerId,
    borrowerUid,
    status: 'draft',
    signedByBorrower: false,
    signedByLender: false,
    signedByNotary: false,
    documentRefs: {
      draftPdf: null,
      signedPdf: null,
    },
    roomRefs: {
      contractRoomId: `mortgage:contract:${contractVoucherId}`,
    },
    createdAt: nowIso(),
  };

  contracts.push(contractObj);

  return res.json({ ok: true, contractVoucherId, contract: contractObj, offer: offerObj });
});

// POST /api/hypotheken/vertrag/update-status
// Body: { contractVoucherId, action }
// action: "signed-by-borrower" | "signed-by-lender" | "signed-by-notary"
app.post(`${BASE_PATH}/hypotheken/vertrag/update-status`, (req, res) => {
  const uid = getUserFromReq(req);
  const { contractVoucherId, action } = req.body || {};
  if (!contractVoucherId || !action) {
    return res.status(400).json({ error: 'contractVoucherId und action sind erforderlich' });
  }

  const contractObj = contracts.find(c => c.voucherId === contractVoucherId);
  if (!contractObj) {
    return res.status(404).json({ error: 'Contract nicht gefunden' });
  }

  if (action === 'signed-by-borrower') {
    if (uid !== contractObj.borrowerUid) {
      return res.status(403).json({ error: 'Nur der Borrower darf diese Aktion durchführen' });
    }
    contractObj.signedByBorrower = true;
  } else if (action === 'signed-by-lender') {
    if (uid !== contractObj.lenderId) {
      return res.status(403).json({ error: 'Nur der Lender darf diese Aktion durchführen' });
    }
    contractObj.signedByLender = true;
  } else if (action === 'signed-by-notary') {
    // In echtem System: separate Notar-Identität / Rolle
    contractObj.signedByNotary = true;
  } else {
    return res.status(400).json({ error: 'Unbekannte action' });
  }

  // Status ableiten
  if (contractObj.signedByBorrower && contractObj.signedByLender) {
    contractObj.status = contractObj.signedByNotary ? 'active' : 'pending-notary';
  }

  contractObj.updatedAt = nowIso();
  return res.json({ ok: true, contract: contractObj });
});

app.listen(PORT, () => {
  console.log(`Mortgage API Server läuft auf Port ${PORT} (Basis-Pfad: ${BASE_PATH})`);
});


