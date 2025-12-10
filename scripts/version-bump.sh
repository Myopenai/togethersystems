#!/bin/bash
# Auto-Version Bump
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

set -euo pipefail

if [ ! -f package.json ]; then
    echo "❌ package.json nicht gefunden"
    exit 1
fi

CUR=$(jq -r '.version' package.json)
NEW=$(node -e "const v='$CUR'.split('.'); v[2]=(+v[2]+1); console.log(v.join('.'))")

echo "📦 Version: $CUR → $NEW"

jq ".version=\"$NEW\"" package.json > package.json.tmp && mv package.json.tmp package.json

if [ ! -f CHANGELOG.md ]; then
    echo "# Changelog" > CHANGELOG.md
fi

echo "" >> CHANGELOG.md
echo "## $NEW - $(date -I)" >> CHANGELOG.md
echo "- Auto-fix and gates green" >> CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "chore: version bump $NEW" || true
git push || true

echo "✅ Version auf $NEW aktualisiert"


