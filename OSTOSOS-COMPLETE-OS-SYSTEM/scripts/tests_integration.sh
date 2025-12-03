#!/usr/bin/env bash
# T,. OSOTOSOS - Integration Tests
set -euo pipefail

echo "Integration: HTTP server responds"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

import threading
import time
import urllib.request
from osotosos import run_server, CONFIG

try:
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    time.sleep(1.5)
    
    # Test root endpoint
    try:
        resp = urllib.request.urlopen("http://127.0.0.1:9876/", timeout=3)
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        print("Integration OK: Root endpoint")
    except Exception as e:
        print(f"Integration FAILED: Root endpoint - {e}")
        sys.exit(1)
    
    # Test docs endpoint
    try:
        resp = urllib.request.urlopen("http://127.0.0.1:9876/docs", timeout=3)
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        print("Integration OK: Docs endpoint")
    except Exception as e:
        print(f"Integration FAILED: Docs endpoint - {e}")
        sys.exit(1)
    
    print("Integration OK")
except Exception as e:
    print(f"Integration FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

