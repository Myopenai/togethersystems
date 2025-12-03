import sys
sys.path.insert(0, '.')
try:
    from osotosos import DEFAULT_CONFIG, THEMES
    assert DEFAULT_CONFIG['theme'] in THEMES, "Invalid theme"
    w = DEFAULT_CONFIG['panels_thresholds']['warn']
    e = DEFAULT_CONFIG['panels_thresholds']['error']
    assert w < e, "Thresholds invalid"
    print("Schema OK")
    sys.exit(0)
except Exception as ex:
    print(f"Schema FAILED: {ex}")
    sys.exit(1)

