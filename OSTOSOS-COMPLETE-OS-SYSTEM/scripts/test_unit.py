import sys
sys.path.insert(0, '.')
try:
    from osotosos import get_area_status, DEFAULT_CONFIG
    s = get_area_status(DEFAULT_CONFIG)
    assert 'frontend' in s, "Missing 'frontend'"
    assert 'backend' in s, "Missing 'backend'"
    assert 'human' in s, "Missing 'human'"
    assert len(s) == 12, f"Expected 12 areas, got {len(s)}"
    print("Unit OK")
    sys.exit(0)
except Exception as ex:
    print(f"Unit FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

