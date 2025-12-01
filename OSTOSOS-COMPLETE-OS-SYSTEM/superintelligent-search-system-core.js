// T,. OSTOSOS - Superintelligentes Suchsystem mit KI-Unterstützung
// Erkennt fehlerhafte Eingaben, fragt nach, leitet ab

const SUPERINTELLIGENT_SEARCH = {
  corpus: [],
  index: new Map(),
  grams: new Map(),
  aiHelper: null,
  
  init() {
    this.loadCorpus();
    this.buildIndex();
    if (window.AI_CHAT_SYSTEM) {
      this.aiHelper = window.AI_CHAT_SYSTEM;
    }
  },
  
  loadCorpus() {
    // Lade alle Dokumentationen und Hilfe-Artikel
    const docs = [
      { id: 'studienprojekt', title: 'Wissenschaftliches Studienprojekt', tags: ['studienprojekt', 'wissenschaftlich', 'lernen', 'gentlyoverdone'], content: 'OSTOSOS ist ein wissenschaftliches Studienprojekt. Fertige Programme können als Studienobjekte verwendet werden. AI-Begeisterte können mit Dokumentationen schnell Programme erstellen, üben und lernen.' },
      { id: 'gentlyoverdone', title: 'Gentlyoverdone Programme', tags: ['gentlyoverdone', 'programme', 'studienobjekte', 'reproduktion'], content: 'Gentlyoverdone-Ordner enthält fertige Programme als Studienobjekte. Jedes Programm kann reproduziert, verbessert oder in eine andere Version umgewandelt werden.' },
      { id: 'manifest', title: 'Manifest Portal', tags: ['manifest', 'portal', 'offline', 'verification'], content: 'Manifest Portal für Offline-Verification und lokale Datenverwaltung' },
      { id: 'telbank', title: 'TPGA Telbank', tags: ['bank', 'finanz', 'transaktion', 'wallet'], content: 'TPGA Telbank System für Transaktionen, Wallet-Verwaltung und Finanz-Operationen' },
      { id: 'oso', title: 'OSO Produktionssystem', tags: ['produktion', 'statistik', 'user', 'kosten'], content: 'OSO Produktionssystem für User-Management, Statistiken und Kostenberechnung' },
      { id: 'honeycomb', title: 'Honeycomb Hub', tags: ['honeycomb', 'prozess', 'workflow'], content: 'Honeycomb Hub für Prozess-Management und Workflows' },
      { id: 'legal', title: 'Legal Hub', tags: ['legal', 'recht', 'vertrag', 'compliance'], content: 'Legal Hub für Verträge, Compliance und rechtliche Dokumente' },
      { id: 'dev-tools', title: 'Developer Tools', tags: ['dev', 'entwickler', 'system', 'hardware'], content: 'Developer Expert Tools für Systemanalyse, Hardware-Identifizierung und Netzwerk' },
      { id: 'extensions', title: 'Erweiterungen', tags: ['erweiterung', 'extension', 'install', 'plugin'], content: 'Erweiterungen Manager für Installation und Verwaltung von 200+ Erweiterungen' },
      { id: 'ai-chat', title: 'AI Chat System', tags: ['ai', 'chat', 'sprachmodell', 'hilfe'], content: 'AI Chat System für Konversation, Code-Erklärung und Fehlerbehebung' },
      { id: 'settings', title: 'Settings System', tags: ['settings', 'einstellung', 'konfiguration'], content: 'Settings-Ordner System für Konfiguration und System-Einstellungen' },
      { id: 'test', title: 'Test System', tags: ['test', 'prüfung', 'fehler', 'diagnose'], content: 'Test-System für automatische Tests und Fehlererkennung' },
      { id: 'fixsystem', title: 'Fixsystem', tags: ['fix', 'reparieren', 'fehler', 'auto-fix'], content: 'Playwright-ähnliches Fixsystem für automatische Fehlerbehebung' },
      { id: 'cloud', title: 'Cloud Hub', tags: ['cloud', 'sync', 'speicher', 'backup'], content: 'Cloud Hub für Synchronisation und Backup' },
      { id: 'mail', title: 'Mail Hub', tags: ['mail', 'email', 'nachricht', 'postfach'], content: 'Mail Hub für E-Mail-Verwaltung und Nachrichten' },
      { id: 'media', title: 'Media Hub', tags: ['media', 'audio', 'video', 'doppelvision'], content: 'Media Hub für Audio/Video-Wiedergabe mit Doppelvision' },
      { id: 'matrix', title: 'Matrix Games', tags: ['game', 'spiel', 'matrix', 'multiplayer'], content: 'Matrix Games für Gaming und Multiplayer-Funktionen' }
    ];
    
    docs.forEach(doc => this.addDoc(doc));
  },
  
  addDoc(doc) {
    this.corpus.push(doc);
    const tokens = this.tokenize(doc.title + ' ' + doc.tags.join(' ') + ' ' + doc.content);
    const uniq = new Set(tokens);
    
    uniq.forEach(tok => {
      if (!this.index.has(tok)) this.index.set(tok, new Set());
      this.index.get(tok).add(doc.id);
      
      const g = this.ngrams(tok, 3);
      g.forEach(gr => {
        if (!this.grams.has(gr)) this.grams.set(gr, new Set());
        this.grams.get(gr).add(tok);
      });
    });
  },
  
  tokenize(text) {
    return text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s\-\.]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  },
  
  ngrams(tok, n = 3) {
    const s = `__${tok}__`;
    const g = [];
    for (let i = 0; i <= s.length - n; i++) {
      g.push(s.slice(i, i + n));
    }
    return g;
  },
  
  levenshtein(a, b) {
    const m = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) m[i][0] = i;
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
      }
    }
    return m[a.length][b.length];
  },
  
  fuzzyCandidates(queryTok, limit = 8) {
    const G = this.ngrams(queryTok, 3);
    const tokenScores = new Map();
    
    G.forEach(gr => {
      const set = this.grams.get(gr);
      if (!set) return;
      set.forEach(tok => {
        tokenScores.set(tok, (tokenScores.get(tok) || 0) + 1);
      });
    });
    
    const ranked = Array.from(tokenScores.entries())
      .map(([tok, score]) => ({ tok, score, dist: this.levenshtein(queryTok, tok) }))
      .sort((a, b) => (b.score - a.score) || (a.dist - b.dist))
      .slice(0, limit);
    
    return ranked;
  },
  
  humanizeQuery(query) {
    // Humanizer: Korrigiert häufige Fehler
    const fixes = [
      [/braowser|browserr|browsr/gi, 'browser'],
      [/betriebsystem|betreibsystem|osos|ostosos|os-dos|bestührung/gi, 'betriebssystem'],
      [/verschl[uü]ssel/gi, 'verschlüsselung'],
      [/netz|netwerk/gi, 'netzwerk'],
      [/perfomance|performence/gi, 'performance'],
      [/einstelung|einstelungen/gi, 'settings'],
      [/erweiterung|erweiterungen/gi, 'erweiterung'],
      [/fehler|fehlern/gi, 'fehler'],
      [/hilfe|hilfen/gi, 'hilfe']
    ];
    
    let normalized = query.trim().normalize('NFKC');
    fixes.forEach(([re, rep]) => {
      normalized = normalized.replace(re, rep);
    });
    
    return normalized;
  },
  
  async search(query) {
    const humanized = this.humanizeQuery(query);
    const qTokens = this.tokenize(humanized);
    const docScores = new Map();
    
    qTokens.forEach(qt => {
      const ids = this.index.get(qt);
      if (ids) ids.forEach(id => docScores.set(id, (docScores.get(id) || 0) + 3));
      
      const cands = this.fuzzyCandidates(qt);
      cands.forEach(c => {
        const ids2 = this.index.get(c.tok);
        if (!ids2) return;
        const bonus = Math.max(1, c.score - c.dist);
        ids2.forEach(id => docScores.set(id, (docScores.get(id) || 0) + bonus));
      });
    });
    
    const rankedDocs = Array.from(docScores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .map(({ id, score }) => ({ doc: this.corpus.find(d => d.id === id), score }));
    
    const confidence = rankedDocs[0]?.score || 0;
    const needsClarify = confidence < 3;
    
    // Wenn keine Ergebnisse oder niedrige Konfidenz: KI fragen
    if (needsClarify || rankedDocs.length === 0) {
      return await this.askAI(query, humanized, rankedDocs);
    }
    
    return {
      results: rankedDocs.slice(0, 12),
      confidence,
      needsClarify: false,
      query: humanized
    };
  },
  
  async askAI(originalQuery, humanizedQuery, partialResults) {
    if (!this.aiHelper) {
      return {
        results: partialResults,
        confidence: 0,
        needsClarify: true,
        aiSuggestion: 'KI-System nicht verfügbar. Bitte präzisiere deine Suche.',
        query: humanizedQuery
      };
    }
    
    const prompt = `Der User sucht im OSTOSOS System nach: "${originalQuery}"

Mögliche Korrektur: "${humanizedQuery}"

Teilweise Ergebnisse: ${partialResults.map(r => r.doc?.title).join(', ') || 'Keine'}

Bitte:
1. Analysiere was der User gemeint haben könnte
2. Schlage 3-5 relevante Suchbegriffe vor
3. Erkläre welche Funktionen/Bereiche relevant sein könnten

Antworte auf Deutsch, kurz und präzise.`;
    
    try {
      const aiResponse = await this.aiHelper.generateResponse(prompt);
      
      return {
        results: partialResults,
        confidence: 0,
        needsClarify: true,
        aiSuggestion: aiResponse,
        query: humanizedQuery,
        originalQuery: originalQuery
      };
    } catch (error) {
      return {
        results: partialResults,
        confidence: 0,
        needsClarify: true,
        aiSuggestion: 'KI konnte nicht erreicht werden. Bitte versuche andere Suchbegriffe.',
        query: humanizedQuery
      };
    }
  }
};

window.SUPERINTELLIGENT_SEARCH = SUPERINTELLIGENT_SEARCH;

window.addEventListener('load', () => {
  SUPERINTELLIGENT_SEARCH.init();
});

