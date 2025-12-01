// T,. OSTOSOS - Tiefe Psychologische Analyse
// Basierend auf wissenschaftlichen Erkenntnissen aus UX, Ergonomie, Medizin, Social-Media-Forschung

const DEEP_PSYCHOLOGICAL_ANALYZER = {
  scientificBases: {
    ux: {
      source: 'Nielsen Norman Group, UX Research',
      principles: [
        'Visibility of system status',
        'Match between system and real world',
        'User control and freedom',
        'Consistency and standards',
        'Error prevention',
        'Recognition rather than recall',
        'Flexibility and efficiency of use',
        'Aesthetic and minimalist design',
        'Help users recognize, diagnose, and recover from errors',
        'Help and documentation'
      ]
    },
    ergonomics: {
      source: 'ISO 9241, Medical Ergonomics',
      principles: [
        'Physical comfort (RSI prevention)',
        'Visual comfort (eye strain reduction)',
        'Cognitive load reduction',
        'Posture support',
        'Break reminders'
      ]
    },
    cognitive: {
      source: "Miller's Law, Cognitive Psychology",
      principles: [
        '7±2 information chunks',
        'Working memory limits',
        'Attention span management',
        'Cognitive load theory'
      ]
    },
    social: {
      source: 'Social Media Research, Engagement Patterns',
      principles: [
        'Attention span: 8 seconds average',
        'Engagement patterns',
        'Social connection needs',
        'Community belonging'
      ]
    },
    medical: {
      source: 'Medical Institutions, Hospital Research',
      principles: [
        'Stress reduction',
        'Anxiety management',
        'Comfort design',
        'Accessibility for disabilities'
      ]
    }
  },
  
  psychologicalNeeds: {
    control: {
      theory: 'Self-Determination Theory (Deci & Ryan)',
      need: 'Autonomy and control',
      indicators: ['wants to customize', 'wants undo', 'wants options'],
      implementation: 'Give user control over all actions'
    },
    competence: {
      theory: 'Flow Theory (Csikszentmihalyi)',
      need: 'Feeling competent and mastering',
      indicators: ['wants progress', 'wants feedback', 'wants to learn'],
      implementation: 'Show progress, provide feedback, enable learning'
    },
    connection: {
      theory: 'Social Connection Theory',
      need: 'Feeling connected and belonging',
      indicators: ['wants community', 'wants help', 'wants sharing'],
      implementation: 'Enable community, provide help, allow sharing'
    },
    security: {
      theory: 'Trust in Technology (Mayer et al.)',
      need: 'Feeling safe and trusting',
      indicators: ['worries about data loss', 'worries about security', 'wants backup'],
      implementation: 'Transparent security, backup system, error recovery'
    },
    comfort: {
      theory: 'Ergonomics & Comfort Design',
      need: 'Physical and mental comfort',
      indicators: ['wants customization', 'wants less strain', 'wants pleasant environment'],
      implementation: 'Adjustable themes, ergonomic layout, comfortable settings'
    }
  },
  
  analyzeDeep(prompt, userHistory = []) {
    const analysis = {
      surface: this.analyzeSurface(prompt),
      psychological: this.analyzePsychological(prompt, userHistory),
      needs: this.identifyNeeds(prompt, userHistory),
      comfort: this.analyzeComfort(prompt),
      recommendations: []
    };
    
    // Generiere wissenschaftlich fundierte Empfehlungen
    analysis.recommendations = this.generateScientificRecommendations(analysis);
    
    return analysis;
  },
  
  analyzeSurface(prompt) {
    return {
      wordCount: prompt.split(/\s+/).length,
      sentenceCount: prompt.split(/[.!?]+/).filter(s => s.trim()).length,
      avgWordsPerSentence: prompt.split(/\s+/).length / Math.max(1, prompt.split(/[.!?]+/).filter(s => s.trim()).length),
      typos: this.detectTypos(prompt),
      grammar: this.detectGrammar(prompt),
      urgency: this.detectUrgency(prompt),
      complexity: this.detectComplexity(prompt)
    };
  },
  
  analyzePsychological(prompt, userHistory) {
    const lower = prompt.toLowerCase();
    const psychological = {
      needs: [],
      traits: [],
      stressLevel: 'normal',
      comfortLevel: 'neutral'
    };
    
    // Kontrolle & Autonomie
    if (/kontrolle|selbst|eigen|anpassen|customize|option/gi.test(lower)) {
      psychological.needs.push('control');
      psychological.traits.push('autonomous');
    }
    
    // Kompetenz & Meisterschaft
    if (/lernen|fortschritt|besser|meistern|können|fähig/gi.test(lower)) {
      psychological.needs.push('competence');
      psychological.traits.push('growth-oriented');
    }
    
    // Verbindung & Zugehörigkeit
    if (/gemeinschaft|community|team|zusammen|teilen|sharing/gi.test(lower)) {
      psychological.needs.push('connection');
      psychological.traits.push('social');
    }
    
    // Sicherheit & Vertrauen
    if (/sicher|backup|verlust|angst|sorge|trust/gi.test(lower)) {
      psychological.needs.push('security');
      psychological.traits.push('cautious');
      psychological.stressLevel = 'elevated';
    }
    
    // Komfort & Behaglichkeit
    if (/komfort|behaglich|angenehm|wohlfühlen|gemütlich/gi.test(lower)) {
      psychological.needs.push('comfort');
      psychological.traits.push('comfort-seeking');
      psychological.comfortLevel = 'seeking';
    }
    
    // Stress-Indikatoren
    if (/schnell|eilig|dringend|sofort|jetzt/gi.test(lower)) {
      psychological.stressLevel = 'high';
    }
    
    // Frustration-Indikatoren
    if (/nicht|fehlt|warum|problem|fehler|kaputt/gi.test(lower)) {
      psychological.stressLevel = 'elevated';
      psychological.comfortLevel = 'low';
    }
    
    return psychological;
  },
  
  identifyNeeds(prompt, userHistory) {
    const needs = {
      immediate: [],
      longTerm: [],
      comfort: [],
      functional: []
    };
    
    const lower = prompt.toLowerCase();
    
    // Sofortige Bedürfnisse
    if (/jetzt|sofort|schnell|eilig/gi.test(lower)) {
      needs.immediate.push('quick_solution');
    }
    
    if (/hilfe|erklärung|wie|was/gi.test(lower)) {
      needs.immediate.push('guidance');
    }
    
    // Langfristige Bedürfnisse
    if (/immer|dauerhaft|permanent|standard/gi.test(lower)) {
      needs.longTerm.push('persistent_setting');
    }
    
    if (/erweitern|hinzufügen|mehr|zukunft/gi.test(lower)) {
      needs.longTerm.push('extensibility');
    }
    
    // Komfort-Bedürfnisse
    if (/angenehm|behaglich|komfort|gemütlich/gi.test(lower)) {
      needs.comfort.push('physical_comfort');
      needs.comfort.push('visual_comfort');
      needs.comfort.push('mental_comfort');
    }
    
    // Funktionale Bedürfnisse
    if (/funktion|feature|möglichkeit|kann/gi.test(lower)) {
      needs.functional.push('capability');
    }
    
    return needs;
  },
  
  analyzeComfort(prompt) {
    const comfort = {
      physical: 'neutral',
      visual: 'neutral',
      mental: 'neutral',
      recommendations: []
    };
    
    const lower = prompt.toLowerCase();
    
    // Physischer Komfort
    if (/augen|sehen|lesen|schrift|größe/gi.test(lower)) {
      comfort.visual = 'needs_attention';
      comfort.recommendations.push('Schriftgröße anpassen');
      comfort.recommendations.push('Kontrast erhöhen');
    }
    
    if (/maus|tastatur|klick|hand|arm/gi.test(lower)) {
      comfort.physical = 'needs_attention';
      comfort.recommendations.push('Tastatur-Navigation');
      comfort.recommendations.push('Shortcuts verwenden');
    }
    
    // Mentaler Komfort
    if (/kompliziert|schwierig|verwirrend|unübersichtlich/gi.test(lower)) {
      comfort.mental = 'low';
      comfort.recommendations.push('Vereinfachtes Interface');
      comfort.recommendations.push('Onboarding-Tutorial');
    }
    
    if (/einfach|klar|übersichtlich|verständlich/gi.test(lower)) {
      comfort.mental = 'seeking';
      comfort.recommendations.push('Minimal-Modus');
      comfort.recommendations.push('Klare Struktur');
    }
    
    return comfort;
  },
  
  generateScientificRecommendations(analysis) {
    const recommendations = [];
    
    // Basierend auf UX-Prinzipien
    if (analysis.psychological.stressLevel === 'high') {
      recommendations.push({
        category: 'UX',
        principle: 'Error prevention',
        recommendation: 'Vorschau vor kritischen Aktionen anzeigen',
        source: 'Nielsen Norman Group'
      });
    }
    
    // Basierend auf Ergonomie
    if (analysis.comfort.visual === 'needs_attention') {
      recommendations.push({
        category: 'Ergonomics',
        principle: 'Visual comfort',
        recommendation: 'Schriftgröße und Kontrast anpassbar machen',
        source: 'ISO 9241, Medical Ergonomics'
      });
    }
    
    // Basierend auf kognitiver Psychologie
    if (analysis.surface.complexity === 'high') {
      recommendations.push({
        category: 'Cognitive',
        principle: "Miller's Law (7±2 chunks)",
        recommendation: 'Informationen in kleine Chunks aufteilen',
        source: "Miller's Law, Cognitive Psychology"
      });
    }
    
    // Basierend auf psychologischen Bedürfnissen
    if (analysis.psychological.needs.includes('control')) {
      recommendations.push({
        category: 'Psychology',
        principle: 'Self-Determination Theory',
        recommendation: 'User mehr Kontrolle geben (Anpassungen, Undo)',
        source: 'Deci & Ryan'
      });
    }
    
    if (analysis.psychological.needs.includes('comfort')) {
      recommendations.push({
        category: 'Psychology',
        principle: 'Comfort Design',
        recommendation: 'Komfort-Modus anbieten (sanfte Animationen, warme Farben)',
        source: 'Ergonomics & Comfort Design'
      });
    }
    
    return recommendations;
  },
  
  detectTypos(text) {
    const commonTypos = [
      { pattern: /betriebsystem/gi, correction: 'betriebssystem' },
      { pattern: /bestührung/gi, correction: 'betriebssystem' },
      { pattern: /einstelung/gi, correction: 'einstellung' }
    ];
    
    return commonTypos.filter(t => t.pattern.test(text));
  },
  
  detectGrammar(text) {
    const issues = [];
    
    if (/\s{2,}/.test(text)) {
      issues.push('Doppelte Leerzeichen');
    }
    
    if (/[.!?]{2,}/.test(text)) {
      issues.push('Mehrfache Satzzeichen');
    }
    
    return issues;
  },
  
  detectUrgency(text) {
    const urgent = /sofort|jetzt|eilig|dringend|schnell/gi.test(text);
    const moderate = /bald|später|wenn|kann/gi.test(text);
    
    if (urgent) return 'high';
    if (moderate) return 'moderate';
    return 'low';
  },
  
  detectComplexity(text) {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWords = wordCount / Math.max(1, sentenceCount);
    
    if (wordCount > 200 || avgWords > 25) return 'high';
    if (wordCount > 100 || avgWords > 15) return 'moderate';
    return 'low';
  },
  
  generateUserProfile(analyses) {
    // Aggregiere mehrere Analysen zu einem User-Profil
    const profile = {
      dominantNeeds: [],
      traits: [],
      comfortPreferences: {},
      workingStyle: '',
      recommendations: []
    };
    
    // Zähle Häufigkeiten
    const needCounts = {};
    const traitCounts = {};
    
    analyses.forEach(a => {
      a.psychological.needs.forEach(n => {
        needCounts[n] = (needCounts[n] || 0) + 1;
      });
      a.psychological.traits.forEach(t => {
        traitCounts[t] = (traitCounts[t] || 0) + 1;
      });
    });
    
    // Dominante Bedürfnisse
    profile.dominantNeeds = Object.entries(needCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([need]) => need);
    
    // Dominante Traits
    profile.traits = Object.entries(traitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait]) => trait);
    
    // Arbeitsstil
    if (profile.dominantNeeds.includes('control')) {
      profile.workingStyle = 'Autonom, kontrollierend';
    } else if (profile.dominantNeeds.includes('competence')) {
      profile.workingStyle = 'Lernend, wachsend';
    } else if (profile.dominantNeeds.includes('comfort')) {
      profile.workingStyle = 'Komfort-orientiert, behaglich';
    } else {
      profile.workingStyle = 'Ausgewogen';
    }
    
    // Empfehlungen basierend auf Profil
    if (profile.dominantNeeds.includes('comfort')) {
      profile.recommendations.push('Komfort-Modus aktivieren');
      profile.recommendations.push('Sanfte Animationen');
      profile.recommendations.push('Warme Farben');
    }
    
    if (profile.dominantNeeds.includes('control')) {
      profile.recommendations.push('Mehr Anpassungsmöglichkeiten');
      profile.recommendations.push('Undo/Redo überall');
    }
    
    return profile;
  }
};

window.DEEP_PSYCHOLOGICAL_ANALYZER = DEEP_PSYCHOLOGICAL_ANALYZER;

