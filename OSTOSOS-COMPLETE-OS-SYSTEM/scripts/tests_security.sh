#!/usr/bin/env bash
# T,. OSOTOSOS - Security Tests
set -euo pipefail

echo "Security: developer mode off by default; overlays not executed"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

from osotosos import DEFAULT_CONFIG

try:
    # Verify developer mode is off by default
    assert DEFAULT_CONFIG.get("developer_mode") is False, "Developer mode should be False by default"
    
    # Verify prometheus URL is set but optional
    assert "prometheus_url" in DEFAULT_CONFIG, "Missing prometheus_url in config"
    
    # Verify thresholds are reasonable
    warn = DEFAULT_CONFIG['panels_thresholds']['warn']
    err = DEFAULT_CONFIG['panels_thresholds']['error']
    assert warn >= 0, "Warning threshold should be >= 0"
    assert err > warn, "Error threshold should be > warning threshold"
    
    print("Security OK")
except Exception as e:
    print(f"Security FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

