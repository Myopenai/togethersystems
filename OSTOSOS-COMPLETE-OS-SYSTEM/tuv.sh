#!/usr/bin/env bash
# T,. OSOTOSOS - TÜV-Grade Verification Pipeline
set -euo pipefail

APP="OSOTOSOS"
BUILDID="$(date +b%Y%m%d%H%M%S)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
ROOT="$(pwd)"

log(){ echo "[${TS}] $*"; }

case "${1:-}" in
  "all")
    log "=== TÜV-Grade Verification Pipeline ==="
    bash tuv.sh preflight
    bash tuv.sh tuv1
    bash tuv.sh tests
    bash tuv.sh tuv2
    bash tuv.sh build_all
    bash tuv.sh report
    log "=== Pipeline Complete ==="
    ;;
  "preflight")
    log "Preflight: repo sanity, git status, required files"
    test -f ".cursor-contract.md" || { echo "Missing .cursor-contract.md"; exit 1; }
    test -f "NAMING.md" || { echo "Missing NAMING.md"; exit 1; }
    test -f "osotosos.py" || { echo "Missing osotosos.py"; exit 1; }
    mkdir -p build logs artifacts scripts
    log "Preflight OK"
    ;;
  "tuv1")
    log "TÜV-I: contracts, lint, schema"
    bash scripts/contracts.sh || { log "TÜV-I FAILED: contracts"; exit 1; }
    bash scripts/lint.sh || { log "TÜV-I FAILED: lint"; exit 1; }
    bash scripts/schema.sh || { log "TÜV-I FAILED: schema"; exit 1; }
    log "TÜV-I PASSED"
    ;;
  "tests")
    log "Tests: unit, integration, e2e, perf, accessibility, security"
    bash scripts/tests_unit.sh || { log "Tests FAILED: unit"; exit 1; }
    bash scripts/tests_integration.sh || { log "Tests FAILED: integration"; exit 1; }
    bash scripts/tests_e2e.sh || { log "Tests FAILED: e2e"; exit 1; }
    bash scripts/tests_perf.sh || { log "Tests FAILED: perf"; exit 1; }
    bash scripts/tests_accessibility.sh || { log "Tests FAILED: accessibility"; exit 1; }
    bash scripts/tests_security.sh || { log "Tests FAILED: security"; exit 1; }
    log "All Tests PASSED"
    ;;
  "tuv2")
    log "TÜV-II: parity (localhost vs online), observability, compliance"
    bash scripts/parity.sh || { log "TÜV-II FAILED: parity"; exit 1; }
    bash scripts/observability.sh || { log "TÜV-II FAILED: observability"; exit 1; }
    bash scripts/compliance.sh || { log "TÜV-II FAILED: compliance"; exit 1; }
    log "TÜV-II PASSED"
    ;;
  "build_all")
    log "Build: enumerating matrix and producing artifacts"
    bash scripts/build_matrix.sh "${BUILDID}" "${TS}" || { log "Build FAILED"; exit 1; }
    log "Build Complete"
    ;;
  "report")
    log "Report: audit summary and hashes"
    bash scripts/report.sh "${BUILDID}" "${TS}" || { log "Report FAILED"; exit 1; }
    log "Report Complete"
    ;;
  *)
    echo "Usage: bash tuv.sh [all|preflight|tuv1|tests|tuv2|build_all|report]"
    exit 1
    ;;
esac

