// src/js/autowire.js
import { graph } from './graph.js';

const THRESHOLD = 160;

function distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

export function autowireNearby(id, positions) {
  const origin = positions.get(id);
  if (!origin) return;
  // Find neighbors by proximity
  for (const [otherId, pos] of positions.entries()) {
    if (otherId === id) continue;
    if (distance(origin, pos) < THRESHOLD) {
      autowirePair(id, otherId);
    }
  }
}

export function autowirePair(a, b) {
  const A = graph.nodes.get(a);
  const B = graph.nodes.get(b);
  if (!A || !B) return;

  // Avoid duplicate wiring
  if (graph.neighbors(a).find(n => n.id === b)) return;

  // Simple intent map
  const rule = intent(A.type, B.type) || intent(B.type, A.type);
  if (rule === 'connect') {
    graph.connect(a, b);
  }
  if (rule === 'overlay') {
    graph.connect(b, a); // overlay → guard applies to A
  }
  if (rule === 'control') {
    graph.connect(b, a); // governance controls content
  }
}

function intent(t1, t2) {
  if (t1.startsWith('content') && t2.startsWith('seo')) return 'connect';
  if (t1.startsWith('content') && t2.startsWith('compliance')) return 'overlay';
  if (t1.startsWith('content') && t2.startsWith('governance')) return 'control';
  if (t1.startsWith('deployment') && t2.startsWith('content')) return 'connect';
  if (t1.startsWith('template') && t2.startsWith('content')) return 'connect';
  return null;
}
