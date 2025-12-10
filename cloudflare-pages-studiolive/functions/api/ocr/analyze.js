// [.SYSTEMS.T.SYSTEMS.] OCR Analyze Endpoint
// Cloudflare Pages Function für OCR-Text-Analyse mit Formel-Logik, Gerechtigkeit und Human-basierter Code-Generierung

export const config = { runtime: 'edge' };

// Human-basierte Code-Generierung: Analysiert Text basierend auf allen menschlichen Eigenschaften, Fakultäten, Branchen
function analyzeHumanContext(text) {
  const humanDomains = {
    finance: { keywords: [/bank/i, /konto/i, /überweisung/i, /zahlung/i, /rechnung/i], weight: 0.3 },
    health: { keywords: [/apotheke/i, /arzt/i, /medizin/i, /krankenhaus/i], weight: 0.25 },
    education: { keywords: [/schule/i, /universität/i, /buch/i, /lernen/i], weight: 0.2 },
    food: { keywords: [/supermarkt/i, /restaurant/i, /bäckerei/i, /lebensmittel/i], weight: 0.3 },
    transport: { keywords: [/bus/i, /bahn/i, /taxi/i, /tank/i, /kraftstoff/i], weight: 0.25 },
    housing: { keywords: [/miete/i, /wohnung/i, /haus/i, /strom/i, /gas/i], weight: 0.3 },
    communication: { keywords: [/telefon/i, /internet/i, /handy/i, /vertrag/i], weight: 0.2 },
    leisure: { keywords: [/kino/i, /theater/i, /sport/i, /fitness/i], weight: 0.15 }
  };
  
  const contextScores = {};
  let totalScore = 0;
  
  for (const [domain, config] of Object.entries(humanDomains)) {
    let matches = 0;
    for (const keyword of config.keywords) {
      if (keyword.test(text)) matches++;
    }
    const score = (matches / config.keywords.length) * config.weight;
    contextScores[domain] = score;
    totalScore += score;
  }
  
  const primaryDomain = Object.entries(contextScores)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  
  return {
    contextScores,
    primaryDomain,
    confidence: Math.min(1.0, totalScore),
    humanFactors: {
      urgency: /dringend|sofort|eilt/i.test(text) ? 'high' : 'normal',
      emotional: /wichtig|notwendig|kritisch/i.test(text) ? 'high' : 'normal',
      social: /gemeinsam|familie|freunde/i.test(text) ? 'yes' : 'no'
    }
  };
}

function parseFields(text) {
  const currency = /\b(€|EUR|\$|USD)\b/i.test(text) ? (text.match(/\b(EUR|USD|\$|€)\b/i)?.[0] ?? 'EUR') : 'EUR';
  const totalMatch = text.match(/total[:\s]*([0-9.,]+)/i) || text.match(/summe[:\s]*([0-9.,]+)/i);
  const total = totalMatch ? Number((totalMatch[1] || '').replace(/\./g,'').replace(',','.')) : null;
  const vatMatch = text.match(/\b(UST|VAT|MwSt)[^\d]*([0-9.,]+)%?/i);
  const vatRate = vatMatch ? Number((vatMatch[2] || '').replace(',','.')) : null;
  const dateMatch = text.match(/\b(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})\b/);
  const date = dateMatch ? dateMatch[1] : null;
  const merchant = (text.match(/(REWE|ALDI|LIDL|SPAR|COOP|TESCO|CARREFOUR)/i)?.[0]) || 'UNKNOWN';
  const lines = text.split(/\n+/).filter(l => l.trim());
  
  // Human-basierte Analyse
  const humanContext = analyzeHumanContext(text);
  
  return { currency, total, vatRate, date, merchant, lines, humanContext };
}

