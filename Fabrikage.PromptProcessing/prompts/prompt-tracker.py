#!/usr/bin/env python3
# T,. Fabrikage.PromptProcessing - Prompt Tracker (Multi-Dimensional)
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

"""
Prompt-Tracking-System für die gesamte Fabrikationssoftware.
Erfasst Prompts horizontal, vertikal, diagonal und raumerweitert über alle Dimensionen.
"""

import json
import hashlib
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class PromptDimension(Enum):
    """Dimensionen der Prompt-Erfassung"""
    HORIZONTAL = "horizontal"  # Zeitliche Abfolge
    VERTICAL = "vertical"      # Hierarchische Tiefe
    DIAGONAL = "diagonal"      # Querverbindungen
    SPATIAL = "spatial"        # Räumliche Erweiterung
    TEMPORAL = "temporal"      # Zeitliche Dimension
    LOGICAL = "logical"        # Logische Verknüpfungen

@dataclass
class PromptSegment:
    """Einzelner Prompt-Segment"""
    id: str
    content: str
    timestamp: str
    dimension: PromptDimension
    parent_id: Optional[str] = None
    children_ids: List[str] = None
    related_ids: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.children_ids is None:
            self.children_ids = []
        if self.related_ids is None:
            self.related_ids = []
        if self.metadata is None:
            self.metadata = {}

@dataclass
class PromptContext:
    """Gesamter Prompt-Kontext seit Beginn"""
    session_id: str
    start_time: str
    segments: List[PromptSegment]
    implementation_status: Dict[str, bool]
    code_visibility: Dict[str, bool]
    verification_status: Dict[str, str]
    
    def __post_init__(self):
        if self.segments is None:
            self.segments = []
        if self.implementation_status is None:
            self.implementation_status = {}
        if self.code_visibility is None:
            self.code_visibility = {}
        if self.verification_status is None:
            self.verification_status = {}

