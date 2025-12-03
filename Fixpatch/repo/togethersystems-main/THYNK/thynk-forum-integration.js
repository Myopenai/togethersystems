// T,. THYNK - FORUM INTEGRATION
// Phase 2: Integration in manifest-forum.html (Offline)
// Status: 🔬 LABORPHASE

/**
 * THYNK Integration für Offline-Forum
 * Lokale Asset-Erstellung, Offline-Speicherung, später Sync
 */

class THYNKForumIntegration {
  constructor() {
    this.thynk = null;
    this.userId = null;
    this.localAssets = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // THYNK Labor-Prototyp laden (lokal)
    if (typeof THYNKLaborPrototyp !== 'undefined') {
      this.thynk = new THYNKLaborPrototyp();
      await this.thynk.init();
    } else {
      console.error('THYNK Labor-Prototyp nicht gefunden');
      return;
    }

    // User-ID
    this.userId = this.getUserId();
    
    // Lokale Assets laden
    this.loadLocalAssets();
    
    // UI erstellen
    this.createTHYNKSection();
    
    this.initialized = true;
    console.log('✅ THYNK Forum Integration bereit');
  }

  getUserId() {
    return localStorage.getItem('mot_user_id_v1') || 'unknown';
  }

  loadLocalAssets() {
    try {
      const stored = localStorage.getItem('thynk_local_assets');
      if (stored) {
        this.localAssets = JSON.parse(stored);
        
        // Assets in THYNK laden
        this.localAssets.forEach(assetData => {
          this.thynk.createAsset(assetData);
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden lokaler Assets:', error);
      this.localAssets = [];
    }
  }

  saveLocalAssets() {
    try {
      const allAssets = this.thynk.getAllAssets();
      const localAssets = allAssets.filter(a => a.ownership.creatorId === this.userId);
      localStorage.setItem('thynk_local_assets', JSON.stringify(localAssets));
      this.localAssets = localAssets;
    } catch (error) {
      console.error('Fehler beim Speichern lokaler Assets:', error);
    }
  }

  createTHYNKSection() {
    // Prüfe ob THYNK-Section bereits existiert
    if (document.getElementById('thynk-forum-section')) return;

    // Finde passenden Platz im Forum
    const forumContent = document.querySelector('.grid') || document.body;
    
    const thynkSection = document.createElement('div');
    thynkSection.id = 'thynk-forum-section';
    thynkSection.className = 'card pad';
    thynkSection.style.marginTop = '16px';
    thynkSection.innerHTML = `
      <div class="sec-title">💡 THYNK - Meine Assets (Offline)</div>
      <div class="row" style="margin-top: 12px;">
        <button id="thynk-forum-create" class="btn">Neues Asset erstellen</button>
        <button id="thynk-forum-sync" class="btn secondary">Für Sync vorbereiten</button>
      </div>
      <div id="thynk-forum-assets" style="margin-top: 16px;">
        ${this.renderAssetsList()}
      </div>
    `;

    // Einfügen
    if (forumContent) {
      forumContent.appendChild(thynkSection);
    } else {
      document.body.appendChild(thynkSection);
    }

    // Event Listeners
    document.getElementById('thynk-forum-create')?.addEventListener('click', () => this.showCreateAssetForm());
    document.getElementById('thynk-forum-sync')?.addEventListener('click', () => this.prepareForSync());
  }

  renderAssetsList() {
    const myAssets = this.thynk.getAllAssets().filter(a => a.ownership.creatorId === this.userId);
    
    if (myAssets.length === 0) {
      return '<div class="list-empty">Noch keine Assets. Erstelle dein erstes Asset!</div>';
    }

    return myAssets.map(asset => `
      <div class="post">
        <h3>${this.escapeHtml(asset.metadata.title)}</h3>
        <div class="meta">
          <span>Typ: ${asset.type}</span> | 
          <span>Erstellt: ${new Date(asset.metadata.createdAt).toLocaleString()}</span>
        </div>
        <div style="margin-top: 8px;">${this.escapeHtml(asset.metadata.description.substring(0, 200))}...</div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn secondary" onclick="thynkForum.editAsset('${asset.id}')">Bearbeiten</button>
          <button class="btn gray" onclick="thynkForum.deleteAsset('${asset.id}')">Löschen</button>
        </div>
      </div>
    `).join('');
  }

  showCreateAssetForm() {
    // Einfaches Formular für Asset-Erstellung
    const formDiv = document.createElement('div');
    formDiv.className = 'card pad';
    formDiv.style.marginTop = '16px';
    formDiv.innerHTML = `
      <div class="sec-title">Neues Asset erstellen</div>
      <label>Titel:</label>
      <input type="text" id="thynk-forum-title" class="input" placeholder="Titel deines Assets">
      <label style="margin-top: 12px;">Beschreibung:</label>
      <textarea id="thynk-forum-description" class="textarea" placeholder="Beschreibe dein Asset..."></textarea>
      <label style="margin-top: 12px;">Typ:</label>
      <select id="thynk-forum-type" class="input">
        <option value="idea">Idee</option>
        <option value="text">Text</option>
        <option value="image">Bild</option>
        <option value="code">Code</option>
        <option value="design">Design</option>
      </select>
      <label style="margin-top: 12px;">Tags (kommagetrennt):</label>
      <input type="text" id="thynk-forum-tags" class="input" placeholder="KI, Innovation, Design">
      <label style="margin-top: 12px;">Basis-Preis:</label>
      <input type="number" id="thynk-forum-price" value="0" step="0.01" class="input">
      <div class="row" style="margin-top: 16px;">
        <button id="thynk-forum-submit" class="btn">Erstellen</button>
        <button id="thynk-forum-cancel" class="btn gray">Abbrechen</button>
      </div>
    `;

    const assetsDiv = document.getElementById('thynk-forum-assets');
    if (assetsDiv) {
      assetsDiv.insertBefore(formDiv, assetsDiv.firstChild);
    }

    document.getElementById('thynk-forum-submit')?.addEventListener('click', async () => {
      const title = document.getElementById('thynk-forum-title')?.value;
      const description = document.getElementById('thynk-forum-description')?.value;
      const type = document.getElementById('thynk-forum-type')?.value;
      const tags = document.getElementById('thynk-forum-tags')?.value.split(',').map(t => t.trim()).filter(t => t);
      const price = document.getElementById('thynk-forum-price')?.value;

      if (!title) {
        alert('Bitte Titel angeben');
        return;
      }

      try {
        await this.thynk.createAsset({
          title: title,
          description: description,
          type: type,
          tags: tags,
          creatorId: this.userId,
          basePrice: price || '0'
        });

        this.saveLocalAssets();
        document.getElementById('thynk-forum-assets').innerHTML = this.renderAssetsList();
        formDiv.remove();
      } catch (error) {
        console.error('Fehler beim Erstellen des Assets:', error);
        alert('Fehler: ' + error.message);
      }
    });

    document.getElementById('thynk-forum-cancel')?.addEventListener('click', () => {
      formDiv.remove();
    });
  }

  editAsset(assetId) {
    const asset = this.thynk.getAsset(assetId);
    if (!asset) return;

    // Einfache Bearbeitung (Titel, Beschreibung)
    const newTitle = prompt('Neuer Titel:', asset.metadata.title);
    if (newTitle) {
      asset.metadata.title = newTitle;
    }

    const newDescription = prompt('Neue Beschreibung:', asset.metadata.description);
    if (newDescription !== null) {
      asset.metadata.description = newDescription;
    }

    this.saveLocalAssets();
    document.getElementById('thynk-forum-assets').innerHTML = this.renderAssetsList();
  }

  deleteAsset(assetId) {
    if (!confirm('Asset wirklich löschen?')) return;

    // Asset aus THYNK entfernen
    this.thynk.assets.delete(assetId);
    this.thynk.tradingMarkets.delete(assetId);
    this.thynk.assessments.delete(assetId);

    this.saveLocalAssets();
    document.getElementById('thynk-forum-assets').innerHTML = this.renderAssetsList();
  }

  prepareForSync() {
    // Assets für Sync vorbereiten (später an Portal senden)
    const myAssets = this.thynk.getAllAssets().filter(a => a.ownership.creatorId === this.userId);
    
    // In localStorage für Portal-Sync speichern
    localStorage.setItem('thynk_sync_queue', JSON.stringify(myAssets));
    
    alert(`${myAssets.length} Assets für Sync vorbereitet. Beim Öffnen des Portals werden sie synchronisiert.`);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Globaler Export
window.THYNKForumIntegration = THYNKForumIntegration;

// Auto-Init wenn geladen
if (typeof window !== 'undefined') {
  window.thynkForum = new THYNKForumIntegration();
  
  // Warte auf DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.thynkForum.init();
    });
  } else {
    window.thynkForum.init();
  }
}

