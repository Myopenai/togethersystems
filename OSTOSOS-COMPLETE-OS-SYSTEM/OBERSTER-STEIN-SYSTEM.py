#!/usr/bin/env python3
"""
T,. OSOTOSOS - OBERSTER STEIN SYSTEM
Der fundamentale oberste Stein, der die gesamte Fabrik durchleuchtet,
Schwachstellen findet, Inkonsistenzen aufdeckt und alles in Balance hält.

Prinzip: Schlauchwassersäule - gleichmäßige Ebene überall
Ozean-Prinzip: Wenn an einer Küste Wasser steigt, fällt es an der anderen
"""

import os
import sys
import json
import ast
import re
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict
from datetime import datetime

class ObersterStein:
    """Der oberste Stein - umfassende System-Analyse"""
    
    def __init__(self, root_path: str):
        self.root = Path(root_path)
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "schwachstellen": [],
            "inkonsistenzen": [],
            "funktionslose_funktionen": [],
            "bedeutungsvolle_aber_defekte": [],
            "unqualifizierte_techniken": [],
            "fliessband_probleme": [],
            "schmierung_probleme": [],
            "balance_analyse": {},
            "gesamtbewertung": {}
        }
        self.funktionen_registry = {}
        self.imports_map = defaultdict(set)
        self.definitions_map = {}
        self.references_map = defaultdict(int)
        
    def analyse_komplett(self):
        """Komplette Analyse der gesamten Fabrik"""
        print("=== T,. OBERSTER STEIN - Komplette Fabrik-Analyse ===")
        print()
        
        # 1. Datei-Struktur analysieren
        print("[1/10] Analysiere Datei-Struktur...")
        self.analyse_datei_struktur()
        
        # 2. Python-Code analysieren
        print("[2/10] Analysiere Python-Code...")
        self.analyse_python_code()
        
        # 3. JavaScript-Code analysieren
        print("[3/10] Analysiere JavaScript-Code...")
        self.analyse_javascript_code()
        
        # 4. HTML-Dateien analysieren
        print("[4/10] Analysiere HTML-Dateien...")
        self.analyse_html_dateien()
        
        # 5. Funktionslose Funktionen finden
        print("[5/10] Finde funktionslose Funktionen...")
        self.finde_funktionslose_funktionen()
        
        # 6. Bedeutungsvolle aber defekte Funktionen
        print("[6/10] Finde bedeutungsvolle aber defekte Funktionen...")
        self.finde_bedeutungsvolle_aber_defekte()
        
        # 7. Inkonsistenzen finden
        print("[7/10] Finde Inkonsistenzen...")
        self.finde_inkonsistenzen()
        
        # 8. Unqualifizierte Techniken
        print("[8/10] Analysiere Techniken...")
        self.analysiere_techniken()
        
        # 9. Fließband-Probleme
        print("[9/10] Analysiere Fließband-Prozess...")
        self.analysiere_fliessband()
        
        # 10. Balance-Analyse (Ozean-Prinzip)
        print("[10/10] Führe Balance-Analyse durch (Ozean-Prinzip)...")
        self.balance_analyse()
        
        # Report generieren
        self.generiere_report()
        
    def analyse_datei_struktur(self):
        """Analysiert die Datei-Struktur auf Probleme"""
        fehlende_dateien = []
        doppelte_dateien = []
        unorganisierte_dateien = []
        
        # Erwartete Struktur
        erwartete_ordner = [
            "scripts", "build", "artifacts", "logs",
            ".github/workflows"
        ]
        
        for ordner in erwartete_ordner:
            pfad = self.root / ordner
            if not pfad.exists():
                fehlende_dateien.append(ordner)
        
        # Finde doppelte Dateien (gleicher Name, verschiedene Orte)
        dateien_namen = defaultdict(list)
        for datei in self.root.rglob("*"):
            if datei.is_file():
                dateien_namen[datei.name].append(str(datei.relative_to(self.root)))
        
        for name, pfade in dateien_namen.items():
            if len(pfade) > 1:
                doppelte_dateien.append({"name": name, "pfade": pfade})
        
        if fehlende_dateien:
            self.report["schwachstellen"].append({
                "kategorie": "Datei-Struktur",
                "problem": "Fehlende Ordner",
                "details": fehlende_dateien
            })
        
        if doppelte_dateien:
            self.report["inkonsistenzen"].append({
                "kategorie": "Datei-Struktur",
                "problem": "Doppelte Dateien",
                "details": doppelte_dateien
            })
    
    def analyse_python_code(self):
        """Analysiert Python-Code auf Probleme"""
        for py_file in self.root.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    tree = ast.parse(content, filename=str(py_file))
                    
                    # Analysiere AST
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef):
                            func_name = node.name
                            func_key = f"{py_file}:{func_name}"
                            
                            # Prüfe ob Funktion leer ist
                            if not node.body or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                                self.report["funktionslose_funktionen"].append({
                                    "datei": str(py_file.relative_to(self.root)),
                                    "funktion": func_name,
                                    "problem": "Leere Funktion oder nur 'pass'"
                                })
                            
                            # Prüfe auf try-except ohne Inhalt
                            if len(node.body) == 1 and isinstance(node.body[0], ast.Try):
                                try_node = node.body[0]
                                if not try_node.body and not try_node.handlers:
                                    self.report["funktionslose_funktionen"].append({
                                        "datei": str(py_file.relative_to(self.root)),
                                        "funktion": func_name,
                                        "problem": "Try-Except ohne Inhalt"
                                    })
                            
                            # Registriere Funktion
                            self.funktionen_registry[func_key] = {
                                "datei": str(py_file.relative_to(self.root)),
                                "name": func_name,
                                "linie": node.lineno,
                                "aufrufe": []
                            }
                            
                            # Finde Funktionsaufrufe
                            for call in ast.walk(node):
                                if isinstance(call, ast.Call):
                                    if isinstance(call.func, ast.Name):
                                        self.references_map[call.func.id] += 1
                        
                        # Analysiere Imports
                        if isinstance(node, ast.Import):
                            for alias in node.names:
                                self.imports_map[str(py_file.relative_to(self.root))].add(alias.name)
                        elif isinstance(node, ast.ImportFrom):
                            if node.module:
                                self.imports_map[str(py_file.relative_to(self.root))].add(node.module)
                                
            except SyntaxError as e:
                self.report["bedeutungsvolle_aber_defekte"].append({
                    "datei": str(py_file.relative_to(self.root)),
                    "problem": f"Syntax-Fehler: {e}",
                    "linie": e.lineno
                })
            except Exception as e:
                self.report["schwachstellen"].append({
                    "kategorie": "Python-Analyse",
                    "datei": str(py_file.relative_to(self.root)),
                    "problem": f"Analyse-Fehler: {e}"
                })
    
    def analyse_javascript_code(self):
        """Analysiert JavaScript-Code auf Probleme"""
        for js_file in self.root.rglob("*.js"):
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Finde Funktionen
                    func_pattern = r'function\s+(\w+)\s*\([^)]*\)\s*\{'
                    functions = re.findall(func_pattern, content)
                    
                    # Prüfe auf leere Funktionen
                    for func_name in functions:
                        escaped_name = re.escape(func_name)
                        func_pattern_full = r'function\s+' + escaped_name + r'\s*\([^)]*\)\s*\{([^}]*)\}'
                        match = re.search(func_pattern_full, content, re.DOTALL)
                        if match:
                            body = match.group(1).strip()
                            if not body or body == "" or body == "// TODO" or body == "// placeholder":
                                self.report["funktionslose_funktionen"].append({
                                    "datei": str(js_file.relative_to(self.root)),
                                    "funktion": func_name,
                                    "problem": "Leere JavaScript-Funktion"
                                })
                    
                    # Prüfe auf console.log ohne Bedeutung
                    if "console.log" in content and "console.error" not in content:
                        log_count = content.count("console.log")
                        if log_count > 10:
                            self.report["unqualifizierte_techniken"].append({
                                "datei": str(js_file.relative_to(self.root)),
                                "problem": f"Zu viele console.log ({log_count}), sollte console.error/warn verwenden"
                            })
                    
                    # Prüfe auf fehlende Error-Handling
                    if "try" not in content and "catch" not in content:
                        if len(content) > 500:  # Nur bei größeren Dateien
                            self.report["schwachstellen"].append({
                                "kategorie": "JavaScript",
                                "datei": str(js_file.relative_to(self.root)),
                                "problem": "Fehlendes Error-Handling (kein try-catch)"
                            })
                            
            except Exception as e:
                self.report["schwachstellen"].append({
                    "kategorie": "JavaScript-Analyse",
                    "datei": str(js_file.relative_to(self.root)),
                    "problem": f"Analyse-Fehler: {e}"
                })
    
    def analyse_html_dateien(self):
        """Analysiert HTML-Dateien auf Probleme"""
        for html_file in self.root.rglob("*.html"):
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Prüfe auf fehlende charset
                    if "<meta charset" not in content.lower():
                        self.report["inkonsistenzen"].append({
                            "kategorie": "HTML",
                            "datei": str(html_file.relative_to(self.root)),
                            "problem": "Fehlende charset-Deklaration"
                        })
                    
                    # Prüfe auf doppelte IDs
                    id_pattern = r'id=["\']([^"\']+)["\']'
                    ids = re.findall(id_pattern, content)
                    duplicate_ids = [id for id in ids if ids.count(id) > 1]
                    if duplicate_ids:
                        self.report["inkonsistenzen"].append({
                            "kategorie": "HTML",
                            "datei": str(html_file.relative_to(self.root)),
                            "problem": f"Doppelte IDs: {list(set(duplicate_ids))}"
                        })
                    
                    # Prüfe auf fehlende Script-Tags für referenzierte Dateien
                    script_refs = re.findall(r'src=["\']([^"\']+\.js)["\']', content)
                    for script_ref in script_refs:
                        script_path = html_file.parent / script_ref
                        if not script_path.exists():
                            self.report["bedeutungsvolle_aber_defekte"].append({
                                "datei": str(html_file.relative_to(self.root)),
                                "problem": f"Referenziertes Script nicht gefunden: {script_ref}"
                            })
                            
            except Exception as e:
                self.report["schwachstellen"].append({
                    "kategorie": "HTML-Analyse",
                    "datei": str(html_file.relative_to(self.root)),
                    "problem": f"Analyse-Fehler: {e}"
                })
    
    def finde_funktionslose_funktionen(self):
        """Findet Funktionen ohne Bedeutung"""
        # Bereits in analyse_python_code und analyse_javascript_code gefunden
        # Zusätzlich: Funktionen die nie aufgerufen werden
        for func_key, func_info in self.funktionen_registry.items():
            func_name = func_info["name"]
            if func_name not in self.references_map or self.references_map[func_name] == 0:
                # Prüfe ob es eine main-Funktion oder spezielle Funktion ist
                if func_name not in ["main", "__init__", "__main__", "bootstrap", "run_server"]:
                    self.report["funktionslose_funktionen"].append({
                        "datei": func_info["datei"],
                        "funktion": func_name,
                        "problem": "Funktion wird nie aufgerufen"
                    })
    
    def finde_bedeutungsvolle_aber_defekte(self):
        """Findet Funktionen mit Bedeutung aber Defekten"""
        # Bereits teilweise gefunden, hier zusätzliche Prüfungen
        for py_file in self.root.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines, 1):
                        # Prüfe auf TODO/FIXME ohne Lösung
                        if "TODO" in line or "FIXME" in line:
                            if "DONE" not in line and "FIXED" not in line:
                                self.report["bedeutungsvolle_aber_defekte"].append({
                                    "datei": str(py_file.relative_to(self.root)),
                                    "problem": f"TODO/FIXME ohne Lösung in Zeile {i}",
                                    "inhalt": line.strip()
                                })
            except:
                pass
    
    def finde_inkonsistenzen(self):
        """Findet Inkonsistenzen im System"""
        # Prüfe auf unterschiedliche Coding-Stile
        python_files = list(self.root.rglob("*.py"))
        if python_files:
            # Prüfe auf gemischte Quote-Stile
            single_quotes = 0
            double_quotes = 0
            for py_file in python_files[:10]:  # Sample
                try:
                    with open(py_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        single_quotes += content.count("'")
                        double_quotes += content.count('"')
                except:
                    pass
            
            if single_quotes > 0 and double_quotes > 0:
                ratio = single_quotes / (single_quotes + double_quotes)
                if 0.3 < ratio < 0.7:  # Gemischt
                    self.report["inkonsistenzen"].append({
                        "kategorie": "Coding-Stil",
                        "problem": "Gemischte Quote-Stile (single/double quotes)"
                    })
    
    def analysiere_techniken(self):
        """Analysiert verwendete Techniken auf Qualität"""
        # Prüfe auf veraltete Techniken
        for py_file in self.root.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Prüfe auf eval() - unsicher
                    if "eval(" in content:
                        self.report["unqualifizierte_techniken"].append({
                            "datei": str(py_file.relative_to(self.root)),
                            "problem": "Verwendung von eval() - Sicherheitsrisiko"
                        })
                    
                    # Prüfe auf exec() - unsicher
                    if "exec(" in content:
                        self.report["unqualifizierte_techniken"].append({
                            "datei": str(py_file.relative_to(self.root)),
                            "problem": "Verwendung von exec() - Sicherheitsrisiko"
                        })
            except:
                pass
    
    def analysiere_fliessband(self):
        """Analysiert Fließband-Prozess auf Probleme"""
        # Prüfe Script-Abhängigkeiten
        script_files = list((self.root / "scripts").glob("*.sh")) if (self.root / "scripts").exists() else []
        script_files += list((self.root / "scripts").glob("*.ps1")) if (self.root / "scripts").exists() else []
        
        for script in script_files:
            try:
                with open(script, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Prüfe auf harte Pfade
                    if "C:\\" in content or "/home/" in content:
                        self.report["fliessband_probleme"].append({
                            "datei": str(script.relative_to(self.root)),
                            "problem": "Harte Pfade statt relative Pfade"
                        })
                    
                    # Prüfe auf fehlende Error-Handling
                    if "set -e" not in content and "ErrorActionPreference" not in content:
                        self.report["fliessband_probleme"].append({
                            "datei": str(script.relative_to(self.root)),
                            "problem": "Fehlendes Error-Handling (set -e oder ErrorActionPreference)"
                        })
            except:
                pass
    
    def analysiere_schmierung(self):
        """Analysiert 'Schmierung' - Dependencies, Imports, etc."""
        # Prüfe auf zirkuläre Imports
        # Prüfe auf fehlende Dependencies
        for file_path, imports in self.imports_map.items():
            for imp in imports:
                # Prüfe ob Import existiert (vereinfacht)
                if imp.startswith(".") or imp.startswith("/"):
                    # Relative Import - prüfe ob Datei existiert
                    pass  # Komplex, hier vereinfacht
    
    def balance_analyse(self):
        """Ozean-Prinzip: Balance-Analyse"""
        # Analysiere Verteilung von Code, Tests, Dokumentation
        code_files = len(list(self.root.rglob("*.py"))) + len(list(self.root.rglob("*.js")))
        test_files = len(list(self.root.rglob("*test*.py"))) + len(list(self.root.rglob("*test*.js")))
        doc_files = len(list(self.root.rglob("*.md"))) + len(list(self.root.rglob("*.txt")))
        
        total_files = code_files + test_files + doc_files
        if total_files > 0:
            code_ratio = code_files / total_files
            test_ratio = test_files / total_files
            doc_ratio = doc_files / total_files
            
            self.report["balance_analyse"] = {
                "code_anteil": f"{code_ratio:.2%}",
                "test_anteil": f"{test_ratio:.2%}",
                "dokumentation_anteil": f"{doc_ratio:.2%}",
                "bewertung": "GUT" if test_ratio > 0.1 and doc_ratio > 0.05 else "VERBESSERUNGSBEDARF"
            }
            
            if test_ratio < 0.1:
                self.report["schwachstellen"].append({
                    "kategorie": "Balance",
                    "problem": f"Zu wenige Tests ({test_ratio:.1%}), sollte >10% sein"
                })
            
            if doc_ratio < 0.05:
                self.report["schwachstellen"].append({
                    "kategorie": "Balance",
                    "problem": f"Zu wenig Dokumentation ({doc_ratio:.1%}), sollte >5% sein"
                })
    
    def generiere_report(self):
        """Generiert den finalen Report"""
        # Zähle Probleme
        anzahl_schwachstellen = len(self.report["schwachstellen"])
        anzahl_inkonsistenzen = len(self.report["inkonsistenzen"])
        anzahl_funktionslos = len(self.report["funktionslose_funktionen"])
        anzahl_defekt = len(self.report["bedeutungsvolle_aber_defekte"])
        anzahl_unqualifiziert = len(self.report["unqualifizierte_techniken"])
        anzahl_fliessband = len(self.report["fliessband_probleme"])
        
        gesamt_probleme = (anzahl_schwachstellen + anzahl_inkonsistenzen + 
                          anzahl_funktionslos + anzahl_defekt + 
                          anzahl_unqualifiziert + anzahl_fliessband)
        
        # Gesamtbewertung
        if gesamt_probleme == 0:
            bewertung = "PERFEKT"
            status = "✅"
        elif gesamt_probleme < 10:
            bewertung = "SEHR GUT"
            status = "✅"
        elif gesamt_probleme < 30:
            bewertung = "GUT"
            status = "⚠️"
        elif gesamt_probleme < 50:
            bewertung = "VERBESSERUNGSBEDARF"
            status = "⚠️"
        else:
            bewertung = "KRITISCH"
            status = "❌"
        
        self.report["gesamtbewertung"] = {
            "bewertung": bewertung,
            "status": status,
            "gesamt_probleme": gesamt_probleme,
            "aufschlüsselung": {
                "schwachstellen": anzahl_schwachstellen,
                "inkonsistenzen": anzahl_inkonsistenzen,
                "funktionslose_funktionen": anzahl_funktionslos,
                "bedeutungsvolle_aber_defekte": anzahl_defekt,
                "unqualifizierte_techniken": anzahl_unqualifiziert,
                "fliessband_probleme": anzahl_fliessband
            }
        }
        
        # Report speichern
        report_file = self.root / "artifacts" / f"oberster-stein-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        
        # Generiere auch HTML-Report
        try:
            import subprocess
            html_generator = self.root / "OBERSTER-STEIN-REPORT-GENERATOR.py"
            if html_generator.exists():
                subprocess.run([sys.executable, str(html_generator), str(report_file)], 
                             capture_output=True, check=False)
        except:
            pass  # HTML-Generator optional
        
        # Console-Output
        print()
        print("=" * 70)
        print(f"T,. OBERSTER STEIN - ANALYSE ABGESCHLOSSEN")
        print("=" * 70)
        print()
        print(f"Gesamtbewertung: {status} {bewertung}")
        print(f"Gesamtprobleme: {gesamt_probleme}")
        print()
        print("Aufschlüsselung:")
        print(f"  - Schwachstellen: {anzahl_schwachstellen}")
        print(f"  - Inkonsistenzen: {anzahl_inkonsistenzen}")
        print(f"  - Funktionslose Funktionen: {anzahl_funktionslos}")
        print(f"  - Bedeutungsvolle aber defekte: {anzahl_defekt}")
        print(f"  - Unqualifizierte Techniken: {anzahl_unqualifiziert}")
        print(f"  - Fließband-Probleme: {anzahl_fliessband}")
        print()
        print(f"Report gespeichert: {report_file}")
        print()
        print("=" * 70)
        
        # Detaillierte Ausgabe
        if gesamt_probleme > 0:
            print()
            print("DETAILLIERTE PROBLEME:")
            print()
            
            if anzahl_schwachstellen > 0:
                print(f"🔴 SCHWACHSTELLEN ({anzahl_schwachstellen}):")
                for item in self.report["schwachstellen"][:5]:
                    print(f"  - {item.get('kategorie', 'Unbekannt')}: {item.get('problem', 'N/A')}")
                if anzahl_schwachstellen > 5:
                    print(f"  ... und {anzahl_schwachstellen - 5} weitere")
                print()
            
            if anzahl_inkonsistenzen > 0:
                print(f"🟡 INKONSISTENZEN ({anzahl_inkonsistenzen}):")
                for item in self.report["inkonsistenzen"][:5]:
                    print(f"  - {item.get('kategorie', 'Unbekannt')}: {item.get('problem', 'N/A')}")
                if anzahl_inkonsistenzen > 5:
                    print(f"  ... und {anzahl_inkonsistenzen - 5} weitere")
                print()
            
            if anzahl_funktionslos > 0:
                print(f"⚪ FUNKTIONSLOSE FUNKTIONEN ({anzahl_funktionslos}):")
                for item in self.report["funktionslose_funktionen"][:5]:
                    print(f"  - {item.get('datei', 'N/A')}: {item.get('funktion', 'N/A')}")
                if anzahl_funktionslos > 5:
                    print(f"  ... und {anzahl_funktionslos - 5} weitere")
                print()

if __name__ == "__main__":
    root_path = sys.argv[1] if len(sys.argv) > 1 else "."
    stein = ObersterStein(root_path)
    stein.analyse_komplett()

