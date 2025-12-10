// Smoke-Free Journey - Game Engine
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Interaktives Aufklärungsspiel für Raucher
// Integration: Human Identity DB, alle Fakultäten, multidisziplinär

class SmokeFreeJourneyGame {
  constructor(userProfile, humanIdentityDB) {
    this.userProfile = userProfile;
    this.humanIdentityDB = humanIdentityDB;
    this.currentStage = 'awareness';
    this.progress = {
      awareness: 0,
      knowledge: 0,
      planning: 0,
      action: 0,
      maintenance: 0
    };
    this.insights = [];
    this.recommendations = [];
    this.stats = {
      cigarettes_saved: 0,
      money_saved: 0,
      health_improvements: [],
      days_smoke_free: 0
    };
  }

  // Lade multidisziplinäre Daten
  async loadMultidisciplinaryData() {
    const data = {
      medical: await this.loadMedicalData(),
      psychological: await this.loadPsychologicalData(),
      sociological: await this.loadSociologicalData(),
      pharmacological: await this.loadPharmacologicalData(),
      public_health: await this.loadPublicHealthData(),
      human_identity: await this.loadHumanIdentityData()
    };
    return data;
  }

  // Medizinische Fakultät
  async loadMedicalData() {
    return {
      health_effects: {
        immediate: [
          "20 Minuten: Herzfrequenz normalisiert",
          "12 Stunden: Kohlenmonoxid-Level sinkt",
          "24 Stunden: Herzinfarkt-Risiko beginnt zu sinken",
          "2 Wochen: Lungenfunktion verbessert sich",
          "1 Monat: Husten und Kurzatmigkeit nehmen ab",
          "1 Jahr: Herzinfarkt-Risiko halbiert",
          "10 Jahre: Lungenkrebs-Risiko halbiert"
        ],
        long_term: [
          "Reduziertes Risiko für: Lungenkrebs, Herzkrankheiten, Schlaganfall, COPD",
          "Verbesserte Durchblutung",
          "Stärkeres Immunsystem",
          "Bessere Wundheilung"
        ]
      },
      withdrawal_symptoms: {
        physical: ["Kopfschmerzen", "Müdigkeit", "Schwindel", "Husten", "Verstopfung"],
        timeline: "Höhepunkt: 2-3 Tage, Dauer: 2-4 Wochen"
      }
    };
  }

  // Psychologische Fakultät
  async loadPsychologicalData() {
    return {
      addiction_mechanisms: {
        behavioral: "Rituale und Gewohnheiten sind genauso süchtig machend wie Nikotin",
        cognitive: "Gedankenmuster ('Ich brauche eine Zigarette') können umprogrammiert werden",
        emotional: "Rauchen wird oft zur Emotionsregulation genutzt"
      },
      coping_strategies: [
        "Atemübungen (4-7-8 Technik)",
        "Achtsamkeitsmeditation",
        "Kognitive Umstrukturierung",
        "Ritual-Ersatz (z.B. Kaugummi, Wasser trinken)",
        "Bewegung und Sport"
      ],
      motivation_factors: {
        intrinsic: ["Gesundheit", "Selbstbestimmung", "Lebensqualität"],
        extrinsic: ["Geld sparen", "Soziale Akzeptanz", "Familie"]
      }
    };
  }

  // Soziologische Fakultät
  async loadSociologicalData() {
    return {
      social_factors: {
        peer_pressure: "Soziale Umgebung beeinflusst Rauchverhalten stark",
        cultural_norms: "Kulturelle Unterschiede in Rauchgewohnheiten",
        economic_impact: "Rauchen kostet durchschnittlich 2000-5000€ pro Jahr"
      },
      support_systems: [
        "Selbsthilfegruppen",
        "Online-Communities",
        "Freunde und Familie",
        "Professionelle Beratung"
      ]
    };
  }

  // Pharmakologische Fakultät
  async loadPharmacologicalData() {
    return {
      nicotine_replacement: {
        patches: "Langzeit-Grundversorgung",
        gum: "Schnelle Bedarfslösung",
        spray: "Sofortige Wirkung",
        lozenges: "Diskrete Anwendung"
      },
      medications: {
        varenicline: "Reduziert Verlangen und Genuss",
        bupropion: "Antidepressivum, reduziert Entzugssymptome"
      },
      natural_alternatives: {
        rhodiola: "Stressreduktion",
        l_theanine: "Entspannung ohne Rausch",
        ashwagandha: "Langzeit-Stressmanagement",
        ginseng: "Energie und Fokus"
      }
    };
  }

