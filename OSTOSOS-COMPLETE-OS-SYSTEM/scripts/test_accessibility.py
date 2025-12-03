import sys
sys.path.insert(0, '.')
try:
    from osotosos import page_index, DEFAULT_CONFIG
    html = page_index(DEFAULT_CONFIG)
    assert "charset" in html.lower(), "Missing charset"
    assert "button" in html.lower(), "Missing buttons"
    assert "menu-item" in html.lower() or "menu" in html.lower(), "Missing menu items"
    print("Accessibility OK")
    sys.exit(0)
except Exception as ex:
    print(f"Accessibility FAILED: {ex}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

