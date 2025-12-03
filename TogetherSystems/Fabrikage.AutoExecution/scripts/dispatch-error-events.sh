#!/bin/bash
# ============================================================================
# DISPATCH ERROR EVENTS
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Dispatch Error Events - Normalisiert Konsolen-Events und triggert AI-Patches
# ============================================================================

set -e

EVENTS_PIPE="Fabrikage.ObservabilityAtlas/error_bus/events.stream"
CLASSIFIER="Fabrikage.ObservabilityAtlas/console/classify-event.js"
PATCH_GENERATOR="Fabrikage.ObservabilityAtlas/console/ai-generate-patch.js"
PATCH_APPLIER="Fabrikage.AutoExecution/scripts/apply-patch.sh"
VERIFIER="Fabrikage.AutoExecution/scripts/run-verification.sh"
DOC_UPDATER="Fabrikage.AutoExecution/docs/auto-doc-updater.js"
SIGNER="Fabrikage.ProvenanceLedger/scripts/sign-and-attest.sh"

echo "T,. Dispatch Error Events: Starte Event-Processing..."

while read -r EVENT; do
  echo "T,. Event empfangen: $EVENT"
  
  # Klassifiziere Event
  CLASS=$(node "$CLASSIFIER" "$EVENT")
  echo "T,. Event klassifiziert: $CLASS"
  
  # Generiere Patch
  PATCH=$(node "$PATCH_GENERATOR" --class "$CLASS" --event "$EVENT")
  echo "T,. Patch generiert: $PATCH"
  
  # Wende Patch an
  bash "$PATCH_APPLIER" "$PATCH"
  echo "T,. Patch angewendet"
  
  # Verifiziere
  bash "$VERIFIER"
  echo "T,. Verifikation abgeschlossen"
  
  # Update Docs
  node "$DOC_UPDATER"
  echo "T,. Dokumentation aktualisiert"
  
  # Signiere & attestiere
  bash "$SIGNER"
  echo "T,. Signatur & Attestierung abgeschlossen"
  
done < "$EVENTS_PIPE"

echo "T,. Dispatch Error Events: Event-Processing abgeschlossen"

