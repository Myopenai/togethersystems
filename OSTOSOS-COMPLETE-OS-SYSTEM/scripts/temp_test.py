import sys
import os
sys.path.insert(0, '..')  # Add parent directory to path
try:
    from osotosos import get_area_status, DEFAULT_CONFIG
    s = get_area_status(DEFAULT_CONFIG)
    print("Test successful! Found areas:", list(s.keys()))
except Exception as ex:
    print(f"Test failed: {ex}")
    import traceback
    traceback.print_exc()
