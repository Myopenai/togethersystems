// T,. OSTOSOS - Psychologischer Analyzer
// Analysiert Prompts, Fehler, Grammatik und erkennt den Menschen dahinter

const PSYCHOLOGICAL_ANALYZER = {
  patterns: {
    typos: [],
    grammar: [],
    style: [],
    intent: []
  },
  
  init() {
    this.loadPatterns();
  },
  
  loadPatterns() {
    // Häufige Fehlermuster aus der Produktion
    this.patterns.typos = [
      { pattern: /betriebsystem|betreibsystem/gi, correction: 'betriebssystem', frequency: 0 },
      { pattern: /bestührung|bestührungssystem/gi, correction: 'betriebssystem', frequency: 0 },
      { pattern: /osos|ostosos|os-dos/gi, correction: 'OSTOSOS', frequency: 0 },
      { pattern: /einstelung/gi, correction: 'einstellung', frequency: 0 },
      { pattern: /erweiterung/gi, correction: 'erweiterung', frequency: 0 }
    ];
    
    this.patterns.grammar = [
      { pattern: /alles fertig machenalles/gi, issue: 'Wortzusammenführung', frequency: 0 },
      { pattern: /wiedervrage|wiedervragen/gi, issue: 'Wortzusammenführung', frequency: 0 },
      { pattern: /einjwendee|einwendungen/gi, issue: 'Tippfehler', frequency: 0 },
      { pattern: /komkppleto|komplett/gi, issue: 'Tippfehler', frequency: 0 }
    ];
    
    this.patterns.style = [
      { pattern: /ja alles|alles auf einmal/gi, trait: 'Direktheit', frequency: 0 },
      { pattern: /ohne.*frage|keine.*frage/gi, trait: 'Entschlossenheit', frequency: 0 },
      { pattern: /fertig|komplett|vollständig/gi, trait: 'Vollständigkeit', frequency: 0 },
      { pattern: /soll|muss|sollte/gi, trait: 'Anforderungen', frequency: 0 }
    ];
  },
  
  analyzePrompt(prompt) {
    const analysis = {
      original: prompt,
      cleaned: this.cleanPrompt(prompt),
      typos: this.detectTypos(prompt),
      grammar: this.detectGrammarIssues(prompt),
      style: this.analyzeStyle(prompt),
      intent: this.detectIntent(prompt),
      personality: this.inferPersonality(prompt),
      suggestions: []
    };
    
    // Generiere Vorschläge
    analysis.suggestions = this.generateSuggestions(analysis);
    
    return analysis;
  },
  
  cleanPrompt(prompt) {
    let cleaned = prompt.trim();
    
    // Entferne doppelte Leerzeichen
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Korrigiere häufige Fehler
    this.patterns.typos.forEach(p => {
      cleaned = cleaned.replace(p.pattern, p.correction);
      p.frequency++;
    });
    
    return cleaned;
  },
  
  detectTypos(prompt) {
    const typos = [];
    
    this.patterns.typos.forEach(p => {
      if (p.pattern.test(prompt)) {
        typos.push({
          found: prompt.match(p.pattern)?.[0],
          correction: p.correction,
          type: 'Tippfehler'
        });
      }
    });
    
    return typos;
  },
  
  detectGrammarIssues(prompt) {
    const issues = [];
    
    this.patterns.grammar.forEach(p => {
      if (p.pattern.test(prompt)) {
        issues.push({
          found: prompt.match(p.pattern)?.[0],
          issue: p.issue,
          type: 'Grammatik'
        });
      }
    });
    
    return issues;
  },
  
  analyzeStyle(prompt) {
    const traits = [];
    
    this.patterns.style.forEach(p => {
      if (p.pattern.test(prompt)) {
        traits.push(p.trait);
        p.frequency++;
      }
    });
    
    return {
      traits: [...new Set(traits)],
      wordCount: prompt.split(/\s+/).length,
      sentenceCount: prompt.split(/[.!?]+/).filter(s => s.trim()).length,
      avgWordsPerSentence: prompt.split(/\s+/).length / Math.max(1, prompt.split(/[.!?]+/).filter(s => s.trim()).length)
    };
  },
  
  detectIntent(prompt) {
    const lower = prompt.toLowerCase();
    const intents = [];
    
    if (/erstellen|bauen|machen|implementieren/gi.test(lower)) intents.push('Erstellung');
    if (/fehler|problem|fix|reparieren/gi.test(lower)) intents.push('Fehlerbehebung');
    if (/erklären|beschreiben|zeigen/gi.test(lower)) intents.push('Erklärung');
    if (/testen|prüfen|verifizieren/gi.test(lower)) intents.push('Test');
    if (/erweitern|hinzufügen|integrieren/gi.test(lower)) intents.push('Erweiterung');
    if (/optimieren|verbessern|beschleunigen/gi.test(lower)) intents.push('Optimierung');
    
    return intents;
  },
  
  inferPersonality(analysis) {
    const personality = {
      traits: [],
      workingStyle: '',
      communicationStyle: '',
      priorities: []
    };
    
    // Direktheit & Entschlossenheit
    if (analysis.style.traits.includes('Direktheit') || analysis.style.traits.includes('Entschlossenheit')) {
      personality.traits.push('Direkt');
      personality.workingStyle = 'Zielorientiert, keine Umwege';
      personality.communicationStyle = 'Kurz und präzise';
    }
    
    // Vollständigkeit
    if (analysis.style.traits.includes('Vollständigkeit')) {
      personality.traits.push('Gründlich');
      personality.priorities.push('Vollständige Lösungen');
    }
    
    // Anforderungen
    if (analysis.style.traits.includes('Anforderungen')) {
      personality.traits.push('Anspruchsvoll');
      personality.priorities.push('Hohe Qualität');
    }
    
    // Technische Fokussierung
    if (analysis.intent.includes('Erstellung') || analysis.intent.includes('Erweiterung')) {
      personality.traits.push('Technisch orientiert');
      personality.workingStyle = 'Produktionsorientiert';
    }
    
    return personality;
  },
  
  generateSuggestions(analysis) {
    const suggestions = [];
    
    // Korrektur-Vorschläge
    if (analysis.typos.length > 0) {
      suggestions.push({
        type: 'Korrektur',
        text: `Tippfehler gefunden: ${analysis.typos.map(t => `${t.found} → ${t.correction}`).join(', ')}`
      });
    }
    
    // Stil-Vorschläge
    if (analysis.style.wordCount > 200) {
      suggestions.push({
        type: 'Stil',
        text: 'Langer Prompt. Für bessere Ergebnisse: Aufteilen in mehrere spezifische Anfragen.'
      });
    }
    
    // Intent-Vorschläge
    if (analysis.intent.length > 3) {
      suggestions.push({
        type: 'Intent',
        text: 'Mehrere Intents erkannt. Bitte fokussiere auf ein Hauptziel pro Anfrage.'
      });
    }
    
    return suggestions;
  },
  
  generateUserDescription(analysis) {
    const personality = analysis.personality;
    
    return {
      summary: `Der User zeigt folgende Charakteristika:
- ${personality.traits.join(', ')}
- Arbeitsstil: ${personality.workingStyle}
- Kommunikation: ${personality.communicationStyle}
- Prioritäten: ${personality.priorities.join(', ')}`,
      
      recommendations: `Empfehlungen für bessere Zusammenarbeit:
1. ${personality.traits.includes('Direkt') ? 'Kurze, präzise Antworten bevorzugen' : 'Detaillierte Erklärungen anbieten'}
2. ${personality.priorities.includes('Vollständige Lösungen') ? 'Komplette Lösungen liefern, keine Teil-Lösungen' : 'Schrittweise Vorgehensweise'}
3. ${personality.traits.includes('Technisch orientiert') ? 'Technische Details und Code-Beispiele' : 'Konzeptionelle Erklärungen'}`
    };
  }
};

window.PSYCHOLOGICAL_ANALYZER = PSYCHOLOGICAL_ANALYZER;

window.addEventListener('load', () => {
  PSYCHOLOGICAL_ANALYZER.init();
});

