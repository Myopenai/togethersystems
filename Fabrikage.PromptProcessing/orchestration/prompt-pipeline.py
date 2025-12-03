#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Prompt Pipeline Orchestrator
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

"""
Fließband-Orchestrierung für den Prompt-Arbeitsbereich in der Fabrikationssoftware.
Koordinierte Verarbeitung: Vorab-Analyse → Implementierung → Verifikation → Code-Sichtbarkeit
"""

import json
import sys
from typing import Dict, Optional
from pathlib import Path

# Importe der Komponenten
sys.path.insert(0, str(Path(__file__).parent.parent))
import importlib.util

# Import mit Bindestrichen in Dateinamen
def load_module(module_path, module_name):
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

base_path = Path(__file__).parent.parent
prompt_tracker_mod = load_module(base_path / "prompts" / "prompt-tracker.py", "prompt_tracker")
PromptTracker = prompt_tracker_mod.PromptTracker
PromptDimension = prompt_tracker_mod.PromptDimension

prompt_verifier_mod = load_module(base_path / "verification" / "prompt-verifier.py", "prompt_verifier")
PromptVerifier = prompt_verifier_mod.PromptVerifier

code_visibility_mod = load_module(base_path / "code-visibility" / "code-visibility-manager.py", "code_visibility_manager")
CodeVisibilityManager = code_visibility_mod.CodeVisibilityManager

pre_analysis_mod = load_module(base_path / "analysis" / "pre-analysis.py", "pre_analysis")
PreAnalyzer = pre_analysis_mod.PreAnalyzer

