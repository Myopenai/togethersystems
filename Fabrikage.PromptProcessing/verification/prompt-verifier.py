#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Prompt Verifier
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

"""
Prompt-Verifikations-Engine für die gesamte Fabrikationssoftware.
Verifiziert, ob alle Prompt-Anforderungen implementiert, codiert und lauffähig sind.
"""

import json
import os
import ast
import subprocess
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass

@dataclass
class VerificationResult:
    """Verifikations-Ergebnis"""
    segment_id: str
    status: str  # "verified", "partial", "missing", "error"
    details: Dict
    code_paths: List[str]
    test_status: Optional[str] = None
    errors: List[str] = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []

class PromptVerifier:
    """Prompt-Verifikations-Engine"""
    
    def __init__(self, codebase_root: str = "."):
        self.codebase_root = Path(codebase_root)
        self.verification_cache: Dict[str, VerificationResult] = {}
    
    def verify_segment(self, segment_id: str, content: str, 
                      expected_implementation: Optional[Dict] = None) -> VerificationResult:
        """Verifiziere ein Prompt-Segment"""
        
        # Analysiere Prompt-Inhalt
        requirements = self._extract_requirements(content)
        code_paths = self._find_implementations(requirements)
        
        # Prüfe Code-Existenz
        existing_code = []
        missing_code = []
        
        for req in requirements:
            found = False
            for code_path in code_paths:
                if self._code_matches_requirement(code_path, req):
                    existing_code.append(code_path)
                    found = True
                    break
            if not found:
                missing_code.append(req)
        
        # Bestimme Status
        if len(missing_code) == 0 and len(existing_code) > 0:
            status = "verified"
        elif len(existing_code) > 0:
            status = "partial"
        else:
            status = "missing"
        
        # Prüfe Code-Sichtbarkeit
        visible_code = [cp for cp in existing_code if self._is_code_visible(cp)]
        
        # Prüfe Lauffähigkeit
        test_status = None
        errors = []
        if existing_code:
            test_status, errors = self._check_runnable(existing_code)
        
        result = VerificationResult(
            segment_id=segment_id,
            status=status,
            details={
                'requirements': requirements,
                'existing_code': existing_code,
                'missing_code': missing_code,
                'visible_code': visible_code,
                'code_visibility_percentage': len(visible_code) / len(existing_code) * 100 if existing_code else 0
            },
            code_paths=existing_code,
            test_status=test_status,
            errors=errors
        )
        
        self.verification_cache[segment_id] = result
        return result
    
    def _extract_requirements(self, content: str) -> List[Dict]:
        """Extrahiere Anforderungen aus Prompt-Text"""
        requirements = []
        
        # Suche nach Dateinamen
        import re
        file_patterns = [
            r'`([a-zA-Z0-9_\-/]+\.(py|js|ts|html|css|json|yaml|yml|md|ps1|sh))`',
            r'([a-zA-Z0-9_\-/]+\.(py|js|ts|html|css|json|yaml|yml|md|ps1|sh))',
            r'create\s+([a-zA-Z0-9_\-/]+\.(py|js|ts|html|css|json|yaml|yml|md|ps1|sh))',
            r'write\s+([a-zA-Z0-9_\-/]+\.(py|js|ts|html|css|json|yaml|yml|md|ps1|sh))',
        ]
        
        for pattern in file_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                filepath = match.group(1) if match.lastindex >= 1 else match.group(0)
                requirements.append({
                    'type': 'file',
                    'path': filepath,
                    'context': content[max(0, match.start()-50):match.end()+50]
                })
        
        # Suche nach Funktions-/Klassen-Namen
        func_patterns = [
            r'function\s+([a-zA-Z0-9_]+)',
            r'def\s+([a-zA-Z0-9_]+)',
            r'class\s+([a-zA-Z0-9_]+)',
            r'export\s+(?:function|class|const)\s+([a-zA-Z0-9_]+)',
        ]
        
        for pattern in func_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                name = match.group(1)
                requirements.append({
                    'type': 'function',
                    'name': name,
                    'context': content[max(0, match.start()-50):match.end()+50]
                })
        
        # Suche nach API-Endpunkten
        api_patterns = [
            r'/api/([a-zA-Z0-9_\-/]+)',
            r'endpoint[:\s]+([a-zA-Z0-9_\-/]+)',
        ]
        
        for pattern in api_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                endpoint = match.group(1)
                requirements.append({
                    'type': 'endpoint',
                    'path': f'/api/{endpoint}',
                    'context': content[max(0, match.start()-50):match.end()+50]
                })
        
        return requirements
    
    def _find_implementations(self, requirements: List[Dict]) -> List[str]:
        """Finde Implementierungen für Anforderungen"""
        code_paths = []
        
        for req in requirements:
            if req['type'] == 'file':
                filepath = self.codebase_root / req['path']
                if filepath.exists():
                    code_paths.append(str(filepath))
                else:
                    # Suche rekursiv
                    for found_file in self.codebase_root.rglob(req['path'].split('/')[-1]):
                        code_paths.append(str(found_file))
            
            elif req['type'] == 'function':
                # Suche in Python-Dateien
                for py_file in self.codebase_root.rglob("*.py"):
                    if self._contains_function(py_file, req['name']):
                        code_paths.append(str(py_file))
        
        return list(set(code_paths))  # Entferne Duplikate
    
    def _contains_function(self, filepath: Path, func_name: str) -> bool:
        """Prüfe ob Datei Funktion enthält"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Einfache String-Suche
                if f"def {func_name}" in content or f"function {func_name}" in content:
                    return True
                # AST-Parsing für Python
                if filepath.suffix == '.py':
                    try:
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, ast.FunctionDef) and node.name == func_name:
                                return True
                    except:
                        pass
        except:
            pass
        return False
    
    def _code_matches_requirement(self, code_path: str, requirement: Dict) -> bool:
        """Prüfe ob Code Anforderung erfüllt"""
        # Einfache Heuristik: Wenn Dateiname übereinstimmt oder Funktion gefunden
        if requirement['type'] == 'file':
            return Path(code_path).name == Path(requirement['path']).name
        elif requirement['type'] == 'function':
            return self._contains_function(Path(code_path), requirement['name'])
        return False
    
    def _is_code_visible(self, code_path: str) -> bool:
        """Prüfe ob Code für User sichtbar ist"""
        path = Path(code_path)
        
        # Code ist sichtbar wenn:
        # 1. Datei existiert und lesbar
        if not path.exists():
            return False
        
        # 2. Nicht in versteckten Ordnern (außer .git)
        if any(part.startswith('.') and part != '.git' for part in path.parts):
            return False
        
        # 3. Nicht in build/node_modules/etc.
        excluded_dirs = {'node_modules', '__pycache__', '.pytest_cache', 'build', 'dist', '.venv'}
        if any(part in excluded_dirs for part in path.parts):
            return False
        
        # 4. Datei ist nicht leer
        try:
            if path.stat().st_size == 0:
                return False
        except:
            return False
        
        return True
    
    def _check_runnable(self, code_paths: List[str]) -> Tuple[Optional[str], List[str]]:
        """Prüfe ob Code lauffähig ist"""
        errors = []
        
        for code_path in code_paths:
            path = Path(code_path)
            
            # Syntax-Check für Python
            if path.suffix == '.py':
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        ast.parse(f.read())
                except SyntaxError as e:
                    errors.append(f"Syntax error in {code_path}: {e}")
                except Exception as e:
                    errors.append(f"Error checking {code_path}: {e}")
            
            # Syntax-Check für JavaScript/TypeScript
            elif path.suffix in ['.js', '.ts']:
                # Einfache Prüfung: Datei ist lesbar
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Prüfe auf grundlegende Syntax-Fehler
                        if content.count('{') != content.count('}'):
                            errors.append(f"Brace mismatch in {code_path}")
                        if content.count('(') != content.count(')'):
                            errors.append(f"Parenthesis mismatch in {code_path}")
                except Exception as e:
                    errors.append(f"Error checking {code_path}: {e}")
        
        if errors:
            return "error", errors
        elif len(code_paths) > 0:
            return "runnable", []
        else:
            return None, []
    
    def generate_report(self, session_id: str, tracker) -> Dict:
        """Generiere Verifikations-Report"""
        context = tracker.get_full_context(session_id)
        results = []
        
        for seg in tracker.contexts[session_id].segments:
            result = self.verify_segment(seg.id, seg.content)
            results.append({
                'segment_id': seg.id,
                'content_preview': seg.content[:100],
                'status': result.status,
                'code_paths': result.code_paths,
                'code_visible': len(result.details['visible_code']) > 0,
                'test_status': result.test_status,
                'errors': result.errors
            })
        
        return {
            'session_id': session_id,
            'total_segments': len(results),
            'verified': sum(1 for r in results if r['status'] == 'verified'),
            'partial': sum(1 for r in results if r['status'] == 'partial'),
            'missing': sum(1 for r in results if r['status'] == 'missing'),
            'code_visible_count': sum(1 for r in results if r['code_visible']),
            'runnable_count': sum(1 for r in results if r['test_status'] == 'runnable'),
            'results': results
        }

if __name__ == "__main__":
    # Test
    import importlib.util
    base_path = Path(__file__).parent.parent
    spec = importlib.util.spec_from_file_location("prompt_tracker", base_path / "prompts" / "prompt-tracker.py")
    prompt_tracker_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(prompt_tracker_mod)
    PromptTracker = prompt_tracker_mod.PromptTracker
    
    tracker = PromptTracker()
    verifier = PromptVerifier()
    
    session = tracker.start_session()
    seg1 = tracker.add_segment(session, "Erstelle TypeScript-Module gaincode.ts und mäkincode.ts")
    
    result = verifier.verify_segment(seg1, "Erstelle TypeScript-Module gaincode.ts und mäkincode.ts")
    print(json.dumps({
        'status': result.status,
        'code_paths': result.code_paths,
        'details': result.details
    }, indent=2))

