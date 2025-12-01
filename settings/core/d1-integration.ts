/**
 * D1 Database Integration
 * 
 * Persistierung von Settings Graph in D1
 */

import type { SettingsNode, SettingsGraph, DependencyEdge } from '../schemas/settings.schema';

/**
 * D1 Integration Manager
 */
export class D1Integration {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Speichert Node in D1
   */
  async saveNode(node: SettingsNode): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO settings_nodes (
        id, type, version, scope, tags, meta, dimensions, 
        dependencies, semantics, data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      node.id,
      node.type,
      node.version,
      JSON.stringify(node.scope),
      node.tags ? JSON.stringify(node.tags) : null,
      JSON.stringify(node.meta),
      node.dimensions ? JSON.stringify(node.dimensions) : null,
      node.dependencies ? JSON.stringify(node.dependencies) : null,
      node.semantics ? JSON.stringify(node.semantics) : null,
      node.data ? JSON.stringify(node.data) : null,
      Date.now(),
      Date.now()
    ).run();
  }

  /**
   * Lädt Node aus D1
   */
  async loadNode(nodeId: string): Promise<SettingsNode | null> {
    const result = await this.db.prepare(`
      SELECT * FROM settings_nodes WHERE id = ?
    `).bind(nodeId).first();

    if (!result) {
      return null;
    }

    return {
      id: result.id as string,
      type: result.type as string,
      version: result.version as string,
      scope: JSON.parse(result.scope as string),
      tags: result.tags ? JSON.parse(result.tags as string) : undefined,
      meta: JSON.parse(result.meta as string),
      dimensions: result.dimensions ? JSON.parse(result.dimensions as string) : undefined,
      dependencies: result.dependencies ? JSON.parse(result.dependencies as string) : undefined,
      semantics: result.semantics ? JSON.parse(result.semantics as string) : undefined,
      data: result.data ? JSON.parse(result.data as string) : undefined
    } as SettingsNode;
  }

  /**
   * Speichert Edge in D1
   */
  async saveEdge(sourceId: string, edge: DependencyEdge): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO settings_edges (
        source_id, target_id, edge_type, constraints, required, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      sourceId,
      edge.target,
      edge.edge,
      edge.constraints ? JSON.stringify(edge.constraints) : null,
      edge.required ? 1 : 0,
      Date.now()
    ).run();
  }

  /**
   * Lädt Edges für Node
   */
  async loadEdges(nodeId: string): Promise<DependencyEdge[]> {
    const results = await this.db.prepare(`
      SELECT * FROM settings_edges WHERE source_id = ?
    `).bind(nodeId).all();

    return results.results.map((row: any) => ({
      target: row.target_id,
      edge: row.edge_type,
      constraints: row.constraints ? JSON.parse(row.constraints) : undefined,
      required: row.required === 1
    }));
  }

  /**
   * Lädt vollständigen Graph aus D1
   */
  async loadGraph(projectId?: string, environment?: string): Promise<SettingsGraph> {
    // Lade alle Nodes
    let query = 'SELECT * FROM settings_nodes';
    const params: any[] = [];

    if (projectId || environment) {
      // Filter nach Scope (vereinfacht)
      // In Produktion: bessere Scope-Filterung
    }

    const nodesResult = await this.db.prepare(query).bind(...params).all();
    const nodes = new Map<string, SettingsNode>();

    for (const row of nodesResult.results as any[]) {
      const node: SettingsNode = {
        id: row.id,
        type: row.type,
        version: row.version,
        scope: JSON.parse(row.scope),
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        meta: JSON.parse(row.meta),
        dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
        dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
        semantics: row.semantics ? JSON.parse(row.semantics) : undefined,
        data: row.data ? JSON.parse(row.data) : undefined
      };
      nodes.set(node.id, node);
    }

    // Lade alle Edges
    const edgesResult = await this.db.prepare('SELECT * FROM settings_edges').all();
    const edges = new Map<string, DependencyEdge[]>();

    for (const row of edgesResult.results as any[]) {
      const sourceId = row.source_id;
      if (!edges.has(sourceId)) {
        edges.set(sourceId, []);
      }
      edges.get(sourceId)!.push({
        target: row.target_id,
        edge: row.edge_type,
        constraints: row.constraints ? JSON.parse(row.constraints) : undefined,
        required: row.required === 1
      });
    }

    // Lade Manifest (aus Datei oder D1)
    const manifest = {
      settingsManifestVersion: '0.9.0',
      indexes: {
        types: [],
        scopes: []
      },
      schemas: {},
      validation: {
        layers: ['schema', 'dimensional', 'semantic', 'compliance'],
        units: 'schemas/units.registry.json'
      }
    };

    return {
      nodes,
      edges,
      manifest
    };
  }

  /**
   * Speichert Proposal
   */
  async saveProposal(proposal: {
    id: string;
    nodeId: string;
    changes: any;
    rationale: string;
    proposedBy: string;
    llmModel?: string;
    validationResult: any;
    status: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO settings_proposals (
        id, node_id, changes, rationale, proposed_by, llm_model,
        validation_result, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      proposal.id,
      proposal.nodeId,
      JSON.stringify(proposal.changes),
      proposal.rationale,
      proposal.proposedBy,
      proposal.llmModel || null,
      JSON.stringify(proposal.validationResult),
      proposal.status,
      Date.now()
    ).run();
  }

  /**
   * Loggt Audit Event
   */
  async logAudit(event: {
    action: string;
    nodeId?: string;
    userId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO settings_audit_log (
        action, node_id, user_id, changes, timestamp, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event.action,
      event.nodeId || null,
      event.userId || null,
      event.changes ? JSON.stringify(event.changes) : null,
      Date.now(),
      event.ipAddress || null,
      event.userAgent || null
    ).run();
  }
}








