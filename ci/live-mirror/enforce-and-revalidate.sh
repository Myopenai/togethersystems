#!/usr/bin/env bash
# FABRIKAGE MIRROR ENFORCE AND REVALIDATE
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0
# STANDARD: IBM STANDARD - PERMANENT AKTIV

set -euo pipefail

AUTOFIX=${AUTOFIX:-true}
MUTATION_THRESHOLD=${MUTATION_THRESHOLD:-70}
COVERAGE_LINES=${COVERAGE_LINES:-80}
COVERAGE_BRANCHES=${COVERAGE_BRANCHES:-70}

echo "═══════════════════════════════════════════════════════════"
echo "  FABRIKAGE MIRROR ENFORCE AND REVALIDATE"
echo "  Version: 3.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# PHASE 1: Mirror sync
echo "==> Mirror sync"
node ci/spec-mirror/sync.js
node ci/spec-mirror/generate-graphs.js

# PHASE 2: Fast gates
echo ""
echo "==> Fast gates"
if [ "$AUTOFIX" = "true" ]; then
  node ci/verifier-mesh/run-gate.js --gate=formatting --autofix=true
  node ci/verifier-mesh/run-gate.js --gate=lint --autofix=true
else
  node ci/verifier-mesh/run-gate.js --gate=formatting
  node ci/verifier-mesh/run-gate.js --gate=lint
fi

node ci/verifier-mesh/run-gate.js --gate=types
node ci/verifier-mesh/run-gate.js --gate=contracts
node ci/verifier-mesh/run-gate.js --gate=branding
node ci/verifier-mesh/run-gate.js --gate=version

# PHASE 3: Auto-fixes
echo ""
echo "==> Auto-fixes"
node js/error-fix-system.js --apply --patterns=settings/error-patterns.json

# PHASE 4: Full gates
echo ""
echo "==> Full gates"
node ci/verifier-mesh/run-gate.js --gate=unit --min-lines=$COVERAGE_LINES --min-branches=$COVERAGE_BRANCHES
node ci/verifier-mesh/run-gate.js --gate=integration --min-lines=$COVERAGE_LINES
node ci/verifier-mesh/run-gate.js --gate=property
node ci/verifier-mesh/run-gate.js --gate=mutation --min-score=$MUTATION_THRESHOLD
node ci/verifier-mesh/run-gate.js --gate=security
node ci/verifier-mesh/run-gate.js --gate=build

# PHASE 5: Store to Mirror (only on green)
echo ""
echo "==> Mirror store"
node ci/spec-mirror/store.js --source=./ --meta=3.0.0 --branding=".T. TogetherSystems - ModularFlux Architecture" --standard="IBM STANDARD - PERMANENT AKTIV"

# PHASE 6: Evidence
echo ""
echo "==> Evidence"
node ci/orchestrator/generate-evidence.js

# PHASE 7: Residual error check
echo ""
echo "==> Residual error check"
if command -v pwsh &> /dev/null; then
  pwsh -File FABRIKAGE-MIRROR-VALIDATE-ALL-ERRORS.ps1
elif command -v powershell &> /dev/null; then
  powershell -File FABRIKAGE-MIRROR-VALIDATE-ALL-ERRORS.ps1
else
  echo "⚠️  PowerShell not found, skipping validation script"
fi

echo ""
echo "✅ MIRROR ENFORCEMENT COMPLETED"
echo ""
echo "BRANDING: .T. TogetherSystems - ModularFlux Architecture"
echo "STANDARD: IBM STANDARD - PERMANENT AKTIV"



