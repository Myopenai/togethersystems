import sys
sys.path.insert(0, '.')
try:
    from osotosos import DEFAULT_CONFIG, THEMES
    assert DEFAULT_CONFIG['theme'] in THEMES, "Theme must be valid"
    w = DEFAULT_CONFIG['panels_thresholds']['warn']
    e = DEFAULT_CONFIG['panels_thresholds']['error']
    assert 0 <= w < e, "Thresholds must be non-negative and warn < error"
    assert DEFAULT_CONFIG.get('developer_mode') is False, "Developer mode should be disabled by default"
    print("Compliance OK")
    sys.exit(0)
except Exception as ex:
    print(f"Compliance FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

