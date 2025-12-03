/**
 * Model Registry
 * 
 * Verwaltet NN-Modelle, Tasks, Routing Policies
 */

import type { NNModelNode, PolicyRouteNode, NNTaskNode } from '../schemas/settings.schema';
import { SettingsGraphLoader } from './graph-loader';

/**
 * Model Registry
 */
export class ModelRegistry {
  private graphLoader: SettingsGraphLoader;
  private models: Map<string, NNModelNode> = new Map();
  private policies: Map<string, PolicyRouteNode> = new Map();
  private tasks: Map<string, NNTaskNode> = new Map();

  constructor(graphLoader: SettingsGraphLoader) {
    this.graphLoader = graphLoader;
  }

  /**
   * Initialisiert Registry
   */
  async initialize(): Promise<void> {
    const graph = await this.graphLoader.loadGraph();

    // Lade Models
    const modelNodes = this.graphLoader.findNodesByType('nn.model');
    for (const node of modelNodes) {
      this.models.set(node.id, node as NNModelNode);
    }

    // Lade Policies
    const policyNodes = this.graphLoader.findNodesByType('policy.route');
    for (const node of policyNodes) {
      this.policies.set(node.id, node as PolicyRouteNode);
    }

    // Lade Tasks
    const taskNodes = this.graphLoader.findNodesByType('nn.task');
    for (const node of taskNodes) {
      this.tasks.set(node.id, node as NNTaskNode);
    }
  }

  /**
   * Findet Model für Task
   */
  findModelForTask(task: string, constraints?: {
    maxLatency?: number;
    costCeiling?: number;
    energyCeiling?: number;
  }): NNModelNode | null {
    // Finde Policy für Task
    const policy = Array.from(this.policies.values())
      .find(p => p.data.task === task);

    if (!policy) {
      return null;
    }

    // Filtere Candidates nach Constraints
    let candidates = policy.data.candidates;

    if (constraints) {
      // Filter nach Constraints
      candidates = candidates.filter(candidate => {
        const model = this.models.get(candidate.target);
        if (!model) return false;

        // Prüfe Latency
        if (constraints.maxLatency && model.data.performance?.latency?.p95) {
          const latency = model.data.performance.latency.p95.value;
          if (latency > constraints.maxLatency) {
            return false;
          }
        }

        // Prüfe Cost (wenn verfügbar)
        // In Produktion: echte Cost-Prüfung

        // Prüfe Energy (wenn verfügbar)
        // In Produktion: echte Energy-Prüfung

        return true;
      });
    }

    // Sortiere nach Score
    candidates.sort((a, b) => b.score - a.score);

    // Return best candidate
    if (candidates.length > 0) {
      return this.models.get(candidates[0].target) || null;
    }

    return null;
  }

  /**
   * Listet alle Models
   */
  listModels(): NNModelNode[] {
    return Array.from(this.models.values());
  }

  /**
   * Gibt Model zurück
   */
  getModel(modelId: string): NNModelNode | null {
    return this.models.get(modelId) || null;
  }

  /**
   * Listet alle Policies
   */
  listPolicies(): PolicyRouteNode[] {
    return Array.from(this.policies.values());
  }

  /**
   * Gibt Policy zurück
   */
  getPolicy(policyId: string): PolicyRouteNode | null {
    return this.policies.get(policyId) || null;
  }

  /**
   * Listet alle Tasks
   */
  listTasks(): NNTaskNode[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Gibt Task zurück
   */
  getTask(taskId: string): NNTaskNode | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Berechnet Model Score für Constraints
   */
  calculateModelScore(
    model: NNModelNode,
    constraints: {
      maxLatency?: number;
      costCeiling?: number;
      energyCeiling?: number;
    }
  ): number {
    let score = 1.0;

    // Latency Score
    if (constraints.maxLatency && model.data.performance?.latency?.p95) {
      const latency = model.data.performance.latency.p95.value;
      const latencyRatio = latency / constraints.maxLatency;
      score *= Math.max(0, 1 - latencyRatio);
    }

    // Cost Score (wenn verfügbar)
    // In Produktion: echte Cost-Berechnung

    // Energy Score (wenn verfügbar)
    // In Produktion: echte Energy-Berechnung

    return Math.max(0, Math.min(1, score));
  }
}

