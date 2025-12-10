// Data Model - Export/Import
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
class DataModel {
  static exportToJSON() {
    try {
      if (!window.factoryEngine) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('FactoryEngine not initialized'), { context: 'exportToJSON' });
        } else {
          console.error('FactoryEngine not initialized');
        }
        return '{}';
      }
      return window.factoryEngine.save();
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'exportToJSON' });
      } else {
        console.error('Error exporting to JSON:', e);
      }
      return '{}';
    }
  }
  
  static exportToCSV() {
    try {
      if (!window.factoryEngine || !window.factoryEngine.modules) {
        return 'Module ID,Type,Name,X,Y\n';
      }
      const lines = ['Module ID,Type,Name,X,Y'];
      window.factoryEngine.modules.forEach((module) => {
        const name = (module.name || 'Unbekannt').replace(/,/g, ';');
        lines.push(`${module.id},${module.type},${name},${module.x || 0},${module.y || 0}`);
      });
      return lines.join('\n');
    } catch (e) {
      console.error('Error exporting to CSV:', e);
      return 'Module ID,Type,Name,X,Y\n';
    }
  }
  
  static importFromJSON(json) {
    try {
      if (!window.factoryEngine) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(new Error('FactoryEngine not initialized'), { context: 'importFromJSON' });
        } else {
          console.error('FactoryEngine not initialized');
        }
        return false;
      }
      return window.factoryEngine.load(json);
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'importFromJSON' });
      } else {
        console.error('Error importing from JSON:', e);
      }
      return false;
    }
  }
  
  static validate(data) {
    try {
      if (!data) return false;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (!parsed || typeof parsed !== 'object') return false;
      if (!parsed.modules || !Array.isArray(parsed.modules)) return false;
      if (!parsed.links || !Array.isArray(parsed.links)) return false;
      return true;
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'validate' });
      } else {
        console.error('Validation error:', e);
      }
      return false;
    }
  }
  
  static generateReport() {
    try {
      if (!window.factoryEngine || !window.factoryEngine.modules || !window.factoryEngine.links) {
        return {
          summary: { totalModules: 0, totalLinks: 0, moduleTypes: {} },
          modules: [],
          links: [],
          timestamp: new Date().toISOString(),
          error: 'FactoryEngine not initialized'
        };
      }
      
      const modules = Array.from(window.factoryEngine.modules.values());
      const links = Array.from(window.factoryEngine.links.values());
      
      return {
        summary: {
          totalModules: modules.length,
          totalLinks: links.length,
          moduleTypes: modules.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1;
            return acc;
          }, {})
        },
        modules: modules.map(m => ({
          id: m.id || 'unknown',
          type: m.type || 'unknown',
          name: m.name || 'Unbekannt',
          position: { x: m.x || 0, y: m.y || 0 },
          properties: m.properties || {}
        })),
        links: links.map(l => ({
          id: l.id || 'unknown',
          source: l.sourceModule || 'unknown',
          target: l.targetModule || 'unknown',
          type: l.type || 'material'
        })),
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(e, { context: 'generateReport' });
      } else {
        console.error('Error generating report:', e);
      }
      return {
        summary: { totalModules: 0, totalLinks: 0, moduleTypes: {} },
        modules: [],
        links: [],
        timestamp: new Date().toISOString(),
        error: e.message
      };
    }
  }
}

// Sicherstellen dass DataModel verfügbar ist
if (typeof window !== 'undefined') {
  window.DataModel = DataModel;
}



