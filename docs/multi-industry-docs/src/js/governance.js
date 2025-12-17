// src/js/governance.js
import { graph } from './graph.js';

const auditTrail = [];

export function placeRole(id, role) {
  const s = graph.state.get(id) || {};
  s.role = role;
  graph.state.set(id, s);
  logAudit(id, `role:${role}`);
}

export function requestApproval(id, levels = 1) {
  const s = graph.state.get(id) || {};
  s.approvalRequested = true;
  s.requiredLevels = levels;
  s.approvedLevels = 0;
  graph.state.set(id, s);
  logAudit(id, `approval_requested:${levels}`);
}

export function approve(id) {
  const s = graph.state.get(id);
  if (!s || !s.approvalRequested) return false;
  s.approvedLevels = (s.approvedLevels || 0) + 1;
  graph.state.set(id, s);
  logAudit(id, `approved_level:${s.approvedLevels}`);
  return true;
}

export function isFullyApproved(id) {
  const s = graph.state.get(id);
  return s && s.approvalRequested && s.approvedLevels >= s.requiredLevels;
}

export function getAuditTrail() {
  return [...auditTrail];
}

function logAudit(id, action) {
  auditTrail.push({ 
    id, 
    action, 
    timestamp: new Date().toISOString(),
    user: 'system' // In a real app, this would be the current user
  });
}
