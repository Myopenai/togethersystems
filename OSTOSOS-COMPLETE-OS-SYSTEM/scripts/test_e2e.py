import sys
sys.path.insert(0, '.')
import threading
import time
import json
import urllib.request
from osotosos import run_server

try:
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1.5)
    
    resp = urllib.request.urlopen("http://127.0.0.1:9876/api/status", timeout=3)
    data = json.loads(resp.read().decode('utf-8'))
    assert len(data.keys()) == 12, f"Expected 12 status panels, got {len(data.keys())}"
    print("E2E OK")
    sys.exit(0)
except Exception as ex:
    print(f"E2E FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

