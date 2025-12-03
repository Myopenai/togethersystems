#!/usr/bin/env bash
# T,. OSOTOSOS - Lint Verification
set -euo pipefail

echo "Lint: basic whitespace and style checks (stdlib)"

# Check for tabs in Python files
if grep -R $'\t' --include="*.py" .. 2>/dev/null; then 
    echo "Tabs found in Python files"; 
    exit 1; 
fi

# Check for trailing whitespace
if grep -R '[[:space:]]$' --include="*.py" .. 2>/dev/null; then
    echo "Trailing whitespace found in Python files"
    exit 1
fi

# Check for proper shebang in osotosos.py
if ! head -1 ../osotosos.py | grep -q "#!/usr/bin/env python3"; then
    echo "Missing or incorrect shebang in osotosos.py"
    exit 1
fi

echo "Lint OK"

