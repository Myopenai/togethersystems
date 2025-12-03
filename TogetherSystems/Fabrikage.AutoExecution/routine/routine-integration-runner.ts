/**
 * ============================================================================
 * ROUTINE INTEGRATION RUNNER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Routine Integration Runner - Führt Routine-Integration aus
 * ============================================================================
 */

import { RoutineIntegration } from './routine-integration';

// Führe Routine-Integration aus
if (require.main === module) {
  const integration = new RoutineIntegration();
  integration.integrate().catch((error) => {
    console.error('T,. Routine Integration fehlgeschlagen:', error);
    process.exit(1);
  });
}

