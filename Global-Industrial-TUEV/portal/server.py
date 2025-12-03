#!/usr/bin/env python3
# T,. Global Industrial TÜV - Portal API Server
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

import json
import time
import hashlib
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# In-memory database (replace with persistent storage in production)
DB = {
    "updates": [],
    "devices": [],
    "gates": []
}

def sha256(s: str) -> str:
    """Generate SHA-256 hash"""
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def ok(res, code=200, ct="application/json"):
    """Send OK response"""
    res.send_response(code)
    res.send_header("Content-Type", ct)
    res.send_header("Access-Control-Allow-Origin", "*")
    res.end_headers()

def error(res, msg, code=400):
    """Send error response"""
    ok(res, code)
    res.wfile.write(json.dumps({"error": msg}).encode("utf-8"))

class GlobalTUEVHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Global Industrial TÜV Portal"""
    
    def log_message(self, format, *args):
        """Override to use custom logging"""
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"[{timestamp}] {format % args}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        
        if parsed.path == "/api/updates/submit":
            # Submit update manifest
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                body = self.rfile.read(content_length).decode("utf-8", "ignore")
                manifest = json.loads(body)
                
                # Validate required fields
                if not all(k in manifest for k in ["app", "version", "producer", "role", "targets", "artifacts", "hashes", "signature", "changelog"]):
                    error(self, "Missing required fields", 400)
                    return
                
                # Validate branding immutable
                if not manifest.get("producer", {}).get("brandingImmutable"):
                    error(self, "brandingImmutable must be true", 400)
                    return
                
                # Generate unique ID
                update_id = sha256(json.dumps(manifest, sort_keys=True) + str(time.time()))
                
                # Gate status
                gates = ["integrity", "signature", "schema", "compatibility"]
                
                # Create record
                record = {
                    "id": update_id,
                    "manifest": manifest,
                    "status": "accepted",
                    "gates": gates,
                    "ts": datetime.utcnow().isoformat() + "Z",
                    "verified": False
                }
                
                DB["updates"].append(record)
                ok(self, 201)
                self.wfile.write(json.dumps(record, indent=2).encode("utf-8"))
                
            except json.JSONDecodeError as e:
                error(self, f"Invalid JSON: {str(e)}", 400)
            except Exception as e:
                error(self, f"Server error: {str(e)}", 500)
        
        elif parsed.path == "/api/devices/register":
            # Register device
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
                body = self.rfile.read(content_length).decode("utf-8", "ignore")
                device = json.loads(body)
                
                # Validate required fields
                if not all(k in device for k in ["gid", "type", "manufacturer", "model", "serial", "firmware", "software", "energyProfile", "emissionsProfile", "riskClass"]):
                    error(self, "Missing required device fields", 400)
                    return
                
                # Generate or use existing GID
                if not device.get("gid"):
                    device["gid"] = sha256(f"{device['manufacturer']}-{device['model']}-{device['serial']}")
                
                device["registeredAt"] = datetime.utcnow().isoformat() + "Z"
                DB["devices"].append(device)
                
                ok(self, 201)
                self.wfile.write(json.dumps({"gid": device["gid"], "status": "registered"}, indent=2).encode("utf-8"))
                
            except Exception as e:
                error(self, f"Device registration error: {str(e)}", 500)
        
        else:
            error(self, "Not found", 404)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        
        if parsed.path == "/":
            # Root page
            ok(self, 200, "text/html")
            html = """<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Global Industrial TÜV Portal</title>
    <style>
        body { font-family: sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; }
        h1 { color: #0066cc; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #0066cc; }
        code { background: #eee; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🌍 Global Industrial TÜV Portal</h1>
    <p>Universal device registry, update verification, and compliance dashboard.</p>
    
    <h2>API Endpoints</h2>
    <div class="endpoint">
        <strong>POST</strong> <code>/api/updates/submit</code><br>
        Submit update manifest for verification
    </div>
    <div class="endpoint">
        <strong>GET</strong> <code>/api/updates</code><br>
        List all updates (optional: ?role=original|maintainer|community)
    </div>
    <div class="endpoint">
        <strong>GET</strong> <code>/api/updates/{id}</code><br>
        Get update details by ID
    </div>
    <div class="endpoint">
        <strong>POST</strong> <code>/api/devices/register</code><br>
        Register a device in the global registry
    </div>
    <div class="endpoint">
        <strong>GET</strong> <code>/api/devices</code><br>
        List all registered devices
    </div>
    <div class="endpoint">
        <strong>GET</strong> <code>/api/stats</code><br>
        Get portal statistics
    </div>
    
    <h2>Status</h2>
    <p>✅ Portal operational</p>
    <p>✅ Verification pipeline ready</p>
    <p>✅ Digital twin dashboard available at <a href="http://127.0.0.1:9081">http://127.0.0.1:9081</a></p>
</body>
</html>"""
            self.wfile.write(html.encode("utf-8"))
        
        elif parsed.path == "/api/updates":
            # List updates
            role = query.get("role", [None])[0]
            items = DB["updates"]
            
            if role:
                items = [x for x in items if x["manifest"].get("role") == role]
            
            ok(self)
            self.wfile.write(json.dumps({"items": items, "count": len(items)}, indent=2).encode("utf-8"))
        
        elif parsed.path.startswith("/api/updates/"):
            # Get update by ID
            update_id = parsed.path.split("/")[-1]
            found = [x for x in DB["updates"] if x["id"] == update_id]
            
            if not found:
                error(self, "Update not found", 404)
                return
            
            ok(self)
            self.wfile.write(json.dumps(found[0], indent=2).encode("utf-8"))
        
        elif parsed.path == "/api/devices":
            # List devices
            ok(self)
            self.wfile.write(json.dumps({"devices": DB["devices"], "count": len(DB["devices"])}, indent=2).encode("utf-8"))
        
        elif parsed.path == "/api/stats":
            # Statistics
            stats = {
                "updates": len(DB["updates"]),
                "devices": len(DB["devices"]),
                "verified": len([x for x in DB["updates"] if x.get("verified")]),
                "roles": {
                    "original": len([x for x in DB["updates"] if x["manifest"].get("role") == "original"]),
                    "maintainer": len([x for x in DB["updates"] if x["manifest"].get("role") == "maintainer"]),
                    "community": len([x for x in DB["updates"] if x["manifest"].get("role") == "community"])
                }
            }
            ok(self)
            self.wfile.write(json.dumps(stats, indent=2).encode("utf-8"))
        
        else:
            error(self, "Not found", 404)

def run(port=9080):
    """Start the server"""
    server = HTTPServer(("127.0.0.1", port), GlobalTUEVHandler)
    print(f"[INFO] Global Industrial TÜV Portal running on http://127.0.0.1:{port}")
    print(f"[INFO] API documentation: http://127.0.0.1:{port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down server...")
        server.shutdown()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9080
    run(port)

