// LoveScore Engine - Liebeserkennung durch Satzkonstellationen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Formel: LoveScore(B) = w1*D(B) + w2*A(B) + w3*K(B) + w4*S(B) + w5*R(B)
// D: Direkte Liebesausdrücke
// A: Affektive Nähe
// K: Konditionale Nähe ("Wenn du willst...")
// S: Satzkonstellationen (Frage → Verneinung → respektvolles Angebot)
// R: Human-ID-Faktor (Beziehungstyp, Historie)

class LoveScoreEngine {
  constructor() {
    // Gewichtungen (empirisch gelernt, anpassbar)
    this.weights = {
      D: 0.25,  // Direkte Liebesausdrücke
      A: 0.20,  // Affektive Nähe
      K: 0.30,  // Konditionale Nähe (höchste Gewichtung)
      S: 0.20,  // Satzkonstellationen
      R: 0.05   // Human-ID-Faktor
    };
    
    // Schwellwert für "Liebe ausgedrückt"
    this.threshold = 60;
    
    // Pattern für direkte Liebesausdrücke
    this.directPatterns = [
      /ich liebe dich/gi,
      /hab dich lieb/gi,
      /ich liebe dich sehr/gi,
      /du bist mein/gi,
      /ich mag dich sehr/gi,
      /ich habe dich gern/gi
    ];
    
    // Pattern für affektive Nähe
    this.affectivePatterns = [
      /ich vermisse dich/gi,
      /du bedeutest mir viel/gi,
      /du bist wichtig für mich/gi,
      /ich denke an dich/gi,
      /ich freue mich auf dich/gi,
      /du fehlst mir/gi,
      /ich bin froh dass du da bist/gi
    ];
    
    // Pattern für konditionale Nähe
    this.conditionalPatterns = [
      /wenn du willst/gi,
      /wenn du möchtest/gi,
      /falls du willst/gi,
      /wenn es dir recht ist/gi,
      /wenn du magst/gi,
      /wenn du es wünschst/gi,
      /sofern du willst/gi
    ];
    
    // Satzkonstellationen: Frage → Verneinung → respektvolles Angebot
    this.sequencePatterns = [
      {
        question: /kann ich dir helfen\?/gi,
        negation: /nein/gi,
        offer: /aber wenn du willst/gi
      },
      {
        question: /brauchst du etwas\?/gi,
        negation: /nein danke/gi,
        offer: /aber wenn du möchtest/gi
      },
      {
        question: /soll ich kommen\?/gi,
        negation: /nein/gi,
        offer: /wenn du willst/gi
      }
    ];
  }
  
  /**
   * Berechnet D(B): Direkte Liebesausdrücke
   */
  calculateDirect(text) {
    let score = 0;
    this.directPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 20; // Jeder Match = 20 Punkte
      }
    });
    return Math.min(score, 100); // Max 100
  }
  
  /**
   * Berechnet A(B): Affektive Nähe
   */
  calculateAffective(text) {
    let score = 0;
    this.affectivePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 15; // Jeder Match = 15 Punkte
      }
    });
    return Math.min(score, 100);
  }
  
  /**
   * Berechnet K(B): Konditionale Nähe
   */
  calculateConditional(text) {
    let score = 0;
    this.conditionalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 25; // Höhere Gewichtung für Konditionalität
      }
    });
    return Math.min(score, 100);
  }
  
  /**
   * Berechnet S(B): Satzkonstellationen
   * Erkennt Sequenzen: Frage → Verneinung → respektvolles Angebot
   */
  calculateSequence(text) {
    let score = 0;
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Prüfe Sequenzen in aufeinanderfolgenden Sätzen
    for (let i = 0; i < sentences.length - 2; i++) {
      const s1 = sentences[i];
      const s2 = sentences[i + 1];
      const s3 = sentences[i + 2];
      
      this.sequencePatterns.forEach(seq => {
        if (seq.question.test(s1) && seq.negation.test(s2) && seq.offer.test(s3)) {
          score += 30; // Sequenz erkannt = 30 Punkte
        }
      });
    }
    
    // Prüfe auch in einem Satz (mit Kommas)
    const combined = sentences.join(' ');
    this.sequencePatterns.forEach(seq => {
      if (seq.question.test(combined) && seq.negation.test(combined) && seq.offer.test(combined)) {
        score += 30;
      }
    });
    
    return Math.min(score, 100);
  }
  
  /**
   * Berechnet R(B): Human-ID-Faktor
   * Berücksichtigt Beziehungstyp und Historie
   */
  calculateHumanID(relationshipType = 'unknown', historyScore = 0) {
    const relationshipMultipliers = {
      'partner': 1.2,
      'family': 1.1,
      'friend': 1.0,
      'colleague': 0.8,
      'unknown': 0.9
    };
    
    const multiplier = relationshipMultipliers[relationshipType] || 0.9;
    return Math.min(historyScore * multiplier, 100);
  }
  
  /**
   * Hauptfunktion: Berechnet LoveScore für einen Text
   */
  calculateLoveScore(text, options = {}) {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        components: { D: 0, A: 0, K: 0, S: 0, R: 0 },
        interpretation: 'Kein Text vorhanden',
        containsLove: false
      };
    }
    
    // Normalisiere Text
    const normalizedText = text.toLowerCase().trim();
    
    // Berechne Komponenten
    const D = this.calculateDirect(normalizedText);
    const A = this.calculateAffective(normalizedText);
    const K = this.calculateConditional(normalizedText);
    const S = this.calculateSequence(normalizedText);
    const R = this.calculateHumanID(options.relationshipType, options.historyScore || 0);
    
    // Berechne gewichteten Score
    const score = Math.round(
      this.weights.D * D +
      this.weights.A * A +
      this.weights.K * K +
      this.weights.S * S +
      this.weights.R * R
    );
    
    // Interpretation
    let interpretation = '';
    if (score >= this.threshold) {
      interpretation = 'Dieser Text drückt Liebe aus.';
    } else if (score >= 40) {
      interpretation = 'Dieser Text enthält respektvolle Zuwendung.';
    } else if (score >= 20) {
      interpretation = 'Dieser Text zeigt Nähe.';
    } else {
      interpretation = 'Dieser Text zeigt keine deutliche Zuwendung.';
    }
    
    return {
      score: Math.min(score, 100),
      components: { D, A, K, S, R },
      interpretation,
      containsLove: score >= this.threshold,
      threshold: this.threshold
    };
  }
  
  /**
   * Analysiert mehrere Texte (z.B. Chat-Verlauf)
   */
  analyzeMultiple(texts, options = {}) {
    const results = texts.map(text => this.calculateLoveScore(text, options));
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    return {
      averageScore: Math.round(avgScore),
      results,
      overallInterpretation: avgScore >= this.threshold 
        ? 'Die Kommunikation drückt Liebe aus.'
        : 'Die Kommunikation zeigt Zuwendung.'
    };
  }
}

// Export für Node.js und Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoveScoreEngine;
}
if (typeof window !== 'undefined') {
  window.LoveScoreEngine = LoveScoreEngine;
}


