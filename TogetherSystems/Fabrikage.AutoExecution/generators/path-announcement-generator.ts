/**
 * ============================================================================
 * PATH ANNOUNCEMENT GENERATOR
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Path-Announcement-Generator - Integriert in alle Generatoren
 * ============================================================================
 */

import { PathAnnouncer, PathAnnouncement } from '../../Fabrikage.ProvenanceLedger/registry/path-announcer';
import { RegistryManager } from '../../Fabrikage.ProvenanceLedger/registry/registry-manager';

export class PathAnnouncementGenerator {
  private announcer: PathAnnouncer;
  private registry: RegistryManager;

  constructor(registry: RegistryManager, announcer: PathAnnouncer) {
    this.registry = registry;
    this.announcer = announcer;
  }

  /**
   * Wrapper für Generator-Operationen mit automatischem Path-Announcement
   */
  async generateWithAnnouncement<T>(
    generatorFn: () => Promise<T>,
    module: string,
    filePath: string,
    anchor?: string
  ): Promise<{ result: T; announcement: PathAnnouncement }> {
    // Führe Generator aus
    const result = await generatorFn();

    // Kündige Erstellung an
    const announcement = this.announcer.announceCreated(filePath, module, anchor);

    // Registriere in Registry
    const hash = this.registry.calculateHash(filePath);
    this.registry.registerArtifact({
      artifact_id: announcement.artifact_id,
      name: filePath,
      version: '1.0.0',
      hash: hash,
      timestamp: announcement.timestamp,
      build_id: `build-${Date.now()}`,
      trace_id: `trace-${Date.now()}`,
      provenance: {},
      metadata: {
        author: 'system',
        toolchain: 'node@20',
        policies: [],
        gates_passed: [],
      },
    });

    return { result, announcement };
  }
}

