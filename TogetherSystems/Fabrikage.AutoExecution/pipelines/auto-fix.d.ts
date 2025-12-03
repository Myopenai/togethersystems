/**
 * ============================================================================
 * AUTO-FIX PIPELINE - TYPE DEFINITIONS
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Type Definitions für Auto-Fix Pipeline
 * ============================================================================
 */

export class AutoFixPipeline {
  constructor(rootDir: string);
  clean(): Promise<void>;
  encodingCheck(): Promise<void>;
}

