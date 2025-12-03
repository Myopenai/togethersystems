/**
 * Robot API - Der Macher
 * 
 * API für Robot-Management und Task-Ausführung
 */

import { RobotManager, RobotConfig, RobotTask, DimensionalAnalysis } from './robot-manager';

export class RobotAPI {
  private manager: RobotManager;

  constructor(settingsPath: string) {
    this.manager = new RobotManager(settingsPath);
  }

  /**
   * POST /api/robot/create
   */
  async createRobot(userId: string, verified: boolean, config: Partial<RobotConfig>) {
    return await this.manager.createRobot(userId, verified, config);
  }

  /**
   * POST /api/robot/execute
   */
  async executeTask(robotId: string, taskType: string, input: any) {
    return await this.manager.executeTask(robotId, taskType, input);
  }

  /**
   * POST /api/robot/analyze
   */
  async analyzeDimensional(text: string, robotId: string): Promise<DimensionalAnalysis> {
    const robot = (this.manager as any).loadRobot(robotId);
    if (!robot) {
      throw new Error('Robot nicht gefunden');
    }
    return await this.manager.executeTask(robotId, 'dimensional-analysis', { text });
  }

  /**
   * POST /api/robot/multimedia
   */
  async produceMultimedia(robotId: string, level: number, formats: string[]) {
    return await this.manager.executeTask(robotId, 'multimedia-production', {
      level,
      formats
    });
  }

  /**
   * POST /api/robot/expand
   */
  async expandUniverse(robotId: string, current: number, expected: number) {
    return await this.manager.executeTask(robotId, 'universe-expansion', {
      current,
      expected,
      universe: Infinity
    });
  }

  /**
   * POST /api/robot/extend-source
   */
  async extendSourceCode(robotId: string, sourceCode: string, extension: string, alphabetOffice: string) {
    return await this.manager.executeTask(robotId, 'source-code-extension', {
      sourceCode,
      extension,
      alphabetOffice
    });
  }

  /**
   * POST /api/robot/alphabet-office
   */
  async processAlphabetOffice(robotId: string, office: string, formula: string) {
    return await this.manager.executeTask(robotId, 'alphabet-office', {
      office,
      formula
    });
  }
}

