#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Pre-Analysis System
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

"""
Vorab-Analyse-System für Prompts.
Liefert wichtige Ergebnisse, bevor Code geschrieben wird.
"""

import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class PreAnalysisResult:
    """Vorab-Analyse-Ergebnis"""
    prompt_id: str
    complexity: str  # "low", "medium", "high", "very_high"
    estimated_files: int
    estimated_functions: int
    estimated_time: str  # "minutes", "hours", "days"
    dependencies: List[str]
    risks: List[str]
    recommendations: List[str]
    similar_implementations: List[str]

class PreAnalyzer:
    """Vorab-Analyzer für Prompts"""
    
    def __init__(self):
        self.complexity_keywords = {
            'low': ['create', 'add', 'simple', 'basic', 'single'],
            'medium': ['implement', 'build', 'system', 'module', 'component'],
            'high': ['complete', 'full', 'comprehensive', 'entire', 'all', 'everything'],
            'very_high': ['global', 'universal', 'all', 'complete system', 'entire system', 'production']
        }
    
    def analyze(self, prompt_content: str, prompt_id: str = "unknown") -> PreAnalysisResult:
        """Analysiere Prompt vor Implementierung"""
        
        # Komplexitäts-Analyse
        complexity = self._analyze_complexity(prompt_content)
        
        # Geschätzte Anzahl Dateien
        estimated_files = self._estimate_files(prompt_content)
        
        # Geschätzte Anzahl Funktionen
        estimated_functions = self._estimate_functions(prompt_content)
        
        # Geschätzte Zeit
        estimated_time = self._estimate_time(complexity, estimated_files, estimated_functions)
        
        # Abhängigkeiten
        dependencies = self._extract_dependencies(prompt_content)
        
        # Risiken
        risks = self._identify_risks(prompt_content)
        
        # Empfehlungen
        recommendations = self._generate_recommendations(
            complexity, estimated_files, dependencies, risks
        )
        
        # Ähnliche Implementierungen
        similar_implementations = self._find_similar(prompt_content)
        
        return PreAnalysisResult(
            prompt_id=prompt_id,
            complexity=complexity,
            estimated_files=estimated_files,
            estimated_functions=estimated_functions,
            estimated_time=estimated_time,
            dependencies=dependencies,
            risks=risks,
            recommendations=recommendations,
            similar_implementations=similar_implementations
        )
    
    def _analyze_complexity(self, content: str) -> str:
        """Analysiere Komplexität"""
        content_lower = content.lower()
        
        # Zähle Komplexitäts-Indikatoren
        scores = {'low': 0, 'medium': 0, 'high': 0, 'very_high': 0}
        
        for level, keywords in self.complexity_keywords.items():
            for keyword in keywords:
                scores[level] += content_lower.count(keyword)
        
        # Bestimme höchste Komplexität
        if scores['very_high'] > 3:
            return 'very_high'
        elif scores['high'] > 5:
            return 'high'
        elif scores['medium'] > 3:
            return 'medium'
        else:
            return 'low'
    
    def _estimate_files(self, content: str) -> int:
        """Schätze Anzahl benötigter Dateien"""
        # Suche nach expliziten Dateinamen
        file_pattern = r'([a-zA-Z0-9_\-/]+\.(py|js|ts|html|css|json|yaml|yml|md|ps1|sh|go|rs))'
        files = set(re.findall(file_pattern, content, re.IGNORECASE))
        
        # Zähle "create", "write", "implement" Vorkommen
        create_count = len(re.findall(r'\b(create|write|implement|build)\s+', content, re.IGNORECASE))
        
        # Kombiniere Schätzungen
        estimated = len(files) + max(0, create_count - len(files))
        
        return max(1, estimated)  # Mindestens 1 Datei
    
    def _estimate_functions(self, content: str) -> int:
        """Schätze Anzahl benötigter Funktionen"""
        # Suche nach Funktions-Definitionen
        func_patterns = [
            r'\bfunction\s+([a-zA-Z0-9_]+)',
            r'\bdef\s+([a-zA-Z0-9_]+)',
            r'\bclass\s+([a-zA-Z0-9_]+)',
        ]
        
        functions = set()
        for pattern in func_patterns:
            functions.update(re.findall(pattern, content, re.IGNORECASE))
        
        # Zähle "implement", "create function" Vorkommen
        impl_count = len(re.findall(r'\b(implement|create|add)\s+(function|method|class)', content, re.IGNORECASE))
        
        return max(len(functions), impl_count)
    
    def _estimate_time(self, complexity: str, files: int, functions: int) -> str:
        """Schätze benötigte Zeit"""
        base_times = {
            'low': 5,      # Minuten
            'medium': 30,  # Minuten
            'high': 120,   # Minuten (2 Stunden)
            'very_high': 480  # Minuten (8 Stunden)
        }
        
        base = base_times.get(complexity, 30)
        total_minutes = base + (files * 10) + (functions * 5)
        
        if total_minutes < 60:
            return f"{total_minutes} minutes"
        elif total_minutes < 480:
            return f"{total_minutes // 60} hours"
        else:
            return f"{total_minutes // 480} days"
    
    def _extract_dependencies(self, content: str) -> List[str]:
        """Extrahiere Abhängigkeiten"""
        dependencies = []
        
        # Suche nach Bibliotheken/Frameworks
        lib_patterns = [
            r'\b(import|require|from)\s+([a-zA-Z0-9_\-]+)',
            r'\b(npm|pip|cargo|go\s+get)\s+(install|add)\s+([a-zA-Z0-9_\-]+)',
        ]
        
        for pattern in lib_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                dep = match.group(2) if match.lastindex >= 2 else match.group(0)
                if dep and dep not in dependencies:
                    dependencies.append(dep)
        
        return dependencies
    
    def _identify_risks(self, content: str) -> List[str]:
        """Identifiziere Risiken"""
        risks = []
        content_lower = content.lower()
        
        # Risiko-Indikatoren
        risk_patterns = {
            'Security': ['password', 'secret', 'key', 'token', 'auth', 'encrypt'],
            'Performance': ['performance', 'slow', 'optimize', 'bottleneck'],
            'Complexity': ['complex', 'complicated', 'difficult', 'challenging'],
            'Dependencies': ['external', 'api', 'third-party', 'dependency'],
            'Data': ['database', 'data', 'storage', 'persistent'],
        }
        
        for risk_type, keywords in risk_patterns.items():
            if any(keyword in content_lower for keyword in keywords):
                risks.append(f"{risk_type}: Requires careful implementation")
        
        return risks
    
    def _generate_recommendations(self, complexity: str, files: int, 
                                 dependencies: List[str], risks: List[str]) -> List[str]:
        """Generiere Empfehlungen"""
        recommendations = []
        
        if complexity in ['high', 'very_high']:
            recommendations.append("Break down into smaller, manageable tasks")
            recommendations.append("Implement incrementally with testing at each step")
        
        if files > 10:
            recommendations.append("Consider modular architecture")
            recommendations.append("Create directory structure first")
        
        if dependencies:
            recommendations.append(f"Check dependencies: {', '.join(dependencies[:3])}")
            recommendations.append("Verify compatibility before implementation")
        
        if risks:
            recommendations.append("Address risks early in implementation")
            recommendations.append("Add security/performance tests")
        
        if not recommendations:
            recommendations.append("Proceed with standard implementation")
        
        return recommendations
    
    def _find_similar(self, content: str) -> List[str]:
        """Finde ähnliche Implementierungen (Platzhalter)"""
        # In echter Implementierung: Suche in Codebase nach ähnlichen Patterns
        return []  # Placeholder

