#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  Policy Validation Script                                                  ║
# ║  [.TTT T,.&T,,.T,,,.T.] © 2025 Raymond Demitrio Tel                       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════"
echo "  POLICY VALIDATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0
WARNINGS=0

# Load policies
SECURITY_POLICY="$ROOT_DIR/policies/security.yaml"
QUALITY_POLICY="$ROOT_DIR/policies/quality.yaml"

# ───────────────────────────────────────────────────────────────────
# ENCODING CHECK
# ───────────────────────────────────────────────────────────────────

echo ""
echo "Checking encoding policy..."

if [ -f "$ROOT_DIR/scripts/encoding_lint.sh" ]; then
    if "$ROOT_DIR/scripts/encoding_lint.sh" "$ROOT_DIR" check 2>/dev/null; then
        echo "  ✓ All files are UTF-8 encoded"
    else
        echo "  ✗ Encoding issues found"
        ((ERRORS++))
    fi
else
    # Manual check
    non_utf8=$(find "$ROOT_DIR" -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.yaml" -o -name "*.json" \) -exec file -i {} \; 2>/dev/null | grep -v 'utf-8\|ascii\|binary' | head -5 || true)
    if [ -n "$non_utf8" ]; then
        echo "  ✗ Non-UTF-8 files found:"
        echo "$non_utf8" | head -5
        ((ERRORS++))
    else
        echo "  ✓ All text files appear to be UTF-8 or ASCII"
    fi
fi

# ───────────────────────────────────────────────────────────────────
# SECRETS CHECK
# ───────────────────────────────────────────────────────────────────

echo ""
echo "Checking for hardcoded secrets..."

# Patterns to detect secrets
secret_patterns=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]+['\"]"
)

found_secrets=0
for pattern in "${secret_patterns[@]}"; do
    matches=$(grep -rIl --include="*.js" --include="*.ts" --include="*.py" --include="*.yaml" --include="*.json" -E "$pattern" "$ROOT_DIR/src" "$ROOT_DIR/scripts" "$ROOT_DIR/web" 2>/dev/null | grep -v "node_modules" | grep -v ".example" | grep -v "ENV-EXAMPLE" || true)
    if [ -n "$matches" ]; then
        found_secrets=1
        echo "  ⚠ Potential secrets found in:"
        echo "$matches" | head -5 | sed 's/^/    /'
    fi
done

if [ $found_secrets -eq 0 ]; then
    echo "  ✓ No hardcoded secrets detected"
else
    ((WARNINGS++))
fi

# ───────────────────────────────────────────────────────────────────
# LICENSE CHECK
# ───────────────────────────────────────────────────────────────────

echo ""
echo "Checking licenses..."

if [ -f "$ROOT_DIR/package.json" ]; then
    if command -v npx &> /dev/null; then
        # Check for problematic licenses
        problematic=$(npm ls --json 2>/dev/null | jq -r '.. | .license? // empty' | grep -iE "^(GPL|AGPL)" || true)
        if [ -n "$problematic" ]; then
            echo "  ⚠ Potentially problematic licenses found:"
            echo "$problematic" | head -5 | sed 's/^/    /'
            ((WARNINGS++))
        else
            echo "  ✓ No problematic licenses detected"
        fi
    else
        echo "  ? License check skipped (npm not available)"
    fi
else
    echo "  ? No package.json found"
fi

# ───────────────────────────────────────────────────────────────────
# SECURITY HEADERS CHECK
# ───────────────────────────────────────────────────────────────────

echo ""
echo "Checking security headers in HTML..."

if [ -d "$ROOT_DIR/web" ] || [ -d "$ROOT_DIR/docs_build" ]; then
    html_files=$(find "$ROOT_DIR/web" "$ROOT_DIR/docs_build" -name "*.html" 2>/dev/null | head -5)
    
    for html in $html_files; do
        if [ -f "$html" ]; then
            filename=$(basename "$html")
            
            # Check for meta charset
            if grep -q '<meta charset="utf-8">' "$html" 2>/dev/null; then
                echo "  ✓ $filename has charset meta"
            else
                echo "  ⚠ $filename missing <meta charset=\"utf-8\">"
                ((WARNINGS++))
            fi
        fi
    done
fi

# ───────────────────────────────────────────────────────────────────
# RESULT
# ───────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
    echo "  RESULT: FAILED ($ERRORS error(s), $WARNINGS warning(s))"
    echo "═══════════════════════════════════════════════════════════════"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "  RESULT: PASSED with $WARNINGS warning(s)"
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
else
    echo "  RESULT: PASSED"
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
fi

