#!/usr/bin/env bash
# T,. OSOTOSOS - Parity Tests
set -euo pipefail

echo "Parity: localhost vs (simulated) online"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

from osotosos import get_area_status, DEFAULT_CONFIG

try:
    # Simulate localhost check
    s1 = get_area_status(DEFAULT_CONFIG)
    
    # Simulate online check (same config, should produce consistent structure)
    s2 = get_area_status(DEFAULT_CONFIG)
    
    # Verify all values are floats
    assert all(isinstance(v['value'], (int, float)) for v in s1.values()), "Status values must be numeric"
    assert all(isinstance(v['value'], (int, float)) for v in s2.values()), "Status values must be numeric"
    
    # Verify same keys in both
    assert set(s1.keys()) == set(s2.keys()), "Panels mismatch between localhost and online"
    
    # Verify structure consistency
    for key in s1.keys():
        assert key in s2, f"Key {key} missing in online status"
        assert set(s1[key].keys()) == set(s2[key].keys()), f"Structure mismatch for {key}"
    
    print("Parity OK")
except Exception as e:
    print(f"Parity FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

