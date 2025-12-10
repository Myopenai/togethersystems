#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[.SYSTEMS.T.SYSTEMS.] Pitch Launcher
Professioneller Launcher für ostosos Pitch
Original: https://tinyurl.com/BUGCOMPANY
TogetherSystems International TTT
"""

import subprocess
import webbrowser
import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path
import time
import sys
import os
import threading

# Branding
BRANDING = "[.SYSTEMS.T.SYSTEMS.]"
ORIGINAL_URL = "https://tinyurl.com/BUGCOMPANY"

# Pfade
ROOT = Path(__file__).resolve().parent
SERVER_EXE_GO = ROOT / "server" / "ostosos-server.exe"
SERVER_EXE_PYTHON = ROOT / "server" / "ostosos-python.exe"
SERVER_SCRIPT = ROOT / "server" / "python-server.py"
DOCS_DIR = ROOT / "docs"
PITCH_PDF = DOCS_DIR / "PITCH.pdf"
README_PDF = DOCS_DIR / "README.pdf"

# Server-Prozess
server_process = None
server_port = 9090

def find_server():
    """Finde verfügbaren Server (Priorität: Python Exe → Go Exe → Python Script)"""
    if SERVER_EXE_PYTHON.exists():
        return str(SERVER_EXE_PYTHON), "python-exe"
    elif SERVER_EXE_GO.exists():
        return str(SERVER_EXE_GO), "go-exe"
    elif SERVER_SCRIPT.exists():
        return str(SERVER_SCRIPT), "python-script"
    return None, None

def start_server():
    """Starte Server im Hintergrund"""
    global server_process
    
    server_path, server_type = find_server()
    
    if not server_path:
        status_var.set("❌ Kein Server gefunden!")
        messagebox.showerror("Fehler", "Kein Server-Executable gefunden!\n\nErwartete Orte:\n- server/ostosos-server.exe\n- server/ostosos-python.exe\n- server/python-server.py")
        return False
    
    try:
        if server_type == "python-script":
            server_process = subprocess.Popen([sys.executable, server_path], 
                                             stdout=subprocess.PIPE, 
                                             stderr=subprocess.PIPE)
        else:
            server_process = subprocess.Popen([server_path], 
                                             stdout=subprocess.PIPE, 
                                             stderr=subprocess.PIPE)
        
        # Warte kurz, damit Server hochkommt
        time.sleep(2)
        
        # Prüfe ob Server läuft
        if server_process.poll() is None:
            status_var.set("✅ Server gestartet!")
            return True
        else:
            status_var.set("❌ Server konnte nicht gestartet werden!")
            return False
    except Exception as e:
        status_var.set(f"❌ Fehler: {str(e)}")
        messagebox.showerror("Fehler", f"Server konnte nicht gestartet werden:\n{str(e)}")
        return False

def stop_server():
    """Stoppe Server"""
    global server_process
    
    if server_process:
        try:
            server_process.terminate()
            server_process.wait(timeout=5)
        except:
            server_process.kill()
        server_process = None
        status_var.set("⏹️ Server gestoppt")
    else:
        status_var.set("ℹ️ Kein Server läuft")

def open_browser():
    """Öffne Browser mit GUI"""
    url = f"http://127.0.0.1:{server_port}"
    try:
        webbrowser.open(url)
        status_var.set("🌐 Browser geöffnet")
    except Exception as e:
        status_var.set(f"❌ Browser-Fehler: {str(e)}")
        messagebox.showerror("Fehler", f"Browser konnte nicht geöffnet werden:\n{str(e)}")

def start_server_and_browser():
    """Starte Server und öffne Browser"""
    if start_server():
        time.sleep(1)
        open_browser()
        btn_start.config(state="disabled")
        btn_stop.config(state="normal")
        btn_browser.config(state="normal")

def open_pitch_pdf():
    """Öffne Pitch PDF"""
    if PITCH_PDF.exists():
        try:
            webbrowser.open(str(PITCH_PDF))
            status_var.set("📄 Pitch PDF geöffnet")
        except Exception as e:
            status_var.set(f"❌ PDF-Fehler: {str(e)}")
            messagebox.showerror("Fehler", f"PDF konnte nicht geöffnet werden:\n{str(e)}")
    else:
        status_var.set("❌ PITCH.pdf nicht gefunden")
        messagebox.showwarning("Warnung", f"PITCH.pdf nicht gefunden:\n{PITCH_PDF}")

def open_readme_pdf():
    """Öffne README PDF"""
    if README_PDF.exists():
        try:
            webbrowser.open(str(README_PDF))
            status_var.set("📖 README PDF geöffnet")
        except Exception as e:
            status_var.set(f"❌ PDF-Fehler: {str(e)}")
            messagebox.showerror("Fehler", f"PDF konnte nicht geöffnet werden:\n{str(e)}")
    else:
        status_var.set("❌ README.pdf nicht gefunden")
        messagebox.showwarning("Warnung", f"README.pdf nicht gefunden:\n{README_PDF}")

def on_closing():
    """Beim Schließen: Server stoppen"""
    stop_server()
    root.destroy()

# GUI erstellen
root = tk.Tk()
root.title(f"{BRANDING} ostosos Pitch Launcher")
root.geometry("500x400")
root.resizable(False, False)

# Styling
style = ttk.Style()
style.theme_use('clam')

# Header
header_frame = tk.Frame(root, bg="#2c3e50", height=80)
header_frame.pack(fill=tk.X, padx=0, pady=0)

header_label = tk.Label(header_frame, 
                        text=f"{BRANDING}\nostosos Pitch Launcher",
                        font=("Arial", 16, "bold"),
                        bg="#2c3e50",
                        fg="white")
header_label.pack(pady=15)

# Content Frame
content_frame = tk.Frame(root, bg="white")
content_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

# Status
status_var = tk.StringVar()
status_var.set("✅ Bereit")

status_label = tk.Label(content_frame, 
                       textvariable=status_var,
                       font=("Arial", 10),
                       bg="white",
                       fg="#27ae60")
status_label.pack(pady=10)

# Buttons
btn_frame = tk.Frame(content_frame, bg="white")
btn_frame.pack(pady=20)

btn_start = tk.Button(btn_frame,
                     text="🚀 Server starten + GUI öffnen",
                     command=start_server_and_browser,
                     font=("Arial", 11, "bold"),
                     bg="#27ae60",
                     fg="white",
                     width=30,
                     height=2,
                     cursor="hand2")
btn_start.pack(pady=5)

btn_browser = tk.Button(btn_frame,
                       text="🌐 Browser öffnen",
                       command=open_browser,
                       font=("Arial", 11),
                       bg="#3498db",
                       fg="white",
                       width=30,
                       height=2,
                       state="disabled",
                       cursor="hand2")
btn_browser.pack(pady=5)

btn_stop = tk.Button(btn_frame,
                    text="⏹️ Server stoppen",
                    command=stop_server,
                    font=("Arial", 11),
                    bg="#e74c3c",
                    fg="white",
                    width=30,
                    height=2,
                    state="disabled",
                    cursor="hand2")
btn_stop.pack(pady=5)

# Separator
separator = ttk.Separator(content_frame, orient="horizontal")
separator.pack(fill=tk.X, pady=20)

# PDF Buttons
pdf_frame = tk.Frame(content_frame, bg="white")
pdf_frame.pack(pady=10)

btn_pitch = tk.Button(pdf_frame,
                     text="📄 Pitch PDF öffnen",
                     command=open_pitch_pdf,
                     font=("Arial", 10),
                     bg="#9b59b6",
                     fg="white",
                     width=25,
                     cursor="hand2")
btn_pitch.pack(side=tk.LEFT, padx=5)

btn_readme = tk.Button(pdf_frame,
                      text="📖 README PDF öffnen",
                      command=open_readme_pdf,
                      font=("Arial", 10),
                      bg="#9b59b6",
                      fg="white",
                      width=25,
                      cursor="hand2")
btn_readme.pack(side=tk.LEFT, padx=5)

# Footer
footer_frame = tk.Frame(root, bg="#ecf0f1", height=40)
footer_frame.pack(fill=tk.X, side=tk.BOTTOM)

footer_label = tk.Label(footer_frame,
                       text=f"TogetherSystems International TTT | {ORIGINAL_URL}",
                       font=("Arial", 8),
                       bg="#ecf0f1",
                       fg="#7f8c8d")
footer_label.pack(pady=10)

# Window close handler
root.protocol("WM_DELETE_WINDOW", on_closing)

# Start
root.mainloop()

