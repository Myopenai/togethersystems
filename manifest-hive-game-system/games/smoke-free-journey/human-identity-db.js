// Human Identity Database - Integration
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Zentrale Datenbank für menschliche Eigenschaften, Traits, Muster
// Integration aus allen Fakultäten und Kulturen

class HumanIdentityDB {
  constructor() {
    this.users = new Map();
    this.traits = new Map();
    this.patterns = new Map();
    this.culturalContexts = new Map();
    this.socialNetworks = new Map();
    this.healthHistories = new Map();
    this.lifestyles = new Map();
  }

  // Registriere User
  registerUser(userId, initialData) {
    this.users.set(userId, {
      id: userId,
      created_at: new Date(),
      ...initialData
    });
  }

  // Get Traits (Eigenschaften)
  getTraits(userId) {
    return this.traits.get(userId) || {
      personality: null,
      cognitive_style: null,
      emotional_patterns: null,
      behavioral_tendencies: null,
      cultural_background: null,
      genetic_factors: null,
      environmental_factors: null
    };
  }

  // Set Traits
  setTraits(userId, traits) {
    const existing = this.getTraits(userId);
    this.traits.set(userId, { ...existing, ...traits });
  }

  // Get Behavioral Patterns
  getPatterns(userId) {
    return this.patterns.get(userId) || {
      smoking_patterns: [],
      stress_response: null,
      coping_mechanisms: [],
      trigger_situations: [],
      reward_seeking: null,
      risk_taking: null
    };
  }

  // Set Patterns
  setPatterns(userId, patterns) {
    const existing = this.getPatterns(userId);
    this.patterns.set(userId, { ...existing, ...patterns });
  }

  // Get Cultural Context
  getCulturalContext(userId) {
    return this.culturalContexts.get(userId) || {
      culture: null,
      language: null,
      social_norms: [],
      family_structure: null,
      religious_background: null,
      economic_status: null,
      education_level: null
    };
  }

  // Set Cultural Context
  setCulturalContext(userId, context) {
    const existing = this.getCulturalContext(userId);
    this.culturalContexts.set(userId, { ...existing, ...context });
  }

  // Get Social Network
  getSocialNetwork(userId) {
    return this.socialNetworks.get(userId) || {
      family: [],
      friends: [],
      colleagues: [],
      support_groups: [],
      smoking_peers: [],
      non_smoking_peers: []
    };
  }

  // Set Social Network
  setSocialNetwork(userId, network) {
    const existing = this.getSocialNetwork(userId);
    this.socialNetworks.set(userId, { ...existing, ...network });
  }

  // Get Health History
  getHealthHistory(userId) {
    return this.healthHistories.get(userId) || {
      medical_conditions: [],
      medications: [],
      allergies: [],
      family_history: [],
      previous_quit_attempts: [],
      withdrawal_experiences: []
    };
  }

  // Set Health History
  setHealthHistory(userId, history) {
    const existing = this.getHealthHistory(userId);
    this.healthHistories.set(userId, { ...existing, ...history });
  }

  // Get Lifestyle
  getLifestyle(userId) {
    return this.lifestyles.get(userId) || {
      occupation: null,
      work_stress_level: null,
      sleep_patterns: null,
      exercise_habits: null,
      diet: null,
      alcohol_consumption: null,
      other_substances: []
    };
  }

  // Set Lifestyle
  setLifestyle(userId, lifestyle) {
    const existing = this.getLifestyle(userId);
    this.lifestyles.set(userId, { ...existing, ...lifestyle });
  }

  // Komplette Profil-Analyse
  analyzeProfile(userId) {
    const traits = this.getTraits(userId);
    const patterns = this.getPatterns(userId);
    const cultural = this.getCulturalContext(userId);
    const social = this.getSocialNetwork(userId);
    const health = this.getHealthHistory(userId);
    const lifestyle = this.getLifestyle(userId);

    return {
      user_id: userId,
      traits,
      patterns,
      cultural_context: cultural,
      social_network: social,
      health_history: health,
      lifestyle,
      analysis_timestamp: new Date(),
      risk_factors: this.calculateRiskFactors(traits, patterns, health, lifestyle),
      protective_factors: this.calculateProtectiveFactors(traits, social, lifestyle),
      personalized_recommendations: this.generatePersonalizedRecommendations(
        traits, patterns, cultural, social, health, lifestyle
      )
    };
  }

  // Berechne Risikofaktoren
  calculateRiskFactors(traits, patterns, health, lifestyle) {
    const risks = [];
    
    if (patterns.smoking_patterns?.length > 20) risks.push("hoher Konsum");
    if (lifestyle.work_stress_level > 7) risks.push("hoher Stress");
    if (social.smoking_peers?.length > social.non_smoking_peers?.length) risks.push("soziales Umfeld");
    if (health.previous_quit_attempts?.length > 5) risks.push("mehrfache Rückfälle");
    if (lifestyle.other_substances?.includes('cannabis')) risks.push("Substanzkombination");
    
    return risks;
  }

  // Berechne Schutzfaktoren
  calculateProtectiveFactors(traits, social, lifestyle) {
    const protective = [];
    
    if (social.support_groups?.length > 0) protective.push("soziale Unterstützung");
    if (social.family?.length > 0 && social.family.some(f => !f.smokes)) protective.push("familiäre Unterstützung");
    if (lifestyle.exercise_habits === 'regular') protective.push("regelmäßige Bewegung");
    if (traits.personality?.includes('determined')) protective.push("Entschlossenheit");
    
    return protective;
  }

  // Generiere personalisierte Empfehlungen
  generatePersonalizedRecommendations(traits, patterns, cultural, social, health, lifestyle) {
    const recommendations = [];
    
    // Kulturell angepasst
    if (cultural.culture) {
      recommendations.push({
        type: "cultural",
        text: `Berücksichtige kulturelle Besonderheiten deiner Herkunft (${cultural.culture})`,
        priority: "medium"
      });
    }
    
    // Sozial angepasst
    if (social.smoking_peers?.length > 0) {
      recommendations.push({
        type: "social",
        text: "Erwäge, rauchende Freunde/Kollegen über dein Vorhaben zu informieren oder Alternativen zu finden",
        priority: "high"
      });
    }
    
    // Gesundheitsbasiert
    if (health.medical_conditions?.length > 0) {
      recommendations.push({
        type: "medical",
        text: "Konsultiere deinen Arzt aufgrund deiner medizinischen Vorgeschichte",
        priority: "high"
      });
    }
    
    // Lifestyle-basiert
    if (lifestyle.work_stress_level > 7) {
      recommendations.push({
        type: "lifestyle",
        text: "Entwickle Stressbewältigungsstrategien für deine Arbeitssituation",
        priority: "high"
      });
    }
    
    return recommendations;
  }

  // Export für andere Systeme
  exportProfile(userId) {
    return this.analyzeProfile(userId);
  }

  // Import Profil
  importProfile(userId, profileData) {
    if (profileData.traits) this.setTraits(userId, profileData.traits);
    if (profileData.patterns) this.setPatterns(userId, profileData.patterns);
    if (profileData.cultural_context) this.setCulturalContext(userId, profileData.cultural_context);
    if (profileData.social_network) this.setSocialNetwork(userId, profileData.social_network);
    if (profileData.health_history) this.setHealthHistory(userId, profileData.health_history);
    if (profileData.lifestyle) this.setLifestyle(userId, profileData.lifestyle);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HumanIdentityDB;
}

if (typeof window !== 'undefined') {
  window.HumanIdentityDB = HumanIdentityDB;
}


