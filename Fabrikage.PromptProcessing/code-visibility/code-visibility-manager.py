#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Code Visibility Manager
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

"""
Code-Sichtbarkeits-System für die Fabrikationssoftware.
Stellt sicher, dass alle implementierten Codes für den User sichtbar sind.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class CodeVisibilityReport:
    """Code-Sichtbarkeits-Report"""
    code_path: str
    visible: bool
    reason: str
    size: int
    line_count: int
    last_modified: str

class CodeVisibilityManager:
    """Manager für Code-Sichtbarkeit"""
    
    def __init__(self, codebase_root: str = "."):
        self.codebase_root = Path(codebase_root)
        self.visibility_rules = self._load_visibility_rules()
    
    def _load_visibility_rules(self) -> Dict:
        """Lade Sichtbarkeits-Regeln"""
        return {
            'excluded_dirs': {
                'node_modules', '__pycache__', '.pytest_cache', 
                'build', 'dist', '.venv', '.git', '.vscode', '.idea',
                'venv', 'env', '.env', 'target', 'out', 'bin', 'obj'
            },
            'excluded_files': {
                '.pyc', '.pyo', '.pyd', '.so', '.dll', '.exe',
                '.class', '.jar', '.war', '.ear'
            },
            'min_size': 1,  # Mindestgröße in Bytes
            'required_extensions': {
                '.py', '.js', '.ts', '.html', '.css', '.json', 
                '.yaml', '.yml', '.md', '.ps1', '.sh', '.go', 
                '.rs', '.java', '.cpp', '.c', '.h'
            }
        }
    
    def check_visibility(self, code_path: str) -> CodeVisibilityReport:
        """Prüfe Code-Sichtbarkeit"""
        path = Path(code_path)
        
        # Prüfe Existenz
        if not path.exists():
            return CodeVisibilityReport(
                code_path=code_path,
                visible=False,
                reason="File does not exist",
                size=0,
                line_count=0,
                last_modified=""
            )
        
        # Prüfe auf ausgeschlossene Verzeichnisse
        for part in path.parts:
            if part in self.visibility_rules['excluded_dirs']:
                return CodeVisibilityReport(
                    code_path=code_path,
                    visible=False,
                    reason=f"File in excluded directory: {part}",
                    size=path.stat().st_size,
                    line_count=0,
                    last_modified=str(path.stat().st_mtime)
                )
        
        # Prüfe Dateiendung
        if path.suffix not in self.visibility_rules['required_extensions']:
            if path.suffix in self.visibility_rules['excluded_files']:
                return CodeVisibilityReport(
                    code_path=code_path,
                    visible=False,
                    reason=f"File type excluded: {path.suffix}",
                    size=path.stat().st_size,
                    line_count=0,
                    last_modified=str(path.stat().st_mtime)
                )
        
        # Prüfe Größe
        size = path.stat().st_size
        if size < self.visibility_rules['min_size']:
            return CodeVisibilityReport(
                code_path=code_path,
                visible=False,
                reason="File too small (empty or binary)",
                size=size,
                line_count=0,
                last_modified=str(path.stat().st_mtime)
            )
        
        # Prüfe Lesbarkeit
        try:
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                line_count = len(lines)
        except UnicodeDecodeError:
            return CodeVisibilityReport(
                code_path=code_path,
                visible=False,
                reason="File not readable as UTF-8 text",
                size=size,
                line_count=0,
                last_modified=str(path.stat().st_mtime)
            )
        except Exception as e:
            return CodeVisibilityReport(
                code_path=code_path,
                visible=False,
                reason=f"Error reading file: {str(e)}",
                size=size,
                line_count=0,
                last_modified=str(path.stat().st_mtime)
            )
        
        # Code ist sichtbar
        return CodeVisibilityReport(
            code_path=code_path,
            visible=True,
            reason="Code is visible and readable",
            size=size,
            line_count=line_count,
            last_modified=str(path.stat().st_mtime)
        )
    
    def make_visible(self, code_path: str) -> bool:
        """Mache Code sichtbar (falls versteckt)"""
        path = Path(code_path)
        
        # Prüfe ob Datei existiert
        if not path.exists():
            return False
        
        # Verschiebe aus versteckten Ordnern
        if any(part.startswith('.') and part != '.git' for part in path.parts):
            # Erstelle neuen Pfad ohne versteckte Ordner
            new_parts = [p for p in path.parts if not (p.startswith('.') and p != '.git')]
            new_path = Path(*new_parts)
            
            # Verschiebe Datei
            try:
                new_path.parent.mkdir(parents=True, exist_ok=True)
                path.rename(new_path)
                return True
            except Exception as e:
                print(f"Error moving file: {e}")
                return False
        
        return True
    
    def generate_visibility_report(self, code_paths: List[str]) -> Dict:
        """Generiere Sichtbarkeits-Report für mehrere Dateien"""
        reports = []
        visible_count = 0
        hidden_count = 0
        
        for code_path in code_paths:
            report = self.check_visibility(code_path)
            reports.append({
                'path': report.code_path,
                'visible': report.visible,
                'reason': report.reason,
                'size': report.size,
                'line_count': report.line_count
            })
            
            if report.visible:
                visible_count += 1
            else:
                hidden_count += 1
        
        return {
            'total': len(code_paths),
            'visible': visible_count,
            'hidden': hidden_count,
            'visibility_percentage': (visible_count / len(code_paths) * 100) if code_paths else 0,
            'reports': reports
        }

