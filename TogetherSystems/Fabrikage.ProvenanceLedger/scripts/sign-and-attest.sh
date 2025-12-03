#!/bin/bash
# ============================================================================
# SIGN AND ATTEST
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Sign and Attest - Signiert & attestiert jede Änderung
# ============================================================================

set -e

FILES=("$@")
ATTESTATION_LOG="Fabrikage.ProvenanceLedger/attestations/docs.log"

echo "T,. Sign and Attest: Signiere & attestiere Dateien..."

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "T,. Warnung: Datei nicht gefunden: $f"
    continue
  fi
  
  # Berechne Hash
  if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    HASH=$(certutil -hashfile "$f" SHA256 | findstr /v "hash" | findstr /v "certutil")
  else
    # Unix/Linux/Mac
    HASH=$(shasum -a 256 "$f" | cut -d ' ' -f1)
  fi
  
  # Signiere (Mock - in Produktion würde hier GPG verwendet)
  SIGNATURE="sig-${HASH:0:16}"
  
  # Erstelle Attestation
  ATTESTATION=$(cat <<EOF
{
  "file": "$f",
  "hash": "$HASH",
  "signature": "$SIGNATURE",
  "timestamp": "$(date -Iseconds)",
  "trace_id": "trace-$(date +%s)"
}
EOF
)
  
  # Append to attestation log
  echo "$ATTESTATION" >> "$ATTESTATION_LOG"
  
  echo "T,. Signiert & attestiert: $f (Hash: ${HASH:0:16}...)"
done

echo "T,. Sign and Attest: Abgeschlossen"

