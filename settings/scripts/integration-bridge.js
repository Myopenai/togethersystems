/**
 * Integration Bridge - App-übergreifende Verbindungen
 * 
 * Automatische Integration zwischen Applikationen
 * Service Discovery, IP-Management, Port-Mapping
 */

import fs from 'fs';
import path from 'path';

/**
 * Service Registry
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.connections = new Map();
  }

  /**
   * Registriert einen Service
   */
  registerService(service) {
    const {
      id,
      name,
      type,
      url,
      ip,
      port,
      healthCheck,
      metadata = {}
    } = service;

    this.services.set(id, {
      id,
      name,
      type,
      url,
      ip,
      port,
      healthCheck,
      metadata,
      registeredAt: new Date().toISOString(),
      status: 'unknown'
    });

    // Starte Health-Check
    if (healthCheck) {
      this.startHealthCheck(id);
    }

    return id;
  }

  /**
   * Findet Services nach Typ
   */
  findServices(type) {
    return Array.from(this.services.values())
      .filter(service => service.type === type);
  }

  /**
   * Findet Service nach ID
   */
  getService(id) {
    return this.services.get(id);
  }

  /**
   * Erstellt Verbindung zwischen Services
   */
  connectServices(sourceId, targetId, config = {}) {
    const connectionId = `${sourceId}->${targetId}`;
    
    this.connections.set(connectionId, {
      id: connectionId,
      source: sourceId,
      target: targetId,
      config,
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    return connectionId;
  }

  /**
   * Health-Check für Service
   */
  async startHealthCheck(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || !service.healthCheck) {
      return;
    }

    const check = async () => {
      try {
        const response = await fetch(service.healthCheck.url, {
          method: service.healthCheck.method || 'GET',
          timeout: service.healthCheck.timeout || 5000
        });

        service.status = response.ok ? 'healthy' : 'unhealthy';
      } catch (error) {
        service.status = 'unhealthy';
      }

      // Nächster Check
      if (service.healthCheck.interval) {
        setTimeout(check, service.healthCheck.interval);
      }
    };

    check();
  }

  /**
   * Gibt alle Services zurück
   */
  getAllServices() {
    return Array.from(this.services.values());
  }

  /**
   * Gibt alle Verbindungen zurück
   */
  getAllConnections() {
    return Array.from(this.connections.values());
  }
}

/**
 * IP Manager
 */
class IPManager {
  constructor() {
    this.allocations = new Map();
    this.pools = {
      local: ['127.0.0.1', 'localhost'],
      development: ['192.168.1.0/24'],
      production: []
    };
  }

  /**
   * Weist IP-Adresse zu
   */
  allocateIP(serviceId, type = 'local') {
    const pool = this.pools[type];
    if (!pool || pool.length === 0) {
      return null;
    }

    // Einfache Zuweisung (in Produktion: richtiger IP-Pool-Manager)
    const ip = pool[0];
    this.allocations.set(serviceId, {
      ip,
      type,
      allocatedAt: new Date().toISOString()
    });

    return ip;
  }

  /**
   * Gibt IP-Adresse frei
   */
  releaseIP(serviceId) {
    this.allocations.delete(serviceId);
  }

  /**
   * Gibt IP-Zuweisung zurück
   */
  getIP(serviceId) {
    return this.allocations.get(serviceId);
  }
}

/**
 * Port Manager
 */
class PortManager {
  constructor() {
    this.allocations = new Map();
    this.usedPorts = new Set();
    this.portRange = {
      min: 3000,
      max: 9999
    };
  }

  /**
   * Weist Port zu
   */
  allocatePort(serviceId, preferredPort = null) {
    if (preferredPort && !this.usedPorts.has(preferredPort)) {
      this.usedPorts.add(preferredPort);
      this.allocations.set(serviceId, {
        port: preferredPort,
        allocatedAt: new Date().toISOString()
      });
      return preferredPort;
    }

    // Finde freien Port
    for (let port = this.portRange.min; port <= this.portRange.max; port++) {
      if (!this.usedPorts.has(port)) {
        this.usedPorts.add(port);
        this.allocations.set(serviceId, {
          port,
          allocatedAt: new Date().toISOString()
        });
        return port;
      }
    }

    throw new Error('No available ports');
  }

  /**
   * Gibt Port frei
   */
  releasePort(serviceId) {
    const allocation = this.allocations.get(serviceId);
    if (allocation) {
      this.usedPorts.delete(allocation.port);
      this.allocations.delete(serviceId);
    }
  }

  /**
   * Gibt Port-Zuweisung zurück
   */
  getPort(serviceId) {
    return this.allocations.get(serviceId);
  }
}

/**
 * Integration Bridge
 */
export class IntegrationBridge {
  constructor() {
    this.registry = new ServiceRegistry();
    this.ipManager = new IPManager();
    this.portManager = new PortManager();
  }

  /**
   * Registriert Applikation
   */
  registerApplication(app) {
    const {
      id,
      name,
      type,
      url,
      ip,
      port,
      healthCheck
    } = app;

    // Weise IP zu (falls nicht vorhanden)
    const allocatedIP = ip || this.ipManager.allocateIP(id, 'local');

    // Weise Port zu (falls nicht vorhanden)
    const allocatedPort = port || this.portManager.allocatePort(id);

    // Registriere Service
    const serviceId = this.registry.registerService({
      id,
      name,
      type,
      url: url || `http://${allocatedIP}:${allocatedPort}`,
      ip: allocatedIP,
      port: allocatedPort,
      healthCheck
    });

    return {
      serviceId,
      ip: allocatedIP,
      port: allocatedPort,
      url: `http://${allocatedIP}:${allocatedPort}`
    };
  }

  /**
   * Verbindet Applikationen
   */
  connectApplications(sourceId, targetId, config = {}) {
    return this.registry.connectServices(sourceId, targetId, config);
  }

  /**
   * Findet Applikationen
   */
  findApplications(type) {
    return this.registry.findServices(type);
  }

  /**
   * Gibt Status zurück
   */
  getStatus() {
    return {
      services: this.registry.getAllServices(),
      connections: this.registry.getAllConnections(),
      ipAllocations: Array.from(this.ipManager.allocations.entries()),
      portAllocations: Array.from(this.portManager.allocations.entries())
    };
  }

  /**
   * Exportiert Konfiguration
   */
  exportConfig() {
    return {
      services: this.registry.getAllServices(),
      connections: this.registry.getAllConnections(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Singleton-Instanz
 */
export const integrationBridge = new IntegrationBridge();








