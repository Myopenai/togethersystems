// T,. OSTOSOS - Extensions Manager Core
// Verwaltet 200+ / 2000+ Erweiterungen

const EXTENSIONS_REGISTRY = {
  extensions: [],
  
  async loadExtensions() {
    // Lade Erweiterungen aus Registry
    const registry = localStorage.getItem('ostosos.extensions.registry');
    if (registry) {
      this.extensions = JSON.parse(registry);
    } else {
      // Initialisiere mit Standard-Erweiterungen
      this.extensions = await this.initializeDefaultExtensions();
      this.saveRegistry();
    }
    return this.extensions;
  },
  
  async initializeDefaultExtensions() {
    return [
      {id:'industrial-fabrication',name:'Industrial Fabrication Routine',category:'core',version:'1.0.0',installed:true,description:'Fehler-Prävention und Qualitätskontrolle'},
      {id:'pre-code-verification',name:'Pre-Code Verification System',category:'core',version:'1.0.0',installed:true,description:'Pre-Code-Verifikation'},
      {id:'console-monitoring',name:'Console Monitoring System',category:'core',version:'1.0.0',installed:true,description:'Konsole-Monitoring'},
      {id:'http-resource-monitor',name:'HTTP Resource Monitor',category:'core',version:'1.0.0',installed:true,description:'HTTP-Resource-Überwachung'},
      {id:'ibm-standard',name:'IBM Standard',category:'core',version:'1.0.0',installed:true,description:'IBM Standard Integration'},
      {id:'minimal-user-action',name:'Minimal User Action Principle',category:'core',version:'1.0.0',installed:true,description:'Minimal-User-Action-Prinzip'},
      {id:'ostosos-installer',name:'OSTOSOS Installer System',category:'core',version:'1.0.0',installed:true,description:'Installer-System'},
      {id:'permanent-test',name:'Permanent Test Routine',category:'core',version:'1.0.0',installed:true,description:'Permanente Test-Routine'},
      {id:'error-detection',name:'24/7 Error Detection Routine',category:'core',version:'1.0.0',installed:true,description:'24/7 Fehlererkennung'},
      {id:'user-friendliness',name:'User-Friendliness Routine',category:'core',version:'1.0.0',installed:true,description:'User-Friendliness'},
      {id:'davinci-design',name:'Da Vinci Design System',category:'design',version:'1.0.0',installed:true,description:'Da Vinci Design System'},
      {id:'phosphorescence',name:'Phosphorescence Effects',category:'design',version:'1.0.0',installed:true,description:'Phosphoreszenz-Effekte'},
      {id:'flow-animations',name:'Flow Animations',category:'design',version:'1.0.0',installed:true,description:'Flow-Animationen'},
      {id:'auto-update',name:'Auto Update System',category:'system',version:'1.0.0',installed:true,description:'Automatische Updates'},
      {id:'cross-device-sync',name:'Cross-Device Sync',category:'system',version:'1.0.0',installed:true,description:'Cross-Device-Synchronisation'},
      {id:'p2p-mesh',name:'P2P Mesh Network',category:'network',version:'1.0.0',installed:true,description:'P2P Mesh Network'},
      {id:'metamask',name:'MetaMask Integration',category:'finance',version:'1.0.0',installed:true,description:'MetaMask-Integration'},
      {id:'telbank',name:'TPGA Telbank',category:'finance',version:'1.0.0',installed:true,description:'TPGA Telbank'},
      {id:'oso-production',name:'OSO Production System',category:'production',version:'1.0.0',installed:true,description:'OSO Produktionssystem'},
      {id:'honeycomb',name:'Honeycomb Hub',category:'communication',version:'1.0.0',installed:true,description:'Honeycomb Hub'},
      {id:'legal-hub',name:'Legal Hub',category:'legal',version:'1.0.0',installed:true,description:'Legal Hub'},
      {id:'mail-hub',name:'Mail Hub',category:'communication',version:'1.0.0',installed:true,description:'Mail Hub'},
      {id:'cloud-hub',name:'Cloud Hub',category:'storage',version:'1.0.0',installed:true,description:'Cloud Hub'},
      {id:'media-hub',name:'Media Hub',category:'media',version:'1.0.0',installed:true,description:'Media Hub'},
      {id:'matrix-games',name:'Matrix Games',category:'entertainment',version:'1.0.0',installed:true,description:'Matrix Games'},
      {id:'manifest-portal',name:'Manifest Portal',category:'portal',version:'1.0.0',installed:true,description:'Manifest Portal'},
      {id:'manifest-forum',name:'Manifest Forum',category:'forum',version:'1.0.0',installed:true,description:'Manifest Forum'},
      {id:'usb-boot',name:'USB Boot Creator',category:'deployment',version:'1.0.0',installed:true,description:'USB Boot Creator'},
      {id:'multiboot-usb',name:'Multi-Boot USB System',category:'deployment',version:'1.0.0',installed:true,description:'Multi-Boot USB System'},
      {id:'test-system',name:'Test System',category:'testing',version:'1.0.0',installed:true,description:'Test-System'},
      {id:'error-pattern',name:'Error Pattern Matching',category:'quality',version:'1.0.0',installed:true,description:'Error Pattern Matching'},
      {id:'auto-fix',name:'Auto-Fix System',category:'quality',version:'1.0.0',installed:true,description:'Auto-Fix-System'},
      {id:'cross-platform',name:'Cross-Platform Builds',category:'build',version:'1.0.0',installed:true,description:'Cross-Platform Builds'},
      {id:'settings-master',name:'Settings Master System',category:'core',version:'1.0.0',installed:true,description:'Settings Master System'},
      {id:'dev-tools',name:'Developer Expert Tools',category:'development',version:'1.0.0',installed:true,description:'Developer Expert Tools & Systemanalyse'}
    ];
  },
  
  saveRegistry() {
    localStorage.setItem('ostosos.extensions.registry', JSON.stringify(this.extensions));
  },
  
  async installExtension(id) {
    const ext = this.extensions.find(e => e.id === id);
    if (ext) {
      ext.installed = true;
      ext.installedDate = new Date().toISOString();
      this.saveRegistry();
      return true;
    }
    return false;
  },
  
  async uninstallExtension(id) {
    const ext = this.extensions.find(e => e.id === id);
    if (ext) {
      // Prüfe Abhängigkeiten
      const dependencies = this.getDependencies(id);
      if (dependencies.length > 0) {
        const depsList = dependencies.map(d => d.name).join(', ');
        if (!confirm(`Diese Erweiterung wird von anderen benötigt:\n${depsList}\n\nTrotzdem deinstallieren?`)) {
          return false;
        }
      }
      
      // Speichere für Rückgängig
      const undoData = {
        action: 'uninstall',
        extensionId: id,
        extensionData: JSON.parse(JSON.stringify(ext)),
        timestamp: new Date().toISOString()
      };
      this.addToUndoHistory(undoData);
      
      ext.installed = false;
      ext.uninstalledDate = new Date().toISOString();
      this.saveRegistry();
      return true;
    }
    return false;
  },
  
  getDependencies(id) {
    // Prüfe welche Erweiterungen diese Erweiterung benötigen
    return this.extensions.filter(e => 
      e.installed && 
      e.dependencies && 
      e.dependencies.includes(id)
    );
  },
  
  undoHistory: [],
  
  addToUndoHistory(action) {
    this.undoHistory.push(action);
    // Max 50 Einträge
    if (this.undoHistory.length > 50) {
      this.undoHistory.shift();
    }
    localStorage.setItem('ostosos.extensions.undoHistory', JSON.stringify(this.undoHistory));
  },
  
  async undoLastAction() {
    if (this.undoHistory.length === 0) {
      return false;
    }
    
    const lastAction = this.undoHistory.pop();
    
    if (lastAction.action === 'uninstall') {
      // Wieder installieren
      const ext = this.extensions.find(e => e.id === lastAction.extensionId);
      if (ext) {
        Object.assign(ext, lastAction.extensionData);
        ext.installed = true;
        delete ext.uninstalledDate;
        this.saveRegistry();
        return true;
      }
    } else if (lastAction.action === 'install') {
      // Wieder deinstallieren
      const ext = this.extensions.find(e => e.id === lastAction.extensionId);
      if (ext) {
        ext.installed = false;
        this.saveRegistry();
        return true;
      }
    }
    
    return false;
  },
  
  verifyExtension(id) {
    const ext = this.extensions.find(e => e.id === id);
    if (!ext) return { valid: false, message: 'Erweiterung nicht gefunden' };
    
    const checks = [];
    
    // Prüfe ob installiert
    if (!ext.installed) {
      checks.push({ status: 'warn', message: 'Erweiterung nicht installiert' });
    }
    
    // Prüfe Abhängigkeiten
    if (ext.dependencies) {
      const missingDeps = ext.dependencies.filter(depId => {
        const dep = this.extensions.find(e => e.id === depId);
        return !dep || !dep.installed;
      });
      if (missingDeps.length > 0) {
        checks.push({ status: 'fail', message: `Fehlende Abhängigkeiten: ${missingDeps.join(', ')}` });
      } else {
        checks.push({ status: 'pass', message: 'Alle Abhängigkeiten erfüllt' });
      }
    }
    
    // Prüfe Kompatibilität
    if (ext.minOSTOSOSVersion) {
      const currentVersion = localStorage.getItem('ostosos.version') || '1.0.0';
      if (this.compareVersions(currentVersion, ext.minOSTOSOSVersion) < 0) {
        checks.push({ status: 'fail', message: `Mindest-Version erforderlich: ${ext.minOSTOSOSVersion}` });
      } else {
        checks.push({ status: 'pass', message: 'Version kompatibel' });
      }
    }
    
    const allPass = checks.every(c => c.status === 'pass');
    const hasFail = checks.some(c => c.status === 'fail');
    
    return {
      valid: allPass && !hasFail,
      checks: checks,
      message: hasFail ? 'Verifikation fehlgeschlagen' : allPass ? 'Verifikation erfolgreich' : 'Verifikation mit Warnungen'
    };
  },
  
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    return 0;
  },
  
  getInstalledExtensions() {
    return this.extensions.filter(e => e.installed);
  },
  
  getAvailableExtensions() {
    return this.extensions.filter(e => !e.installed);
  },
  
  getExtensionsByCategory(category) {
    return this.extensions.filter(e => e.category === category);
  },
  
  searchExtensions(query) {
    const lowerQuery = query.toLowerCase();
    return this.extensions.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.category.toLowerCase().includes(lowerQuery)
    );
  }
};

