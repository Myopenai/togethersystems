import { EventEmitter } from 'events';
import { Logger } from '../common/logger';
import { 
  ProtocolHandler, 
  DataPointConfig, 
  DataPointValue, 
  GatewayError, 
  GatewayConfig,
  ProtocolType,
  GATEWAY_EVENTS,
  ProtocolConfig,
  DataPointMapping,
  ProtocolTranslation
} from './types';
import { OPCUAHandler } from './opcua-handler';
import { ModbusHandler } from './modbus-handler';

export class GatewayService extends EventEmitter {
  private logger: Logger;
  private handlers: Map<string, ProtocolHandler> = new Map();
  private dataPoints: Map<string, DataPointConfig> = new Map();
  private dataPointMappings: Map<string, DataPointMapping[]> = new Map();
  private protocolTranslations: ProtocolTranslation[] = [];
  private isInitialized: boolean = false;
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    super();
    this.logger = new Logger('GatewayService');
    this.config = config;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Gateway service already initialized');
      return;
    }

    try {
      this.logger.info('Initializing Gateway Service...');
      
      // Initialize protocol handlers
      await this.initializeProtocolHandlers();
      
      // Load data points
      await this.loadDataPoints();
      
      // Set up protocol translations
      this.setupProtocolTranslations();
      
      this.isInitialized = true;
      this.logger.info('Gateway Service initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Gateway Service', { error });
      throw new GatewayError(
        `Gateway initialization failed: ${(error as Error).message}`,
        'GATEWAY_INIT_ERROR',
        undefined,
        error as Error
      );
    }
  }

  private async initializeProtocolHandlers(): Promise<void> {
    if (!this.config.protocols || this.config.protocols.length === 0) {
      this.logger.warn('No protocol configurations provided');
      return;
    }

    for (const protocolConfig of this.config.protocols) {
      try {
        await this.createProtocolHandler(protocolConfig);
      } catch (error) {
        this.logger.error(`Failed to initialize protocol handler for ${protocolConfig.type}`, { 
          error,
          protocolId: protocolConfig.id
        });
        
        if (protocolConfig.required) {
          throw error;
        }
      }
    }
  }

  private async createProtocolHandler(config: ProtocolConfig): Promise<void> {
    let handler: ProtocolHandler;
    
    switch (config.type) {
      case 'opcua':
        handler = new OPCUAHandler(config.id, config.name, config);
        break;
        
      case 'modbus':
        handler = new ModbusHandler(config.id, config.name, config);
        break;
        
      default:
        throw new GatewayError(
          `Unsupported protocol type: ${config.type}`,
          'UNSUPPORTED_PROTOCOL',
          undefined,
          undefined,
          { protocolType: config.type }
        );
    }
    
    // Set up event forwarding
    this.setupHandlerEvents(handler);
    
    // Connect the handler
    await handler.connect();
    
    // Store the handler
    this.handlers.set(config.id, handler);
    
    this.logger.info(`Initialized ${config.type.toUpperCase()} handler: ${config.name} (${config.id})`);
  }

  private setupHandlerEvents(handler: ProtocolHandler): void {
    handler.on('connected', (info: { id: string; name: string }) => {
      this.emit('handler:connected', info);
    });
    
    handler.on('disconnected', (info: { id: string; name: string }) => {
      this.emit('handler:disconnected', info);    
    });
    
    handler.on('error', (error: any) => {
      this.emit('handler:error', error);
    });
    
    handler.on('data', (data: DataPointValue) => {
      this.handleDataPointUpdate(data);
    });
  }

  private async loadDataPoints(): Promise<void> {
    if (!this.config.dataPoints || this.config.dataPoints.length === 0) {
      this.logger.warn('No data points configured');
      return;
    }
    
    for (const dp of this.config.dataPoints) {
      try {
        await this.addDataPoint(dp);
      } catch (error) {
        this.logger.error(`Failed to load data point ${dp.id}`, { 
          error,
          dataPoint: dp.id 
        });
        
        if (dp.required) {
          throw error;
        }
      }
    }
    
    this.logger.info(`Loaded ${this.dataPoints.size} data points`);
  }

  public async addDataPoint(config: DataPointConfig): Promise<void> {
    // Validate data point
    this.validateDataPointConfig(config);
    
    // Add to data points map
    this.dataPoints.set(config.id, config);
    
    // Get or create handler
    let handler = this.handlers.get(config.protocol);
    if (!handler) {
      const protocolConfig = this.config.protocols?.find(p => p.id === config.protocol);
      if (!protocolConfig) {
        throw new GatewayError(
          `Protocol not found: ${config.protocol}`,
          'PROTOCOL_NOT_FOUND',
          config.id,
          undefined,
          { protocol: config.protocol }
        );
      }
      
      handler = await this.createProtocolHandler(protocolConfig);
    }
    
    // Add data point to handler
    if (handler) {
      await handler.addDataPoint(config);
      
      // Set up subscription if needed
      if (config.pollingInterval) {
        await handler.subscribe(config, (value: DataPointValue) => {
          this.handleDataPointUpdate(value);
        });
      }
    }
    
    this.logger.debug(`Added data point: ${config.id}`);
  }

  public async removeDataPoint(dataPointId: string): Promise<boolean> {
    const config = this.dataPoints.get(dataPointId);
    if (!config) {
      return false;
    }
    
    // Remove from data points map
    this.dataPoints.delete(dataPointId);
    
    // Remove from handler
    const handler = this.handlers.get(config.protocol);
    if (handler) {
      await handler.removeDataPoint(dataPointId);
    }
    
    // Remove any mappings
    this.dataPointMappings.delete(dataPointId);
    
    this.logger.debug(`Removed data point: ${dataPointId}`);
    return true;
  }

  public async readDataPoint(dataPointId: string): Promise<DataPointValue> {
    const config = this.dataPoints.get(dataPointId);
    if (!config) {
      throw new GatewayError(
        `Data point not found: ${dataPointId}`,
        'DATA_POINT_NOT_FOUND',
        dataPointId
      );
    }
    
    const handler = this.handlers.get(config.protocol);
    if (!handler) {
      throw new GatewayError(
        `Protocol handler not found: ${config.protocol}`,
        'HANDLER_NOT_FOUND',
        dataPointId,
        undefined,
        { protocol: config.protocol }
      );
    }
    
    try {
      return await handler.read(config);
    } catch (error) {
      throw new GatewayError(
        `Failed to read data point: ${dataPointId}`,
        'READ_ERROR',
        dataPointId,
        error as Error
      );
    }
  }

  public async writeDataPoint(dataPointId: string, value: any): Promise<boolean> {
    const config = this.dataPoints.get(dataPointId);
    if (!config) {
      throw new GatewayError(
        `Data point not found: ${dataPointId}`,
        'DATA_POINT_NOT_FOUND',
        dataPointId
      );
    }
    
    if (config.readOnly) {
      throw new GatewayError(
        `Cannot write to read-only data point: ${dataPointId}`,
        'WRITE_ERROR',
        dataPointId
      );
    }
    
    const handler = this.handlers.get(config.protocol);
    if (!handler) {
      throw new GatewayError(
        `Protocol handler not found: ${config.protocol}`,
        'HANDLER_NOT_FOUND',
        dataPointId,
        undefined,
        { protocol: config.protocol }
      );
    }
    
    try {
      const result = await handler.write(config, value);
      
      // If write was successful, update any mapped data points
      if (result) {
        await this.processDataPointMappings(dataPointId, value);
      }
      
      return result;
      
    } catch (error) {
      throw new GatewayError(
        `Failed to write data point: ${dataPointId}`,
        'WRITE_ERROR',
        dataPointId,
        error as Error,
        { value }
      );
    }
  }

  public async subscribeToDataPoint(
    dataPointId: string,
    callback: (value: DataPointValue) => void
  ): Promise<() => void> {
    const config = this.dataPoints.get(dataPointId);
    if (!config) {
      throw new GatewayError(
        `Data point not found: ${dataPointId}`,
        'DATA_POINT_NOT_FOUND',
        dataPointId
      );
    }
    
    const handler = this.handlers.get(config.protocol);
    if (!handler) {
      throw new GatewayError(
        `Protocol handler not found: ${config.protocol}`,
        'HANDLER_NOT_FOUND',
        dataPointId,
        undefined,
        { protocol: config.protocol }
      );
    }
    
    // Set up the subscription
    const unsubscribe = await handler.subscribe(config, (value: DataPointValue) => {
      callback(value);
    });
    
    // Return the unsubscribe function
    return async () => {
      if (unsubscribe) {
        await unsubscribe();
      }
    };
  }

  private handleDataPointUpdate(value: DataPointValue): void {
    // Emit the data event
    this.emit('data', value);
    
    // Process any protocol translations
    this.processProtocolTranslations(value);
    
    // Process any data point mappings
    this.processDataPointMappings(value.id, value.value).catch(error => {
      this.logger.error('Error processing data point mappings', { 
        error,
        dataPoint: value.id 
      });
    });
  }

  private async processDataPointMappings(sourceId: string, value: any): Promise<void> {
    const mappings = this.dataPointMappings.get(sourceId) || [];
    
    for (const mapping of mappings) {
      try {
        // Get the target data point
        const targetConfig = this.dataPoints.get(mapping.targetId);
        if (!targetConfig) continue;
        
        // Apply the transformation if provided
        let targetValue = value;
        if (mapping.transform) {
          try {
            targetValue = this.applyTransformation(value, mapping.transform);
          } catch (error) {
            this.logger.error('Error applying transformation', { 
              error,
              sourceId,
              targetId: mapping.targetId,
              transform: mapping.transform
            });
            continue;
          }
        }
        
        // Write the value to the target data point
        await this.writeDataPoint(mapping.targetId, targetValue);
        
      } catch (error) {
        this.logger.error('Error processing data point mapping', { 
          error,
          sourceId,
          targetId: mapping.targetId
        });
      }
    }
  }

  private processProtocolTranslations(value: DataPointValue): void {
    for (const translation of this.protocolTranslations) {
      try {
        if (translation.sourceProtocol === value.protocol) {
          // Find matching target data points
          const targetPoints = Array.from(this.dataPoints.values()).filter(
            dp => dp.protocol === translation.targetProtocol &&
                  dp.tags?.some(tag => translation.mappingTags.includes(tag))
          );
          
          // Update each target data point
          for (const target of targetPoints) {
            this.writeDataPoint(target.id, value.value).catch(error => {
              this.logger.error('Error in protocol translation', {
                error,
                sourceId: value.id,
                targetId: target.id,
                sourceProtocol: value.protocol,
                targetProtocol: target.protocol
              });
            });
          }
        }
      } catch (error) {
        this.logger.error('Error in protocol translation', { 
          error,
          dataPoint: value.id,
          translation
        });
      }
    }
  }

  private applyTransformation(value: any, transform: string): any {
    // Simple transformation function evaluation
    // In a real implementation, you would want to use a sandboxed environment
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('value', `return ${transform}`);
      return fn(value);
    } catch (error) {
      throw new GatewayError(
        `Invalid transformation: ${transform}`,
        'TRANSFORM_ERROR',
        undefined,
        error as Error,
        { transform, value }
      );
    }
  }

  private validateDataPointConfig(config: DataPointConfig): void {
    if (!config.id) {
      throw new GatewayError(
        'Data point ID is required',
        'INVALID_CONFIG',
        undefined,
        undefined,
        { config }
      );
    }
    
    if (!config.protocol) {
      throw new GatewayError(
        'Protocol is required',
        'INVALID_CONFIG',
        config.id,
        undefined,
        { config }
      );
    }
    
    if (!config.address) {
      throw new GatewayError(
        'Address is required',
        'INVALID_CONFIG',
        config.id,
        undefined,
        { config }
      );
    }
    
    // Protocol-specific validation
    switch (config.protocol) {
      case 'modbus':
        this.validateModbusConfig(config);
        break;
      case 'opcua':
        this.validateOpcUaConfig(config);
        break;
      // Add other protocol validations as needed
    }
  }

  private validateModbusConfig(config: DataPointConfig): void {
    const modbusConfig = config.modbusConfig;
    if (!modbusConfig) {
      throw new GatewayError(
        'Modbus configuration is required',
        'INVALID_CONFIG',
        config.id,
        undefined,
        { config }
      );
    }
    
    // Validate register type and function code
    if (!modbusConfig.registerType || !modbusConfig.functionCode) {
      throw new GatewayError(
        'Modbus register type and function code are required',
        'INVALID_CONFIG',
        config.id,
        undefined,
        { modbusConfig }
      );
    }
  }

  private validateOpcUaConfig(config: DataPointConfig): void {
    // Add OPC UA specific validation
    if (!config.address) {
      throw new GatewayError(
        'OPC UA node ID is required',
        'INVALID_CONFIG',
        config.id,
        undefined,
        { config }
      );
    }
  }

  private setupProtocolTranslations(): void {
    if (!this.config.protocolTranslations) return;
    
    this.protocolTranslations = this.config.protocolTranslations;
    
    this.logger.info(`Configured ${this.protocolTranslations.length} protocol translations`);
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Gateway Service...');
    
    // Disconnect all protocol handlers
    const disconnectPromises = Array.from(this.handlers.values()).map(handler => 
      handler.disconnect().catch(error => {
        this.logger.error('Error disconnecting handler', { error });
      })
    );
    
    await Promise.all(disconnectPromises);
    
    this.handlers.clear();
    this.dataPoints.clear();
    this.dataPointMappings.clear();
    this.protocolTranslations = [];
    this.isInitialized = false;
    
    this.logger.info('Gateway Service shut down');
  }

  public getStatus(): {
    isInitialized: boolean;
    handlerCount: number;
    dataPointCount: number;
    handlerStatuses: Array<{ id: string; type: string; status: string }>;
  } {
    const handlerStatuses = Array.from(this.handlers.entries()).map(([id, handler]) => ({
      id,
      type: handler.getType(),
      status: handler.getStatus()
    }));
    
    return {
      isInitialized: this.isInitialized,
      handlerCount: this.handlers.size,
      dataPointCount: this.dataPoints.size,
      handlerStatuses
    };
  }

  // Helper methods for data point mappings
  public addDataPointMapping(sourceId: string, targetId: string, transform?: string): void {
    if (!this.dataPoints.has(sourceId)) {
      throw new GatewayError(
        `Source data point not found: ${sourceId}`,
        'DATA_POINT_NOT_FOUND',
        sourceId
      );
    }
    
    if (!this.dataPoints.has(targetId)) {
      throw new GatewayError(
        `Target data point not found: ${targetId}`,
        'DATA_POINT_NOT_FOUND',
        targetId
      );
    }
    
    const mappings = this.dataPointMappings.get(sourceId) || [];
    
    // Check if mapping already exists
    if (mappings.some(m => m.targetId === targetId)) {
      return;
    }
    
    // Add the new mapping
    mappings.push({ sourceId, targetId, transform });
    this.dataPointMappings.set(sourceId, mappings);
    
    this.logger.debug(`Added data point mapping: ${sourceId} -> ${targetId}`);
  }

  public removeDataPointMapping(sourceId: string, targetId: string): boolean {
    const mappings = this.dataPointMappings.get(sourceId);
    if (!mappings) return false;
    
    const initialLength = mappings.length;
    const filtered = mappings.filter(m => m.targetId !== targetId);
    
    if (filtered.length === initialLength) {
      return false;
    }
    
    if (filtered.length === 0) {
      this.dataPointMappings.delete(sourceId);
    } else {
      this.dataPointMappings.set(sourceId, filtered);
    }
    
    this.logger.debug(`Removed data point mapping: ${sourceId} -> ${targetId}`);
    return true;
  }

  public getDataPointMappings(sourceId?: string): DataPointMapping[] {
    if (sourceId) {
      return this.dataPointMappings.get(sourceId) || [];
    }
    
    // Return all mappings if no source ID is provided
    return Array.from(this.dataPointMappings.values()).flat();
  }

  // Event emitter type definitions
  public on(event: 'data', listener: (value: DataPointValue) => void): this;
  public on(event: 'handler:connected', listener: (info: { id: string; name: string }) => void): this;
  public on(event: 'handler:disconnected', listener: (info: { id: string; name: string }) => void): this;
  public on(event: 'handler:error', listener: (error: any) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public emit(event: 'data', value: DataPointValue): boolean;
  public emit(event: 'handler:connected', info: { id: string; name: string }): boolean;
  public emit(event: 'handler:disconnected', info: { id: string; name: string }): boolean;
  public emit(event: 'handler:error', error: any): boolean;
  public emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}
