/**
 * Employee Onboarding System
 * 
 * Automatisches Mitarbeiter-Onboarding
 * Willkommens-Gruß, Zugang, Namensgebung, Integration
 */

import fs from 'fs';
import path from 'path';

/**
 * Employee Onboarding Manager
 */
export class EmployeeOnboardingManager {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  /**
   * Lädt Onboarding-Config
   */
  loadConfig() {
    try {
      const configFile = path.join(this.configPath, 'database', 'employees.json');
      return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    } catch (error) {
      console.error('Could not load employee config:', error);
      return {
        onboarding: { enabled: true },
        employees: [],
        templates: {}
      };
    }
  }

  /**
   * Registriert neuen Mitarbeiter
   */
  async registerEmployee(employeeData) {
    const {
      firstName,
      lastName,
      email,
      role = 'developer',
      verification = {}
    } = employeeData;

    // Generiere Mitarbeiter-ID
    const employeeId = this.generateEmployeeId(firstName, lastName);

    // Generiere Namensgebung (gleichmäßig)
    const displayName = this.generateDisplayName(firstName, lastName);

    // Erstelle Mitarbeiter-Objekt
    const employee = {
      id: employeeId,
      firstName,
      lastName,
      displayName,
      email,
      role,
      status: 'pending',
      registeredAt: new Date().toISOString(),
      verification: {
        digital: {
          enabled: this.config.verification?.digital?.enabled || true,
          method: this.config.verification?.digital?.method || 'email',
          verified: false
        },
        notary: {
          enabled: this.config.verification?.notary?.enabled || false,
          required: this.config.verification?.notary?.required || false,
          verified: false,
          cost: this.config.verification?.notary?.cost || 0
        },
        ...verification
      },
      access: {
        role: role,
        permissions: this.config.templates?.access?.autoPermissions || ['read', 'write'],
        grantedAt: null
      },
      integration: {
        togetherSystems: this.config.integration?.togetherSystems || true,
        startupSystems: this.config.integration?.startupSystems || true,
        github: this.config.integration?.github || true,
        cloudflare: this.config.integration?.cloudflare || true,
        buildTools: this.config.integration?.buildTools || true
      }
    };

    // Automatisches Onboarding (wenn aktiviert)
    if (this.config.onboarding?.enabled) {
      await this.performAutoOnboarding(employee);
    }

    // Speichere Mitarbeiter
    this.saveEmployee(employee);

    return employee;
  }

  /**
   * Führt automatisches Onboarding durch
   */
  async performAutoOnboarding(employee) {
    // 1. Willkommens-Gruß
    if (this.config.onboarding?.autoWelcome) {
      await this.sendWelcomeMessage(employee);
    }

    // 2. Automatischer Zugang
    if (this.config.onboarding?.autoAccess) {
      await this.grantAccess(employee);
    }

    // 3. Automatische Namensgebung (bereits in registerEmployee)
    // DisplayName wurde bereits generiert

    // 4. Automatische Integration
    await this.setupIntegrations(employee);

    // 5. Status auf aktiv setzen
    employee.status = 'active';
    employee.access.grantedAt = new Date().toISOString();
  }

  /**
   * Sendet Willkommens-Nachricht
   */
  async sendWelcomeMessage(employee) {
    const template = this.config.templates?.welcome || {
      subject: "Willkommen bei Together Systems & Startup Systems",
      message: "Herzlich willkommen! Sie wurden erfolgreich als Mitarbeiter registriert."
    };

    const message = {
      to: employee.email,
      subject: template.subject,
      body: template.message,
      employee: {
        name: employee.displayName,
        id: employee.id,
        role: employee.role
      },
      links: {
        documentation: "https://github.com/Myopenai/togethersystems",
        startupSystems: "https://github.com/Myopenai/startupsystems",
        support: "support@togethersystems.com"
      }
    };

    // In Produktion: E-Mail senden
    console.log('Welcome message:', message);
    
    return message;
  }

  /**
   * Gewährt Zugang
   */
  async grantAccess(employee) {
    const accessConfig = this.config.templates?.access || {
      defaultRole: 'developer',
      autoPermissions: ['read', 'write', 'test', 'deploy']
    };

    employee.access = {
      role: accessConfig.defaultRole || employee.role,
      permissions: accessConfig.autoPermissions || [],
      grantedAt: new Date().toISOString(),
      credentials: {
        // In Produktion: Sichere Credentials generieren
        username: employee.displayName.toLowerCase(),
        temporaryPassword: this.generateTemporaryPassword()
      }
    };

    return employee.access;
  }

  /**
   * Generiert Display-Name (gleichmäßig)
   */
  generateDisplayName(firstName, lastName) {
    const template = this.config.templates?.naming?.pattern || '{firstName}.{lastName}';
    let displayName = template
      .replace('{firstName}', firstName)
      .replace('{lastName}', lastName);

    if (this.config.templates?.naming?.lowercase) {
      displayName = displayName.toLowerCase();
    }

    if (!this.config.templates?.naming?.specialChars) {
      displayName = displayName.replace(/[^a-zA-Z0-9.]/g, '');
    }

    return displayName;
  }

  /**
   * Generiert Mitarbeiter-ID
   */
  generateEmployeeId(firstName, lastName) {
    const timestamp = Date.now().toString(36);
    const nameHash = (firstName + lastName).toLowerCase().substring(0, 4);
    return `emp_${nameHash}_${timestamp}`;
  }

  /**
   * Generiert temporäres Passwort
   */
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Richtet Integrationen ein
   */
  async setupIntegrations(employee) {
    const integrations = [];

    if (employee.integration.togetherSystems) {
      integrations.push({
        name: 'Together Systems',
        type: 'system',
        status: 'connected',
        url: 'https://github.com/Myopenai/togethersystems'
      });
    }

    if (employee.integration.startupSystems) {
      integrations.push({
        name: 'Startup Systems',
        type: 'system',
        status: 'connected',
        url: 'https://github.com/Myopenai/startupsystems'
      });
    }

    if (employee.integration.github) {
      integrations.push({
        name: 'GitHub',
        type: 'repository',
        status: 'pending',
        action: 'invite_required'
      });
    }

    if (employee.integration.cloudflare) {
      integrations.push({
        name: 'Cloudflare',
        type: 'deployment',
        status: 'pending',
        action: 'api_key_required'
      });
    }

    if (employee.integration.buildTools) {
      integrations.push({
        name: 'BuildTools',
        type: 'license',
        status: 'pending',
        action: 'license_required'
      });
    }

    employee.integrations = integrations;
    return integrations;
  }

  /**
   * Speichert Mitarbeiter
   */
  saveEmployee(employee) {
    const configFile = path.join(this.configPath, 'database', 'employees.json');
    const config = this.loadConfig();
    
    // Entferne alten Eintrag falls vorhanden
    config.employees = config.employees.filter(emp => emp.id !== employee.id);
    
    // Füge neuen Eintrag hinzu
    config.employees.push(employee);
    
    // Speichere
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Gibt alle Mitarbeiter zurück
   */
  getAllEmployees() {
    const config = this.loadConfig();
    return config.employees || [];
  }

  /**
   * Findet Mitarbeiter
   */
  findEmployee(id) {
    const employees = this.getAllEmployees();
    return employees.find(emp => emp.id === id);
  }
}

/**
 * Singleton-Instanz
 */
let onboardingManager = null;

export function getOnboardingManager(configPath) {
  if (!onboardingManager) {
    onboardingManager = new EmployeeOnboardingManager(configPath);
  }
  return onboardingManager;
}

