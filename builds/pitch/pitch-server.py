#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[.SYSTEMS.T.SYSTEMS.] Pitch Server
Fabrikation Standard TÜV MCP
Original: https://tinyurl.com/BUGCOMPANY
TogetherSystems International TTT
"""

import os
import sys
import http.server
import socketserver
import webbrowser
import threading
import time
from pathlib import Path

PORT = int(os.getenv('PORT', '9090'))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP Request Handler mit CORS Support"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom logging - kann erweitert werden"""
        message = format % args
        print(f"[{self.log_date_time_string()}] {message}")

def find_serve_directory():
    """Finde das beste Verzeichnis zum Serven"""
    # Wenn wir als EXE laufen, suche nach gui/ oder web/ Verzeichnis
    if getattr(sys, 'frozen', False):
        # PyInstaller: EXE ist in sys.executable
        base_dir = Path(sys.executable).parent
    else:
        # Normales Python Script
        base_dir = Path(__file__).parent
    
    # Suche nach GUI/Web-Verzeichnissen
    search_paths = [
        base_dir / "gui",
        base_dir / "web",
        base_dir / "www",
        base_dir,
        base_dir.parent,
        base_dir.parent.parent,
    ]
    
    for path in search_paths:
        index_path = path / "index.html"
        if index_path.exists():
            return str(path)
    
    # Fallback: aktuelles Verzeichnis
    return str(base_dir)

def start_server():
    """Startet den HTTP Server"""
    serve_dir = find_serve_directory()
    os.chdir(serve_dir)
    
    Handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    
    print("=" * 50)
    print("[.SYSTEMS.T.SYSTEMS.] Pitch Server")
    print("Fabrikation Standard TÜV MCP")
    print("=" * 50)
    print(f"Server running at: http://127.0.0.1:{PORT}")
    print(f"Directory: {serve_dir}")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    print("")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.shutdown()

def open_browser():
    """Öffnet Browser nach kurzer Verzögerung"""
    time.sleep(1.5)  # Warte bis Server hochgefahren ist
    url = f"http://127.0.0.1:{PORT}"
    print(f"Opening browser: {url}")
    webbrowser.open(url)

def main():
    """Hauptfunktion - Startet Server und Browser"""
    # Server im Hintergrund-Thread starten
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Browser öffnen
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    # Haupt-Thread wartet auf Eingabe
    try:
        print("\nServer läuft. Drücken Sie Enter zum Beenden...")
        input()
    except KeyboardInterrupt:
        pass
    
    print("\nShutting down...")
    sys.exit(0)

if __name__ == "__main__":
    main()
