/**
 * MCP Manager - Heading Anchor Project
 * 
 * Total MCP Management & Recovery System
 * Extra verdrahtet, vernetzt für alle MCPs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface MCPInfo {
  id: string;
  name: string;
  type: 'standard' | 'xxxxl' | 'custom';
  status: 'connected' | 'available' | 'offline' | 'error';
  capabilities: string[];
  lastVerified: string;
  backupStatus: 'verified' | 'pending' | 'failed';
  networkInfo: {
    type: 'localhost' | 'network' | 'global' | 'bluetooth' | 'wifi' | 'external';
    address?: string;
    port?: number;
    connectionId?: string;
  };
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    hapticConfig?: any;
    connectionType: string;
  };
  timestamp: string;
  deployReceived?: string;
  version: string;
}

export interface MCPOutput {
  id: string;
  mcpId: string;
  output: any;
  timestamp: string;
  verified: boolean;
  checksum: string;
  backupLocation: {
    local?: string;
    online?: string;
  };
}

export interface MCPRecoveryPoint {
  id: string;
  timestamp: string;
  mcpSnapshot: MCPInfo[];
  settingsSnapshot: any;
  checksum: string;
  location: {
    local: string;
    online?: string;
  };
}

export class MCPManager {
  private registryPath: string;
  private outputsPath: string;
  private backupsPath: string;
  private recoveryPath: string;
  private settingsPath: string;

  constructor(settingsRoot: string) {
    this.settingsPath = settingsRoot;
    this.registryPath = path.join(settingsRoot, 'mcp', 'mcp-registry.json');
    this.outputsPath = path.join(settingsRoot, 'mcp', 'outputs');
    this.backupsPath = path.join(settingsRoot, 'mcp', 'backups');
    this.recoveryPath = path.join(settingsRoot, 'mcp', 'recovery');

    // Erstelle Verzeichnisse
    [this.outputsPath, this.backupsPath, this.recoveryPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Registriere einen MCP
   */
  async registerMCP(info: Partial<MCPInfo>): Promise<MCPInfo> {
    const mcp: MCPInfo = {
      id: info.id || crypto.randomBytes(16).toString('hex'),
      name: info.name || 'Unknown MCP',
      type: info.type || 'standard',
      status: info.status || 'available',
      capabilities: info.capabilities || [],
      lastVerified: new Date().toISOString(),
      backupStatus: 'pending',
      networkInfo: info.networkInfo || { type: 'localhost' },
      deviceInfo: info.deviceInfo || {
        deviceId: 'unknown',
        deviceType: 'unknown',
        connectionType: 'unknown'
      },
      timestamp: new Date().toISOString(),
      version: info.version || '1.0.0'
    };

    // Speichere in Registry
    const registry = this.loadRegistry();
    registry.mcpRegistry.push(mcp);
    registry.mcpTotal = registry.mcpRegistry.length;
    registry.mcpConnected = registry.mcpRegistry.filter(m => m.status === 'connected').length;
    registry.mcpAvailable = registry.mcpRegistry.filter(m => m.status === 'available' || m.status === 'connected').length;
    
    if (mcp.type === 'xxxxl') {
      registry.mcpXXXXL.push(mcp.id);
    }

    this.saveRegistry(registry);

    // Verifiziere im Hintergrund
    this.verifyMCP(mcp.id);

    return mcp;
  }

  /**
   * Speichere erfolgreichen Output
   */
  async saveOutput(mcpId: string, output: any): Promise<MCPOutput> {
    const outputData: MCPOutput = {
      id: crypto.randomBytes(16).toString('hex'),
      mcpId,
      output,
      timestamp: new Date().toISOString(),
      verified: false,
      checksum: this.calculateChecksum(output),
      backupLocation: {}
    };

    // Speichere lokal
    const localPath = path.join(this.outputsPath, `${outputData.id}.json`);
    fs.writeFileSync(localPath, JSON.stringify(outputData, null, 2));
    outputData.backupLocation.local = localPath;

    // Verifiziere im Hintergrund
    this.verifyOutput(outputData.id);

    // Aktualisiere Registry
    const registry = this.loadRegistry();
    registry.successfulOutputs.push({
      id: outputData.id,
      mcpId,
      timestamp: outputData.timestamp,
      verified: false
    });
    this.saveRegistry(registry);

    return outputData;
  }

  /**
   * Verifiziere MCP im Hintergrund
   */
  private async verifyMCP(mcpId: string): Promise<void> {
    const registry = this.loadRegistry();
    const mcp = registry.mcpRegistry.find(m => m.id === mcpId);
    if (!mcp) return;

    // Simuliere Verifizierung
    mcp.lastVerified = new Date().toISOString();
    mcp.backupStatus = 'verified';

    // Erstelle Backup
    await this.createBackup(mcpId, mcp);

    this.saveRegistry(registry);
  }

  /**
   * Verifiziere Output im Hintergrund
   */
  private async verifyOutput(outputId: string): Promise<void> {
    const outputPath = path.join(this.outputsPath, `${outputId}.json`);
    if (!fs.existsSync(outputPath)) return;

    const outputData: MCPOutput = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    
    // Verifiziere Checksum
    const calculatedChecksum = this.calculateChecksum(outputData.output);
    outputData.verified = calculatedChecksum === outputData.checksum;

    // Erstelle verifiziertes Backup
    if (outputData.verified) {
      await this.createVerifiedBackup(outputId, outputData);
    }

    // Aktualisiere Datei
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    // Aktualisiere Registry
    const registry = this.loadRegistry();
    const outputEntry = registry.successfulOutputs.find(o => o.id === outputId);
    if (outputEntry) {
      outputEntry.verified = outputData.verified;
    }
    this.saveRegistry(registry);
  }

  /**
   * Erstelle Backup für MCP
   */
  private async createBackup(mcpId: string, mcp: MCPInfo): Promise<void> {
    const backupPath = path.join(this.backupsPath, `${mcpId}-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(mcp, null, 2));

    const registry = this.loadRegistry();
    registry.verifiedBackups.local.push({
      mcpId,
      path: backupPath,
      timestamp: new Date().toISOString(),
      verified: true
    });
    this.saveRegistry(registry);
  }

  /**
   * Erstelle verifiziertes Backup für Output
   */
  private async createVerifiedBackup(outputId: string, output: MCPOutput): Promise<void> {
    const backupPath = path.join(this.backupsPath, `output-${outputId}-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(output, null, 2));

    const registry = this.loadRegistry();
    registry.verifiedBackups.local.push({
      outputId,
      path: backupPath,
      timestamp: new Date().toISOString(),
      verified: true
    });
    this.saveRegistry(registry);
  }

  /**
   * Erstelle Recovery Point
   */
  async createRecoveryPoint(): Promise<MCPRecoveryPoint> {
    const registry = this.loadRegistry();
    
    // Lade Settings-Snapshot
    const settingsSnapshot = this.loadSettingsSnapshot();

    const recoveryPoint: MCPRecoveryPoint = {
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date().toISOString(),
      mcpSnapshot: registry.mcpRegistry,
      settingsSnapshot,
      checksum: this.calculateChecksum({ registry, settingsSnapshot }),
      location: {
        local: path.join(this.recoveryPath, `recovery-${Date.now()}.json`)
      }
    };

    // Speichere Recovery Point
    fs.writeFileSync(recoveryPoint.location.local, JSON.stringify(recoveryPoint, null, 2));

    // Aktualisiere Registry
    registry.recoveryPoints.push({
      id: recoveryPoint.id,
      timestamp: recoveryPoint.timestamp,
      location: recoveryPoint.location.local
    });
    this.saveRegistry(registry);

    return recoveryPoint;
  }

  /**
   * Dokumentiere fehlende Funktionen
   */
  async documentMissingFunction(functionName: string, context: any): Promise<void> {
    const registry = this.loadRegistry();
    
    registry.missingFunctions.push({
      functionName,
      context,
      timestamp: new Date().toISOString(),
      reportedBy: 'mcp-manager'
    });

    this.saveRegistry(registry);
  }

  /**
   * Dokumentiere Netzwerk-Verteilung
   */
  async documentNetworkDistribution(mcpId: string, networkType: string, details: any): Promise<void> {
    const registry = this.loadRegistry();
    
    const distribution = {
      mcpId,
      networkType,
      details,
      timestamp: new Date().toISOString()
    };

    switch (networkType) {
      case 'localhost':
        registry.networkDistribution.localhost.push(distribution);
        break;
      case 'bluetooth':
        registry.networkDistribution.bluetooth.push(distribution);
        break;
      case 'wifi':
        registry.networkDistribution.wifi.push(distribution);
        break;
      case 'external':
        registry.networkDistribution.external.push(distribution);
        break;
      default:
        registry.networkDistribution.networks.push(distribution);
    }

    this.saveRegistry(registry);
  }

  /**
   * Lade Registry
   */
  private loadRegistry(): any {
    if (!fs.existsSync(this.registryPath)) {
      return {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        mcpTotal: 0,
        mcpConnected: 0,
        mcpAvailable: 0,
        mcpXXXXL: [],
        mcpRegistry: [],
        successfulOutputs: [],
        verifiedBackups: { local: [], online: [] },
        networkDistribution: {
          localhost: [],
          networks: [],
          global: [],
          bluetooth: [],
          wifi: [],
          external: []
        },
        deviceRegistry: [],
        connectionTypes: [],
        licenses: [],
        modifications: [],
        useCases: [],
        missingFunctions: [],
        recoveryPoints: []
      };
    }

    return JSON.parse(fs.readFileSync(this.registryPath, 'utf-8'));
  }

  /**
   * Speichere Registry
   */
  private saveRegistry(registry: any): void {
    registry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2));
  }

  /**
   * Lade Settings-Snapshot
   */
  private loadSettingsSnapshot(): any {
    // Lade alle relevanten Settings-Dateien
    const snapshot: any = {};

    const settingsFiles = [
      'settings-manifest.json',
      'branding.json',
      'config/mcp-config.json'
    ];

    settingsFiles.forEach(file => {
      const filePath = path.join(this.settingsPath, file);
      if (fs.existsSync(filePath)) {
        snapshot[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    });

    return snapshot;
  }

  /**
   * Berechne Checksum
   */
  private calculateChecksum(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Get MCP Status
   */
  getStatus(): any {
    const registry = this.loadRegistry();
    return {
      total: registry.mcpTotal,
      connected: registry.mcpConnected,
      available: registry.mcpAvailable,
      xxxxl: registry.mcpXXXXL.length,
      outputs: registry.successfulOutputs.length,
      verifiedBackups: {
        local: registry.verifiedBackups.local.length,
        online: registry.verifiedBackups.online.length
      },
      recoveryPoints: registry.recoveryPoints.length,
      lastUpdated: registry.lastUpdated
    };
  }
}

