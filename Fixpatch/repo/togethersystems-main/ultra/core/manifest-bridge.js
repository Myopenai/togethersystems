// Manifest Bridge - Verbindung zum Offline-Portal
// Automatische Integration mit manifest-forum.html

class ManifestBridge {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.manifestKeys = {
      userId: 'mot_user_id_v1',
      verified: 'mot_verified_v1',
      manifestData: 'mot_manifest_data_v1'
    };
  }

  /**
   * Manifest-Daten aus Offline-Portal lesen
   */
  async loadManifestData() {
    try {
      // Prüfe localStorage für Manifest-Daten
      const userId = localStorage.getItem(this.manifestKeys.userId);
      const verified = localStorage.getItem(this.manifestKeys.verified);
      const manifestData = localStorage.getItem(this.manifestKeys.manifestData);

      if (userId && verified) {
        const data = {
          userId,
          verified: JSON.parse(verified),
          manifestData: manifestData ? JSON.parse(manifestData) : null
        };

        this.eventBus.emit('MANIFEST_DATA_LOADED', { data });
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error loading manifest data:', error);
      return null;
    }
  }

  /**
   * Manifest-ID verknüpfen
   * @param {string} manifestId - Manifest-ID aus Offline-Portal
   */
  async linkManifestId(manifestId) {
    const data = {
      manifestId,
      linkedAt: new Date().toISOString()
    };

    localStorage.setItem(this.manifestKeys.manifestData, JSON.stringify(data));
    
    this.eventBus.emit('MANIFEST_LINKED', { manifestId });
    return data;
  }

  /**
   * Manifest-Daten importieren (aus Export-Datei)
   * @param {object} manifestExport - Exportierte Manifest-Daten
   */
  async importManifest(manifestExport) {
    try {
      // Manifest-Daten verarbeiten
      if (manifestExport.userId) {
        localStorage.setItem(this.manifestKeys.userId, manifestExport.userId);
      }

      if (manifestExport.verified) {
        localStorage.setItem(this.manifestKeys.verified, JSON.stringify(manifestExport.verified));
      }

      if (manifestExport.posts || manifestExport.items) {
        // Posts/Items aus Manifest importieren
        const posts = manifestExport.posts || manifestExport.items || [];
        
        // In Ultra-Format konvertieren
        const ultraPosts = posts.map(item => ({
          id: `post://${item.id || this.generateId()}`,
          authorId: manifestExport.userId,
          type: 'text',
          content: {
            text: item.text || item.content || '',
            media: item.media || []
          },
          createdAt: item.createdAt || new Date().toISOString(),
          reactions: []
        }));

        // Posts speichern
        const existingPosts = await this.storage.get('posts') || [];
        const merged = [...ultraPosts, ...existingPosts];
        await this.storage.set('posts', merged);
      }

      this.eventBus.emit('MANIFEST_IMPORTED', { manifestExport });
      return true;
    } catch (error) {
      console.error('Error importing manifest:', error);
      throw error;
    }
  }

  /**
   * Manifest-Daten exportieren
   */
  async exportManifest() {
    const userId = localStorage.getItem(this.manifestKeys.userId);
    const verified = localStorage.getItem(this.manifestKeys.verified);
    const posts = await this.storage.get('posts') || [];

    const exportData = {
      userId,
      verified: verified ? JSON.parse(verified) : null,
      posts: posts.filter(p => p.authorId === userId),
      exportedAt: new Date().toISOString()
    };

    this.eventBus.emit('MANIFEST_EXPORTED', { exportData });
    return exportData;
  }

  /**
   * Prüft ob Manifest vorhanden ist
   */
  async hasManifest() {
    const userId = localStorage.getItem(this.manifestKeys.userId);
    return !!userId;
  }

  /**
   * Manifest-ID generieren (falls nicht vorhanden)
   */
  generateManifestId() {
    return `manifest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * ID generieren
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ManifestBridge };
}








