/**
 * ============================================================================
 * REGISTRY MANAGER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Registry-Manager für Artefakt-Registry
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface Artifact {
  artifact_id: string;
  name: string;
  version: string;
  hash: string;
  timestamp: string;
  build_id: string;
  trace_id: string;
  provenance: {
    sbom?: string;
    signatures?: string[];
    attestations?: string[];
  };
  metadata: {
    author: string;
    toolchain: string;
    policies: string[];
    gates_passed: string[];
  };
}

export class RegistryManager {
  private registryPath: string;
  private registry: { artifacts: Artifact[] };

  constructor(registryPath: string = './registry/artifact-registry.json') {
    this.registryPath = registryPath;
    this.registry = this.loadRegistry();
  }

  /**
   * Lädt die Registry
   */
  private loadRegistry(): { artifacts: Artifact[] } {
    if (fs.existsSync(this.registryPath)) {
      const content = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(content);
    }
    return { artifacts: [] };
  }

  /**
   * Speichert die Registry
   */
  private saveRegistry(): void {
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2));
  }

  /**
   * Registriert ein Artefakt
   */
  registerArtifact(artifact: Artifact): void {
    // Prüfe auf Duplikate
    const existing = this.registry.artifacts.find(a => a.artifact_id === artifact.artifact_id);
    if (existing) {
      throw new Error(`T,. Artefakt ${artifact.artifact_id} bereits registriert`);
    }

    // Validiere Hash
    if (!artifact.hash || artifact.hash.length !== 64) {
      throw new Error(`T,. Ungültiger Hash für Artefakt ${artifact.artifact_id}`);
    }

    // Validiere Timestamp
    if (!artifact.timestamp || !this.isValidISO8601(artifact.timestamp)) {
      throw new Error(`T,. Ungültiger Timestamp für Artefakt ${artifact.artifact_id}`);
    }

    this.registry.artifacts.push(artifact);
    this.saveRegistry();
  }

  /**
   * Berechnet Hash eines Artefakts
   */
  calculateHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Sucht Artefakte nach Kriterien
   */
  findArtifacts(criteria: Partial<Artifact>): Artifact[] {
    return this.registry.artifacts.filter(artifact => {
      return Object.keys(criteria).every(key => {
        const value = (criteria as any)[key];
        const artifactValue = (artifact as any)[key];
        
        if (Array.isArray(value)) {
          return value.every(v => artifactValue.includes(v));
        }
        
        return artifactValue === value;
      });
    });
  }

  /**
   * Validiert ISO 8601 Timestamp
   */
  private isValidISO8601(timestamp: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(timestamp);
  }

  /**
   * Erstellt Audit-Trail
   */
  createAuditTrail(artifactId: string): any {
    const artifact = this.registry.artifacts.find(a => a.artifact_id === artifactId);
    if (!artifact) {
      throw new Error(`T,. Artefakt ${artifactId} nicht gefunden`);
    }

    return {
      artifact_id: artifact.artifact_id,
      name: artifact.name,
      version: artifact.version,
      hash: artifact.hash,
      timestamp: artifact.timestamp,
      build_id: artifact.build_id,
      trace_id: artifact.trace_id,
      provenance: artifact.provenance,
      metadata: artifact.metadata,
      audit_trail: {
        registered_at: artifact.timestamp,
        verified: true,
        policies_compliant: artifact.metadata.gates_passed.length > 0,
      },
    };
  }
}

