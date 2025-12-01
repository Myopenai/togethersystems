/**
 * Settings-OS Core Schema
 * 
 * Typisiertes Settings-Graph-Modell für industrielle, kontinuierliche Enterprise-Operationen
 * Auditable, dimensional, AI-native
 */

/**
 * Node Identity
 */
export interface NodeIdentity {
  id: string; // settings://{scope}/{type}/{name}
  type: NodeType;
  version: string; // Semantic versioning
  scope: Scope[];
  tags?: string[];
  meta: NodeMeta;
}

/**
 * Node Types
 */
export type NodeType =
  | "runtime.profile"
  | "build.target"
  | "nn.model"
  | "policy.route"
  | "mcp.tool"
  | "employee.role"
  | "deploy.target"
  | "autofix.pattern"
  | "playwright.profile"
  | "encryption.policy"
  | "database"
  | "verify.build"
  | "nn.task";

/**
 * Scope
 */
export type Scope = 
  | `global`
  | `env:${string}`
  | `project:${string}`
  | `service:${string}`
  | `feature:${string}`
  | `employee:${string}`;

/**
 * Node Meta
 */
export interface NodeMeta {
  owner: string;
  createdAt: string; // ISO 8601
  updatedAt?: string;
  checksum: string; // sha256:...
  description?: string;
}

/**
 * Dimensional Value
 */
export interface DimensionalValue {
  value: number;
  unit: Unit;
  constraints?: {
    min?: number;
    max?: number;
    target?: number;
  };
}

/**
 * Dimensions
 */
export interface Dimensions {
  latency?: DimensionalValue;
  cost?: DimensionalValue;
  energy?: DimensionalValue;
  throughput?: DimensionalValue;
  memory?: DimensionalValue;
  storage?: DimensionalValue;
  bandwidth?: DimensionalValue;
  temperature?: DimensionalValue;
}

/**
 * Units
 */
export type Unit =
  | "ms" | "s" | "min" | "h"
  | "EUR/hour" | "USD/hour" | "EUR" | "USD"
  | "W" | "kW" | "mW"
  | "req/s" | "ops/s" | "req/min"
  | "GB" | "GiB" | "MB" | "MiB" | "KB" | "B"
  | "B/s" | "KB/s" | "MB/s" | "GB/s" | "Gbps" | "Mbps"
  | "C" | "K" | "F";

/**
 * Dimension Types
 */
export type Dimension =
  | "Time"
  | "CostRate"
  | "Cost"
  | "Power"
  | "Throughput"
  | "Memory"
  | "Storage"
  | "Bandwidth"
  | "Temperature";

/**
 * Dependency Edge
 */
export interface DependencyEdge {
  target: string; // Node ID
  edge: EdgeType;
  constraints?: Partial<Dimensions>;
  required?: boolean;
}

/**
 * Edge Types
 */
export type EdgeType =
  | "requires"
  | "provides"
  | "conflicts"
  | "binds"
  | "routes-to"
  | "depends-on"
  | "uses";

/**
 * Semantic Rule
 */
export interface SemanticRule {
  expression: string; // e.g., "latency <= constraints.max"
  description?: string;
}

/**
 * Settings Node (Complete)
 */
export interface SettingsNode extends NodeIdentity {
  dimensions?: Dimensions;
  dependencies?: DependencyEdge[];
  semantics?: SemanticRule[];
  data?: Record<string, any>; // Type-specific data
}

/**
 * Runtime Profile Node
 */
export interface RuntimeProfileNode extends SettingsNode {
  type: "runtime.profile";
  data: {
    profile: "ai-lab" | "microservice" | "data-pipeline" | "sdr-stack" | "frontend-only";
    riskLevel?: "low" | "medium" | "high";
    energyProfile?: "low" | "medium" | "high";
    dataSensitivity?: "public" | "internal" | "confidential" | "restricted";
  };
}

/**
 * Build Target Node
 */
export interface BuildTargetNode extends SettingsNode {
  type: "build.target";
  data: {
    hardware: {
      class: "CPU" | "GPU" | "WASM" | "FPGA" | "ASIC";
      vendor?: string;
      device?: string;
    };
    isa?: string[];
    memory?: DimensionalValue;
    toolchain?: string[];
    artifacts?: {
      format: string;
      profile?: string;
    };
  };
}

