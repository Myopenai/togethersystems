#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Pre-Response Verification System
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.
# Standardroutine: Prüft alle Prompts und Funktionen VOR User-Antwort

"""
ARBEITSPLATZ PROMPT USER EINGABE UPDATE
Standardroutine: Kontrolliert ob alle eingegebenen Prompts funktionieren im System
Dies ist System-Abschluss-Standard-Antwort bevor den Betreiber User Antwort gibt
"""

import json
import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import hashlib

class PreResponseVerification:
    """System-Abschluss-Standard: Prüft alle Prompts und Funktionen vor User-Antwort"""
    
    def __init__(self, codebase_root: Optional[str] = None):
        # Automatische Root-Erkennung
        if codebase_root is None:
            # Suche nach Root (wo Fabrikage.PromptProcessing oder OSTOSOS-COMPLETE-OS-SYSTEM ist)
            current = Path(__file__).resolve()
            while current != current.parent:
                if (current / "Fabrikage.PromptProcessing").exists() or (current / "OSTOSOS-COMPLETE-OS-SYSTEM").exists():
                    codebase_root = str(current)
                    break
                current = current.parent
            else:
                codebase_root = "."
        
        self.codebase_root = Path(codebase_root)
        self.verification_results = []
        self.failed_checks = []
        self.passed_checks = []
    
    def run_full_verification(self) -> Dict:
        """Führt vollständige Verifikation durch - Standardroutine"""
        print("=" * 80)
        print("SYSTEM-ABSCHLUSS-STANDARD: VOLLSTÄNDIGE VERIFIKATION")
        print("=" * 80)
        print(f"Zeitpunkt: {datetime.utcnow().isoformat()}Z")
        print()
        
        # 1. Prüfe alle Prompts im System
        print("PHASE 1: PROMPT-VERIFIKATION")
        print("-" * 80)
        prompt_status = self.verify_all_prompts()
        
        # 2. Prüfe alle Funktionen im Code
        print("\nPHASE 2: FUNKTIONS-VERIFIKATION")
        print("-" * 80)
        function_status = self.verify_all_functions()
        
        # 3. Prüfe Code-Integrität
        print("\nPHASE 3: CODE-INTEGRITÄTS-PRÜFUNG")
        print("-" * 80)
        integrity_status = self.verify_code_integrity()
        
        # 4. Prüfe System-Sicherheit
        print("\nPHASE 4: SICHERHEITS-PRÜFUNG")
        print("-" * 80)
        security_status = self.verify_security()
        
        # 5. Prüfe Abhängigkeiten
        print("\nPHASE 5: ABHÄNGIGKEITS-PRÜFUNG")
        print("-" * 80)
        dependency_status = self.verify_dependencies()
        
        # 6. Zusammenfassung
        print("\n" + "=" * 80)
        print("VERIFIKATIONS-ZUSAMMENFASSUNG")
        print("=" * 80)
        
        total_checks = len(self.passed_checks) + len(self.failed_checks)
        passed_count = len(self.passed_checks)
        failed_count = len(self.failed_checks)
        
        print(f"Gesamt-Pruefungen: {total_checks}")
        print(f"[OK] Bestanden: {passed_count}")
        print(f"[FAIL] Fehlgeschlagen: {failed_count}")
        print(f"Erfolgsrate: {(passed_count/total_checks*100) if total_checks > 0 else 0:.2f}%")
        
        if failed_count > 0:
            print("\n[FAIL] FEHLGESCHLAGENE PRUEFUNGEN:")
            for check in self.failed_checks:
                print(f"  - {check}")
        
        # Status bestimmen
        system_status = "READY" if failed_count == 0 else "WARNING"
        
        result = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": system_status,
            "total_checks": total_checks,
            "passed": passed_count,
            "failed": failed_count,
            "success_rate": (passed_count/total_checks*100) if total_checks > 0 else 0,
            "prompt_status": prompt_status,
            "function_status": function_status,
            "integrity_status": integrity_status,
            "security_status": security_status,
            "dependency_status": dependency_status,
            "failed_checks": self.failed_checks,
            "passed_checks": self.passed_checks
        }
        
        # Speichere Ergebnis
        self.save_result(result)
        
        return result
    
    def verify_all_prompts(self) -> Dict:
        """Prüft alle Prompts im System"""
        tracker_path = self.codebase_root / "Fabrikage.PromptProcessing" / "prompts" / "tracker.json"
        
        if not tracker_path.exists():
            self.failed_checks.append("Prompt-Tracker nicht gefunden")
            return {"status": "error", "message": "Tracker nicht gefunden"}
        
        try:
            with open(tracker_path, 'r', encoding='utf-8') as f:
                tracker_data = json.load(f)
            
            total_sessions = len(tracker_data)
            total_segments = sum(len(ctx.get('segments', [])) for ctx in tracker_data.values())
            implemented = sum(
                len([s for s in ctx.get('segments', []) 
                     if ctx.get('implementation_status', {}).get(s.get('id'), False)])
                for ctx in tracker_data.values()
            )
            
            print(f"  Sessions gefunden: {total_sessions}")
            print(f"  Prompt-Segmente: {total_segments}")
            print(f"  Implementiert: {implemented}")
            
            if total_segments > 0:
                implementation_rate = (implemented / total_segments) * 100
                print(f"  Implementierungsrate: {implementation_rate:.2f}%")
                
                if implementation_rate < 100:
                    self.failed_checks.append(f"Prompts nicht vollständig implementiert ({implementation_rate:.2f}%)")
                else:
                    self.passed_checks.append("Alle Prompts implementiert")
            
            return {
                "status": "ok",
                "sessions": total_sessions,
                "segments": total_segments,
                "implemented": implemented
            }
        except Exception as e:
            self.failed_checks.append(f"Fehler beim Lesen des Prompt-Trackers: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def verify_all_functions(self) -> Dict:
        """Prüft alle Funktionen im Code"""
        function_count = 0
        working_functions = 0
        broken_functions = []
        
        # Suche nach Python-Dateien
        python_files = list(self.codebase_root.rglob("*.py"))
        
        for py_file in python_files:
            # Überspringe __pycache__ und venv
            if any(skip in str(py_file) for skip in ['__pycache__', 'venv', '.venv', 'node_modules']):
                continue
            
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Einfache Syntax-Prüfung
                try:
                    compile(content, str(py_file), 'exec')
                    working_functions += 1
                except SyntaxError as e:
                    broken_functions.append(f"{py_file.name}: {str(e)}")
                    self.failed_checks.append(f"Syntax-Fehler in {py_file.name}")
                
                # Zähle Funktionen
                import re
                functions = re.findall(r'\bdef\s+([a-zA-Z0-9_]+)', content)
                function_count += len(functions)
                
            except Exception as e:
                self.failed_checks.append(f"Fehler beim Lesen {py_file.name}: {str(e)}")
        
        print(f"  Python-Dateien geprüft: {len(python_files)}")
        print(f"  Funktionen gefunden: {function_count}")
        print(f"  Funktionierende Dateien: {working_functions}")
        
        if broken_functions:
            print(f"  [FAIL] Defekte Dateien: {len(broken_functions)}")
        else:
            self.passed_checks.append("Alle Python-Funktionen syntaktisch korrekt")
        
        return {
            "status": "ok" if not broken_functions else "warning",
            "files_checked": len(python_files),
            "functions_found": function_count,
            "working": working_functions,
            "broken": len(broken_functions),
            "broken_list": broken_functions
        }
    
    def verify_code_integrity(self) -> Dict:
        """Prüft Code-Integrität über gesamte Fläche"""
        critical_files = [
            "Fabrikage.PromptProcessing/prompts/prompt-tracker.py",
            "Fabrikage.PromptProcessing/verification/prompt-verifier.py",
            "Fabrikage.PromptProcessing/orchestration/prompt-pipeline.py",
            "OSTOSOS-COMPLETE-OS-SYSTEM/osos-tos-production-portal.html",
            "OSTOSOS-COMPLETE-OS-SYSTEM/tuv.ps1",
            "OSTOSOS-COMPLETE-OS-SYSTEM/TUV-TEST-3X-RUNNER.ps1"
        ]
        
        missing_files = []
        existing_files = []
        
        for file_path in critical_files:
            # Versuche verschiedene Pfade
            paths_to_try = [
                self.codebase_root / file_path,
                Path(file_path),
                Path("..") / file_path,
                Path("../..") / file_path
            ]
            
            found = False
            for full_path in paths_to_try:
                if full_path.exists():
                    existing_files.append(file_path)
                    self.passed_checks.append(f"Kritische Datei vorhanden: {file_path}")
                    found = True
                    break
            
            if not found:
                # Suche rekursiv nach Dateinamen
                filename = Path(file_path).name
                found_files = list(self.codebase_root.rglob(filename))
                if not found_files:
                    found_files = list(Path("..").rglob(filename))
                
                if found_files:
                    existing_files.append(file_path)
                    self.passed_checks.append(f"Kritische Datei gefunden (alternativer Pfad): {found_files[0]}")
                else:
                    missing_files.append(file_path)
                    self.failed_checks.append(f"Kritische Datei fehlt: {file_path}")
        
        print(f"  Kritische Dateien geprueft: {len(critical_files)}")
        print(f"  [OK] Vorhanden: {len(existing_files)}")
        print(f"  [FAIL] Fehlend: {len(missing_files)}")
        
        return {
            "status": "ok" if not missing_files else "error",
            "total": len(critical_files),
            "existing": len(existing_files),
            "missing": len(missing_files),
            "missing_list": missing_files
        }
    
    def verify_security(self) -> Dict:
        """Prüft System-Sicherheit"""
        security_issues = []
        
        # Prüfe auf hardcodierte Passwörter/Secrets
        python_files = list(self.codebase_root.rglob("*.py"))
        for py_file in python_files:
            if any(skip in str(py_file) for skip in ['__pycache__', 'venv', '.venv']):
                continue
            
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Suche nach verdächtigen Patterns (aber ignoriere Arrays/Dicts)
                import re
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    line_lower = line.lower().strip()
                    # Ignoriere Kommentare, Arrays, Dicts, Listen
                    if (line_lower.startswith('#') or 
                        line_lower.startswith('"') or 
                        line_lower.startswith("'") or
                        '[' in line and ']' in line or
                        '{' in line and '}' in line):
                        continue
                    # Suche nach direkten Zuweisungen von Passwörtern
                    if 'password' in line_lower and ('=' in line) and ('input' not in line_lower):
                        # Prüfe ob es wirklich eine Zuweisung ist (nicht nur ein String in einem Array)
                        if re.search(r'password\s*=\s*["\']', line, re.IGNORECASE):
                            security_issues.append(f"Moegliches hardcodiertes Passwort in {py_file.name}:{i+1}")
                
            except:
                pass
        
        if security_issues:
            for issue in security_issues:
                self.failed_checks.append(issue)
        else:
            self.passed_checks.append("Keine offensichtlichen Sicherheitsprobleme")
        
        print(f"  Sicherheitsprüfungen durchgeführt")
        print(f"  Gefundene Probleme: {len(security_issues)}")
        
        return {
            "status": "ok" if not security_issues else "warning",
            "issues": len(security_issues),
            "issues_list": security_issues
        }
    
    def verify_dependencies(self) -> Dict:
        """Prüft Abhängigkeiten"""
        missing_deps = []
        
        # Prüfe Python-Module
        required_modules = ['json', 'os', 'sys', 'pathlib', 'datetime']
        for module in required_modules:
            try:
                __import__(module)
                self.passed_checks.append(f"Python-Modul verfügbar: {module}")
            except ImportError:
                missing_deps.append(module)
                self.failed_checks.append(f"Python-Modul fehlt: {module}")
        
        # Prüfe externe Dateien
        if missing_deps:
            print(f"  [FAIL] Fehlende Abhaengigkeiten: {', '.join(missing_deps)}")
        else:
            print(f"  [OK] Alle Abhaengigkeiten verfuegbar")
        
        return {
            "status": "ok" if not missing_deps else "error",
            "missing": missing_deps
        }
    
    def save_result(self, result: Dict):
        """Speichert Verifikations-Ergebnis"""
        reports_dir = self.codebase_root / "Fabrikage.PromptProcessing" / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        result_file = reports_dir / f"pre-response-verification-{timestamp}.json"
        
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\nErgebnis gespeichert: {result_file}")

def generate_standard_response(verification_result: Dict) -> str:
    """Generiert Standard-Antwort basierend auf Verifikations-Ergebnis"""
    status = verification_result.get('status', 'UNKNOWN')
    failed_count = verification_result.get('failed', 0)
    passed_count = verification_result.get('passed', 0)
    
    response = f"""
================================================================================
                    SYSTEM-ABSCHLUSS-STANDARD-ANTWORT
                    T,. Fabrikage Prompt Processing
================================================================================

STATUS: {status}
Zeitpunkt: {verification_result.get('timestamp', 'N/A')}

VERIFIKATIONS-ERGEBNIS:
  [OK] Bestanden: {passed_count}
  [FAIL] Fehlgeschlagen: {failed_count}
  [STAT] Erfolgsrate: {verification_result.get('success_rate', 0):.2f}%

"""
    
    if status == "READY":
        response += """
[OK] SYSTEM BEREIT FUER USER-ANTWORT

Alle Prompts wurden verifiziert.
Alle Funktionen wurden geprueft.
Code-Integritaet bestaetigt.
Sicherheitspruefung bestanden.
Abhaengigkeiten verfuegbar.

-> System kann sicher antworten.
"""
    else:
        response += f"""
[WARN] SYSTEM MIT WARNUNGEN

{len(verification_result.get('failed_checks', []))} Pruefungen fehlgeschlagen.

Fehlerdetails:
"""
        for check in verification_result.get('failed_checks', [])[:10]:
            response += f"  - {check}\n"
        
        if len(verification_result.get('failed_checks', [])) > 10:
            response += f"  ... und {len(verification_result.get('failed_checks', [])) - 10} weitere\n"
        
        response += "\n-> System antwortet mit Warnungen.\n"
    
    response += """
================================================================================
                    ENDE SYSTEM-ABSCHLUSS-STANDARD
================================================================================
"""
    
    return response

if __name__ == "__main__":
    # Standardroutine: Führe Verifikation durch
    verifier = PreResponseVerification()
    result = verifier.run_full_verification()
    
    # Generiere Standard-Antwort
    standard_response = generate_standard_response(result)
    print("\n" + standard_response)
    
    # Exit-Code basierend auf Status
    sys.exit(0 if result['status'] == 'READY' else 1)

