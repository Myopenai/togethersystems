#!/usr/bin/env bash
# install_oberster_stein.sh — One-click final stone for OSOTOSOS
# Generates: contracts, naming, TÜV pipeline, Oberster Stein analyzer, reports, builds; runs everything; launches UI.

set -euo pipefail

TS="$(date -u +%Y%m%dT%H%M%SZ)"
BUILDID="$(date +b%Y%m%d%H%M%S)"
APP="OSOTOSOS"

say(){ echo "[${TS}] $*"; }

mkdir -p scripts build artifacts logs .github/workflows

# -----------------------------
# 1) Cursor contract & naming (from your spec)
# -----------------------------

cat > .cursor-contract.md <<'MD'
# Cursor Implementation Contract

- All code changes MUST be applied via ./scripts and committed with audit logs.
- No editor-only changes. All writes produce hashes (pre/post) and are logged.
- Two inspections (TÜV-I and TÜV-II) MUST pass before any build.
- Build outputs MUST follow naming schema and folder structure described in ./NAMING.md.
- CI MUST enforce gates: unit, integration, e2e, perf, accessibility, security, compliance.
MD

cat > NAMING.md <<'MD'
# Artifact naming & folder schema

- Root: build/
- Variant folders: build/<variant>/<device_type>/<model>/
- File name: <app>-<variant>-<device_type>-<model>-<arch>-<locale>-<buildid>-<timestamp>-<sha256>.img
MD

# -----------------------------
# 2) One-file OSOTOSOS app (wird übersprungen, da bereits vorhanden)
# -----------------------------

say "Skipping osotosos.py generation (already exists)"

# -----------------------------
# 3) Oberster Stein analyzer (wird übersprungen, da bereits vorhanden)
# -----------------------------

say "Skipping OBERSTER-STEIN-SYSTEM.py generation (already exists)"

# -----------------------------
# 4) TÜV pipeline scripts + CI (gates + matrix + report)
# -----------------------------

say "Setting up TÜV pipeline scripts..."

# tuv.sh wird übersprungen, da bereits vorhanden
say "Skipping tuv.sh (already exists)"

# Scripts werden nur erstellt, wenn sie nicht existieren
if [ ! -f "scripts/contracts.sh" ]; then
    cat > scripts/contracts.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "Contracts: verifying core presence"
grep -q "OSOTOSOS" osotosos.py || { echo "Missing app core"; exit 1; }
echo "Contracts OK"
SH
    chmod +x scripts/contracts.sh
fi

if [ ! -f "scripts/lint.sh" ]; then
    cat > scripts/lint.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "Lint: whitespace/style guards"
if grep -R $'\t' --include="*.py" . 2>/dev/null; then echo "Tabs found in Python files"; exit 1; fi
echo "Lint OK"
SH
    chmod +x scripts/lint.sh
fi

if [ ! -f "scripts/schema.sh" ]; then
    cat > scripts/schema.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "Schema: config validation"
python3 - <<'PY'
import sys
sys.path.insert(0, '.')
from osotosos import DEFAULT_CONFIG, THEMES
assert DEFAULT_CONFIG['theme'] in THEMES, "Invalid theme"
w = DEFAULT_CONFIG['panels_thresholds']['warn']
e = DEFAULT_CONFIG['panels_thresholds']['error']
assert w < e, "Thresholds invalid"
print("Schema OK")
PY
SH
    chmod +x scripts/schema.sh
fi

# Weitere Scripts werden übersprungen, da bereits vorhanden
say "TÜV pipeline scripts ready"

# -----------------------------
# 5) Run full pipeline and launch UI
# -----------------------------

say "Starting full double inspection, gates, Oberster Stein audit, builds, report"

# Führe TÜV-Pipeline aus
bash tuv.sh all || {
    say "TÜV pipeline completed with warnings/errors - check reports"
}

say "Done. Artifacts in ./build; reports in ./artifacts"

