/**
 * Generated TypeScript Types for Settings-OS
 * 
 * Auto-generated from settings.schema.ts
 */

export * from '../schemas/settings.schema';

/**
 * Settings-OS API Types
 */
export interface SettingsQueryParams {
  projectId?: string;
  environment?: string;
  type?: string;
  scope?: string;
  id?: string;
}

export interface SettingsQueryResponse {
  nodes: SettingsNode[];
  graph: {
    nodeCount: number;
    edgeCount: number;
  };
}

export interface SimulateChangeRequest {
  nodeId: string;
  changes: Partial<SettingsNode>;
}

export interface SimulateChangeResponse {
  valid: boolean;
  validation: ValidationResult;
  impact: {
    affectedNodes: string[];
    dimensionalImpact?: Dimensions;
  };
}

export interface ProposeChangeRequest {
  nodeId: string;
  changes: Partial<SettingsNode>;
  rationale: string;
  proposedBy: string;
  llmModel?: string;
}

export interface ProposeChangeResponse {
  proposalId: string;
  validation: ValidationResult;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ModelForTaskRequest {
  task: string;
  constraints?: {
    maxLatency?: number;
    costCeiling?: number;
    energyCeiling?: number;
  };
}

export interface ModelForTaskResponse {
  model: SettingsNode | null;
  score?: number;
  alternatives?: Array<{
    model: SettingsNode;
    score: number;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  layer: 'schema' | 'dimensional' | 'semantic' | 'compliance';
  message: string;
  nodeId?: string;
  field?: string;
  value?: any;
}

export interface ValidationWarning {
  layer: 'schema' | 'dimensional' | 'semantic' | 'compliance';
  message: string;
  nodeId?: string;
  suggestion?: string;
}

