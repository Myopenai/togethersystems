import sys
sys.path.insert(0, '.')
import time
import threading
import urllib.request
from osotosos import run_server

try:
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1.5)
    
    t0 = time.time()
    resp = urllib.request.urlopen("http://127.0.0.1:9876", timeout=3)
    content = resp.read()
    dt = (time.time() - t0) * 1000
    
    assert dt < 300, f"Index too slow: {dt:.2f}ms (threshold: 300ms)"
    print(f"Perf OK: {int(dt)}ms")
    sys.exit(0)
except Exception as ex:
    print(f"Perf FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

