#!/usr/bin/env bash
# T,. OSOTOSOS - Build Matrix
set -euo pipefail

BUILDID="${1:?buildid required}"
TS="${2:?timestamp required}"

echo "Build Matrix: generating variants"

# Enumerations
VARIANTS=("pro" "lite")
DEVICE_TYPES=("desktop" "laptop" "tablet" "phone" "embedded")
MODELS=("elite" "gen2" "gen3" "micro" "max")
ARCHS=("x64" "arm64")
LOCALES=("de-DE" "en-US" "nl-NL")
APP="osotosos"

TOTAL=0

for v in "${VARIANTS[@]}"; do
  for d in "${DEVICE_TYPES[@]}"; do
    for m in "${MODELS[@]}"; do
      for a in "${ARCHS[@]}"; do
        for l in "${LOCALES[@]}"; do
          dir="build/${v}/${d}/${m}"
          mkdir -p "${dir}"
          
          content="${APP}-${v}-${d}-${m}-${a}-${l}-${BUILDID}-${TS}"
          
          # Calculate SHA256 (first 5 chars)
          if command -v sha256sum >/dev/null 2>&1; then
            sha="$(printf "%s" "${content}" | sha256sum | awk '{print $1}' | cut -c1-5)"
          elif command -v shasum >/dev/null 2>&1; then
            sha="$(printf "%s" "${content}" | shasum -a 256 | awk '{print $1}' | cut -c1-5)"
          else
            sha="00000"
          fi
          
          file="${dir}/${APP}-${v}-${d}-${m}-${a}-${l}-${BUILDID}-${TS}-${sha}.img"
          
          # Create artifact with metadata
          {
            echo "OSOTOSOS IMAGE"
            echo "Variant: ${v}"
            echo "Device: ${d}"
            echo "Model: ${m}"
            echo "Arch: ${a}"
            echo "Locale: ${l}"
            echo "BuildID: ${BUILDID}"
            echo "Timestamp: ${TS}"
            echo "SHA256: ${sha}"
            echo "Content: ${content}"
          } > "${file}"
          
          echo "Artifact ${file}"
          TOTAL=$((TOTAL + 1))
        done
      done
    done
  done
done

echo "Build Matrix Complete: ${TOTAL} artifacts created"

