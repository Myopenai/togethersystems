/**
 * MCP API - Heading Anchor Project
 * 
 * API für MCP-Management und Recovery
 */

import { MCPManager, MCPInfo, MCPOutput } from './mcp-manager';

export class MCPAPI {
  private manager: MCPManager;

  constructor(settingsPath: string) {
    this.manager = new MCPManager(settingsPath);
  }

  /**
   * GET /api/mcp/status
   */
  async getStatus() {
    return this.manager.getStatus();
  }

  /**
   * POST /api/mcp/register
   */
  async registerMCP(info: Partial<MCPInfo>) {
    return await this.manager.registerMCP(info);
  }

  /**
   * POST /api/mcp/output
   */
  async saveOutput(mcpId: string, output: any) {
    return await this.manager.saveOutput(mcpId, output);
  }

  /**
   * POST /api/mcp/recovery-point
   */
  async createRecoveryPoint() {
    return await this.manager.createRecoveryPoint();
  }

  /**
   * GET /api/mcp/missing-functions
   */
  async getMissingFunctions() {
    const registry = (this.manager as any).loadRegistry();
    return registry.missingFunctions || [];
  }

  /**
   * POST /api/mcp/missing-function
   */
  async documentMissingFunction(functionName: string, context: any) {
    return await this.manager.documentMissingFunction(functionName, context);
  }

  /**
   * POST /api/mcp/network-distribution
   */
  async documentNetworkDistribution(mcpId: string, networkType: string, details: any) {
    return await this.manager.documentNetworkDistribution(mcpId, networkType, details);
  }
}

