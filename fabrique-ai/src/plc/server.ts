import { Logger } from '../common/logger';
import { MonitoringService, ServiceStatus } from '../runtime/monitoring';

// Types for PLC data points
type DataType = 'BOOL' | 'INT' | 'REAL' | 'STRING' | 'DINT' | 'WORD' | 'DWORD' | 'LREAL';

interface DataPoint {
  name: string;
  type: DataType;
  value: any;
  address: string;  // e.g., "%I0.0" for digital input, "%QW0" for analog output word
  description?: string;
  min?: number;
  max?: number;
  units?: string;
  readOnly: boolean;
  lastUpdated: Date;
}

interface PLCServerConfig {
  name: string;
  vendor: string;
  model: string;
  ipAddress: string;
  port: number;
  scanRate: number;  // ms
  maxPoints: number;
  tags: Record<string, Omit<DataPoint, 'value' | 'lastUpdated'>>;
}

export class PLCServer {
  private logger: Logger;
  private monitoring: MonitoringService;
  private config: PLCServerConfig;
  private dataPoints: Map<string, DataPoint> = new Map();
  private scanInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(monitoring: MonitoringService) {
    this.logger = new Logger('PLCServer');
    this.monitoring = monitoring;
    
    // Default configuration - would typically be loaded from a file
    this.config = {
      name: 'Default PLC',
      vendor: 'FabriqueAI',
      model: 'FAB-PLC-1',
      ipAddress: '127.0.0.1',
      port: 502,  // Standard Modbus port
      scanRate: 100,  // ms
      maxPoints: 1000,
      tags: {
        // Example tags - in a real system, these would be defined in a configuration
        'System.Heartbeat': {
          name: 'System.Heartbeat',
          type: 'BOOL',
          address: '%M0.0',
          description: 'Heartbeat signal',
          readOnly: false
        },
        'System.Temperature': {
          name: 'System.Temperature',
          type: 'REAL',
          address: '%MD0',
          description: 'System temperature',
          min: -20,
          max: 100,
          units: '°C',
          readOnly: false
        },
        'System.Status': {
          name: 'System.Status',
          type: 'INT',
          address: '%MW0',
          description: 'System status code',
          readOnly: false
        }
      }
    };
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('PLC Server is already running');
      return;
    }