class PromptTracker:
    """Multi-dimensionaler Prompt-Tracker"""
    
    def __init__(self, storage_path: str = "prompts/tracker.json"):
        self.storage_path = storage_path
        self.contexts: Dict[str, PromptContext] = {}
        self._load()
    
    def _load(self):
        """Lade gespeicherte Kontexte"""
        try:
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for session_id, ctx_data in data.items():
                    # Rekonstruiere PromptContext
                    segments = [PromptSegment(**s) for s in ctx_data.get('segments', [])]
                    ctx = PromptContext(
                        session_id=ctx_data['session_id'],
                        start_time=ctx_data['start_time'],
                        segments=segments,
                        implementation_status=ctx_data.get('implementation_status', {}),
                        code_visibility=ctx_data.get('code_visibility', {}),
                        verification_status=ctx_data.get('verification_status', {})
                    )
                    self.contexts[session_id] = ctx
        except FileNotFoundError:
            pass
    
    def _save(self):
        """Speichere Kontexte"""
        data = {}
        for session_id, ctx in self.contexts.items():
            data[session_id] = {
                'session_id': ctx.session_id,
                'start_time': ctx.start_time,
                'segments': [asdict(s) for s in ctx.segments],
                'implementation_status': ctx.implementation_status,
                'code_visibility': ctx.code_visibility,
                'verification_status': ctx.verification_status
            }
        
        import os
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        with open(self.storage_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def start_session(self, session_id: Optional[str] = None) -> str:
        """Starte neue Prompt-Session"""
        if session_id is None:
            session_id = hashlib.sha256(f"{time.time()}".encode()).hexdigest()[:16]
        
        ctx = PromptContext(
            session_id=session_id,
            start_time=datetime.utcnow().isoformat() + "Z",
            segments=[],
            implementation_status={},
            code_visibility={},
            verification_status={}
        )
        self.contexts[session_id] = ctx
        self._save()
        return session_id
    
    def add_segment(self, session_id: str, content: str, 
                   dimension: PromptDimension = PromptDimension.HORIZONTAL,
                   parent_id: Optional[str] = None,
                   metadata: Optional[Dict] = None) -> str:
        """Füge Prompt-Segment hinzu"""
        if session_id not in self.contexts:
            self.start_session(session_id)
        
        ctx = self.contexts[session_id]
        
        # Generiere Segment-ID
        segment_id = hashlib.sha256(
            f"{session_id}{content}{time.time()}".encode()
        ).hexdigest()[:16]
        
        segment = PromptSegment(
            id=segment_id,
            content=content,
            timestamp=datetime.utcnow().isoformat() + "Z",
            dimension=dimension,
            parent_id=parent_id,
            metadata=metadata or {}
        )
        
        # Verknüpfe mit Parent
        if parent_id:
            for seg in ctx.segments:
                if seg.id == parent_id:
                    seg.children_ids.append(segment_id)
                    segment.related_ids.append(parent_id)
                    break
        
        ctx.segments.append(segment)
        self._save()
        return segment_id
    
    def link_segments(self, session_id: str, segment_id1: str, segment_id2: str, 
                     link_type: str = "related"):
        """Verknüpfe zwei Segmente (diagonal/spatial)"""
        if session_id not in self.contexts:
            return
        
        ctx = self.contexts[session_id]
        seg1 = next((s for s in ctx.segments if s.id == segment_id1), None)
        seg2 = next((s for s in ctx.segments if s.id == segment_id2), None)
        
        if seg1 and seg2:
            if segment_id2 not in seg1.related_ids:
                seg1.related_ids.append(segment_id2)
            if segment_id1 not in seg2.related_ids:
                seg2.related_ids.append(segment_id1)
            
            seg1.metadata[f"link_{link_type}"] = segment_id2
            seg2.metadata[f"link_{link_type}"] = segment_id1
            self._save()
    
    def get_full_context(self, session_id: str) -> Dict:
        """Hole vollständigen Prompt-Kontext"""
        if session_id not in self.contexts:
            return {}
        
        ctx = self.contexts[session_id]
        
        # Erstelle multi-dimensionalen Graphen
        graph = {
            'horizontal': [],  # Zeitliche Abfolge
            'vertical': {},   # Hierarchie
            'diagonal': [],    # Querverbindungen
            'spatial': {},     # Räumliche Erweiterung
            'temporal': [],    # Zeitliche Dimension
            'logical': []      # Logische Verknüpfungen
        }
        
        for seg in ctx.segments:
            # Horizontal (zeitlich)
            graph['horizontal'].append({
                'id': seg.id,
                'content': seg.content[:100] + "..." if len(seg.content) > 100 else seg.content,
                'timestamp': seg.timestamp,
                'dimension': seg.dimension.value
            })
            
            # Vertical (Hierarchie)
            if seg.parent_id:
                if seg.parent_id not in graph['vertical']:
                    graph['vertical'][seg.parent_id] = []
                graph['vertical'][seg.parent_id].append(seg.id)
            
            # Diagonal (Querverbindungen)
            if seg.related_ids:
                graph['diagonal'].append({
                    'id': seg.id,
                    'related': seg.related_ids
                })
        
        return {
            'session_id': ctx.session_id,
            'start_time': ctx.start_time,
            'total_segments': len(ctx.segments),
            'graph': graph,
            'implementation_status': ctx.implementation_status,
            'code_visibility': ctx.code_visibility,
            'verification_status': ctx.verification_status,
            'completeness': self._calculate_completeness(ctx)
        }
    
    def _calculate_completeness(self, ctx: PromptContext) -> Dict:
        """Berechne Vollständigkeit der Implementierung"""
        total = len(ctx.segments)
        if total == 0:
            return {'percentage': 0, 'implemented': 0, 'total': 0}
        
        implemented = sum(1 for status in ctx.implementation_status.values() if status)
        visible = sum(1 for status in ctx.code_visibility.values() if status)
        verified = sum(1 for status in ctx.verification_status.values() if status == "verified")
        
        return {
            'percentage': round((implemented / total) * 100, 2) if total > 0 else 0,
            'implemented': implemented,
            'code_visible': visible,
            'verified': verified,
            'total': total
        }
    
    def mark_implemented(self, session_id: str, segment_id: str, 
                        code_path: Optional[str] = None,
                        code_visible: bool = True):
        """Markiere Segment als implementiert"""
        if session_id not in self.contexts:
            return
        
        ctx = self.contexts[session_id]
        ctx.implementation_status[segment_id] = True
        ctx.code_visibility[segment_id] = code_visible
        
        if code_path:
            ctx.verification_status[segment_id] = f"code_at:{code_path}"
        
        self._save()
    
    def mark_verified(self, session_id: str, segment_id: str, status: str = "verified"):
        """Markiere Segment als verifiziert"""
        if session_id not in self.contexts:
            return
        
        ctx = self.contexts[session_id]
        ctx.verification_status[segment_id] = status
        self._save()
    
    def get_unimplemented(self, session_id: str) -> List[Dict]:
        """Hole nicht-implementierte Segmente"""
        if session_id not in self.contexts:
            return []
        
        ctx = self.contexts[session_id]
        unimplemented = []
        
        for seg in ctx.segments:
            if not ctx.implementation_status.get(seg.id, False):
                unimplemented.append({
                    'id': seg.id,
                    'content': seg.content,
                    'timestamp': seg.timestamp,
                    'dimension': seg.dimension.value
                })
        
        return unimplemented

if __name__ == "__main__":
    # Test
    tracker = PromptTracker()
    session = tracker.start_session()
    
    seg1 = tracker.add_segment(session, "Erstelle TypeScript-Module", PromptDimension.HORIZONTAL)
    seg2 = tracker.add_segment(session, "Implementiere gaincode.ts", PromptDimension.VERTICAL, seg1)
    seg3 = tracker.add_segment(session, "Implementiere mäkincode.ts", PromptDimension.VERTICAL, seg1)
    
    tracker.link_segments(session, seg2, seg3, "related")
    
    context = tracker.get_full_context(session)
    print(json.dumps(context, indent=2, ensure_ascii=False))

