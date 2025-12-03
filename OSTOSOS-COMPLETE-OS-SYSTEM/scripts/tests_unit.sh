#!/usr/bin/env bash
# T,. OSOTOSOS - Unit Tests
set -euo pipefail

echo "Unit: core functions"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

try:
    from osotosos import get_area_status, DEFAULT_CONFIG, AREAS
    
    # Test get_area_status returns correct structure
    s = get_area_status(DEFAULT_CONFIG)
    
    # Verify all areas are present
    assert 'frontend' in s, "Missing 'frontend' in status"
    assert 'backend' in s, "Missing 'backend' in status"
    assert 'build' in s, "Missing 'build' in status"
    assert 'infra' in s, "Missing 'infra' in status"
    assert 'prod' in s, "Missing 'prod' in status"
    assert 'org' in s, "Missing 'org' in status"
    assert 'sec' in s, "Missing 'sec' in status"
    assert 'data' in s, "Missing 'data' in status"
    assert 'user' in s, "Missing 'user' in status"
    assert 'ext' in s, "Missing 'ext' in status"
    assert 'time' in s, "Missing 'time' in status"
    assert 'human' in s, "Missing 'human' in status"
    
    # Verify structure of each status entry
    for key, value in s.items():
        assert 'value' in value, f"Missing 'value' in {key}"
        assert 'color' in value, f"Missing 'color' in {key}"
        assert 'label' in value, f"Missing 'label' in {key}"
        assert 'title' in value, f"Missing 'title' in {key}"
        assert value['color'] in ['red', 'orange', 'green'], f"Invalid color in {key}: {value['color']}"
        assert value['label'] in ['FEHLER', 'WARNUNG', 'OK'], f"Invalid label in {key}: {value['label']}"
    
    # Verify we have exactly 12 areas
    assert len(s) == 12, f"Expected 12 areas, got {len(s)}"
    
    print("Unit OK")
except Exception as e:
    print(f"Unit FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