    try {
      this.logger.info('Starting PLC Server...');
      
      // Initialize data points from config
      this.initializeDataPoints();
      
      // Register with monitoring
      this.monitoring.registerService('plc-server', 'PLC Server', 'plc');
      
      // Start the scan cycle
      this.startScanCycle();
      
      this.isRunning = true;
      this.monitoring.updateServiceStatus('plc-server', 'running');
      this.logger.info(`PLC Server started on ${this.config.ipAddress}:${this.config.port}`);
      
    } catch (error) {
      this.logger.error('Failed to start PLC Server', { error });
      this.monitoring.recordError('plc-server', error as Error);
      throw error;
    }
  }

  private initializeDataPoints(): void {
    // Clear existing data points
    this.dataPoints.clear();
    
    // Create data points from config
    for (const [name, tag] of Object.entries(this.config.tags)) {
      this.dataPoints.set(name, {
        ...tag,
        value: this.getDefaultValue(tag.type),
        lastUpdated: new Date()
      });
    }
    
    this.logger.info(`Initialized ${this.dataPoints.size} data points`);
  }

  private getDefaultValue(type: DataType): any {
    switch (type) {
      case 'BOOL': return false;
      case 'INT':
      case 'WORD':
      case 'DWORD':
        return 0;
      case 'REAL':
      case 'LREAL':
        return 0.0;
      case 'STRING':
        return '';
      default:
        return null;
    }
  }

  private startScanCycle(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    this.scanInterval = setInterval(() => {
      this.scanCycle();
    }, this.config.scanRate);
    
    this.logger.debug(`Started PLC scan cycle (${this.config.scanRate}ms)`);
  }

  private scanCycle(): void {
    try {
      const startTime = process.hrtime();
      
      // Update heartbeat
      const heartbeat = this.dataPoints.get('System.Heartbeat');
      if (heartbeat) {
        heartbeat.value = !heartbeat.value;
        heartbeat.lastUpdated = new Date();
      }
      
      // Update other simulated values
      this.updateSimulatedValues();
      
      // Calculate scan time
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const scanTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
      
      // Record metrics
      this.monitoring.recordMetric('plc-server', 'scan_time', scanTimeMs, {
        points: this.dataPoints.size
      });
      
    } catch (error) {
      this.logger.error('Error in PLC scan cycle', { error });
      this.monitoring.recordError('plc-server', error as Error, { phase: 'scanCycle' });
    }
  }

  private updateSimulatedValues(): void {
    // In a real system, this would read from actual hardware
    // For simulation, we'll generate some changing values
    
    // Update temperature with some noise
    const tempPoint = this.dataPoints.get('System.Temperature');
    if (tempPoint) {
      const currentTemp = tempPoint.value as number;
      const change = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and +0.25
      let newTemp = currentTemp + change;
      
      // Keep within bounds if defined
      if (tempPoint.min !== undefined && newTemp < tempPoint.min) newTemp = tempPoint.min;
      if (tempPoint.max !== undefined && newTemp > tempPoint.max) newTemp = tempPoint.max;
      
      tempPoint.value = parseFloat(newTemp.toFixed(2));
      tempPoint.lastUpdated = new Date();
    }
    
    // Update status code occasionally
    if (Math.random() < 0.05) { // 5% chance to change status
      const statusPoint = this.dataPoints.get('System.Status');
      if (statusPoint) {
        statusPoint.value = Math.floor(Math.random() * 10); // Random status code 0-9
        statusPoint.lastUpdated = new Date();
      }
    }
  }

  public readTag(tagName: string): any | undefined {
    const point = this.dataPoints.get(tagName);
    if (!point) {
      this.logger.warn(`Attempted to read undefined tag: ${tagName}`);
      return undefined;
    }
    
    // Record the read operation
    this.monitoring.recordMetric('plc-server', 'tag_read', 1, { tag: tagName });
    
    return point.value;
  }

  public writeTag(tagName: string, value: any): boolean {
    const point = this.dataPoints.get(tagName);
    if (!point) {
      this.logger.warn(`Attempted to write to undefined tag: ${tagName}`);
      return false;
    }
    
    if (point.readOnly) {
      this.logger.warn(`Attempted to write to read-only tag: ${tagName}`);
      return false;
    }
    
    // Validate value type
    const isValid = this.validateValue(point.type, value);
    if (!isValid) {
      this.logger.warn(`Invalid value type for tag ${tagName}: ${typeof value} (expected ${point.type})`);
      return false;
    }
    
    // Validate value range if min/max defined
    if (typeof value === 'number' && (point.min !== undefined || point.max !== undefined)) {
      if (point.min !== undefined && value < point.min) {
        this.logger.warn(`Value ${value} below minimum ${point.min} for tag ${tagName}`);
        return false;
      }
      if (point.max !== undefined && value > point.max) {
        this.logger.warn(`Value ${value} above maximum ${point.max} for tag ${tagName}`);
        return false;
      }
    }
    
    // Update the value
    point.value = value;
    point.lastUpdated = new Date();
    
    // Record the write operation
    this.monitoring.recordMetric('plc-server', 'tag_write', 1, { 
      tag: tagName,
      value: value.toString()
    });
    
    this.logger.debug(`Updated tag ${tagName} = ${value}`);
    return true;
  }

  private validateValue(type: DataType, value: any): boolean {
    switch (type) {
      case 'BOOL':
        return typeof value === 'boolean';
      case 'INT':
      case 'WORD':
        return Number.isInteger(value);
      case 'DINT':
      case 'DWORD':
        return Number.isInteger(value) && value >= -2147483648 && value <= 4294967295;
      case 'REAL':
      case 'LREAL':
        return typeof value === 'number';
      case 'STRING':
        return typeof value === 'string';
      default:
        return false;
    }
  }

  public getTags(): string[] {
    return Array.from(this.dataPoints.keys());
  }

  public getTagInfo(tagName: string): DataPoint | undefined {
    return this.dataPoints.get(tagName);
  }

  public async shutdown(): Promise<void> {
    if (!this.isRunning) return;
    
    this.logger.info('Shutting down PLC Server...');
    
    // Stop the scan cycle
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    // Update monitoring
    this.monitoring.updateServiceStatus('plc-server', 'stopped');
    
    this.isRunning = false;
    this.logger.info('PLC Server has been shut down');
  }
}
