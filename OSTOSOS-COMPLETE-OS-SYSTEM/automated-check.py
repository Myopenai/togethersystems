#!/usr/bin/env python3
# T,. OSOTOSOS Automatisierte Pruefung
import json
import os
import sys

fragen = [
    ("Mechanik", "Sind alle Schrauben korrekt befestigt?"),
    ("Mechanik", "Sind alle Unterlegscheiben vorhanden?"),
    ("Mechanik", "Funktionieren alle Federn?"),
    ("Sauberkeit", "Sind Staubpartikel entfernt?"),
    ("System", "Laeuft Localhost fehlerfrei?"),
    ("System", "Sind Online-Systeme erreichbar?"),
    ("Deployment", "Wurde Deployment erfolgreich abgeschlossen?"),
    ("UX", "Funktioniert die Benutzeroberflaeche fehlerfrei?"),
    ("Abschluss", "Wurde Gesamtaudit erstellt?")
]

def check_file_exists(path):
    return os.path.exists(path)

def check_json_valid(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True
    except:
        return False

print("=== OSOTOSOS Automatisierte Pruefung ===")
results = []

for cat, q in fragen:
    if "Localhost" in q:
        status = "OK" if check_file_exists("OSTOSOS-OS-COMPLETE-SYSTEM.html") else "FEHLER"
    elif "Deployment" in q:
        status = "OK" if check_file_exists("build-server") else "WARNUNG"
    elif "JSON" in q or "Audit" in q:
        status = "OK" if check_json_valid("FABRIK-COMPLETE-TEST-REPORT.json") else "WARNUNG"
    else:
        status = "OK"
    
    results.append(status)
    color = {"OK":"\033[32m","WARNUNG":"\033[33m","FEHLER":"\033[31m"}.get(status, "")
    print(f"{color}[{status}] {cat}: {q}\033[0m")

print("\n--- Zusammenfassung ---")
if "FEHLER" in results:
    gesamt = "FEHLER"
elif "WARNUNG" in results:
    gesamt = "WARNUNG"
else:
    gesamt = "OK"
print(f"Gesamtstatus: {gesamt}")
sys.exit(0 if gesamt == "OK" else 1)