/**
 * NN Model Node
 */
export interface NNModelNode extends SettingsNode {
  type: "nn.model";
  data: {
    vendor: string;
    tasks: string[];
    resources: {
      memory?: DimensionalValue;
      gpu?: {
        compute: string;
        vram?: DimensionalValue;
      };
      disk?: DimensionalValue;
    };
    performance?: {
      latency?: {
        p50?: DimensionalValue;
        p95?: DimensionalValue;
        p99?: DimensionalValue;
      };
      throughput?: DimensionalValue;
    };
    integrations?: string[];
    compliance?: string[];
  };
}

/**
 * Policy Route Node
 */
export interface PolicyRouteNode extends SettingsNode {
  type: "policy.route";
  data: {
    task: string;
    selectors: {
      maxLatency?: DimensionalValue;
      costCeiling?: DimensionalValue;
      energyCeiling?: DimensionalValue;
    };
    preferences?: string[];
    candidates: Array<{
      target: string;
      score: number;
    }>;
    semantics?: SemanticRule[];
  };
}

/**
 * MCP Tool Node
 */
export interface MCPToolNode extends SettingsNode {
  type: "mcp.tool";
  data: {
    service: string;
    capabilities: string[];
    reliability?: {
      score: number; // 0-1
    };
  };
}

/**
 * Employee Role Node
 */
export interface EmployeeRoleNode extends SettingsNode {
  type: "employee.role";
  data: {
    permissions: string[];
    aiAccess?: string[];
  };
}

/**
 * Deploy Target Node
 */
export interface DeployTargetNode extends SettingsNode {
  type: "deploy.target";
  data: {
    region: string;
    constraints?: {
      dataLocality?: string;
      energy?: DimensionalValue;
    };
    reliability?: {
      sla?: string;
      score?: number;
    };
  };
}

/**
 * AutoFix Pattern Node
 */
export interface AutoFixPatternNode extends SettingsNode {
  type: "autofix.pattern";
  data: {
    detect: string;
    propose: string;
    llmPrompt?: string;
    policies?: string[];
  };
}

/**
 * Playwright Profile Node
 */
export interface PlaywrightProfileNode extends SettingsNode {
  type: "playwright.profile";
  data: {
    timeout?: DimensionalValue;
    network?: {
      bandwidth?: DimensionalValue;
      latency?: DimensionalValue;
    };
    assertions?: string[];
  };
}

/**
 * Encryption Policy Node
 */
export interface EncryptionPolicyNode extends SettingsNode {
  type: "encryption.policy";
  data: {
    alg: string;
    keyRouting?: string[];
    rotation?: {
      interval?: DimensionalValue;
      grace?: DimensionalValue;
    };
  };
}

/**
 * Database Node
 */
export interface DatabaseNode extends SettingsNode {
  type: "database";
  data: {
    host: string;
    reliability?: {
      score: number;
    };
  };
}

/**
 * Verify Build Node
 */
export interface VerifyBuildNode extends SettingsNode {
  type: "verify.build";
  data: {
    result: "passed" | "failed" | "pending";
    checks: string[];
    signedBy?: string;
    signature?: string;
    artifacts?: Array<{
      id: string;
      checksum: string;
      target?: string;
    }>;
  };
}

/**
 * NN Task Node
 */
export interface NNTaskNode extends SettingsNode {
  type: "nn.task";
  data: {
    policies?: string[];
    models?: string[];
  };
}

/**
 * Settings Graph
 */
export interface SettingsGraph {
  nodes: Map<string, SettingsNode>;
  edges: Map<string, DependencyEdge[]>;
  manifest: SettingsManifest;
}

/**
 * Settings Manifest
 */
export interface SettingsManifest {
  settingsManifestVersion: string;
  indexes: {
    types: NodeType[];
    scopes: string[];
  };
  schemas: Record<NodeType, string>;
  validation: {
    layers: string[];
    units: string;
  };
}

/**
 * Unit Rule
 */
export interface UnitRule {
  unit: Unit;
  dimension: Dimension;
  convertTo?: Unit;
  factor?: number;
}

/**
 * Units Registry
 */
export interface UnitsRegistry {
  rules: UnitRule[];
  canonical: Record<Dimension, Unit>;
}








