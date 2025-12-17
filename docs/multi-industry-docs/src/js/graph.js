// src/js/graph.js
export class Graph {
  constructor() {
    this.nodes = new Map();   // id -> card
    this.edges = new Map();   // id -> Set(id)
    this.index = new Map();   // tag/type -> Set(id)
    this.state = new Map();   // id -> {lane, status}
  }

  add(card) {
    this.nodes.set(card.id, card);
    for (const t of [card.type, ...(card.tags || [])]) {
      if (!this.index.has(t)) this.index.set(t, new Set());
      this.index.get(t).add(card.id);
    }
    if (!this.edges.has(card.id)) this.edges.set(card.id, new Set());
  }

  connect(a, b) {
    if (!this.edges.has(a)) this.edges.set(a, new Set());
    this.edges.get(a).add(b);
  }

  neighbors(id) {
    return [...(this.edges.get(id) || new Set())].map(n => this.nodes.get(n));
  }

  byType(type) {
    return [...(this.index.get(type) || new Set())].map(id => this.nodes.get(id));
  }

  moveToLane(id, lane) {
    const s = this.state.get(id) || {};
    s.lane = lane;
    this.state.set(id, s);
  }

  setStatus(id, status) {
    const s = this.state.get(id) || {};
    s.status = status;
    this.state.set(id, s);
  }

  toEvidencePack() {
    const entries = [...this.nodes.values()].map(n => ({
      id: n.id,
      type: n.type,
      props: n.props,
      tags: n.tags,
      lane: (this.state.get(n.id) || {}).lane || 'draft',
      status: (this.state.get(n.id) || {}).status || 'active'
    }));
    return {
      timestamp: new Date().toISOString(),
      cards: entries,
      edges: [...this.edges.entries()].map(([k, v]) => ({ from: k, to: [...v] }))
    };
  }
}

export const graph = new Graph();
