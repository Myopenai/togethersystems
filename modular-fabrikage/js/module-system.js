// Module System - Rendering and Interaction
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
function renderModules() {
  try {
    const container = document.getElementById('modules-container');
    if (!container) {
      console.error('modules-container not found');
      return;
    }
    
    if (!window.factoryEngine || !window.factoryEngine.modules) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    container.innerHTML = '';
    
    window.factoryEngine.modules.forEach((module, id) => {
      try {
        const moduleEl = createModuleElement(module);
        if (moduleEl) {
          container.appendChild(moduleEl);
        }
      } catch (e) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(e, { context: 'renderModules', moduleId: id });
        } else {
          console.error(`Error rendering module ${id}:`, e);
        }
      }
    });
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'renderModules' });
    } else {
      console.error('Error in renderModules:', e);
    }
  }
}

function createModuleElement(module) {
  try {
    if (!module || !module.id) {
      console.error('Invalid module:', module);
      return null;
    }
    
    const div = document.createElement('div');
    div.className = 'factory-module';
    div.id = module.id;
    div.style.left = (module.x || 0) + 'px';
    div.style.top = (module.y || 0) + 'px';
    
    if (window.factoryEngine && window.factoryEngine.selectedModule === module.id) {
      div.classList.add('selected');
    }
    
    const config = window.factoryEngine ? window.factoryEngine.getModuleConfig(module.type) : { name: 'Unbekannt', icon: '❓', ports: {}, properties: {} };
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const moduleIdEscaped = escapeHtml(module.id);
    const moduleNameEscaped = escapeHtml(config.name || 'Unbekannt');
    const moduleIcon = config.icon || '❓';
    
    div.innerHTML = `
      <div class="module-header">
        <div>
          <div class="module-title">${moduleIcon} ${moduleNameEscaped}</div>
          <div class="module-type">${moduleIdEscaped}</div>
        </div>
        <button class="btn-small btn-outline" onclick="deleteModule('${moduleIdEscaped}')" title="Löschen">×</button>
      </div>
      <div class="module-ports">
        ${(config.ports && config.ports.input || []).map((port) => `
          <div class="port input" data-port="${escapeHtml(port)}" data-type="input" 
               onclick="handlePortClick('${moduleIdEscaped}', '${escapeHtml(port)}', 'input')"
               title="${escapeHtml(port)} (Input)"></div>
        `).join('')}
        ${(config.ports && config.ports.output || []).map((port) => `
          <div class="port output" data-port="${escapeHtml(port)}" data-type="output"
               onclick="handlePortClick('${moduleIdEscaped}', '${escapeHtml(port)}', 'output')"
               title="${escapeHtml(port)} (Output)"></div>
        `).join('')}
      </div>
      <div class="module-actions">
        <button class="btn-small btn-outline" onclick="selectModule('${moduleIdEscaped}')">Details</button>
        ${config.properties && config.properties.path ? `
          <button class="btn-small btn-primary" onclick="openModuleApp('${moduleIdEscaped}')" title="App öffnen">→</button>
        ` : ''}
      </div>
    `;
    
    makeDraggable(div, module.id);
    
    return div;
  } catch (e) {
    console.error('Error creating module element:', e);
    return null;
  }
}