class PromptPipeline:
    """Haupt-Orchestrator für Prompt-Verarbeitungs-Pipeline"""
    
    def __init__(self, codebase_root: str = "."):
        self.codebase_root = codebase_root
        self.tracker = PromptTracker()
        self.verifier = PromptVerifier(codebase_root)
        self.visibility_manager = CodeVisibilityManager(codebase_root)
        self.pre_analyzer = PreAnalyzer()
    
    def process_prompt(self, prompt_content: str, session_id: Optional[str] = None) -> Dict:
        """Verarbeite Prompt durch komplette Pipeline"""
        
        # 1. Starte Session
        if session_id is None:
            session_id = self.tracker.start_session()
        
        # 2. VORAB-ANALYSE (vor dem Coden)
        print("=" * 60)
        print("PHASE 1: VORAB-ANALYSE")
        print("=" * 60)
        
        pre_analysis = self.pre_analyzer.analyze(prompt_content, session_id)
        
        print(f"Komplexität: {pre_analysis.complexity}")
        print(f"Geschätzte Dateien: {pre_analysis.estimated_files}")
        print(f"Geschätzte Funktionen: {pre_analysis.estimated_functions}")
        print(f"Geschätzte Zeit: {pre_analysis.estimated_time}")
        print(f"Abhängigkeiten: {', '.join(pre_analysis.dependencies) if pre_analysis.dependencies else 'Keine'}")
        print(f"Risiken: {len(pre_analysis.risks)}")
        print("\nEmpfehlungen:")
        for rec in pre_analysis.recommendations:
            print(f"  - {rec}")
        
        # 3. Prompt-Segment hinzufügen
        segment_id = self.tracker.add_segment(
            session_id,
            prompt_content,
            PromptDimension.HORIZONTAL,
            metadata={'pre_analysis': json.loads(json.dumps(pre_analysis.__dict__, default=str))}
        )
        
        # 4. VERIFIKATION (nach Implementierung - wird später aufgerufen)
        print("\n" + "=" * 60)
        print("PHASE 2: VERIFIKATION (wird nach Implementierung durchgeführt)")
        print("=" * 60)
        
        # 5. Code-Sichtbarkeits-Check
        print("\n" + "=" * 60)
        print("PHASE 3: CODE-SICHTBARKEITS-PRÜFUNG")
        print("=" * 60)
        
        # Wird nach Implementierung aufgerufen
        
        return {
            'session_id': session_id,
            'segment_id': segment_id,
            'pre_analysis': pre_analysis.__dict__,
            'status': 'analyzed',
            'next_steps': [
                'Implementiere Code basierend auf Vorab-Analyse',
                'Führe Verifikation durch',
                'Prüfe Code-Sichtbarkeit',
                'Generiere Report'
            ]
        }
    
    def verify_implementation(self, session_id: str) -> Dict:
        """Verifiziere Implementierung für Session"""
        print("\n" + "=" * 60)
        print("VERIFIKATION DER IMPLEMENTIERUNG")
        print("=" * 60)
        
        context = self.tracker.get_full_context(session_id)
        verification_report = self.verifier.generate_report(session_id, self.tracker)
        
        # Update Tracker mit Verifikations-Status
        for result in verification_report['results']:
            if result['status'] == 'verified':
                self.tracker.mark_verified(session_id, result['segment_id'], "verified")
                self.tracker.mark_implemented(
                    session_id, 
                    result['segment_id'],
                    result['code_paths'][0] if result['code_paths'] else None,
                    result['code_visible']
                )
        
        return verification_report
    
    def check_code_visibility(self, session_id: str) -> Dict:
        """Prüfe Code-Sichtbarkeit für Session"""
        print("\n" + "=" * 60)
        print("CODE-SICHTBARKEITS-PRÜFUNG")
        print("=" * 60)
        
        context = self.tracker.get_full_context(session_id)
        all_code_paths = []
        
        # Sammle alle Code-Pfade
        for seg in self.tracker.contexts[session_id].segments:
            if seg.id in context['implementation_status']:
                code_paths = self.verifier.verify_segment(seg.id, seg.content).code_paths
                all_code_paths.extend(code_paths)
        
        # Entferne Duplikate
        all_code_paths = list(set(all_code_paths))
        
        # Generiere Sichtbarkeits-Report
        visibility_report = self.visibility_manager.generate_visibility_report(all_code_paths)
        
        print(f"Gesamt: {visibility_report['total']} Dateien")
        print(f"Sichtbar: {visibility_report['visible']}")
        print(f"Versteckt: {visibility_report['hidden']}")
        print(f"Sichtbarkeit: {visibility_report['visibility_percentage']:.1f}%")
        
        return visibility_report
    
    def generate_complete_report(self, session_id: str) -> Dict:
        """Generiere vollständigen Report"""
        context = self.tracker.get_full_context(session_id)
        verification = self.verify_implementation(session_id)
        visibility = self.check_code_visibility(session_id)
        completeness = context.get('completeness', {})
        
        return {
            'session_id': session_id,
            'timestamp': context.get('start_time'),
            'completeness': completeness,
            'verification': verification,
            'code_visibility': visibility,
            'summary': {
                'total_segments': context.get('total_segments', 0),
                'implemented': completeness.get('implemented', 0),
                'code_visible': completeness.get('code_visible', 0),
                'verified': completeness.get('verified', 0),
                'implementation_percentage': completeness.get('percentage', 0),
                'visibility_percentage': visibility.get('visibility_percentage', 0)
            },
            'recommendations': self._generate_recommendations(completeness, verification, visibility)
        }
    
    def _generate_recommendations(self, completeness: Dict, verification: Dict, visibility: Dict) -> list:
        """Generiere Empfehlungen basierend auf Status"""
        recommendations = []
        
        if completeness.get('percentage', 0) < 100:
            recommendations.append(f"Implementiere fehlende {completeness.get('total', 0) - completeness.get('implemented', 0)} Segmente")
        
        if visibility.get('visibility_percentage', 100) < 100:
            recommendations.append(f"Mache {visibility.get('hidden', 0)} versteckte Dateien sichtbar")
        
        if verification.get('missing', 0) > 0:
            recommendations.append(f"Verifiziere {verification.get('missing', 0)} fehlende Implementierungen")
        
        if not recommendations:
            recommendations.append("Alle Prompts vollständig implementiert, verifiziert und sichtbar!")
        
        return recommendations

if __name__ == "__main__":
    # Test
    pipeline = PromptPipeline()
    
    test_prompt = """
    Erstelle TypeScript-Module für Viewunity Count-Up System.
    Implementiere gaincode.ts mit init, step, timeAdvance Funktionen.
    Implementiere mäkincode.ts mit Pipeline-Klasse.
    """
    
    result = pipeline.process_prompt(test_prompt)
    print("\n" + json.dumps(result, indent=2, ensure_ascii=False))

