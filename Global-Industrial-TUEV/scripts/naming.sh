#!/usr/bin/env bash
# T,. Global Industrial TÜV - Strict Artifact Naming
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

set -euo pipefail

# name_artifact: Generates deterministic artifact filename
# Usage: name_artifact app variant device model arch locale buildid timestamp payload
# Returns: app-variant-device-model-arch-locale-buildid-timestamp-hash5.ext
name_artifact() {
  local app="$1"
  local v="$2"
  local d="$3"
  local m="$4"
  local a="$5"
  local l="$6"
  local b="$7"
  local t="$8"
  local p="$9"
  
  # Extract extension from payload if it's a filename
  local ext=""
  if [[ "$p" =~ \.([a-zA-Z0-9]+)$ ]]; then
    ext=".${BASH_REMATCH[1]}"
  fi
  
  # Generate SHA-256 hash and take first 5 chars
  local sha
  if command -v sha256sum >/dev/null 2>&1; then
    sha=$(printf "%s" "$p" | sha256sum | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    sha=$(printf "%s" "$p" | shasum -a 256 | awk '{print $1}')
  else
    # Fallback: use timestamp as hash
    sha=$(printf "%s" "$p$t" | od -A n -t x1 | tr -d ' \n' | head -c 64)
  fi
  
  local hash5="${sha:0:5}"
  
  # Format: app-variant-device-model-arch-locale-buildid-timestamp-hash5.ext
  printf "%s-%s-%s-%s-%s-%s-%s-%s-%s%s" \
    "$app" "$v" "$d" "$m" "$a" "$l" "$b" "$t" "$hash5" "$ext"
}

# validate_name: Validates artifact naming convention
validate_name() {
  local name="$1"
  # Pattern: app-variant-device-model-arch-locale-buildid-timestamp-hash5.ext
  if [[ ! "$name" =~ ^[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[0-9TZ]+-[a-f0-9]{5}(\.[a-zA-Z0-9]+)?$ ]]; then
    echo "ERROR: Invalid artifact name format: $name" >&2
    return 1
  fi
  return 0
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ $# -eq 9 ]]; then
    name_artifact "$@"
  elif [[ $# -eq 1 ]]; then
    validate_name "$1"
  else
    echo "Usage: $0 <app> <variant> <device> <model> <arch> <locale> <buildid> <timestamp> <payload>" >&2
    echo "   or: $0 <name>  (validate)" >&2
    exit 1
  fi
fi

