// Engine Node Server - API für Prompt-to-Program
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const express = require('express');
const cors = require('cors');
const { promptToProgram } = require('../prompt_to_program');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/meta', (_req, res) => {
  res.json({
    name: 'Universal Prompt-to-Program Engine',
    version: '3.0.0',
    branding: '.T. TogetherSystems - ModularFlux Architecture',
    capabilities: ['python', 'javascript', 'typescript', 'rust', 'go', 'java', 'cpp', 'csharp', 'swift', 'kotlin']
  });
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, outputDir } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const result = promptToProgram(prompt, outputDir || './generated');
    
    res.json({
      ok: true,
      result: {
        category: result.metadata.category,
        domains: result.metadata.domains,
        targets: result.metadata.targets,
        files: result.files.map(f => ({ language: f.language, path: f.path })),
        hasUI: !!result.ui
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Engine läuft auf Port ${PORT}`);
});


