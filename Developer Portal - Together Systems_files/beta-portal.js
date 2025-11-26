// Beta Portal Manager - Zweite Applikation für Produktionsprozess
// Parallel zum Original-Portal, 1:1 Abbild für Beta-Testing

class BetaPortalManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.betaMode = false;
  }

  /**
   * Beta-Modus aktivieren
   */
  async enableBetaMode() {
    this.betaMode = true;
    await this.storage.set('beta_mode', true);
    this.eventBus.emit('BETA_MODE_ENABLED');
  }

  /**
   * Beta-Modus deaktivieren
   */
  async disableBetaMode() {
    this.betaMode = false;
    await this.storage.set('beta_mode', false);
    this.eventBus.emit('BETA_MODE_DISABLED');
  }

  /**
   * Beta-Feature aktivieren
   * @param {string} featureId - Feature-ID
   * @param {object} featureData - Feature-Daten
   */
  async enableBetaFeature(featureId, featureData) {
    const feature = {
      id: featureId,
      name: featureData.name,
      description: featureData.description,
      code: featureData.code,
      submittedBy: featureData.developerId,
      enabledAt: new Date().toISOString(),
      status: 'beta_testing',
      testResults: [],
      approvedForProduction: false
    };

    const features = await this.getBetaFeatures();
    features.push(feature);
    await this.storage.set('beta_features', features);
    
    this.eventBus.emit('BETA_FEATURE_ENABLED', { feature });
    return feature;
  }

  /**
   * Beta-Feature testen
   * @param {string} featureId - Feature-ID
   * @param {object} testResult - Test-Ergebnis
   */
  async testBetaFeature(featureId, testResult) {
    const features = await this.getBetaFeatures();
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      feature.testResults.push({
        ...testResult,
        testedAt: new Date().toISOString()
      });
      await this.storage.set('beta_features', features);
      
      this.eventBus.emit('BETA_FEATURE_TESTED', { featureId, testResult });
    }
  }

  /**
   * Beta-Feature für Production freigeben
   * @param {string} featureId - Feature-ID
   */
  async approveForProduction(featureId) {
    const features = await this.getBetaFeatures();
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      feature.approvedForProduction = true;
      feature.approvedAt = new Date().toISOString();
      await this.storage.set('beta_features', features);
      
      this.eventBus.emit('BETA_FEATURE_APPROVED', { feature });
    }
  }

  /**
   * Beta-Features abrufen
   */
  async getBetaFeatures() {
    const features = await this.storage.get('beta_features');
    return Array.isArray(features) ? features : [];
  }

  /**
   * Beta-Portal-Status abrufen
   */
  async getBetaStatus() {
    const features = await this.getBetaFeatures();
    return {
      betaMode: this.betaMode,
      totalFeatures: features.length,
      testingFeatures: features.filter(f => f.status === 'beta_testing').length,
      approvedFeatures: features.filter(f => f.approvedForProduction).length
    };
  }

  /**
   * Feature von Beta zu Production migrieren
   * @param {string} featureId - Feature-ID
   */
  async migrateToProduction(featureId) {
    const features = await this.getBetaFeatures();
    const feature = features.find(f => f.id === featureId);
    if (feature && feature.approvedForProduction) {
      // Feature wird ins Original-Portal übernommen
      this.eventBus.emit('FEATURE_MIGRATED_TO_PRODUCTION', { feature });
      
      // Feature aus Beta entfernen (oder als migrated markieren)
      feature.status = 'migrated';
      feature.migratedAt = new Date().toISOString();
      await this.storage.set('beta_features', features);
      
      return feature;
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BetaPortalManager };
}

