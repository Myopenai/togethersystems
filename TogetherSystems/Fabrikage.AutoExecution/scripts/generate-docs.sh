#!/bin/bash
# ============================================================================
# GENERATE DOCS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Generate Docs - Automatische, verifizierende Dokumentation
# ============================================================================

set -e

CHANGES_JSON="Fabrikage.ObservabilityAtlas/reports/changes.json"
DOCS_DIR="docs"
HISTORY_DIR="$DOCS_DIR/append_only"
TEMPLATES_DIR="$DOCS_DIR/templates"
TIMESTAMP=$(date -Iseconds)

echo "T,. Generate Docs: Starte Dokumentations-Generierung..."

# Erstelle Verzeichnisse
mkdir -p "$DOCS_DIR"
mkdir -p "$HISTORY_DIR"
mkdir -p "$TEMPLATES_DIR"

# Generiere index.md
if [ -f "$TEMPLATES_DIR/index.md.tmpl" ]; then
  node -e "
    const fs = require('fs');
    const template = fs.readFileSync('$TEMPLATES_DIR/index.md.tmpl', 'utf8');
    const rendered = template.replace(/\{\{timestamp\}\}/g, '$TIMESTAMP');
    fs.writeFileSync('$DOCS_DIR/index.md', rendered, 'utf8');
  "
  echo "T,. Generate Docs: index.md generiert"
fi

# Generiere changelog.md (append-only)
if [ -f "$TEMPLATES_DIR/changelog.md.tmpl" ]; then
  node -e "
    const fs = require('fs');
    const template = fs.readFileSync('$TEMPLATES_DIR/changelog.md.tmpl', 'utf8');
    const rendered = template.replace(/\{\{timestamp\}\}/g, '$TIMESTAMP');
    if (fs.existsSync('$DOCS_DIR/changelog.md')) {
      const existing = fs.readFileSync('$DOCS_DIR/changelog.md', 'utf8');
      fs.writeFileSync('$DOCS_DIR/changelog.md', existing + '\n\n' + rendered, 'utf8');
    } else {
      fs.writeFileSync('$DOCS_DIR/changelog.md', rendered, 'utf8');
    }
  "
  echo "T,. Generate Docs: changelog.md aktualisiert (append-only)"
fi

# Generiere docs_autogen.md
if [ -f "$TEMPLATES_DIR/docs_autogen.md.tmpl" ]; then
  node -e "
    const fs = require('fs');
    const template = fs.readFileSync('$TEMPLATES_DIR/docs_autogen.md.tmpl', 'utf8');
    const rendered = template.replace(/\{\{timestamp\}\}/g, '$TIMESTAMP');
    fs.writeFileSync('$DOCS_DIR/docs_autogen.md', rendered, 'utf8');
  "
  echo "T,. Generate Docs: docs_autogen.md generiert"
fi

# Erstelle History Snapshot (append-only)
SNAP="$HISTORY_DIR/${TIMESTAMP//[:.]/-}.md"
if [ -f "$TEMPLATES_DIR/history_snapshot.md.tmpl" ]; then
  node -e "
    const fs = require('fs');
    const template = fs.readFileSync('$TEMPLATES_DIR/history_snapshot.md.tmpl', 'utf8');
    const rendered = template.replace(/\{\{timestamp\}\}/g, '$TIMESTAMP');
    fs.writeFileSync('$SNAP', rendered, 'utf8');
  "
  echo "T,. Generate Docs: History Snapshot erstellt: $SNAP"
fi

# Signiere & attestiere
bash "Fabrikage.ProvenanceLedger/scripts/sign-and-attest.sh" \
  "$DOCS_DIR/index.md" \
  "$DOCS_DIR/changelog.md" \
  "$DOCS_DIR/docs_autogen.md" \
  "$SNAP"

echo "T,. Generate Docs: Dokumentation generiert und signiert ✓"

