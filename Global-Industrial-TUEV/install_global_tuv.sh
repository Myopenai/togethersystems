#!/usr/bin/env bash
# T,. Global Industrial TÜV - One-Click Setup (Bash)
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

set -euo pipefail

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
say() { printf "[%s] %s\n" "$(ts)" "$*"; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

say "=== Global Industrial TÜV - One-Click Setup ==="
say ""

# Check Python 3
if ! command -v python3 >/dev/null 2>&1; then
    say "ERROR: python3 not found. Please install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
say "Found Python: $PYTHON_VERSION"

# Make scripts executable
chmod +x scripts/naming.sh scripts/verify_pipeline.py portal/server.py portal/dashboard.py 2>/dev/null || true

say ""
say "=== Starting Portal and Dashboard ==="

# Kill existing processes on ports 9080 and 9081
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:9080 | xargs kill -9 2>/dev/null || true
    lsof -ti:9081 | xargs kill -9 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
    fuser -k 9080/tcp 2>/dev/null || true
    fuser -k 9081/tcp 2>/dev/null || true
fi

# Start portal server in background
python3 portal/server.py > logs/portal.log 2>&1 &
PORTAL_PID=$!
say "Portal started (PID: $PORTAL_PID) on http://127.0.0.1:9080"

# Wait a moment for server to start
sleep 2

# Start dashboard in background
python3 portal/dashboard.py > logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
say "Dashboard started (PID: $DASHBOARD_PID) on http://127.0.0.1:9081"

# Wait a moment for dashboard to start
sleep 2

say ""
say "=== Running Verification Pipeline ==="

# Run verification on example manifest
if [ -f "artifacts/example_update_manifest.json" ]; then
    python3 scripts/verify_pipeline.py < artifacts/example_update_manifest.json
    say "Verification completed"
else
    say "WARNING: example_update_manifest.json not found"
fi

say ""
say "=== Submitting Example Manifest ==="

# Submit example manifest to portal
if command -v curl >/dev/null 2>&1; then
    if curl -s -X POST \
        -H "Content-Type: application/json" \
        --data @artifacts/example_update_manifest.json \
        http://127.0.0.1:9080/api/updates/submit > /dev/null 2>&1; then
        say "Example manifest submitted successfully"
    else
        say "WARNING: Failed to submit manifest (portal may still be starting)"
    fi
else
    say "WARNING: curl not found, skipping manifest submission"
fi

say ""
say "=== Setup Complete ==="
say ""
say "Portal:    http://127.0.0.1:9080"
say "Dashboard: http://127.0.0.1:9081"
say ""
say "API Endpoints:"
say "  GET  http://127.0.0.1:9080/api/updates"
say "  POST http://127.0.0.1:9080/api/updates/submit"
say "  GET  http://127.0.0.1:9080/api/devices"
say "  POST http://127.0.0.1:9080/api/devices/register"
say "  GET  http://127.0.0.1:9080/api/stats"
say ""
say "Logs:"
say "  Portal:    logs/portal.log"
say "  Dashboard: logs/dashboard.log"
say ""
say "To stop servers:"
say "  kill $PORTAL_PID $DASHBOARD_PID"
say ""
say "Press Ctrl+C to stop servers and exit"

# Wait for user interrupt
trap "say 'Shutting down...'; kill $PORTAL_PID $DASHBOARD_PID 2>/dev/null || true; exit 0" INT TERM

# Keep script running
wait

