import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from osotosos import get_area_status, DEFAULT_CONFIG

def test_area_status():
    s = get_area_status(DEFAULT_CONFIG)
    assert 'frontend' in s, "Missing 'frontend'"
    assert 'backend' in s, "Missing 'backend'"
    assert 'human' in s, "Missing 'human'"
    assert len(s) == 12, f"Expected 12 areas, got {len(s)}"
