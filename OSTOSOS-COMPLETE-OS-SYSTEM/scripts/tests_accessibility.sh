#!/usr/bin/env bash
# T,. OSOTOSOS - Accessibility Tests
set -euo pipefail

echo "Accessibility: page contains buttons and proper charset"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

from osotosos import page_index, DEFAULT_CONFIG

try:
    html = page_index(DEFAULT_CONFIG)
    
    # Check for charset declaration
    assert "charset" in html.lower(), "Missing charset declaration"
    assert "utf-8" in html.lower(), "Missing UTF-8 charset"
    
    # Check for buttons (accessibility)
    assert "button" in html.lower(), "Missing buttons"
    
    # Check for proper HTML structure
    assert "<!doctype html>" in html.lower() or "<!DOCTYPE HTML>" in html, "Missing DOCTYPE"
    assert "<html" in html.lower(), "Missing HTML tag"
    assert "<head" in html.lower(), "Missing HEAD tag"
    assert "<body" in html.lower(), "Missing BODY tag"
    
    # Check for semantic elements
    assert "dock" in html.lower() or "icon" in html.lower(), "Missing UI elements"
    
    print("Accessibility OK")
except Exception as e:
    print(f"Accessibility FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

