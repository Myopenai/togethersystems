/**
 * Config Validator - Validierung von Settings-Konfigurationen
 * 
 * Validiert alle Settings auf Korrektheit und Vollständigkeit
 */

/**
 * Validiert Settings-Config
 */
export function validateConfig(config, schema) {
  const errors = [];
  const warnings = [];

  // Basis-Validierung
  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { valid: false, errors, warnings };
  }

  // Schema-basierte Validierung
  if (schema) {
    const schemaErrors = validateAgainstSchema(config, schema);
    errors.push(...schemaErrors);
  }

  // Typ-spezifische Validierung
  if (config.mcp) {
    const mcpErrors = validateMCPConfig(config.mcp);
    errors.push(...mcpErrors);
  }

  if (config.playwright) {
    const playwrightErrors = validatePlaywrightConfig(config.playwright);
    errors.push(...playwrightErrors);
  }

  if (config.autofix) {
    const autofixErrors = validateAutofixConfig(config.autofix);
    errors.push(...autofixErrors);
  }

  if (config.deployment) {
    const deploymentErrors = validateDeploymentConfig(config.deployment);
    errors.push(...deploymentErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validiert gegen Schema
 */
function validateAgainstSchema(config, schema) {
  const errors = [];

  for (const [key, value] of Object.entries(schema)) {
    if (value.required && !(key in config)) {
      errors.push(`Required field missing: ${key}`);
      continue;
    }

    if (key in config) {
      const configValue = config[key];
      
      // Typ-Validierung
      if (value.type && typeof configValue !== value.type) {
        errors.push(`Field ${key} must be of type ${value.type}, got ${typeof configValue}`);
      }

      // Enum-Validierung
      if (value.enum && !value.enum.includes(configValue)) {
        errors.push(`Field ${key} must be one of: ${value.enum.join(', ')}`);
      }

      // Range-Validierung
      if (value.min !== undefined && configValue < value.min) {
        errors.push(`Field ${key} must be >= ${value.min}`);
      }

      if (value.max !== undefined && configValue > value.max) {
        errors.push(`Field ${key} must be <= ${value.max}`);
      }
    }
  }

  return errors;
}

/**
 * Validiert MCP-Config
 */
function validateMCPConfig(mcpConfig) {
  const errors = [];

  if (!mcpConfig) {
    return errors;
  }

  // Validiere MCP-spezifische Felder
  if (mcpConfig.servers && !Array.isArray(mcpConfig.servers)) {
    errors.push('MCP servers must be an array');
  }

  if (mcpConfig.timeout && (typeof mcpConfig.timeout !== 'number' || mcpConfig.timeout < 0)) {
    errors.push('MCP timeout must be a positive number');
  }

  return errors;
}

/**
 * Validiert Playwright-Config
 */
function validatePlaywrightConfig(playwrightConfig) {
  const errors = [];

  if (!playwrightConfig) {
    return errors;
  }

  if (playwrightConfig.baseURL && typeof playwrightConfig.baseURL !== 'string') {
    errors.push('Playwright baseURL must be a string');
  }

  if (playwrightConfig.timeout && (typeof playwrightConfig.timeout !== 'number' || playwrightConfig.timeout < 0)) {
    errors.push('Playwright timeout must be a positive number');
  }

  if (playwrightConfig.projects && !Array.isArray(playwrightConfig.projects)) {
    errors.push('Playwright projects must be an array');
  }

  return errors;
}

/**
 * Validiert Autofix-Config
 */
function validateAutofixConfig(autofixConfig) {
  const errors = [];

  if (!autofixConfig) {
    return errors;
  }

  if (autofixConfig.enabled !== undefined && typeof autofixConfig.enabled !== 'boolean') {
    errors.push('Autofix enabled must be a boolean');
  }

  if (autofixConfig.patterns && !Array.isArray(autofixConfig.patterns)) {
    errors.push('Autofix patterns must be an array');
  }

  return errors;
}

/**
 * Validiert Deployment-Config
 */
function validateDeploymentConfig(deploymentConfig) {
  const errors = [];

  if (!deploymentConfig) {
    return errors;
  }

  if (deploymentConfig.provider && typeof deploymentConfig.provider !== 'string') {
    errors.push('Deployment provider must be a string');
  }

  if (deploymentConfig.environments && !Array.isArray(deploymentConfig.environments)) {
    errors.push('Deployment environments must be an array');
  }

  return errors;
}

/**
 * Standard-Schema für Settings
 */
export const SETTINGS_SCHEMA = {
  projectType: {
    type: 'string',
    required: true,
    enum: ['static', 'serverless', 'fullstack', 'monorepo', 'microservices']
  },
  mcp: {
    type: 'object',
    required: false
  },
  playwright: {
    type: 'object',
    required: false
  },
  autofix: {
    type: 'object',
    required: false
  },
  deployment: {
    type: 'object',
    required: false
  },
  neuralNetwork: {
    type: 'object',
    required: false
  },
  encryption: {
    type: 'object',
    required: false
  }
};

