// Extension Registry - Tankstelle für Plugins
// Erweiterungen können sich registrieren und in Feed, Menü und Datenmodell einhängen

class ExtensionsRegistry {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.extensions = new Map();
    this.hooks = {
      composer: [],      // Zusätzliche Aktionen im Composer
      postRender: [],    // Post-Rendering-Hooks
      feedFilter: [],    // Feed-Filter-Hooks
      menuItems: []      // Zusätzliche Menü-Items
    };
  }

  /**
   * Extension registrieren
   * @param {object} extensionMeta - Extension-Metadaten
   */
  register(extensionMeta) {
    const extension = {
      id: extensionMeta.id,
      name: extensionMeta.name,
      icon: extensionMeta.icon || '🔌',
      version: extensionMeta.version || '1.0.0',
      description: extensionMeta.description || '',
      actions: extensionMeta.actions || [],      // Composer-Aktionen
      views: extensionMeta.views || [],          // Eigene Views
      hooks: extensionMeta.hooks || {},          // Hooks
      init: extensionMeta.init || null,          // Init-Funktion
      instance: null
    };

    this.extensions.set(extension.id, extension);
    
    // Extension initialisieren
    if (extension.init && typeof extension.init === 'function') {
      extension.instance = extension.init(this.eventBus, this);
    }

    // Hooks registrieren
    if (extension.hooks.composer) {
      this.hooks.composer.push({
        extensionId: extension.id,
        actions: extension.hooks.composer
      });
    }

    if (extension.hooks.postRender) {
      this.hooks.postRender.push({
        extensionId: extension.id,
        render: extension.hooks.postRender
      });
    }

    if (extension.hooks.feedFilter) {
      this.hooks.feedFilter.push({
        extensionId: extension.id,
        filter: extension.hooks.feedFilter
      });
    }

    if (extension.hooks.menuItems) {
      this.hooks.menuItems.push({
        extensionId: extension.id,
        items: extension.hooks.menuItems
      });
    }

    this.eventBus.emit('EXTENSION_REGISTERED', { extension });
    return extension;
  }

  /**
   * Extension abrufen
   * @param {string} extensionId - Extension-ID
   */
  getExtension(extensionId) {
    return this.extensions.get(extensionId) || null;
  }

  /**
   * Alle Extensions abrufen
   */
  getExtensions() {
    return Array.from(this.extensions.values());
  }

  /**
   * Composer-Aktionen aller Extensions abrufen
   */
  getComposerActions() {
    const actions = [];
    this.hooks.composer.forEach(hook => {
      hook.actions.forEach(action => {
        actions.push({
          ...action,
          extensionId: hook.extensionId
        });
      });
    });
    return actions;
  }

  /**
   * Extension-Aktion ausführen
   * @param {string} extensionId - Extension-ID
   * @param {string} actionId - Aktion-ID
   * @param {object} context - Kontext
   */
  executeAction(extensionId, actionId, context = {}) {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    this.eventBus.emit('EXTENSION_ACTION_SELECTED', {
      extensionId,
      actionId,
      context
    });

    // Extension-spezifische Aktion ausführen
    if (extension.instance && extension.instance.handleAction) {
      return extension.instance.handleAction(actionId, context);
    }

    return null;
  }

  /**
   * Post mit Extension-Hooks rendern
   * @param {object} post - Post-Objekt
   * @param {string} html - Basis-HTML
   */
  renderPost(post, html) {
    let rendered = html;
    
    this.hooks.postRender.forEach(hook => {
      if (typeof hook.render === 'function') {
        rendered = hook.render(post, rendered) || rendered;
      }
    });

    return rendered;
  }

  /**
   * Feed mit Extension-Filtern filtern
   * @param {Array} posts - Posts-Array
   */
  filterFeed(posts) {
    let filtered = posts;
    
    this.hooks.feedFilter.forEach(hook => {
      if (typeof hook.filter === 'function') {
        filtered = hook.filter(filtered) || filtered;
      }
    });

    return filtered;
  }

  /**
   * Menü-Items aller Extensions abrufen
   */
  getMenuItems() {
    const items = [];
    this.hooks.menuItems.forEach(hook => {
      hook.items.forEach(item => {
        items.push({
          ...item,
          extensionId: hook.extensionId
        });
      });
    });
    return items;
  }
}

// Globale Registry-Instanz
let extensionsRegistry = null;

function initRegistry(eventBus) {
  if (!extensionsRegistry) {
    extensionsRegistry = new ExtensionsRegistry(eventBus);
  }
  return extensionsRegistry;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExtensionsRegistry, initRegistry };
}








