#!/usr/bin/env bash
# T,. OSOTOSOS - Schema Verification
set -euo pipefail

echo "Schema: validating config blocks (themes, thresholds)"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

try:
    from osotosos import DEFAULT_CONFIG, THEMES
    
    # Verify theme is valid
    assert DEFAULT_CONFIG['theme'] in THEMES, f"Invalid theme: {DEFAULT_CONFIG['theme']}"
    
    # Verify thresholds
    warn = DEFAULT_CONFIG['panels_thresholds']['warn']
    err  = DEFAULT_CONFIG['panels_thresholds']['error']
    assert warn < err, f"Thresholds invalid: warn={warn}, error={err}"
    
    # Verify all required keys in DEFAULT_CONFIG
    required_keys = ['theme', 'developer_mode', 'prometheus_url', 'panels_thresholds']
    for key in required_keys:
        assert key in DEFAULT_CONFIG, f"Missing key in DEFAULT_CONFIG: {key}"
    
    # Verify panels_thresholds structure
    assert 'warn' in DEFAULT_CONFIG['panels_thresholds'], "Missing 'warn' in panels_thresholds"
    assert 'error' in DEFAULT_CONFIG['panels_thresholds'], "Missing 'error' in panels_thresholds"
    
    print("Schema OK")
except Exception as e:
    print(f"Schema FAILED: {e}")
    sys.exit(1)
PY

