#!/bin/bash
# ============================================================================
# AUTO AUTOMATION SCRIPT
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Auto Automation - Führt vollständige Automatisierung durch
# ============================================================================

set -e

PROJECT_NAME="${1:-}"
PROVIDER="${2:-openrouter}"

echo "T,. Auto Automation: Starte vollständige Automatisierung..."
echo ""

# Prüfe Node.js
if ! command -v node &> /dev/null; then
    echo "T,. FEHLER: Node.js nicht gefunden!"
    exit 1
fi

# Führe Auto-Automation aus
node -e "
const { AutoAutomation } = require('./Fabrikage.AutoExecution/automation/auto-automation.ts');
const automation = new AutoAutomation();
automation.automate('$PROJECT_NAME', '$PROVIDER').catch(console.error);
"

echo ""
echo "T,. Auto Automation: Abgeschlossen ✓"

