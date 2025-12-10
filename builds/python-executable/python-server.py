#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[.SYSTEMS.T.SYSTEMS.] Python HTTP Server
Fabrikation Standard TÜV MCP
Original: https://tinyurl.com/BUGCOMPANY
TogetherSystems International TTT
"""

import os
import sys
import http.server
import socketserver
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

def find_index_html():
    """Finde index.html automatisch in aktuellen und übergeordneten Verzeichnissen"""
    current = Path.cwd()
    search_paths = [
        current,
        current.parent,
        current.parent.parent,
        current.parent.parent.parent
    ]
    
    for path in search_paths:
        index_path = path / "index.html"
        if index_path.exists():
            return str(path)
    
    return str(current)

def main():
    """Hauptfunktion - Startet HTTP Server"""
    serve_dir = find_index_html()
    os.chdir(serve_dir)
    
    Handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    
    print("=" * 50)
    print("[.SYSTEMS.T.SYSTEMS.] Python HTTP Server")
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

if __name__ == "__main__":
    main()

