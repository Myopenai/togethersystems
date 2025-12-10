// Notary Core Service - Digitaler Notator
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../specs/domain/NN_notary.schema.json'), 'utf8')
);
const validate = ajv.compile(schema);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = process.env.DATA_DIR || '/data/notary';

// Manifest speichern
app.post('/notary/manifest', (req, res) => {
  const { name, data } = req.body || {};
  
  if (!name || !data) {
    return res.status(400).json({ error: 'name/data required' });
  }

  try {
    const bin = Buffer.from(String(data), 'base64');
    const sha = crypto.createHash('sha256').update(bin).digest('hex');
    
    const dateDir = path.join(DATA_DIR, new Date().toISOString().slice(0, 10));
    fs.mkdirSync(dateDir, { recursive: true });
    
    const file = path.join(dateDir, name);
    fs.writeFileSync(file, bin);
    
    const meta = {
      id: `NN-${sha.slice(0, 12).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      hash: sha,
      type: 'manifest',
      name,
      notarId: `NN-${sha.slice(0, 12)}`,
      hessenNumber: null,
      verified: false,
      meta: {}
    };
    
    fs.writeFileSync(file + '.meta.json', JSON.stringify(meta, null, 2));
    
    if (!validate(meta)) {
      return res.status(500).json({ error: 'Validation failed', details: validate.errors });
    }
    
    res.status(201).json(meta);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Manifest abrufen
app.get('/notary/manifest/:id', (req, res) => {
  const { id } = req.params;
  // Suche in allen Verzeichnissen
  // ... (vereinfacht)
  res.status(404).json({ error: 'not found' });
});

// Export (ZIP)
app.get('/notary/export/:date', (req, res) => {
  const date = req.params.date;
  const dir = path.join(DATA_DIR, date);
  
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: 'not found' });
  }
  
  // ZIP erstellen (vereinfacht - in Produktion: archiver)
  res.download(dir + '.zip');
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`✅ Notary Core läuft auf Port ${PORT}`);
});


