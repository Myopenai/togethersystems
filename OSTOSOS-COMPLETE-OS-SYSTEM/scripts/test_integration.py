import sys
sys.path.insert(0, '.')
import threading
import time
import urllib.request
from osotosos import run_server

try:
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1.5)
    
    resp = urllib.request.urlopen("http://127.0.0.1:9876", timeout=3)
    assert resp.status == 200, f"Expected 200, got {resp.status}"
    print("Integration OK")
    sys.exit(0)
except Exception as ex:
    print(f"Integration FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

