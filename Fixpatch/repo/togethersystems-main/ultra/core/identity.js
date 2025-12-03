// Identity Management - Manifest & Identitätslogik
// Verbindung zum Manifest-Offline-Portal

// Event-Bus importieren (wird global verfügbar sein)
// const { eventBus } = require('./event-bus.js');

class IdentityManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.currentIdentity = null;
  }

  /**
   * Identität initialisieren - prüft ob bereits vorhanden
   */
  async init() {
    const identity = await this.storage.get('identity');
    
    if (identity) {
      this.currentIdentity = identity;
      this.eventBus.emit('IDENTITY_FOUND', { identity });
      return identity;
    } else {
      this.eventBus.emit('IDENTITY_NOT_FOUND');
      return null;
    }
  }

  /**
   * Identität erstellen
   * @param {object} data - Identitätsdaten
   */
  async createIdentity(data) {
    const identity = {
      id: `id://${this.generateId()}`,
      type: data.type || 'person_private', // person_private | person_business | company | organization
      displayName: data.displayName || '',
      avatar: data.avatar || '',
      manifestId: data.manifestId || null,
      companyData: data.type === 'company' || data.type === 'person_business' ? {
        name: data.companyName || '',
        registerId: data.registerId || '',
        verified: false
      } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.storage.set('identity', identity);
    this.currentIdentity = identity;
    
    this.eventBus.emit('IDENTITY_CREATED', { identity });
    return identity;
  }

  /**
   * Identität aktualisieren
   * @param {object} updates - Zu aktualisierende Felder
   */
  async updateIdentity(updates) {
    if (!this.currentIdentity) {
      throw new Error('No identity found. Create identity first.');
    }

    const updated = {
      ...this.currentIdentity,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.storage.set('identity', updated);
    this.currentIdentity = updated;
    
    this.eventBus.emit('IDENTITY_UPDATED', { identity: updated });
    return updated;
  }

  /**
   * Aktuelle Identität abrufen
   */
  getCurrentIdentity() {
    return this.currentIdentity;
  }

  /**
   * Manifest-ID verknüpfen
   * @param {string} manifestId - Manifest-ID aus Offline-Portal
   */
  async linkManifest(manifestId) {
    if (!this.currentIdentity) {
      throw new Error('No identity found. Create identity first.');
    }

    return await this.updateIdentity({ manifestId });
  }

  /**
   * Verifizierungsstatus setzen
   * @param {boolean} verified - Verifizierungsstatus
   */
  async setVerified(verified) {
    if (!this.currentIdentity) {
      throw new Error('No identity found.');
    }

    if (this.currentIdentity.companyData) {
      this.currentIdentity.companyData.verified = verified;
    }

    await this.updateIdentity(this.currentIdentity);
    this.eventBus.emit('IDENTITY_VERIFIED_STATUS_CHANGED', {
      identityId: this.currentIdentity.id,
      verified
    });
  }

  /**
   * Manifest-Daten importieren
   * @param {object} manifestData - Daten aus Manifest-Forum
   */
  async importManifest(manifestData) {
    // Manifest-Daten verarbeiten und Identität aktualisieren
    const updates = {
      manifestId: manifestData.id || manifestData.manifestId,
      displayName: manifestData.displayName || this.currentIdentity?.displayName,
      avatar: manifestData.avatar || this.currentIdentity?.avatar
    };

    if (this.currentIdentity) {
      return await this.updateIdentity(updates);
    } else {
      return await this.createIdentity({
        type: manifestData.type || 'person_private',
        displayName: manifestData.displayName || '',
        avatar: manifestData.avatar || '',
        manifestId: manifestData.id || manifestData.manifestId
      });
    }
  }

  /**
   * ID generieren
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Prüft ob Identität verifiziert ist
   */
  isVerified() {
    if (!this.currentIdentity) return false;
    
    if (this.currentIdentity.type === 'company' || this.currentIdentity.type === 'person_business') {
      return this.currentIdentity.companyData?.verified || false;
    }
    
    return !!this.currentIdentity.manifestId;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IdentityManager };
}