let currentFilter = 'all';
let currentSearch = '';

async function loadExtensions() {
  await EXTENSIONS_REGISTRY.loadExtensions();
  updateStats();
  displayExtensions();
}

function updateStats() {
  const total = EXTENSIONS_REGISTRY.extensions.length;
  const installed = EXTENSIONS_REGISTRY.getInstalledExtensions().length;
  const available = EXTENSIONS_REGISTRY.getAvailableExtensions().length;
  const updates = EXTENSIONS_REGISTRY.extensions.filter(e => e.updateAvailable).length;
  
  document.getElementById('totalExtensions').textContent = total;
  document.getElementById('installedExtensions').textContent = installed;
  document.getElementById('availableExtensions').textContent = available;
  document.getElementById('updateExtensions').textContent = updates;
}

function displayExtensions() {
  let filtered = EXTENSIONS_REGISTRY.extensions;
  
  if (currentSearch) {
    filtered = EXTENSIONS_REGISTRY.searchExtensions(currentSearch);
  }
  
  if (currentFilter === 'installed') {
    filtered = filtered.filter(e => e.installed);
  } else if (currentFilter === 'available') {
    filtered = filtered.filter(e => !e.installed);
  } else if (currentFilter === 'updates') {
    filtered = filtered.filter(e => e.updateAvailable);
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(e => e.category === currentFilter);
  }
  
  const container = document.getElementById('extensionsGrid');
  container.innerHTML = filtered.map(ext => `
    <div class="ext-card ${ext.installed ? 'installed' : ''}">
      <h3>${ext.name}</h3>
      <p style="color:var(--davinci-muted,#9ca3af);font-size:0.9em;margin-bottom:10px">${ext.description}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="status ${ext.installed ? 'status-installed' : 'status-available'}">
          ${ext.installed ? '✅ Installiert' : '📦 Verfügbar'}
        </span>
        <span style="color:var(--davinci-muted,#9ca3af);font-size:0.8em">v${ext.version}</span>
      </div>
      <div style="margin-top:10px">
        ${ext.installed ? 
          `<button class="btn btn-secondary" onclick="uninstallExtension('${ext.id}')" style="width:100%;padding:8px;font-size:0.9em">🗑️ Deinstallieren</button>` :
          `<button class="btn btn-primary" onclick="installExtension('${ext.id}')" style="width:100%;padding:8px;font-size:0.9em">📥 Installieren</button>`
        }
      </div>
    </div>
  `).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  displayExtensions();
}