  // Public Health Fakultät
  async loadPublicHealthData() {
    return {
      statistics: {
        success_rate: "5-10% schaffen es beim ersten Versuch, 50-70% nach mehreren Versuchen",
        average_attempts: "6-8 Versuche bis zum Erfolg",
        relapse_rate: "40-60% in den ersten 3 Monaten"
      },
      prevention: [
        "Frühe Intervention",
        "Bildung und Aufklärung",
        "Zugang zu Hilfsmitteln",
        "Soziale Unterstützung"
      ]
    };
  }

  // Human Identity DB Integration
  async loadHumanIdentityData() {
    if (!this.humanIdentityDB) return null;
    
    return {
      personal_traits: this.humanIdentityDB.getTraits(this.userProfile.id),
      behavioral_patterns: this.humanIdentityDB.getPatterns(this.userProfile.id),
      cultural_background: this.humanIdentityDB.getCulturalContext(this.userProfile.id),
      social_network: this.humanIdentityDB.getSocialNetwork(this.userProfile.id),
      health_history: this.humanIdentityDB.getHealthHistory(this.userProfile.id),
      lifestyle_factors: this.humanIdentityDB.getLifestyle(this.userProfile.id)
    };
  }

  // Generiere personalisierte Fragen
  generatePersonalizedQuestions(stage) {
    const questions = {
      awareness: [
        {
          question: "Wie viele Zigaretten rauchst du pro Tag?",
          type: "number",
          impact: "N",
          category: "consumption"
        },
        {
          question: "Wann rauchst du die erste Zigarette nach dem Aufstehen?",
          type: "time",
          impact: "F",
          category: "dependence"
        },
        {
          question: "In welchen Situationen rauchst du am meisten?",
          type: "multiple_choice",
          options: ["Stress", "Langeweile", "Geselligkeit", "Nach dem Essen", "Beim Kaffee"],
          impact: "S",
          category: "triggers"
        }
      ],
      knowledge: [
        {
          question: "Was weißt du über die gesundheitlichen Auswirkungen des Rauchens?",
          type: "text",
          category: "education"
        },
        {
          question: "Welche Entzugserscheinungen erwartest du?",
          type: "multiple_choice",
          options: ["Reizbarkeit", "Konzentrationsprobleme", "Gewichtszunahme", "Schlafstörungen"],
          category: "expectations"
        }
      ],
      planning: [
        {
          question: "Welches Datum wählst du für deinen Rauchstopp?",
          type: "date",
          category: "commitment"
        },
        {
          question: "Welche Strategien willst du anwenden?",
          type: "multiple_choice",
          options: ["Nikotinersatz", "Medikamente", "Natürliche Mittel", "Verhaltenstherapie", "Kombination"],
          category: "strategy"
        }
      ]
    };
    
    return questions[stage] || [];
  }

  // Generiere personalisierte Empfehlungen
  generateRecommendations() {
    const recommendations = [];
    const data = this.loadMultidisciplinaryData();
    
    // Basierend auf Profil
    if (this.userProfile.stress_level > 7) {
      recommendations.push({
        source: "psychology",
        recommendation: "Stressbewältigungstechniken: Atemübungen, Meditation, Bewegung",
        priority: "high"
      });
    }
    
    if (this.userProfile.cigarettes_per_day > 20) {
      recommendations.push({
        source: "pharmacology",
        recommendation: "Kombinierte Nikotinersatztherapie: Pflaster + Bedarfsmittel",
        priority: "high"
      });
    }
    
    if (this.userProfile.cannabis_use) {
      recommendations.push({
        source: "medical",
        recommendation: "Cannabis-Reduktion parallel planen, um Suchtverlagerung zu vermeiden",
        priority: "medium"
      });
    }
    
    // Basierend auf Human Identity DB
    if (this.humanIdentityDB) {
      const traits = this.humanIdentityDB.getTraits(this.userProfile.id);
      if (traits?.cultural_background) {
        recommendations.push({
          source: "sociology",
          recommendation: `Kulturell angepasste Strategien für ${traits.cultural_background}`,
          priority: "medium"
        });
      }
    }
    
    return recommendations;
  }