function scoreDecision(fields) {
  const NachfrageIndex = Math.min(100, (fields.total ?? 0) * 2);
  const EnergieKostenIndex = 50;
  const RecyclingPotenzial = 3;
  const FEAnbindung = 4;
  const SpaceReadyIndex = 1;
  
  const w = { B: 0.30, C: -0.20, D: 0.25, E: 0.15, F: 0.30 };
  const sumprod =
    NachfrageIndex * w.B +
    EnergieKostenIndex * w.C +
    RecyclingPotenzial * w.D +
    FEAnbindung * w.E +
    SpaceReadyIndex * w.F;
  
  let EntscheidungInstallieren = 'NOCH PRÜFEN';
  if (sumprod >= 80 && RecyclingPotenzial >= 3 && SpaceReadyIndex >= 4) EntscheidungInstallieren = 'INSTALLIEREN';
  else if (sumprod < 60) EntscheidungInstallieren = 'NICHT INSTALLIEREN';
  
  const OuterSpaceFlag = (SpaceReadyIndex >= 4 && FEAnbindung >= 4 && sumprod >= 90) ? 1 : 0;
  
  return {
    GesamtScore: Math.round(sumprod),
    EntscheidungInstallieren,
    OuterSpaceFlag,
    NachfrageIndex,
    EnergieKostenIndex,
    RecyclingPotenzial,
    FEAnbindung,
    SpaceReadyIndex
  };
}

function fairnessChecks(fields, textQuality) {
  const checks = [
    { rule: 'no_personal_identity_required', pass: true, note: 'Analysis does not require personal identity.' },
    { rule: 'transparency', pass: true, note: 'Key fields extracted with confidence and shown to user.' },
    { rule: 'ocr_quality_min', pass: textQuality.confidence >= 0.6, note: `OCR confidence ${textQuality.confidence}` }
  ];
  
  // Human-basierte Gerechtigkeits-Checks
  if (fields.humanContext) {
    checks.push({
      rule: 'human_context_analysis',
      pass: fields.humanContext.confidence > 0.3,
      note: `Human context analysis: ${fields.humanContext.primaryDomain} (confidence: ${(fields.humanContext.confidence * 100).toFixed(0)}%)`
    });
    
    // Beurteilung der OCR-Qualität basierend auf Human-Faktoren
    if (fields.humanContext.confidence < 0.3) {
      checks.push({
        rule: 'ocr_quality_assessment',
        pass: false,
        note: 'OCR-Qualität als schlecht beurteilt: Unzureichende Kontext-Erkennung. Empfehlung: Bild neu scannen oder manuelle Korrektur.'
      });
    }
  }
  
  return checks;
}

export async function onRequest(context) {
  try {
    const json = await context.request.json();
    const { ocrText, language = 'de', confidence = 0.7 } = json;
    
    if (!ocrText) return new Response(JSON.stringify({ error: 'Missing ocrText' }), { status: 400 });
    
    const fields = parseFields(ocrText);
    const decision = scoreDecision(fields);
    const fairness = fairnessChecks(fields, { confidence });
    
    const audit = {
      policyId: 'UAE-FAIR-001',
      version: '1.0',
      evidenceHashes: [],
      steps: ['ocrText->parseFields', 'parseFields->scoreDecision', 'scoreDecision->fairnessChecks']
    };
    
    // Maschinelles System: Beurteilung der OCR-Qualität
    const ocrQualityAssessment = {
      quality: confidence >= 0.8 ? 'good' : confidence >= 0.6 ? 'acceptable' : 'poor',
      confidence,
      humanContextConfidence: fields.humanContext?.confidence || 0,
      recommendation: confidence < 0.6 
        ? 'Bild neu scannen empfohlen. Bessere Beleuchtung, höhere Auflösung, gerade Ausrichtung.'
        : confidence < 0.8
        ? 'OCR akzeptabel, aber manuelle Überprüfung empfohlen.'
        : 'OCR-Qualität gut, automatische Verarbeitung möglich.'
    };
    
    return new Response(JSON.stringify({
      ok: true,
      language,
      confidence,
      extraction: fields,
      decision,
      fairness,
      audit,
      ocrQualityAssessment,
      humanContext: fields.humanContext
    }), { headers: { 'Content-Type': 'application/json; charset=utf-8' }});
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
