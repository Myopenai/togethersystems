// Node Invariants - Property Tests
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 1.0.0

/**
 * Invariants for Node entities
 * These properties must ALWAYS hold true
 */

export const nodeInvariants = {
  /**
   * ID must be unique across all nodes
   */
  idMustBeUnique: (nodes) => {
    const ids = nodes.map(n => n.id);
    return ids.length === new Set(ids).size;
  },

  /**
   * Position coordinates must be non-negative
   */
  positionMustBeNonNegative: (node) => {
    if (!node.position) return true;
    return node.position.x >= 0 && node.position.y >= 0;
  },

  /**
   * Level must be valid enum value
   */
  levelMustBeValid: (node) => {
    const validLevels = [
      'NANO', 'MESO', 'PLANET_SPHERE', 'SOLAR_SPHERE',
      'GALACTIC', 'SUPERCLUSTER', 'UNIVERSAL',
      'TRANSUNIVERSAL_META', 'CONTINUUM_FIELD'
    ];
    return validLevels.includes(node.level);
  },

  /**
   * Ports must be non-empty array
   */
  portsMustBeNonEmpty: (node) => {
    return Array.isArray(node.ports) && node.ports.length > 0;
  },

  /**
   * Port values must be valid
   */
  portsMustBeValid: (node) => {
    const validPorts = ['material', 'energy', 'info', 'meta'];
    return node.ports.every(port => validPorts.includes(port));
  },

  /**
   * ID must match pattern
   */
  idMustMatchPattern: (node) => {
    return /^[A-Z0-9-]+$/.test(node.id);
  }
};

/**
 * Run all invariants on a single node
 */
export function validateNode(node) {
  const errors = [];
  
  if (!nodeInvariants.idMustMatchPattern(node)) {
    errors.push('ID does not match required pattern');
  }
  
  if (!nodeInvariants.positionMustBeNonNegative(node)) {
    errors.push('Position coordinates must be non-negative');
  }
  
  if (!nodeInvariants.levelMustBeValid(node)) {
    errors.push('Level must be a valid enum value');
  }
  
  if (!nodeInvariants.portsMustBeNonEmpty(node)) {
    errors.push('Ports must be a non-empty array');
  }
  
  if (!nodeInvariants.portsMustBeValid(node)) {
    errors.push('All ports must be valid enum values');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Run all invariants on a collection of nodes
 */
export function validateNodes(nodes) {
  const errors = [];
  
  if (!nodeInvariants.idMustBeUnique(nodes)) {
    errors.push('Node IDs must be unique');
  }
  
  nodes.forEach((node, index) => {
    const nodeValidation = validateNode(node);
    if (!nodeValidation.valid) {
      errors.push(`Node ${index} (${node.id}): ${nodeValidation.errors.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
