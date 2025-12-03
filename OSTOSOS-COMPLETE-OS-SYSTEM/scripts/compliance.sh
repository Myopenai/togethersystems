#!/usr/bin/env bash
# T,. OSOTOSOS - Compliance Tests
set -euo pipefail

echo "Compliance: basic checks placeholders"

cd ..

python3 - <<'PY'
import sys
sys.path.insert(0, '.')

from osotosos import DEFAULT_CONFIG, THEMES

try:
    # Basic compliance checks
    
    # 1. Configuration must be valid
    assert DEFAULT_CONFIG['theme'] in THEMES, "Theme must be valid"
    
    # 2. Thresholds must be reasonable
    warn = DEFAULT_CONFIG['panels_thresholds']['warn']
    err = DEFAULT_CONFIG['panels_thresholds']['error']
    assert 0 <= warn < err, "Thresholds must be non-negative and warn < error"
    
    # 3. Developer mode should be off by default (security compliance)
    assert DEFAULT_CONFIG.get('developer_mode') is False, "Developer mode should be disabled by default"
    
    # Placeholder for future compliance checks:
    # - ISO standards
    # - CEPT regulations
    # - DSGVO/GDPR compliance
    # - Accessibility standards (WCAG)
    
    print("Compliance OK")
except Exception as e:
    print(f"Compliance FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PY

