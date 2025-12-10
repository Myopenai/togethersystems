#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[.SYSTEMS.T.SYSTEMS.] Pitch Launcher (GUI)
Fabrikation Standard TÜV MCP
Original: https://tinyurl.com/BUGCOMPANY
TogetherSystems International TTT
"""

import subprocess
import webbrowser
import tkinter as tk
from tkinter import messagebox
from pathlib import Path
import sys
import time
import threading

# Pfade bestimmen
if getattr(sys, 'frozen', False):
    ROOT = Path(sys.executable).parent
else:
    ROOT = Path(__file__).parent

SERVER_EXE = ROOT / "server" / "ostosos-server.exe"
PITCH_PDF = ROOT / "docs" / "PITCH.pdf"
README_PDF = ROOT / "docs" / "README.pdf"

# Server-Prozess
server_process = None

def start_server():
    """Startet den Server"""
    global server_process
    
    if server_process is not None:
        status_var.set("Server läuft bereits!")
        return
    
    # Prüfe ob Server-EXE existiert
    if not SERVER_EXE.exists():
        # Fallback: Python-Script
        server_script = ROOT / "pitch-server.py"
        if server_script.exists():
            server_process = subprocess.Popen([sys.executable, str(server_script)])
        else:
            messagebox.showerror("Fehler", "Server-Executable nicht gefunden!")
            status_var.set("Server nicht gefunden!")
            return
    else:
        server_process = subprocess.Popen([str(SERVER_EXE)])
    
    status_var.set("Server wird gestartet...")
    
    # Warte kurz und öffne Browser
    def open_browser_delayed():
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:9090")
        status_var.set("Server läuft, Browser geöffnet!")
    
    threading.Thread(target=open_browser_delayed, daemon=True).start()

def stop_server():
    """Stoppt den Server"""
    global server_process
    
    if server_process is not None:
        server_process.terminate()
        server_process = None
        status_var.set("Server gestoppt.")
    else:
        status_var.set("Kein Server läuft.")

def open_pitch():
    """Öffnet Pitch-PDF"""
    if PITCH_PDF.exists():
        webbrowser.open(str(PITCH_PDF))
        status_var.set("Pitch-PDF geöffnet!")
    else:
        messagebox.showwarning("Warnung", "PITCH.pdf nicht gefunden!")
        status_var.set("PITCH.pdf nicht gefunden!")

def open_readme():
    """Öffnet README-PDF"""
    if README_PDF.exists():
        webbrowser.open(str(README_PDF))
        status_var.set("README-PDF geöffnet!")
    else:
        messagebox.showwarning("Warnung", "README.pdf nicht gefunden!")
        status_var.set("README.pdf nicht gefunden!")

def on_closing():
    """Beim Schließen des Fensters"""
    global server_process
    if server_process is not None:
        server_process.terminate()
    root.destroy()

# GUI erstellen
root = tk.Tk()
root.title("[.SYSTEMS.T.SYSTEMS.] ostosos Pitch")
root.geometry("400x300")
root.protocol("WM_DELETE_WINDOW", on_closing)

# Status-Variable
status_var = tk.StringVar()
status_var.set("Bereit.")

# Titel
title_label = tk.Label(root, text="[.SYSTEMS.T.SYSTEMS.] ostosos Pitch", 
                       font=("Arial", 14, "bold"))
title_label.pack(pady=10)

# Buttons
button_frame = tk.Frame(root)
button_frame.pack(pady=10)

btn_start = tk.Button(button_frame, text="🚀 Server starten + GUI öffnen", 
                     command=start_server, width=30, height=2)
btn_start.pack(pady=5)

btn_stop = tk.Button(button_frame, text="⏹ Server stoppen", 
                    command=stop_server, width=30, height=2)
btn_stop.pack(pady=5)

btn_pitch = tk.Button(button_frame, text="📄 Pitch (PDF) öffnen", 
                      command=open_pitch, width=30, height=2)
btn_pitch.pack(pady=5)

btn_readme = tk.Button(button_frame, text="📖 README (PDF) öffnen", 
                      command=open_readme, width=30, height=2)
btn_readme.pack(pady=5)

# Status
status_label = tk.Label(root, textvariable=status_var, 
                       font=("Arial", 10), fg="blue")
status_label.pack(pady=10)

# Footer
footer_label = tk.Label(root, text="TogetherSystems International TTT\nhttps://tinyurl.com/BUGCOMPANY", 
                       font=("Arial", 8), fg="gray")
footer_label.pack(side=tk.BOTTOM, pady=5)

root.mainloop()
