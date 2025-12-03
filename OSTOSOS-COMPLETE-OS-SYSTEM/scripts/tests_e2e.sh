#!/usr/bin/env bash
# T,. OSOTOSOS - E2E Tests
set -euo pipefail

echo "E2E: status API delivers 12 areas"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

import threading
import time
import json
import urllib.request
from osotosos import run_server

try:
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    time.sleep(1.5)
    
    # Test status API
    resp = urllib.request.urlopen("http://127.0.0.1:9876/api/status", timeout=3)
    data = json.loads(resp.read().decode('utf-8'))
    
    # Verify we have exactly 12 areas
    assert len(data.keys()) == 12, f"Expected 12 status panels, got {len(data.keys())}"
    
    # Verify all expected keys are present
    expected_keys = ['frontend', 'backend', 'build', 'infra', 'prod', 'org', 'sec', 'data', 'user', 'ext', 'time', 'human']
    for key in expected_keys:
        assert key in data, f"Missing key in status: {key}"
    
    print("E2E OK")
except Exception as e:
    print(f"E2E FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

