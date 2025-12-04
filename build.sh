#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8080}"
echo "[build] Node 20 required"; node -v
echo "[serve] http://127.0.0.1:${PORT}"
PORT="${PORT}" node tools/serve.js