function makeDraggable(element, moduleId) {
  try {
    if (!element || !moduleId) {
      console.error('Invalid parameters for makeDraggable');
      return;
    }
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let mouseMoveHandler, mouseUpHandler;
    
    element.addEventListener('mousedown', (e) => {
      try {
        // Port-Klicks nicht blockieren - Ports haben eigene Handler
        if (e.target.classList.contains('port')) {
          return; // Port-Klick wird von handlePortClick behandelt
        }
        if (e.target.tagName === 'BUTTON') return;
        
        if (!window.factoryEngine) {
          console.error('FactoryEngine not initialized');
          return;
        }
        
        const module = window.factoryEngine.modules.get(moduleId);
        if (!module) {
          console.error('Module not found:', moduleId);
          return;
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = module.x || 0;
        initialY = module.y || 0;
        
        element.style.cursor = 'grabbing';
        e.preventDefault();
        
        // Event-Handler für mousemove und mouseup
        mouseMoveHandler = (e) => {
          if (!isDragging) return;
          
          try {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const newX = initialX + dx;
            const newY = initialY + dy;
            
            if (window.factoryEngine) {
              window.factoryEngine.updateModulePosition(moduleId, newX, newY);
              if (typeof window.renderLinks === 'function') {
                window.renderLinks();
              }
            }
          } catch (err) {
            console.error('Error in mousemove handler:', err);
          }
        };
        
        mouseUpHandler = () => {
          if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
          }
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      } catch (e) {
        console.error('Error in mousedown handler:', e);
        isDragging = false;
      }
    });
  } catch (e) {
    console.error('Error in makeDraggable:', e);
  }
}

function selectModule(id) {
  try {
    if (!id) {
      console.error('Module ID is required');
      return;
    }
    
    if (!window.factoryEngine) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    window.factoryEngine.selectModule(id);
  } catch (e) {
    console.error('Error selecting module:', e);
  }
}

function deleteModule(id) {
  try {
    if (!id) {
      console.error('Module ID is required');
      return;
    }
    
    if (!window.factoryEngine) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    if (confirm(`Modul ${id} wirklich löschen?`)) {
      window.factoryEngine.deleteModule(id);
      if (typeof window.renderModules === 'function') {
        window.renderModules();
      }
      if (typeof window.renderLinks === 'function') {
        window.renderLinks();
      }
    }
  } catch (e) {
    console.error('Error deleting module:', e);
    alert('Fehler beim Löschen: ' + e.message);
  }
}

function handlePortClick(moduleId, portName, portType) {
  try {
    const engine = window.factoryEngine;
    if (!engine) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    const statusEl = document.getElementById('system-status');
    
    // Wenn noch kein Port ausgewählt ist
    if (!engine.connectingPort) {
      engine.connectingPort = {
        moduleId,
        portName,
        portType
      };
      if (statusEl) {
        statusEl.textContent = 'Verbinden... Klicke auf ' + (portType === 'output' ? 'Input' : 'Output') + ' Port';
        statusEl.style.color = '#39d0ff';
      }
      console.log('Port ausgewählt:', { moduleId, portName, portType });
      return;
    }
    
    // Zweiter Klick: Verbindung erstellen
    const firstPort = engine.connectingPort;
    const secondPort = { moduleId, portName, portType };
    
    // Prüfe ob es verschiedene Module sind
    if (firstPort.moduleId === secondPort.moduleId) {
      console.warn('Kann nicht mit sich selbst verbinden');
      engine.connectingPort = null;
      if (statusEl) {
        statusEl.textContent = 'Bereit';
        statusEl.style.color = '';
      }
      return;
    }
    
    // Prüfe ob Port-Typen kompatibel sind (Output -> Input)
    if (firstPort.portType === 'output' && secondPort.portType === 'input') {
      // Output zu Input: Verbindung erstellen
      const link = engine.createLink(
        firstPort.moduleId,
        firstPort.portName,
        secondPort.moduleId,
        secondPort.portName
      );
      
      if (link) {
        console.log('Verbindung erstellt:', link);
        if (typeof window.renderLinks === 'function') {
          window.renderLinks();
        }
        if (statusEl) {
          statusEl.textContent = 'Verbindung erstellt!';
          statusEl.style.color = '#10b981';
          setTimeout(() => {
            statusEl.textContent = 'Bereit';
            statusEl.style.color = '';
          }, 2000);
        }
      } else {
        console.warn('Verbindung konnte nicht erstellt werden');
        if (statusEl) {
          statusEl.textContent = 'Verbindung fehlgeschlagen';
          statusEl.style.color = '#ef4444';
          setTimeout(() => {
            statusEl.textContent = 'Bereit';
            statusEl.style.color = '';
          }, 2000);
        }
      }
    } else if (firstPort.portType === 'input' && secondPort.portType === 'output') {
      // Input zu Output: Umgekehrte Verbindung erstellen
      const link = engine.createLink(
        secondPort.moduleId,
        secondPort.portName,
        firstPort.moduleId,
        firstPort.portName
      );
      
      if (link) {
        console.log('Verbindung erstellt:', link);
        if (typeof window.renderLinks === 'function') {
          window.renderLinks();
        }
        if (statusEl) {
          statusEl.textContent = 'Verbindung erstellt!';
          statusEl.style.color = '#10b981';
          setTimeout(() => {
            statusEl.textContent = 'Bereit';
            statusEl.style.color = '';
          }, 2000);
        }
      } else {
        console.warn('Verbindung konnte nicht erstellt werden');
        if (statusEl) {
          statusEl.textContent = 'Verbindung fehlgeschlagen';
          statusEl.style.color = '#ef4444';
          setTimeout(() => {
            statusEl.textContent = 'Bereit';
            statusEl.style.color = '';
          }, 2000);
        }
      }
    } else {
      // Inkompatible Port-Typen
      console.warn('Inkompatible Port-Typen:', firstPort.portType, secondPort.portType);
      if (statusEl) {
        statusEl.textContent = 'Inkompatible Ports (Output -> Input erforderlich)';
        statusEl.style.color = '#f59e0b';
        setTimeout(() => {
          statusEl.textContent = 'Bereit';
          statusEl.style.color = '';
        }, 2000);
      }
    }
    
    // Reset connectingPort
    engine.connectingPort = null;
    
  } catch (e) {
    console.error('Error in handlePortClick:', e);
    if (window.factoryEngine) {
      window.factoryEngine.connectingPort = null;
    }
    const statusEl = document.getElementById('system-status');
    if (statusEl) {
      statusEl.textContent = 'Fehler: ' + e.message;
      statusEl.style.color = '#ef4444';
    }
  }
}

function openModuleApp(moduleId) {
  try {
    if (!moduleId) {
      console.error('Module ID is required');
      return;
    }
    
    if (!window.factoryEngine) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    const module = window.factoryEngine.modules.get(moduleId);
    if (!module) {
      console.warn('Module not found:', moduleId);
      alert('Modul nicht gefunden');
      return;
    }
    
    const config = window.factoryEngine.getModuleConfig(module.type);
    
    // Spezialbehandlung für Software Generator (Modul O)
    if (module.type === 'O') {
      openSoftwareGeneratorUI(moduleId);
      return;
    }
    
    const appPath = config.properties && config.properties.path;
    
    if (appPath) {
      try {
        window.open(appPath, '_blank');
      } catch (e) {
        console.error('Error opening app:', e);
        alert('Fehler beim Öffnen der App: ' + e.message);
      }
    } else {
      alert('Keine App für dieses Modul verfügbar');
    }
  } catch (e) {
    console.error('Error in openModuleApp:', e);
    alert('Fehler beim Öffnen der App');
  }
}

function openSoftwareGeneratorUI(moduleId) {
  try {
    if (!window.softwareGenerator) {
      alert('Software Generator nicht verfügbar');
      return;
    }
    
    // Erstelle UI für Software Generator
    const modal = document.createElement('div');
    modal.id = 'software-generator-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const freeAPIs = window.softwareGenerator.getFreeAPIs();
    
    modal.innerHTML = `
      <div style="background: #1a1a2e; border: 2px solid #39d0ff; border-radius: 15px; padding: 30px; max-width: 800px; max-height: 90vh; overflow-y: auto; color: #e0e0e0;">
        <h2 style="color: #39d0ff; margin-bottom: 20px;">💻 Software Generator - Modul O</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f565ff; margin-bottom: 10px;">Freie APIs</h3>
          <div id="free-apis-list" style="display: grid; gap: 10px;">
            ${freeAPIs.map(api => `
              <div style="background: rgba(57, 208, 255, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(57, 208, 255, 0.3);">
                <strong style="color: #39d0ff;">${api.name}</strong>
                <p style="color: #aaa; font-size: 0.9rem; margin: 5px 0;">${api.description}</p>
                <p style="color: #666; font-size: 0.8rem;">URL: ${api.url}</p>
                <button onclick="connectFreeAPI('${api.url}', '${api.name}')" style="margin-top: 10px; padding: 8px 16px; background: #39d0ff; color: #000; border: none; border-radius: 8px; cursor: pointer;">Verbinden</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f565ff; margin-bottom: 10px;">Eigene API hinzufügen</h3>
          <input type="text" id="custom-api-url" placeholder="API URL (z.B. https://api.example.com)" style="width: 100%; padding: 10px; background: #0a0e14; border: 1px solid #39d0ff; border-radius: 8px; color: #e0e0e0; margin-bottom: 10px;">
          <input type="text" id="custom-api-name" placeholder="API Name" style="width: 100%; padding: 10px; background: #0a0e14; border: 1px solid #39d0ff; border-radius: 8px; color: #e0e0e0; margin-bottom: 10px;">
          <button onclick="connectCustomAPI()" style="padding: 10px 20px; background: #f565ff; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">API hinzufügen</button>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f565ff; margin-bottom: 10px;">Code generieren</h3>
          <select id="code-type" style="width: 100%; padding: 10px; background: #0a0e14; border: 1px solid #39d0ff; border-radius: 8px; color: #e0e0e0; margin-bottom: 10px;">
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="python">Python</option>
            <option value="api">API Integration</option>
          </select>
          <button onclick="generateCodeFromModules()" style="padding: 10px 20px; background: #10b981; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Code aus Modulen generieren</button>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(57, 208, 255, 0.3);">
          <button onclick="closeSoftwareGeneratorUI()" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">Schließen</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Globale Funktionen für UI
    window.connectFreeAPI = async (url, name) => {
      try {
        const result = await window.softwareGenerator.connectAPI({ name, url });
        if (result.success) {
          alert(`✅ API "${name}" erfolgreich verbunden!`);
        } else {
          alert(`❌ Fehler: ${result.error}`);
        }
      } catch (e) {
        alert(`❌ Fehler: ${e.message}`);
      }
    };
    
    window.connectCustomAPI = async () => {
      const url = document.getElementById('custom-api-url').value.trim();
      const name = document.getElementById('custom-api-name').value.trim() || 'Custom API';
      
      if (!url) {
        alert('Bitte API URL eingeben');
        return;
      }
      
      try {
        const result = await window.softwareGenerator.connectAPI({ name, url });
        if (result.success) {
          alert(`✅ API "${name}" erfolgreich verbunden!`);
          document.getElementById('custom-api-url').value = '';
          document.getElementById('custom-api-name').value = '';
        } else {
          alert(`❌ Fehler: ${result.error}\n\nHinweis: Stelle sicher, dass D1 Schema deployed ist!`);
        }
      } catch (e) {
        alert(`❌ Fehler: ${e.message}`);
      }
    };
    
    window.generateCodeFromModules = () => {
      try {
        if (!window.factoryEngine) {
          alert('FactoryEngine nicht verfügbar');
          return;
        }
        
        const moduleIds = Array.from(window.factoryEngine.modules.keys());
        if (moduleIds.length === 0) {
          alert('Keine Module vorhanden');
          return;
        }
        
        const codeType = document.getElementById('code-type').value;
        const result = window.softwareGenerator.combineModules(moduleIds);
        
        if (result.success) {
          const codeResult = window.softwareGenerator.generateCode(codeType, {
            name: 'Generated Software',
            code: result.code,
            title: 'Generated App',
            styles: 'body { margin: 0; padding: 20px; }',
            content: '<h1>Generated App</h1>',
            scripts: result.code
          });
          
          if (codeResult.success) {
            window.softwareGenerator.exportCode(codeResult.id, 'file');
            alert('✅ Code erfolgreich generiert und heruntergeladen!');
          }
        } else {
          alert(`❌ Fehler: ${result.error}`);
        }
      } catch (e) {
        alert(`❌ Fehler: ${e.message}`);
      }
    };
    
    window.closeSoftwareGeneratorUI = () => {
      const modal = document.getElementById('software-generator-modal');
      if (modal) {
        modal.remove();
      }
      delete window.connectFreeAPI;
      delete window.connectCustomAPI;
      delete window.generateCodeFromModules;
      delete window.closeSoftwareGeneratorUI;
    };
    
  } catch (e) {
    console.error('Error opening Software Generator UI:', e);
    alert('Fehler beim Öffnen des Software Generators: ' + e.message);
  }
}

window.renderModules = renderModules;
window.selectModule = selectModule;
window.deleteModule = deleteModule;
window.handlePortClick = handlePortClick;
window.openModuleApp = openModuleApp;



