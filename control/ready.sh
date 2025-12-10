#!/bin/bash
# Readiness Gates - Control Service
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  READINESS GATES"
echo "  Version: 3.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""

node ci/verifier-mesh/run-gate.js --gate=formatting --autofix=true
node ci/verifier-mesh/run-gate.js --gate=lint --autofix=true
node ci/verifier-mesh/run-gate.js --gate=types
node ci/verifier-mesh/run-gate.js --gate=unit --min-lines=80 --min-branches=70
node ci/verifier-mesh/run-gate.js --gate=integration --min-lines=80
node ci/verifier-mesh/run-gate.js --gate=property
node ci/verifier-mesh/run-gate.js --gate=mutation --min-score=70
node ci/verifier-mesh/run-gate.js --gate=contracts
node ci/verifier-mesh/run-gate.js --gate=security
node ci/verifier-mesh/run-gate.js --gate=build

echo ""
echo "✅ Alle Readiness-Gates bestanden"
echo ""
echo "BRANDING: .T. TogetherSystems - ModularFlux Architecture"
echo "STANDARD: IBM STANDARD - PERMANENT AKTIV"
