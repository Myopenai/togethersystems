// Universal Engine Server - REST API
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import express from 'express';
import cors from 'cors';
import { UniversalEngine } from './universal-engine';

const app = express();
app.use(cors());
app.use(express.json());

const engine = new UniversalEngine('./generated-programs');

// Meta-Endpoint
app.get('/meta', (_req, res) => {
  res.json({
    name: 'Universal Prompt-to-Program Engine',
    version: '3.0.0',
    branding: '.T. TogetherSystems - ModularFlux Architecture',
    capabilities: {
      languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'java', 'cpp', 'csharp', 'swift', 'kotlin'],
      targets: ['web', 'mobile', 'desktop', 'cli'],
      domains: ['Finanz', 'Energie', 'Statistik', 'Notar', 'Versicherung', 'Haushalt', 'Investition', 'Identity', 'Produkt']
    }
  });
});

// Generate Program
app.post('/generate', async (req, res) => {
  try {
    const { prompt, targets } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ ok: false, error: 'prompt required' });
    }

    const targetList = targets || ['python', 'web'];
    const result = await engine.process(prompt, targetList);

    res.json({
      ok: true,
      category: result.plan.category,
      outputDir: result.outputDir,
      generated: Object.keys(result.generated),
      plan: {
        formulas: result.plan.nodes.length,
        inputs: result.plan.inputs,
        outputs: result.plan.outputs
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Parse Intent (ohne Generierung)
app.post('/parse', (req, res) => {
  try {
    const { parsePrompt } = require('./prompt_parser');
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ ok: false, error: 'prompt required' });
    }

    const intent = parsePrompt(prompt);
    res.json({ ok: true, intent });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Universal Engine läuft auf Port ${PORT}`);
  console.log(`   Meta: http://localhost:${PORT}/meta`);
  console.log(`   Generate: POST http://localhost:${PORT}/generate`);
  console.log(`   Parse: POST http://localhost:${PORT}/parse`);
});


