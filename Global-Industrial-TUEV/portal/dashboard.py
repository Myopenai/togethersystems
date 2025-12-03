#!/usr/bin/env python3
# T,. Global Industrial TÜV - Digital Twin Dashboard
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

import json
import random
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime

# Digital Twin State
TWIN = {
    "energy": 0.0,
    "emissions": {
        "co2": 0.0,
        "nox": 0.0,
        "sox": 0.0
    },
    "alerts": [],
    "devices": 0,
    "updates": 0,
    "verified": 0,
    "lastUpdate": None
}

def simulate():
    """Simulate digital twin updates"""
    # Simulate energy consumption (1000-1100 W base + variation)
    TWIN["energy"] = round(1000 + random.random() * 100, 2)
    
    # Simulate emissions
    TWIN["emissions"]["co2"] = round(500 + random.random() * 50, 2)
    TWIN["emissions"]["nox"] = round(20 + random.random() * 5, 2)
    TWIN["emissions"]["sox"] = round(10 + random.random() * 3, 2)
    
    # Update timestamp
    TWIN["lastUpdate"] = datetime.utcnow().isoformat() + "Z"
    
    # Generate alerts if thresholds exceeded
    if TWIN["energy"] > 1080:
        alert = {
            "type": "energy",
            "level": "warning",
            "message": f"High energy consumption: {TWIN['energy']}W",
            "timestamp": TWIN["lastUpdate"]
        }
        if alert not in TWIN["alerts"]:
            TWIN["alerts"].append(alert)
    
    if TWIN["emissions"]["co2"] > 540:
        alert = {
            "type": "emissions",
            "level": "warning",
            "message": f"High CO2 emissions: {TWIN['emissions']['co2']} kg/h",
            "timestamp": TWIN["lastUpdate"]
        }
        if alert not in TWIN["alerts"]:
            TWIN["alerts"].append(alert)
    
    # Keep only last 10 alerts
    if len(TWIN["alerts"]) > 10:
        TWIN["alerts"] = TWIN["alerts"][-10:]

class TwinDashboardHandler(BaseHTTPRequestHandler):
    """HTTP Handler for Digital Twin Dashboard"""
    
    def log_message(self, format, *args):
        """Override to use custom logging"""
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"[{timestamp}] {format % args}")
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == "/":
            # Dashboard HTML
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            
            html = """<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Global Industrial TÜV - Digital Twin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .metric {
            font-size: 2.5em;
            font-weight: bold;
            color: #764ba2;
            margin: 10px 0;
        }
        .unit {
            font-size: 0.6em;
            color: #666;
            font-weight: normal;
        }
        .alerts {
            max-height: 300px;
            overflow-y: auto;
        }
        .alert {
            padding: 10px;
            margin: 5px 0;
            border-radius: 6px;
            border-left: 4px solid #ff6b6b;
        }
        .alert.warning {
            background: #fff3cd;
            border-color: #ffc107;
        }
        .alert.info {
            background: #d1ecf1;
            border-color: #17a2b8;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.active {
            background: #28a745;
            color: white;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }
        #data {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Global Industrial TÜV - Digital Twin Dashboard</h1>
        
        <div class="dashboard">
            <div class="card">
                <h2>⚡ Energy Consumption</h2>
                <div class="metric" id="energy">- <span class="unit">W</span></div>
                <div class="timestamp" id="energyTime">-</div>
            </div>
            
            <div class="card">
                <h2>🌫️ CO₂ Emissions</h2>
                <div class="metric" id="co2">- <span class="unit">kg/h</span></div>
                <div class="timestamp" id="co2Time">-</div>
            </div>
            
            <div class="card">
                <h2>📊 System Status</h2>
                <div style="margin: 15px 0;">
                    <div>Devices: <strong id="devices">-</strong></div>
                    <div>Updates: <strong id="updates">-</strong></div>
                    <div>Verified: <strong id="verified">-</strong></div>
                </div>
                <div class="status active">● ACTIVE</div>
            </div>
            
            <div class="card">
                <h2>⚠️ Alerts</h2>
                <div class="alerts" id="alerts">
                    <div class="alert info">No active alerts</div>
                </div>
            </div>
        </div>
        
        <div id="data"></div>
    </div>
    
    <script>
        function updateDashboard() {
            fetch('/api')
                .then(r => r.json())
                .then(data => {
                    // Update metrics
                    document.getElementById('energy').innerHTML = data.energy.toFixed(2) + ' <span class="unit">W</span>';
                    document.getElementById('co2').innerHTML = data.emissions.co2.toFixed(2) + ' <span class="unit">kg/h</span>';
                    document.getElementById('devices').textContent = data.devices || 0;
                    document.getElementById('updates').textContent = data.updates || 0;
                    document.getElementById('verified').textContent = data.verified || 0;
                    
                    // Update timestamps
                    if (data.lastUpdate) {
                        const time = new Date(data.lastUpdate).toLocaleString();
                        document.getElementById('energyTime').textContent = 'Updated: ' + time;
                        document.getElementById('co2Time').textContent = 'Updated: ' + time;
                    }
                    
                    // Update alerts
                    const alertsDiv = document.getElementById('alerts');
                    if (data.alerts && data.alerts.length > 0) {
                        alertsDiv.innerHTML = data.alerts.map(alert => 
                            `<div class="alert ${alert.level}">
                                <strong>${alert.type.toUpperCase()}</strong>: ${alert.message}<br>
                                <small>${new Date(alert.timestamp).toLocaleString()}</small>
                            </div>`
                        ).join('');
                    } else {
                        alertsDiv.innerHTML = '<div class="alert info">No active alerts</div>';
                    }
                    
                    // Update raw data
                    document.getElementById('data').textContent = JSON.stringify(data, null, 2);
                })
                .catch(err => {
                    console.error('Dashboard update error:', err);
                });
        }
        
        // Update every second
        updateDashboard();
        setInterval(updateDashboard, 1000);
    </script>
</body>
</html>"""
            self.wfile.write(html.encode("utf-8"))
        
        elif self.path == "/api":
            # API endpoint for JSON data
            simulate()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(TWIN, indent=2).encode("utf-8"))
        
        else:
            self.send_response(404)
            self.end_headers()

def run(port=9081):
    """Start the dashboard server"""
    server = HTTPServer(("127.0.0.1", port), TwinDashboardHandler)
    print(f"[INFO] Digital Twin Dashboard running on http://127.0.0.1:{port}")
    print(f"[INFO] Dashboard: http://127.0.0.1:{port}/")
    print(f"[INFO] API: http://127.0.0.1:{port}/api")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down dashboard...")
        server.shutdown()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9081
    run(port)