function filterExtensions() {
  currentSearch = document.getElementById('searchBar').value;
  displayExtensions();
}

async function installExtension(id) {
  const success = await EXTENSIONS_REGISTRY.installExtension(id);
  if (success) {
    alert('Erweiterung installiert!');
    updateStats();
    displayExtensions();
  }
}

async function uninstallExtension(id) {
  if (confirm('Erweiterung wirklich deinstallieren?\n\nHinweis: Diese Aktion kann rückgängig gemacht werden.')) {
    const success = await EXTENSIONS_REGISTRY.uninstallExtension(id);
    if (success) {
      alert('Erweiterung deinstalliert!\n\nDu kannst diese Aktion mit "Letzte Aktion rückgängig" wiederherstellen.');
      updateStats();
      displayExtensions();
    }
  }
}

async function undoLastAction() {
  const success = await EXTENSIONS_REGISTRY.undoLastAction();
  if (success) {
    alert('Aktion rückgängig gemacht!');
    updateStats();
    displayExtensions();
  } else {
    alert('Keine Aktion zum Rückgängig machen verfügbar.');
  }
}

async function verifyAllExtensions() {
  const results = document.getElementById('verificationResults');
  results.innerHTML = '<div style="color:var(--davinci-muted,#9ca3af)">🔍 Verifikation läuft...</div>';
  
  const installed = EXTENSIONS_REGISTRY.getInstalledExtensions();
  const verificationResults = installed.map(ext => ({
    extension: ext,
    result: EXTENSIONS_REGISTRY.verifyExtension(ext.id)
  }));
  
  const passed = verificationResults.filter(r => r.result.valid).length;
  const failed = verificationResults.filter(r => !r.result.valid).length;
  
  results.innerHTML = `
    <div style="margin-top:15px">
      <div style="color:#22c55e;margin-bottom:10px"><strong>✅ Verifiziert: ${passed}</strong></div>
      ${failed > 0 ? `<div style="color:#ef4444;margin-bottom:10px"><strong>❌ Fehler: ${failed}</strong></div>` : ''}
      ${verificationResults.map(r => `
        <div style="padding:10px;margin:5px 0;background:var(--davinci-bg,#0f172a);border-radius:6px;border-left:3px solid ${r.result.valid ? '#22c55e' : '#ef4444'}">
          <strong>${r.extension.name}:</strong> ${r.result.message}
          ${r.result.checks ? r.result.checks.map(c => `<div style="font-size:0.85em;margin-top:5px;color:var(--davinci-muted,#9ca3af)">${c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : '⚠️'} ${c.message}</div>`).join('') : ''}
        </div>
      `).join('')}
    </div>
  `;
}

window.addEventListener('load', () => {
  loadExtensions();
});

