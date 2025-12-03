/**
 * Settings Graph Loader
 * 
 * Baut Settings-Graph aus Manifest und Nodes
 * Lazy-Loading, Dependency Resolution, Caching
 */

import type {
  SettingsNode,
  SettingsGraph,
  SettingsManifest,
  NodeType,
  Scope
} from '../schemas/settings.schema';
import fs from 'fs';
import path from 'path';

/**
 * Settings Graph Loader
 */
export class SettingsGraphLoader {
  private settingsPath: string;
  private graph: SettingsGraph;
  private cache: Map<string, SettingsNode> = new Map();

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      manifest: this.loadManifest()
    };
  }

  /**
   * Lädt Settings Manifest
   */
  private loadManifest(): SettingsManifest {
    const manifestPath = path.join(this.settingsPath, 'settings-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      // Default Manifest
      return {
        settingsManifestVersion: '0.9.0',
        indexes: {
          types: [
            'runtime.profile',
            'build.target',
            'nn.model',
            'policy.route',
            'mcp.tool',
            'employee.role',
            'deploy.target',
            'autofix.pattern',
            'playwright.profile',
            'encryption.policy',
            'database',
            'verify.build',
            'nn.task'
          ],
          scopes: ['global', 'env', 'project', 'service', 'feature', 'employee']
        },
        schemas: {
          'runtime.profile': 'schemas/runtime.profile.json',
          'build.target': 'schemas/build.target.json',
          'nn.model': 'schemas/nn.model.json',
          'policy.route': 'schemas/policy.route.json',
          'mcp.tool': 'schemas/mcp.tool.json',
          'employee.role': 'schemas/employee.role.json',
          'deploy.target': 'schemas/deploy.target.json',
          'autofix.pattern': 'schemas/autofix.pattern.json',
          'playwright.profile': 'schemas/playwright.profile.json',
          'encryption.policy': 'schemas/encryption.policy.json',
          'database': 'schemas/database.json',
          'verify.build': 'schemas/verify.build.json',
          'nn.task': 'schemas/nn.task.json'
        },
        validation: {
          layers: ['schema', 'dimensional', 'semantic', 'compliance'],
          units: 'schemas/units.registry.json'
        }
      };
    }

    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  /**
   * Lädt Settings Graph
   */
  async loadGraph(projectId?: string, environment?: string): Promise<SettingsGraph> {
    // Lade alle Nodes
    await this.loadAllNodes(projectId, environment);

    // Resolve Dependencies
    this.resolveDependencies();

    return this.graph;
  }

  /**
   * Lädt alle Nodes
   */
  private async loadAllNodes(projectId?: string, environment?: string): Promise<void> {
    const nodesPath = path.join(this.settingsPath, 'nodes');
    
    if (!fs.existsSync(nodesPath)) {
      return;
    }

    const files = fs.readdirSync(nodesPath, { recursive: true })
      .filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(nodesPath, file);
      const node = this.loadNode(filePath);

      if (node) {
        // Filter nach Scope
        if (this.matchesScope(node, projectId, environment)) {
          this.graph.nodes.set(node.id, node);
          this.cache.set(node.id, node);
        }
      }
    }
  }

  /**
   * Lädt einzelne Node
   */
  private loadNode(filePath: string): SettingsNode | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const node = JSON.parse(content) as SettingsNode;

      // Validiere Node
      if (!this.validateNodeStructure(node)) {
        console.warn(`Invalid node structure: ${filePath}`);
        return null;
      }

      return node;
    } catch (error) {
      console.error(`Error loading node ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Validiert Node-Struktur
   */
  private validateNodeStructure(node: any): node is SettingsNode {
    return (
      node.id &&
      node.type &&
      node.version &&
      Array.isArray(node.scope) &&
      node.meta &&
      node.meta.owner &&
      node.meta.createdAt &&
      node.meta.checksum
    );
  }

  /**
   * Prüft ob Node Scope matcht
   */
  private matchesScope(node: SettingsNode, projectId?: string, environment?: string): boolean {
    // Global immer inkludieren
    if (node.scope.includes('global')) {
      return true;
    }

    // Environment-Filter
    if (environment) {
      const envScope = `env:${environment}`;
      if (node.scope.includes(envScope)) {
        return true;
      }
    }

    // Project-Filter
    if (projectId) {
      const projectScope = `project:${projectId}`;
      if (node.scope.includes(projectScope)) {
        return true;
      }
    }

    // Wenn keine Filter: alle inkludieren
    if (!projectId && !environment) {
      return true;
    }

    return false;
  }

  /**
   * Resolved Dependencies
   */
  private resolveDependencies(): void {
    for (const [nodeId, node] of this.graph.nodes) {
      if (node.dependencies) {
        const edges: Array<{ target: string; edge: any; constraints?: any }> = [];

        for (const dep of node.dependencies) {
          // Prüfe ob Target existiert
          if (this.graph.nodes.has(dep.target)) {
            edges.push(dep);
          } else {
            console.warn(`Dependency target not found: ${dep.target} (from ${nodeId})`);
          }
        }

        this.graph.edges.set(nodeId, edges);
      }
    }
  }

  /**
   * Lädt Node (lazy)
   */
  async loadNodeById(nodeId: string): Promise<SettingsNode | null> {
    // Prüfe Cache
    if (this.cache.has(nodeId)) {
      return this.cache.get(nodeId)!;
    }

    // Lade aus Graph
    if (this.graph.nodes.has(nodeId)) {
      return this.graph.nodes.get(nodeId)!;
    }

    // Versuche aus Datei zu laden
    const node = await this.loadNodeFromFile(nodeId);
    if (node) {
      this.graph.nodes.set(nodeId, node);
      this.cache.set(nodeId, node);
      return node;
    }

    return null;
  }

  /**
   * Lädt Node aus Datei
   */
  private async loadNodeFromFile(nodeId: string): Promise<SettingsNode | null> {
    // Parse Node ID: settings://{scope}/{type}/{name}
    const match = nodeId.match(/^settings:\/\/([^/]+)\/([^/]+)\/(.+)$/);
    if (!match) {
      return null;
    }

    const [, scope, type, name] = match;
    const fileName = `${type}.${name}.json`;
    const filePath = path.join(this.settingsPath, 'nodes', scope, fileName);

    if (fs.existsSync(filePath)) {
      return this.loadNode(filePath);
    }

    return null;
  }

  /**
   * Findet Nodes nach Typ
   */
  findNodesByType(type: NodeType): SettingsNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(node => node.type === type);
  }

  /**
   * Findet Nodes nach Scope
   */
  findNodesByScope(scope: Scope): SettingsNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(node => node.scope.includes(scope));
  }

  /**
   * Findet Dependencies
   */
  getDependencies(nodeId: string): SettingsNode[] {
    const edges = this.graph.edges.get(nodeId) || [];
    return edges
      .map(edge => this.graph.nodes.get(edge.target))
      .filter((node): node is SettingsNode => node !== undefined);
  }

  /**
   * Findet Dependents (reverse)
   */
  getDependents(nodeId: string): SettingsNode[] {
    const dependents: SettingsNode[] = [];

    for (const [id, edges] of this.graph.edges) {
      if (edges.some(edge => edge.target === nodeId)) {
        const node = this.graph.nodes.get(id);
        if (node) {
          dependents.push(node);
        }
      }
    }

    return dependents;
  }

  /**
   * Gibt Graph zurück
   */
  getGraph(): SettingsGraph {
    return this.graph;
  }
}

