// T,. NEURAL NETWORK UPDATE
// Endausbau für das Gesamtsystem: Portal, Manifest, OS, Telbank, Legal, Rooms, Business, Survey

class NeuralNetworkSystem {
  constructor() {
    this.network = {
      nodes: [],
      connections: [],
      patterns: {},
      weights: {}
    };
    this.init();
  }

  init() {
    // Initialisiere Netzwerk-Knoten für alle System-Komponenten
    this.addNode('portal', 'Portal', { type: 'component', category: 'frontend' });
    this.addNode('manifest', 'Manifest', { type: 'component', category: 'data' });
    this.addNode('os', 'OS', { type: 'component', category: 'system' });
    this.addNode('telbank', 'Telbank', { type: 'component', category: 'financial' });
    this.addNode('legal', 'Legal', { type: 'component', category: 'compliance' });
    this.addNode('rooms', 'Rooms', { type: 'component', category: 'communication' });
    this.addNode('business', 'Business', { type: 'component', category: 'business' });
    this.addNode('survey', 'Survey', { type: 'component', category: 'data-collection' });

    // Verbindungen zwischen Komponenten
    this.addConnection('portal', 'manifest', { weight: 0.9, type: 'data-flow' });
    this.addConnection('portal', 'os', { weight: 0.8, type: 'integration' });
    this.addConnection('manifest', 'os', { weight: 0.7, type: 'data-flow' });
    this.addConnection('os', 'telbank', { weight: 0.6, type: 'integration' });
    this.addConnection('os', 'legal', { weight: 0.6, type: 'integration' });
    this.addConnection('os', 'rooms', { weight: 0.7, type: 'integration' });
    this.addConnection('os', 'business', { weight: 0.8, type: 'integration' });
    this.addConnection('portal', 'survey', { weight: 0.5, type: 'data-flow' });
    this.addConnection('telbank', 'legal', { weight: 0.5, type: 'compliance' });
    this.addConnection('rooms', 'business', { weight: 0.6, type: 'data-flow' });

    // Lerne Patterns
    this.learnPatterns();

    console.log('✅ Neural Network System initialisiert');
  }

  addNode(id, name, metadata = {}) {
    this.network.nodes.push({
      id,
      name,
      metadata,
      activation: 0,
      timestamp: Date.now()
    });
  }

  addConnection(from, to, metadata = {}) {
    this.network.connections.push({
      from,
      to,
      weight: metadata.weight || 0.5,
      type: metadata.type || 'default',
      timestamp: Date.now()
    });
  }

  learnPatterns() {
    // Lerne Patterns für verschiedene Szenarien
    this.network.patterns = {
      'user-install-app': {
        nodes: ['portal', 'os'],
        sequence: ['portal.select', 'os.install'],
        weight: 0.9
      },
      'user-create-manifest': {
        nodes: ['portal', 'manifest'],
        sequence: ['portal.create', 'manifest.publish'],
        weight: 0.8
      },
      'user-transaction': {
        nodes: ['os', 'telbank'],
        sequence: ['os.initiate', 'telbank.transact'],
        weight: 0.7
      },
      'user-sign-contract': {
        nodes: ['os', 'legal'],
        sequence: ['os.open', 'legal.sign'],
        weight: 0.8
      },
      'user-join-room': {
        nodes: ['os', 'rooms'],
        sequence: ['os.open', 'rooms.join'],
        weight: 0.7
      },
      'user-business-action': {
        nodes: ['os', 'business'],
        sequence: ['os.open', 'business.execute'],
        weight: 0.8
      },
      'user-complete-survey': {
        nodes: ['portal', 'survey'],
        sequence: ['portal.open', 'survey.complete'],
        weight: 0.6
      }
    };
  }

  activateNode(nodeId, value = 1.0) {
    const node = this.network.nodes.find(n => n.id === nodeId);
    if (node) {
      node.activation = Math.min(1.0, node.activation + value);
      node.timestamp = Date.now();
      
      // Propagate zu verbundenen Knoten
      this.propagateActivation(nodeId);
    }
  }

  propagateActivation(nodeId) {
    const connections = this.network.connections.filter(c => c.from === nodeId);
    connections.forEach(conn => {
      const targetNode = this.network.nodes.find(n => n.id === conn.to);
      if (targetNode) {
        const activation = this.network.nodes.find(n => n.id === nodeId).activation * conn.weight;
        targetNode.activation = Math.min(1.0, targetNode.activation + activation * 0.1);
      }
    });
  }

  predictNextAction(currentContext) {
    // Finde passende Patterns
    const matches = Object.entries(this.network.patterns)
      .filter(([patternId, pattern]) => {
        return pattern.nodes.some(node => currentContext.includes(node));
      })
      .sort((a, b) => b[1].weight - a[1].weight);

    if (matches.length > 0) {
      const [patternId, pattern] = matches[0];
      return {
        pattern: patternId,
        nextSteps: pattern.sequence,
        confidence: pattern.weight
      };
    }

    return null;
  }

  getNetworkState() {
    return {
      nodes: this.network.nodes.map(n => ({
        id: n.id,
        name: n.name,
        activation: n.activation,
        category: n.metadata.category
      })),
      connections: this.network.connections.map(c => ({
        from: c.from,
        to: c.to,
        weight: c.weight,
        type: c.type
      })),
      patterns: Object.keys(this.network.patterns).length
    };
  }

  exportNetwork() {
    return JSON.stringify(this.network, null, 2);
  }
}

// Global verfügbar
window.NeuralNetworkSystem = NeuralNetworkSystem;

// Auto-Init
if (typeof window !== 'undefined') {
  window.neuralNetwork = new NeuralNetworkSystem();
  
  // Integriere mit OSOS
  document.addEventListener('DOMContentLoaded', () => {
    // Track User-Actions
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.id === 'installApp') {
        window.neuralNetwork.activateNode('os', 0.3);
        window.neuralNetwork.activateNode('portal', 0.2);
      } else if (target.id === 'openManifestWindow') {
        window.neuralNetwork.activateNode('manifest', 0.3);
        window.neuralNetwork.activateNode('portal', 0.2);
      } else if (target.id === 'openSurvey') {
        window.neuralNetwork.activateNode('survey', 0.3);
        window.neuralNetwork.activateNode('portal', 0.2);
      } else if (target.id === 'donate') {
        window.neuralNetwork.activateNode('telbank', 0.2);
      }
    });
  });
}

