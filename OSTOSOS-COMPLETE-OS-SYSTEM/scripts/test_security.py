import sys
sys.path.insert(0, '.')
try:
    from osotosos import DEFAULT_CONFIG
    assert DEFAULT_CONFIG.get("developer_mode") is False, "Developer mode should be False by default"
    print("Security OK")
    sys.exit(0)
except Exception as ex:
    print(f"Security FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

