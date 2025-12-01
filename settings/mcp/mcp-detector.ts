/**
 * MCP Detector - Automatische Erkennung aller verfügbaren MCPs
 * 
 * Erkennt alle MCPs im System und registriert sie automatisch
 */

import { MCPManager, MCPInfo } from './mcp-manager';
import fs from 'fs';
import path from 'path';

export class MCPDetector {
  private manager: MCPManager;
  private settingsPath: string;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.manager = new MCPManager(settingsPath);
  }

  /**
   * Erkenne alle verfügbaren MCPs
   */
  async detectAllMCPs(): Promise<MCPInfo[]> {
    const detected: MCPInfo[] = [];

    // 1. Erkenne MCPs aus Settings/config/mcp-config.json
    const mcpConfigPath = path.join(this.settingsPath, 'config', 'mcp-config.json');
    if (fs.existsSync(mcpConfigPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
      if (mcpConfig.tools) {
        for (const tool of mcpConfig.tools) {
          const mcp = await this.manager.registerMCP({
            name: tool.name || tool.id,
            type: this.determineMCPType(tool),
            status: 'available',
            capabilities: tool.capabilities || [],
            networkInfo: {
              type: 'localhost',
              address: tool.endpoint || 'localhost'
            },
            deviceInfo: {
              deviceId: tool.id,
              deviceType: 'mcp-tool',
              connectionType: 'internal'
            },
            version: tool.version || '1.0.0'
          });
          detected.push(mcp);
        }
      }
    }

    // 2. Erkenne MCPs aus functions/api (Cloudflare Functions)
    const functionsPath = path.join(this.settingsPath, '..', 'functions', 'api');
    if (fs.existsSync(functionsPath)) {
      const apiMCPs = await this.detectAPIMCPs(functionsPath);
      detected.push(...apiMCPs);
    }

    // 3. Erkenne externe MCP-Verbindungen
    const externalMCPs = await this.detectExternalMCPs();
    detected.push(...externalMCPs);

    return detected;
  }

  /**
   * Erkenne API-basierte MCPs
   */
  private async detectAPIMCPs(functionsPath: string): Promise<MCPInfo[]> {
    const mcpList: MCPInfo[] = [];

    const apiDirs = ['mcp', 'sponsors', 'ostosos', 'settings', 'ai'];
    
    for (const dir of apiDirs) {
      const dirPath = path.join(functionsPath, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (file.endsWith('.js')) {
            const mcp = await this.manager.registerMCP({
              name: `${dir}/${file.replace('.js', '')}`,
              type: 'standard',
              status: 'available',
              capabilities: ['api', 'http'],
              networkInfo: {
                type: 'network',
                address: `/api/${dir}/${file.replace('.js', '')}`
              },
              deviceInfo: {
                deviceId: `api-${dir}-${file}`,
                deviceType: 'cloudflare-function',
                connectionType: 'http'
              },
              version: '1.0.0'
            });
            mcpList.push(mcp);
          }
        }
      }
    }

    return mcpList;
  }

  /**
   * Erkenne externe MCP-Verbindungen
   */
  private async detectExternalMCPs(): Promise<MCPInfo[]> {
    const mcpList: MCPInfo[] = [];

    // Simuliere Erkennung von externen MCPs
    // In Produktion: Scanne Netzwerk, Bluetooth, etc.

    // Bluetooth MCPs (simuliert)
    const bluetoothMCPs = await this.detectBluetoothMCPs();
    mcpList.push(...bluetoothMCPs);

    // Wi-Fi MCPs (simuliert)
    const wifiMCPs = await this.detectWiFiMCPs();
    mcpList.push(...wifiMCPs);

    return mcpList;
  }

  /**
   * Erkenne Bluetooth MCPs
   */
  private async detectBluetoothMCPs(): Promise<MCPInfo[]> {
    // In Produktion: Verwende Web Bluetooth API oder ähnliches
    return [];
  }

  /**
   * Erkenne Wi-Fi MCPs
   */
  private async detectWiFiMCPs(): Promise<MCPInfo[]> {
    // In Produktion: Scanne lokales Netzwerk
    return [];
  }

  /**
   * Bestimme MCP-Typ
   */
  private determineMCPType(tool: any): 'standard' | 'xxxxl' | 'custom' {
    if (tool.type === 'xxxxl' || tool.size === 'xxxxl') {
      return 'xxxxl';
    }
    if (tool.custom || tool.type === 'custom') {
      return 'custom';
    }
    return 'standard';
  }

  /**
   * Dokumentiere alle fehlenden Funktionen
   */
  async documentMissingFunctions(): Promise<void> {
    const registry = (this.manager as any).loadRegistry();
    const allMCPs = registry.mcpRegistry || [];

    // Prüfe jede MCP auf fehlende Funktionen
    for (const mcp of allMCPs) {
      const missing = await this.checkMissingFunctions(mcp);
      for (const func of missing) {
        await this.manager.documentMissingFunction(func, {
          mcpId: mcp.id,
          mcpName: mcp.name,
          context: 'auto-detected'
        });
      }
    }
  }

  /**
   * Prüfe fehlende Funktionen für eine MCP
   */
  private async checkMissingFunctions(mcp: MCPInfo): Promise<string[]> {
    const missing: string[] = [];

    // Standard-Funktionen, die jede MCP haben sollte
    const requiredFunctions = [
      'connect',
      'disconnect',
      'execute',
      'verify',
      'backup'
    ];

    // Prüfe ob alle Funktionen in Capabilities vorhanden sind
    for (const func of requiredFunctions) {
      if (!mcp.capabilities.includes(func)) {
        missing.push(func);
      }
    }

    return missing;
  }

  /**
   * Erstelle vollständigen System-Scan
   */
  async performFullScan(): Promise<{
    detected: MCPInfo[];
    missingFunctions: any[];
    networkDistribution: any;
    status: any;
  }> {
    // 1. Erkenne alle MCPs
    const detected = await this.detectAllMCPs();

    // 2. Dokumentiere fehlende Funktionen
    await this.documentMissingFunctions();

    // 3. Lade Status
    const status = this.manager.getStatus();

    // 4. Lade Registry für Details
    const registry = (this.manager as any).loadRegistry();

    return {
      detected,
      missingFunctions: registry.missingFunctions || [],
      networkDistribution: registry.networkDistribution || {},
      status
    };
  }
}