  // Berechne Fortschritt
  calculateProgress() {
    const totalStages = Object.keys(this.progress).length;
    const completedStages = Object.values(this.progress).filter(p => p >= 100).length;
    return (completedStages / totalStages) * 100;
  }

  // Berechne Einsparungen
  calculateSavings(daysSmokeFree) {
    const cigarettesPerDay = this.userProfile.cigarettes_per_day || 20;
    const pricePerPack = this.userProfile.price_per_pack || 7.50;
    const cigarettesPerPack = 20;
    
    const cigarettesSaved = daysSmokeFree * cigarettesPerDay;
    const packsSaved = cigarettesSaved / cigarettesPerPack;
    const moneySaved = packsSaved * pricePerPack;
    
    return {
      cigarettes_saved: Math.round(cigarettesSaved),
      money_saved: Math.round(moneySaved * 100) / 100,
      days_smoke_free: daysSmokeFree
    };
  }

  // Generiere Gesundheitsverbesserungen
  generateHealthImprovements(daysSmokeFree) {
    const improvements = [];
    
    if (daysSmokeFree >= 0.04) { // ~1 Stunde
      improvements.push("Herzfrequenz beginnt sich zu normalisieren");
    }
    if (daysSmokeFree >= 0.5) { // 12 Stunden
      improvements.push("Kohlenmonoxid-Level im Blut sinkt");
    }
    if (daysSmokeFree >= 1) {
      improvements.push("Herzinfarkt-Risiko beginnt zu sinken");
    }
    if (daysSmokeFree >= 2) {
      improvements.push("Geruchs- und Geschmackssinn verbessern sich");
    }
    if (daysSmokeFree >= 14) {
      improvements.push("Lungenfunktion verbessert sich deutlich");
    }
    if (daysSmokeFree >= 30) {
      improvements.push("Husten und Kurzatmigkeit nehmen ab");
    }
    if (daysSmokeFree >= 90) {
      improvements.push("Kreislauf verbessert sich, Lungenreinigung schreitet voran");
    }
    if (daysSmokeFree >= 365) {
      improvements.push("Herzinfarkt-Risiko halbiert");
    }
    if (daysSmokeFree >= 3650) {
      improvements.push("Lungenkrebs-Risiko halbiert");
    }
    
    return improvements;
  }

  // Hauptspiel-Logik
  async play() {
    // Lade alle Daten
    const multidisciplinaryData = await this.loadMultidisciplinaryData();
    
    // Generiere personalisierte Fragen für aktuelle Stage
    const questions = this.generatePersonalizedQuestions(this.currentStage);
    
    // Generiere Empfehlungen
    const recommendations = this.generateRecommendations();
    
    return {
      current_stage: this.currentStage,
      questions: questions,
      recommendations: recommendations,
      data: multidisciplinaryData,
      progress: this.calculateProgress(),
      stats: this.stats
    };
  }

  // Beantworte Frage
  answerQuestion(questionId, answer) {
    // Speichere Antwort
    this.insights.push({
      question_id: questionId,
      answer: answer,
      timestamp: new Date()
    });
    
    // Update Profil basierend auf Antwort
    this.updateProfileFromAnswer(questionId, answer);
    
    // Update Progress
    this.progress[this.currentStage] += 10;
    
    // Prüfe ob Stage abgeschlossen
    if (this.progress[this.currentStage] >= 100) {
      this.advanceToNextStage();
    }
  }

  updateProfileFromAnswer(questionId, answer) {
    // Update userProfile basierend auf Antworten
    // z.B. wenn Frage nach Zigaretten pro Tag beantwortet wird
  }

  advanceToNextStage() {
    const stages = ['awareness', 'knowledge', 'planning', 'action', 'maintenance'];
    const currentIndex = stages.indexOf(this.currentStage);
    if (currentIndex < stages.length - 1) {
      this.currentStage = stages[currentIndex + 1];
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmokeFreeJourneyGame;
}

if (typeof window !== 'undefined') {
  window.SmokeFreeJourneyGame = SmokeFreeJourneyGame;
}


