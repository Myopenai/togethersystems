#!/bin/bash
# ============================================================================
# ROUTINE UPDATE SCRIPT
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Routine Update - Führt Routine-Update automatisch durch
# ============================================================================

set -e

echo "T,. Routine Update: Starte Routine-Update..."
echo ""

# Prüfe Node.js
if ! command -v node &> /dev/null; then
    echo "T,. FEHLER: Node.js nicht gefunden!"
    exit 1
fi

# Führe Routine-Update aus
node -e "
const { RoutineUpdateEngine } = require('./Fabrikage.AutoExecution/routine/routine-update-engine.ts');
const engine = new RoutineUpdateEngine();
engine.executeRoutineUpdate().catch(console.error);
"

echo ""
echo "T,. Routine Update: Abgeschlossen ✓"

