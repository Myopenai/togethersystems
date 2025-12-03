import sys
sys.path.insert(0, '.')
try:
    from osotosos import audit_export, LOGS, bootstrap
    bootstrap()
    md = audit_export()
    assert md.startswith("# OSOTOSOS Audit-Ergebnis"), "Audit export should start with header"
    assert len(LOGS) >= 1, "Logs should contain at least one entry"
    print("Observability OK")
    sys.exit(0)
except Exception as ex:
    print(f"Observability FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

