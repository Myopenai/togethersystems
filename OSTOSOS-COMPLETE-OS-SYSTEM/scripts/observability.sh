#!/usr/bin/env bash
# T,. OSOTOSOS - Observability Tests
set -euo pipefail

echo "Observability: logs and audit export"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

from osotosos import audit_export, LOGS, bootstrap

try:
    # Bootstrap to initialize logs
    bootstrap()
    
    # Verify audit export works
    md = audit_export()
    assert md.startswith("# OSOTOSOS Audit-Ergebnis"), "Audit export should start with header"
    assert "Status:" in md, "Audit export should contain status"
    assert "Erfüllt:" in md, "Audit export should contain completion count"
    
    # Verify logs are being written
    assert len(LOGS) >= 1, "Logs should contain at least one entry"
    
    # Verify log format
    for log_entry in LOGS:
        assert "[" in log_entry, "Log entries should contain timestamp brackets"
    
    print("Observability OK")
except Exception as e:
    print(f"Observability FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

