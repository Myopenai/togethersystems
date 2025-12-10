// Main Application Logic
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
function handleDragStart(event) {
  try {
    if (!event || !event.target) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('Invalid drag event'), { context: 'handleDragStart' });
      } else {
        console.error('Invalid drag event');
      }
      return;
    }
    
    const moduleType = event.target.dataset.module;
    if (!moduleType) {
      console.error('No module type in dataset');
      return;
    }
    
    if (!window.factoryEngine) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    window.factoryEngine.draggedModule = moduleType;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'handleDragStart' });
    } else {
      console.error('Error in handleDragStart:', e);
    }
  }
}

function handleDragOver(event) {
  try {
    if (!event) {
      return;
    }
    
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'handleDragOver' });
    } else {
      console.error('Error in handleDragOver:', e);
    }
  }
}

function handleDrop(event) {
  try {
    event.preventDefault();
    const workspace = document.getElementById('workspace');
    if (!workspace) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('workspace not found'), { context: 'handleDrop' });
      } else {
        console.error('workspace not found');
      }
      return;
    }
    
    if (!window.factoryEngine) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('FactoryEngine not initialized'), { context: 'handleDrop' });
      } else {
        console.error('FactoryEngine not initialized');
      }
      return;
    }
    
    const rect = workspace.getBoundingClientRect();
    const x = event.clientX - rect.left - 100;
    const y = event.clientY - rect.top - 60;
    
    if (window.factoryEngine.draggedModule) {
      const module = window.factoryEngine.createModule(
        window.factoryEngine.draggedModule,
        Math.max(0, x),
        Math.max(0, y)
      );
      window.factoryEngine.draggedModule = null;
      
      if (typeof window.renderModules === 'function') {
        window.renderModules();
      }
      if (typeof window.renderLinks === 'function') {
        window.renderLinks();
      }
    }
  } catch (e) {
    console.error('Error in handleDrop:', e);
  }
}

function saveConfiguration() {
  try {
    if (!window.factoryEngine) {
      alert('Fehler: System nicht initialisiert');
      return;
    }
    
    const data = window.factoryEngine.save();
    if (!data) {
      alert('Fehler: Keine Daten zum Speichern');
      return;
    }
    
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fabrikage-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Konfiguration gespeichert!');
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'saveConfiguration' });
    } else {
      console.error('Error saving configuration:', e);
    }
    alert('Fehler beim Speichern: ' + e.message);
  }
}

function loadConfiguration() {
  try {
    if (!window.factoryEngine) {
      alert('Fehler: System nicht initialisiert');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target.result;
            if (!data) {
              alert('Fehler: Datei ist leer');
              return;
            }
            
            if (window.factoryEngine.load(data)) {
              alert('Konfiguration geladen!');
            } else {
              alert('Fehler beim Laden der Konfiguration! Bitte prüfe die Datei.');
            }
          } catch (e) {
            console.error('Error loading file:', e);
            alert('Fehler beim Laden: ' + e.message);
          }
        };
        reader.onerror = () => {
          alert('Fehler beim Lesen der Datei');
        };
        reader.readAsText(file);
      } catch (e) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(e, { context: 'loadConfiguration-input' });
        } else {
          console.error('Error in file input handler:', e);
        }
        alert('Fehler: ' + e.message);
      }
    };
    input.click();
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'loadConfiguration' });
    } else {
      console.error('Error in loadConfiguration:', e);
    }
    alert('Fehler beim Öffnen des Datei-Dialogs');
  }
}

function resetFactory() {
  try {
    if (!window.factoryEngine) {
      alert('Fehler: System nicht initialisiert');
      return;
    }
    
    if (confirm('Wirklich alle Module und Verbindungen löschen?')) {
      window.factoryEngine.modules.clear();
      window.factoryEngine.links.clear();
      window.factoryEngine.selectedModule = null;
      window.factoryEngine.connectingPort = null;
      window.factoryEngine.updateCounts();
      
      if (typeof window.renderModules === 'function') {
        window.renderModules();
      }
      if (typeof window.renderLinks === 'function') {
        window.renderLinks();
      }
      
      const inspector = document.getElementById('inspector');
      if (inspector) {
        inspector.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('Error resetting factory:', e);
    alert('Fehler beim Zurücksetzen: ' + e.message);
  }
}

function closeInspector() {
  try {
    const inspector = document.getElementById('inspector');
    if (inspector) {
      inspector.style.display = 'none';
    }
    
    if (window.factoryEngine) {
      window.factoryEngine.selectedModule = null;
    }
    
    if (typeof window.renderModules === 'function') {
      window.renderModules();
    }
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'closeInspector' });
    } else {
      console.error('Error closing inspector:', e);
    }
  }
}

// Initialize - Wird jetzt von index.html gesteuert
// Diese Funktion wird nur als Fallback verwendet
function initializeMain() {
  try {
    if (typeof window.factoryEngine === 'undefined') {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('FactoryEngine not available in main.js initialization'), { context: 'initializeMain', severity: 'warning' });
      } else {
        console.warn('FactoryEngine not available in main.js initialization');
      }
      return;
    }
    
    // Warte kurz, damit alle Skripte geladen sind
    setTimeout(() => {
      if (typeof window.renderModules === 'function') {
        window.renderModules();
      }
      if (typeof window.renderLinks === 'function') {
        window.renderLinks();
      }
      if (window.factoryEngine && typeof window.factoryEngine.updateCounts === 'function') {
        window.factoryEngine.updateCounts();
      }
    }, 100);
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'initializeMain' });
    } else {
      console.error('Error during main.js initialization:', e);
    }
  }
}

// Nur initialisieren wenn nicht bereits von index.html initialisiert
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMain);
} else {
  // DOM bereits geladen, aber warte kurz
  setTimeout(initializeMain, 200);
}

// Export functions
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.saveConfiguration = saveConfiguration;
window.loadConfiguration = loadConfiguration;
window.resetFactory = resetFactory;
window.closeInspector = closeInspector;



