#!/usr/bin/env bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  Schema Validation Script                                                  ║
# ║  [.TTT T,.&T,,.T,,,.T.] © 2025 Raymond Demitrio Tel                       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════"
echo "  SCHEMA VALIDATION"
echo "═══════════════════════════════════════════════════════════════"

ERRORS=0

# Validate JSON schemas
if [ -d "$ROOT_DIR/schemas" ]; then
    echo ""
    echo "Validating JSON schemas..."
    for schema in "$ROOT_DIR/schemas"/*.json; do
        if [ -f "$schema" ]; then
            filename=$(basename "$schema")
            if jq empty "$schema" 2>/dev/null; then
                echo "  ✓ $filename"
            else
                echo "  ✗ $filename - Invalid JSON"
                ((ERRORS++))
            fi
        fi
    done
fi

# Validate YAML files
echo ""
echo "Validating YAML files..."

yaml_files=(
    "$ROOT_DIR/factory.manifest.yaml"
    "$ROOT_DIR/policies/security.yaml"
    "$ROOT_DIR/policies/quality.yaml"
)

for yaml in "${yaml_files[@]}"; do
    if [ -f "$yaml" ]; then
        filename=$(basename "$yaml")
        if command -v yq &> /dev/null; then
            if yq empty "$yaml" 2>/dev/null; then
                echo "  ✓ $filename"
            else
                echo "  ✗ $filename - Invalid YAML"
                ((ERRORS++))
            fi
        elif command -v python3 &> /dev/null; then
            if python3 -c "import yaml; yaml.safe_load(open('$yaml'))" 2>/dev/null; then
                echo "  ✓ $filename"
            else
                echo "  ✗ $filename - Invalid YAML"
                ((ERRORS++))
            fi
        else
            echo "  ? $filename - No YAML validator available"
        fi
    fi
done

# Validate manifest against schema (if ajv available)
echo ""
echo "Validating manifest against schema..."
if command -v ajv &> /dev/null; then
    if [ -f "$ROOT_DIR/schemas/manifest.schema.json" ] && [ -f "$ROOT_DIR/factory.manifest.yaml" ]; then
        # Convert YAML to JSON for validation
        if command -v yq &> /dev/null; then
            yq -o=json "$ROOT_DIR/factory.manifest.yaml" > /tmp/manifest.json
            if ajv validate -s "$ROOT_DIR/schemas/manifest.schema.json" -d /tmp/manifest.json 2>/dev/null; then
                echo "  ✓ factory.manifest.yaml conforms to schema"
            else
                echo "  ✗ factory.manifest.yaml does not conform to schema"
                ((ERRORS++))
            fi
            rm -f /tmp/manifest.json
        fi
    fi
else
    echo "  ? Schema validation skipped (ajv not installed)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"

if [ $ERRORS -gt 0 ]; then
    echo "  RESULT: FAILED ($ERRORS error(s))"
    echo "═══════════════════════════════════════════════════════════════"
    exit 1
else
    echo "  RESULT: PASSED"
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
fi

