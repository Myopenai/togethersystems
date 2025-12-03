#!/usr/bin/env bash
# T,. OSOTOSOS - Contracts Verification
set -euo pipefail

echo "Contracts: verifying required exports, routes, configs"

# Check osotosos.py exists and contains core components
test -f "../osotosos.py" || { echo "Missing osotosos.py"; exit 1; }

# Verify core app name
grep -q "APP_NAME = \"OSOTOSOS\"" ../osotosos.py || { echo "Missing app core"; exit 1; }

# Verify required functions exist
grep -q "def get_area_status" ../osotosos.py || { echo "Missing get_area_status"; exit 1; }
grep -q "def audit_export" ../osotosos.py || { echo "Missing audit_export"; exit 1; }
grep -q "def run_server" ../osotosos.py || { echo "Missing run_server"; exit 1; }
grep -q "def cli_dashboard" ../osotosos.py || { echo "Missing cli_dashboard"; exit 1; }

# Verify required constants
grep -q "AREAS = \[" ../osotosos.py || { echo "Missing AREAS"; exit 1; }
grep -q "QUESTIONNAIRE = \[" ../osotosos.py || { echo "Missing QUESTIONNAIRE"; exit 1; }
grep -q "THEMES = {" ../osotosos.py || { echo "Missing THEMES"; exit 1; }
grep -q "DEFAULT_CONFIG = {" ../osotosos.py || { echo "Missing DEFAULT_CONFIG"; exit 1; }

echo "Contracts OK"

