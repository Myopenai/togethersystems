import sys
sys.path.insert(0, '.')
try:
    from osotosos import get_area_status, DEFAULT_CONFIG
    s1 = get_area_status(DEFAULT_CONFIG)
    s2 = get_area_status(DEFAULT_CONFIG)
    assert set(s1.keys()) == set(s2.keys()), "Panels mismatch"
    assert all(isinstance(v['value'], (int, float)) for v in s1.values()), "Status values must be numeric"
    print("Parity OK")
    sys.exit(0)
except Exception as ex:
    print(f"Parity FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

