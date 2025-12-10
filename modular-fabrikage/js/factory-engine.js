// Factory Engine - Core System
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
class FactoryEngine {
  constructor() {
    this.modules = new Map();
    this.links = new Map();
    this.nextModuleId = 1;
    this.nextLinkId = 1;
    this.selectedModule = null;
    this.draggedModule = null;
    this.connectingPort = null;
  }

  createModule(type, x, y) {
    try {
      if (!type) {
        console.error('Module type is required');
        return null;
      }
      
      const id = `MODULE-${this.nextModuleId++}`;
      const config = this.getModuleConfig(type);
      
      const module = {
        id,
        type,
        x: Math.max(0, x || 0),
        y: Math.max(0, y || 0),
        ...config
      };
      
      this.modules.set(id, module);
      this.updateCounts();
      return module;
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'createModule', type });
      } else {
        console.error('Error creating module:', e);
      }
      return null;
    }
  }

  getModuleConfig(type) {
    const configs = {
      'A': {
        name: 'Materialeingang',
        icon: '📦',
        ports: {
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '1000 kg/h',
          voltage: '400V AC',
          protocol: 'PROFINET'
        }
      },
      'B': {
        name: 'Vorverarbeitung',
        icon: '⚙️',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '500 kg/h',
          voltage: '400V AC + 24V DC',
          protocol: 'EtherCAT'
        }
      },
      'C': {
        name: 'Produktion',
        icon: '🏭',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '300 units/h',
          voltage: '400V AC + 24V DC + 48V DC',
          protocol: 'PROFINET RT'
        }
      },
      'D': {
        name: 'Montage & QS',
        icon: '🔧',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '200 units/h',
          voltage: '24V DC + 48V DC',
          protocol: 'EtherCAT'
        }
      },
      'E': {
        name: 'Verpackung',
        icon: '📦',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '150 units/h',
          voltage: '24V DC',
          protocol: 'PROFINET'
        }
      },
      'F': {
        name: 'Leitwarte',
        icon: '🖥️',
        ports: {
          input: ['information']
        },
        properties: {
          capacity: 'unlimited',
          voltage: '24V DC',
          protocol: 'Ethernet/IP'
        }
      },
      'G': {
        name: 'UNRWA Hilfsorganisation',
        icon: '🏥',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: '5M+ Menschen',
          regions: 'Gaza, Westjordanland, Jordanien, Libanon, Syrien',
          services: 'Schulen, Kliniken, Notfallhilfe, Grundversorgung',
          protocol: 'UN-Standard / Humanitarian'
        }
      },
      'H': {
        name: 'Benjamin Kultur/Historie',
        icon: '📚',
        ports: {
          input: ['information'],
          output: ['information']
        },
        properties: {
          capacity: 'unlimited',
          context: 'Biblische Wurzeln, Internationale Verbreitung, Kulturelle Bedeutung',
          languages: 'Hebräisch, Englisch, Französisch, Spanisch, Arabisch',
          protocol: 'Cultural/Historical Data'
        }
      },
      'I': {
        name: 'Banking-System',
        icon: '🏦',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: 'Multi-Currency',
          features: 'Konten, Zahlungen, Batch, Direct Debit, Statements',
          integration: 'Wise API, Open Banking',
          protocol: 'REST/GraphQL API'
        }
      },
      'J': {
        name: 'Vouchers-System',
        icon: '🎟️',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: 'unlimited',
          features: 'Issue, Redeem, Liability Tracking, Expiry Management',
          integration: 'Ledger, Accounting',
          protocol: 'REST API'
        }
      },
      'K': {
        name: 'Communication Hub',
        icon: '💬',
        ports: {
          input: ['information'],
          output: ['information']
        },
        properties: {
          capacity: 'unlimited',
          features: 'Presence API, Matching, Signaling, WebRTC, Rooms',
          integration: 'Manifest Portal, Offline Forum',
          protocol: 'WebSocket/REST'
        }
      },
      'L': {
        name: 'Telbank',
        icon: '💳',
        ports: {
          input: ['material', 'energy', 'information'],
          output: ['material', 'energy', 'information']
        },
        properties: {
          capacity: 'Multi-Layer',
          features: 'MetaMask Integration, TPGA Authority, Exchange Layer, Fiat Provider',
          integration: 'Blockchain, Regulated Exchanges',
          protocol: 'EVM/MetaMask'
        }
      },
      'M': {
        name: 'AI Communication Support',
        icon: '🤖',
        ports: {
          input: ['information'],
          output: ['information']
        },
        properties: {
          capacity: 'unlimited',
          features: 'Question Support, Communication Bridge, AI-Assisted Dialogue, Thought Structuring',
          context: 'Unterstützung für Menschen mit Frage-Verbot-Erfahrung, AI als Kommunikationsbrücke',
          integration: 'AI Models, Human Communication Systems',
          protocol: 'AI/LLM API, Natural Language Processing'
        }
      },
      'N': {
        name: 'Heilungsspirale Pro',
        icon: '🌀',
        ports: {
          input: ['information', 'energy'],
          output: ['information', 'energy']
        },
        properties: {
          capacity: 'unlimited',
          features: 'Heilungsspirale, Transformation, Spirituelle Entwicklung, Pro-Version',
          context: 'Professionelle Heilungs- und Transformationsanwendung',
          integration: 'Web App, Progressive Web App',
          protocol: 'HTML5/JavaScript',
          path: 'apps/heilungsspirale-pro.html'
        }
      }
    };
    return configs[type] || { name: 'Unbekannt', ports: {}, properties: {} };
  }

  deleteModule(id) {
    try {
      if (!id) {
        console.warn('deleteModule called without ID');
        return;
      }
      
      if (!this.modules.has(id)) {
        console.warn('Module not found for deletion:', id);
        return;
      }
      
      const linksToDelete = [];
      this.links.forEach((link, linkId) => {
        if (link && (link.sourceModule === id || link.targetModule === id)) {
          linksToDelete.push(linkId);
        }
      });
      linksToDelete.forEach(linkId => this.links.delete(linkId));
      
      this.modules.delete(id);
      if (this.selectedModule === id) {
        this.selectedModule = null;
      }
      if (this.connectingPort && this.connectingPort.moduleId === id) {
        this.connectingPort = null;
      }
      this.updateCounts();
      this.render();
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'deleteModule', moduleId: id });
      } else {
        console.error('Error deleting module:', e);
      }
    }
  }

  createLink(sourceModule, sourcePort, targetModule, targetPort) {
    try {
      // Prüfe ob Module existieren
      if (!this.modules.has(sourceModule)) {
        console.warn('Source module not found:', sourceModule);
        return null;
      }
      if (!this.modules.has(targetModule)) {
        console.warn('Target module not found:', targetModule);
        return null;
      }
      
      // Prüfe ob nicht selbst verbunden
      if (sourceModule === targetModule) {
        console.warn('Cannot link module to itself');
        return null;
      }
      
      const id = `LINK-${this.nextLinkId++}`;
      const link = {
        id,
        sourceModule,
        sourcePort,
        targetModule,
        targetPort,
        type: 'material'
      };
      this.links.set(id, link);
      this.updateCounts();
      return link;
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'createLink', source: sourceModule, target: targetModule });
      } else {
        console.error('Error creating link:', e);
      }
      return null;
    }
  }

  deleteLink(id) {
    try {
      if (!id) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('deleteLink called without ID'), { context: 'deleteLink', severity: 'warning' });
        } else {
          console.warn('deleteLink called without ID');
        }
        return;
      }
      
      if (!this.links.has(id)) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('Link not found for deletion'), { context: 'deleteLink', linkId: id, severity: 'warning' });
        } else {
          console.warn('Link not found for deletion:', id);
        }
        return;
      }
      
      this.links.delete(id);
      this.updateCounts();
      this.render();
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'deleteLink', linkId: id });
      } else {
        console.error('Error deleting link:', e);
      }
    }
  }

  updateModulePosition(id, x, y) {
    try {
      const module = this.modules.get(id);
      if (module) {
        // Begrenze Position auf positive Werte
        module.x = Math.max(0, x);
        module.y = Math.max(0, y);
        this.render();
      } else {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('Module not found for position update'), { context: 'updateModulePosition', moduleId: id, severity: 'warning' });
        } else {
          console.warn('Module not found for position update:', id);
        }
      }
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'updateModulePosition', moduleId: id });
      } else {
        console.error('Error updating module position:', e);
      }
    }
  }

  selectModule(id) {
    try {
      if (!id) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('selectModule called without ID'), { context: 'selectModule', severity: 'warning' });
        } else {
          console.warn('selectModule called without ID');
        }
        return;
      }
      
      if (!this.modules.has(id)) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('Module not found for selection'), { context: 'selectModule', moduleId: id, severity: 'warning' });
        } else {
          console.warn('Module not found for selection:', id);
        }
        return;
      }
      
      this.selectedModule = id;
      this.render();
      this.showInspector(id);
    } catch (e) {
      console.error('Error selecting module:', e);
    }
  }

  showInspector(moduleId) {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('Module not found'), { context: 'showInspector', moduleId, severity: 'warning' });
        } else {
          console.warn('Module not found:', moduleId);
        }
        return;
      }

      const inspector = document.getElementById('inspector');
      const content = document.getElementById('inspector-content');
      
      if (!inspector || !content) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('Inspector elements not found'), { context: 'showInspector', moduleId });
        } else {
          console.error('Inspector elements not found');
        }
        return;
      }
      
      // Escape HTML to prevent XSS
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      
      content.innerHTML = `
        <div class="property-row">
          <span class="property-label">ID:</span>
          <span class="property-value">${escapeHtml(module.id)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Typ:</span>
          <span class="property-value">${escapeHtml(module.name || 'Unbekannt')}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Position:</span>
          <span class="property-value">(${Math.round(module.x || 0)}, ${Math.round(module.y || 0)})</span>
        </div>
        ${Object.entries(module.properties || {}).map(([key, value]) => `
          <div class="property-row">
            <span class="property-label">${escapeHtml(String(key))}:</span>
            <span class="property-value">${escapeHtml(String(value))}</span>
          </div>
        `).join('')}
      `;
      
      inspector.style.display = 'block';
    } catch (e) {
      console.error('Error showing inspector:', e);
    }
  }

  updateCounts() {
    try {
      const moduleCountEl = document.getElementById('module-count');
      const linkCountEl = document.getElementById('link-count');
      if (moduleCountEl) moduleCountEl.textContent = this.modules.size;
      if (linkCountEl) linkCountEl.textContent = this.links.size;
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'updateCounts' });
      } else {
        console.error('Error updating counts:', e);
      }
    }
  }

  save() {
    try {
      const data = {
        modules: Array.from(this.modules.entries()),
        links: Array.from(this.links.entries()),
        version: '3.0.0',
        timestamp: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'save' });
      } else {
        console.error('Error saving:', e);
      }
      return JSON.stringify({
        modules: [],
        links: [],
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        error: e.message
      }, null, 2);
    }
  }

  load(data) {
    try {
      if (!data) {
        console.error('No data provided to load');
        return false;
      }
      
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed || typeof parsed !== 'object') {
        console.error('Invalid data format');
        return false;
      }
      
      this.modules.clear();
      this.links.clear();
      
      if (Array.isArray(parsed.modules)) {
        parsed.modules.forEach(([id, module]) => {
          if (id && module) {
            this.modules.set(id, module);
          }
        });
      }
      
      if (Array.isArray(parsed.links)) {
        parsed.links.forEach(([id, link]) => {
          if (id && link) {
            this.links.set(id, link);
          }
        });
      }
      
      // Berechne nextModuleId sicher
      const moduleIds = Array.from(this.modules.keys()).map(id => {
        const match = id.match(/MODULE-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      
      this.nextModuleId = moduleIds.length > 0 ? Math.max(...moduleIds, 0) + 1 : 1;
      
      this.updateCounts();
      this.render();
      return true;
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'load' });
      } else {
        console.error('Load error:', e);
      }
      return false;
    }
  }

  render() {
    try {
      if (typeof window.renderModules === 'function') {
        window.renderModules();
      }
      if (typeof window.renderLinks === 'function') {
        window.renderLinks();
      }
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'render' });
      } else {
        console.error('Render error:', e);
      }
    }
  }
}

// FactoryEngine Initialisierung mit Fehlerbehandlung
try {
  window.factoryEngine = new FactoryEngine();
  console.log('✅ FactoryEngine erfolgreich initialisiert');
} catch (e) {
  console.error('❌ KRITISCHER FEHLER bei FactoryEngine Initialisierung:', e);
  // Fallback: Erstelle minimale FactoryEngine
  window.factoryEngine = {
    modules: new Map(),
    links: new Map(),
    nextModuleId: 1,
    nextLinkId: 1,
    selectedModule: null,
    draggedModule: null,
    connectingPort: null,
    createModule: () => null,
    getModuleConfig: () => ({ name: 'Fehler', ports: {}, properties: {} }),
    deleteModule: () => {},
    createLink: () => null,
    deleteLink: () => {},
    updateModulePosition: () => {},
    selectModule: () => {},
    showInspector: () => {},
    updateCounts: () => {},
    save: () => '{}',
    load: () => false,
    render: () => {}
  };
}



