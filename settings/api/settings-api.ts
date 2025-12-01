/**
 * Settings API
 * 
 * API für AI Gateway Integration
 * GET /api/settings/query
 * POST /api/settings/simulate-change
 * POST /api/settings/propose
 */

import type { SettingsNode, SettingsGraph } from '../schemas/settings.schema';
import { SettingsGraphLoader } from '../core/graph-loader';
import { MultiLayerValidator } from '../core/multi-layer-validator';
import { ModelRegistry } from '../core/model-registry';

/**
 * Settings API Handler
 */
export class SettingsAPI {
  private graphLoader: SettingsGraphLoader;
  private validator: MultiLayerValidator;
  private modelRegistry: ModelRegistry;
  private settingsPath: string;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.graphLoader = new SettingsGraphLoader(settingsPath);
    this.validator = new MultiLayerValidator(settingsPath);
    this.modelRegistry = new ModelRegistry(this.graphLoader);
  }

  /**
   * Query Settings
   * GET /api/settings/query
   */
  async querySettings(params: {
    projectId?: string;
    environment?: string;
    type?: string;
    scope?: string;
    id?: string;
  }): Promise<{
    nodes: SettingsNode[];
    graph: {
      nodeCount: number;
      edgeCount: number;
    };
  }> {
    const graph = await this.graphLoader.loadGraph(params.projectId, params.environment);

    let nodes = Array.from(graph.nodes.values());

    // Filter nach Type
    if (params.type) {
      nodes = nodes.filter(n => n.type === params.type);
    }

    // Filter nach Scope
    if (params.scope) {
      nodes = nodes.filter(n => n.scope.includes(params.scope as any));
    }

    // Filter nach ID
    if (params.id) {
      nodes = nodes.filter(n => n.id === params.id);
    }

    return {
      nodes,
      graph: {
        nodeCount: graph.nodes.size,
        edgeCount: Array.from(graph.edges.values()).reduce((sum, edges) => sum + edges.length, 0)
      }
    };
  }

  /**
   * Simulate Change
   * POST /api/settings/simulate-change
   */
  async simulateChange(proposal: {
    nodeId: string;
    changes: Partial<SettingsNode>;
  }): Promise<{
    valid: boolean;
    validation: any;
    impact: {
      affectedNodes: string[];
      dimensionalImpact?: any;
    };
  }> {
    // Lade Original Node
    const originalNode = await this.graphLoader.loadNodeById(proposal.nodeId);
    if (!originalNode) {
      throw new Error(`Node not found: ${proposal.nodeId}`);
    }

    // Erstelle Proposal Node
    const proposalNode: SettingsNode = {
      ...originalNode,
      ...proposal.changes,
      meta: {
        ...originalNode.meta,
        updatedAt: new Date().toISOString()
      }
    };

    // Validiere
    const validation = await this.validator.validateNode(proposalNode);

    // Berechne Impact
    const dependents = this.graphLoader.getDependents(proposal.nodeId);
    const affectedNodes = dependents.map(n => n.id);

    return {
      valid: validation.valid,
      validation,
      impact: {
        affectedNodes,
        dimensionalImpact: proposalNode.dimensions
      }
    };
  }

  /**
   * Propose Change (LLM)
   * POST /api/settings/propose
   */
  async proposeChange(proposal: {
    nodeId: string;
    changes: Partial<SettingsNode>;
    rationale: string;
    proposedBy: string;
    llmModel?: string;
  }): Promise<{
    proposalId: string;
    validation: any;
    status: 'pending' | 'approved' | 'rejected';
  }> {
    // Simuliere Change
    const simulation = await this.simulateChange({
      nodeId: proposal.nodeId,
      changes: proposal.changes
    });

    // Erstelle Proposal Node
    const proposalId = `proposal:${Date.now()}:${proposal.nodeId}`;
    const proposalNode: SettingsNode = {
      id: proposalId,
      type: 'verify.build',
      version: '1.0.0',
      scope: ['global'],
      meta: {
        owner: proposal.proposedBy,
        createdAt: new Date().toISOString(),
        checksum: 'pending',
        description: `Proposal for ${proposal.nodeId}: ${proposal.rationale}`
      },
      data: {
        result: simulation.valid ? 'pending' : 'failed',
        checks: ['schema', 'dimensional', 'semantic', 'compliance'],
        artifacts: []
      }
    };

    // Speichere Proposal (in Produktion: in D1 DB)
    // await this.saveProposal(proposalNode);

    return {
      proposalId,
      validation: simulation.validation,
      status: simulation.valid ? 'pending' : 'rejected'
    };
  }

  /**
   * Get Model for Task
   * GET /api/settings/model-for-task
   */
  async getModelForTask(task: string, constraints?: {
    maxLatency?: number;
    costCeiling?: number;
    energyCeiling?: number;
  }): Promise<{
    model: SettingsNode | null;
    score?: number;
    alternatives?: Array<{ model: SettingsNode; score: number }>;
  }> {
    await this.modelRegistry.initialize();

    const model = this.modelRegistry.findModelForTask(task, constraints);

    if (!model) {
      return { model: null };
    }

    // Berechne Score
    const score = constraints
      ? this.modelRegistry.calculateModelScore(model, constraints)
      : undefined;

    // Finde Alternativen
    const allModels = this.modelRegistry.listModels();
    const alternatives = allModels
      .filter(m => m.id !== model.id)
      .map(m => ({
        model: m,
        score: constraints ? this.modelRegistry.calculateModelScore(m, constraints) : 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      model,
      score,
      alternatives
    };
  }

  /**
   * Get Graph
   */
  async getGraph(projectId?: string, environment?: string): Promise<SettingsGraph> {
    return await this.graphLoader.loadGraph(projectId, environment);
  }
}








