const express = require('express');

// Simple in-memory transfer ledger for TPGA Telbank.
// This server does NOT move money or crypto itself – it only logs
// transfer intents and metadata so that a regulated backend or operator
// can execute them according to local laws and provider APIs.

const app = express();
const router = express.Router();

const PORT = Number(process.env.TELBANK_PORT) || 3400;
const BASE_PATH = process.env.TELBANK_API_BASE_PATH || '/api/telbank';

/** @type {Map<string, any>} */
const transfers = new Map();

function makeId(prefix = 'tx') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

app.use(express.json());

// Create a new transfer log entry (fiat<->crypto, in/out).
router.post('/transfers', (req, res) => {
  const {
    direction, // 'in' | 'out'
    label,
    walletAddress,
    network,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount,
    meta,
  } = req.body || {};

  if (!direction || (direction !== 'in' && direction !== 'out')) {
    return res.status(400).json({ ok: false, error: 'Invalid direction' });
  }

  if (
    typeof cryptoAmount !== 'number' ||
    !cryptoSymbol ||
    typeof fiatAmount !== 'number' ||
    !fiatCurrency
  ) {
    return res.status(400).json({
      ok: false,
      error:
        'cryptoAmount, cryptoSymbol, fiatAmount and fiatCurrency are required as numbers/strings',
    });
  }

  const id = makeId(direction === 'in' ? 'in' : 'out');
  const now = new Date().toISOString();

  const entry = {
    id,
    direction,
    label: label || (direction === 'in' ? 'Fiat→Crypto inflow' : 'Crypto→Fiat outflow'),
    walletAddress: walletAddress || null,
    network: network || null,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount: externalAccount || null,
    meta: meta || {},
    status: 'logged', // later: 'pending','executed','failed'
    createdAt: now,
    updatedAt: now,
  };

  transfers.set(id, entry);

  res.json({ ok: true, transfer: entry });
});

// List transfers, optionally filtered by walletAddress or direction.
router.get('/transfers', (req, res) => {
  const { walletAddress, direction } = req.query || {};
  const items = [];

  for (const tr of transfers.values()) {
    if (walletAddress && tr.walletAddress && tr.walletAddress !== walletAddress) {
      continue;
    }
    if (direction && tr.direction !== direction) {
      continue;
    }
    items.push(tr);
  }

  // Sorted newest first
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.json({ ok: true, items });
});

// Simple detail endpoint
router.get('/transfers/:id', (req, res) => {
  const id = req.params.id;
  const tr = transfers.get(id);
  if (!tr) {
    return res.status(404).json({ ok: false, error: 'Not found' });
  }
  res.json({ ok: true, transfer: tr });
});

app.use(BASE_PATH, router);

app.listen(PORT, () => {
  console.log(`TPGA Telbank Transfer API listening on port ${PORT}${BASE_PATH}`);
});


