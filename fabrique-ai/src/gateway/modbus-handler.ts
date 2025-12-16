import ModbusRTU from 'modbus-serial';
import { EventEmitter } from 'events';
import { Logger } from '../common/logger';
import { BaseProtocolHandler } from './base-handler';
import { 
  DataPointConfig, 
  DataPointValue, 
  GatewayError, 
  ProtocolType,
  GATEWAY_EVENTS
} from './types';
import {
  ModbusConfig,
  ModbusRegisterType,
  ModbusFunctionCode,
  ModbusDataPointConfig,
  ModbusConnectionOptions
} from './modbus-types';

type ModbusClient = ModbusRTU & {
  _client?: {
    _client?: {
      destroy?: () => void;
    };
  };
};

export class ModbusHandler extends BaseProtocolHandler {
  private client?: ModbusClient;
  private connectionPool: Map<string, ModbusClient> = new Map();
  private connectionOptions: ModbusConnectionOptions;
  private maxConnections: number = 5;
  private connectionTimeout: number = 5000;
  private retryInterval: number = 5000;
  private maxRetries: number = 3;
  private unitId: number = 1;
  private isRTU: boolean = false;
  private connectionCheckInterval?: NodeJS.Timeout;
  private connectionInProgress: boolean = false;
  private debug: boolean = false;

  constructor(
    id: string,
    name: string,
    config: ModbusConfig
  ) {
    super(id, name, 'modbus', config);
    
    this.debug = config.debug || false;
    this.isRTU = config.transport === 'rtu' || config.transport === 'ascii';
    this.unitId = config.unitId || 1;
    this.maxConnections = config.poolSize || 5;
    this.connectionTimeout = config.timeout || 5000;
    this.retryInterval = config.retryInterval || 5000;
    this.maxRetries = config.maxRetries || 3;
    
    // Set up connection options based on transport type
    this.connectionOptions = this.prepareConnectionOptions(config);
  }

  private prepareConnectionOptions(config: ModbusConfig): ModbusConnectionOptions {
    const baseOptions: ModbusConnectionOptions = {
      poolSize: config.poolSize || 5,
      timeout: config.timeout || 5000,
      retryInterval: config.retryInterval || 5000,
      maxRetries: config.maxRetries || 3,
      debug: config.debug || false
    };

    if (this.isRTU) {
      return {
        ...baseOptions,
        baudRate: config.baudRate || 9600,
        dataBits: config.dataBits || 8,
        stopBits: config.stopBits || 1,
        parity: config.parity || 'none',
        rtscts: config.rtscts || false,
        xon: config.xon || false,
        xoff: config.xoff || false,
        rtsMode: config.rtsMode || 'none',
        portPath: config.port ? config.port.toString() : '/dev/ttyUSB0',
      };
    } else {
      return {
        ...baseOptions,
        host: config.host || 'localhost',
        port: config.port || 502,
      };
    }
  }

  protected async performConnect(): Promise<void> {
    if (this.connected) return;
    
    try {
      if (this.isRTU) {
        await this.connectRTU();
      } else {
        await this.initializeConnectionPool();
      }
      
      this.connected = true;
      this.setupConnectionMonitoring();
      
    } catch (error) {
      this.handleConnectionError(error as Error);
      throw new GatewayError(
        `Failed to connect to Modbus ${this.isRTU ? 'RTU' : 'TCP'}: ${(error as Error).message}`,
        'MODBUS_CONNECTION_ERROR',
        undefined,
        error as Error
      );
    }
  }

  private async connectRTU(): Promise<void> {
    this.client = new ModbusRTU() as ModbusClient;
    
    // Set up event handlers
    this.setupClientEventHandlers(this.client);
    
    // Connect to the RTU device
    await this.client.connectRTUBuffer(
      this.connectionOptions.portPath as string,
      {
        baudRate: this.connectionOptions.baudRate,
        dataBits: this.connectionOptions.dataBits,
        stopBits: this.connectionOptions.stopBits,
        parity: this.connectionOptions.parity,
        rtscts: this.connectionOptions.rtscts,
        xon: this.connectionOptions.xon,
        xoff: this.connectionOptions.xoff,
      },
      { unitId: this.unitId }
    );
    
    this.logger.info(`Connected to Modbus RTU device at ${this.connectionOptions.portPath}`);
  }

  private async initializeConnectionPool(): Promise<void> {
    if (this.isRTU) return; // No pooling for RTU
    
    const connectionPromises = [];
    
    // Create initial connections
    for (let i = 0; i < this.maxConnections; i++) {
      connectionPromises.push(this.createConnection(`conn-${i}`));
    }
    
    await Promise.all(connectionPromises);
    
    if (this.connectionPool.size === 0) {
      throw new Error('Failed to create any connections in the pool');
    }
    
    this.logger.info(`Initialized Modbus connection pool with ${this.connectionPool.size} connections`);
  }

  private async createConnection(id: string): Promise<void> {
    try {
      const client = new ModbusRTU() as ModbusClient;
      
      // Set up event handlers
      this.setupClientEventHandlers(client);
      
      // Connect to the Modbus TCP server
      await client.connectTCP(this.connectionOptions.host as string, {
        port: this.connectionOptions.port as number,
        timeout: this.connectionTimeout
      });
      
      // Set the unit ID
      client.setID(this.unitId);
      
      // Add to connection pool
      this.connectionPool.set(id, client);
      
      if (this.debug) {
        this.logger.debug(`Created connection ${id}`);
      }
      
    } catch (error) {
      this.logger.error(`Failed to create connection ${id}`, { error });
      throw error;
    }
  }

  private setupClientEventHandlers(client: ModbusClient): void {
    client.on('open', () => {
      this.logger.debug('Modbus connection opened');
    });
    
    client.on('close', () => {
      this.logger.warn('Modbus connection closed');
      this.connected = false;
      this.emit(GATEWAY_EVENTS.DISCONNECTED, { 
        id: this.id, 
        name: this.name,
        reason: 'connection_closed'
      });
    });
    
    client.on('error', (error: Error) => {
      this.logger.error('Modbus connection error', { error });
      this.emit(GATEWAY_EVENTS.ERROR, { 
        type: 'connection_error',
        error: error.message,
        timestamp: new Date()
      });
    });
  }

  private async getClient(): Promise<ModbusClient> {
    if (this.isRTU && this.client) {
      return this.client;
    }
    
    if (!this.isRTU && this.connectionPool.size > 0) {
      // Get the first available connection from the pool
      const [id, client] = this.connectionPool.entries().next().value;
      this.connectionPool.delete(id);
      
      if (this.debug) {
        this.logger.debug(`Acquired connection ${id} from pool, ${this.connectionPool.size} remaining`);
      }
      
      return client;
    }
    
    throw new Error('No available connections in the pool');
  }

  private releaseClient(client: ModbusClient): void {
    if (this.isRTU) return; // No pooling for RTU
    
    // Check if the client is still valid
    if (client && client.isOpen) {
      const id = `conn-${Date.now()}`;
      this.connectionPool.set(id, client);
      
      if (this.debug) {
        this.logger.debug(`Released connection back to pool, ${this.connectionPool.size} available`);
      }
    }
  }

  protected async performDisconnect(): Promise<void> {
    this.stopConnectionMonitoring();
    
    // Close all connections in the pool
    const closePromises = Array.from(this.connectionPool.entries()).map(([id, client]) => {
      return new Promise<void>((resolve) => {
        try {
          if (client && client.isOpen) {
            client.close(() => {
              if (this.debug) {
                this.logger.debug(`Closed connection ${id}`);
              }
              resolve();
            });
          } else {
            resolve();
          }
        } catch (error) {
          this.logger.error(`Error closing connection ${id}`, { error });
          resolve();
        }
      });
    });
    
    // Close the main client if it exists (RTU)
    if (this.client) {
      closePromises.push(
        new Promise<void>((resolve) => {
          try {
            if (this.client?.isOpen) {
              this.client.close(() => {
                if (this.debug) {
                  this.logger.debug('Closed main Modbus client');
                }
                resolve();
              });
            } else {
              resolve();
            }
          } catch (error) {
            this.logger.error('Error closing main Modbus client', { error });
            resolve();
          }
        })
      );
    }
    
    await Promise.all(closePromises);
    
    this.connectionPool.clear();
    this.client = undefined;
    this.connected = false;
    this.logger.info('Disconnected from Modbus device');
  }

  protected async performRead(dataPoint: DataPointConfig): Promise<DataPointValue> {
    if (!this.connected) {
      throw new GatewayError('Modbus client not connected', 'MODBUS_NOT_CONNECTED', dataPoint.id);
    }
    
    const { address, modbusConfig } = this.parseDataPointConfig(dataPoint);
    const { registerType, functionCode, dataType, length = 1, unitId } = modbusConfig;
    
    let client: ModbusClient | undefined;
    
    try {
      client = await this.getClient();
      
      // Set the unit ID if specified in the data point config
      const targetUnitId = unitId !== undefined ? unitId : this.unitId;
      client.setID(targetUnitId);
      
      // Set the timeout for this operation
      client.setTimeout(this.connectionTimeout);
      
      let value: any;
      
      // Execute the appropriate Modbus function
      switch (functionCode) {
        case ModbusFunctionCode.READ_COIL:
          value = await this.readCoil(client, address);
          break;
          
        case ModbusFunctionCode.READ_DISCRETE_INPUT:
          value = await this.readDiscreteInput(client, address);
          break;
          
        case ModbusFunctionCode.READ_HOLDING_REGISTERS:
          value = await this.readHoldingRegisters(client, address, length, dataType);
          break;
          
        case ModbusFunctionCode.READ_INPUT_REGISTERS:
          value = await this.readInputRegisters(client, address, length, dataType);
          break;
          
        default:
          throw new GatewayError(
            `Unsupported Modbus function code: ${functionCode}`,
            'UNSUPPORTED_FUNCTION_CODE',
            dataPoint.id
          );
      }
      
      // Apply scaling if configured
      const scaledValue = this.applyScaling(value, dataPoint);
      
      return {
        id: dataPoint.id,
        name: dataPoint.name,
        value: scaledValue,
        timestamp: new Date(),
        quality: 'good',
        source: `modbus:${this.id}`,
        protocol: 'modbus',
        rawValue: value,
        modbus: {
          address,
          registerType,
          functionCode,
          dataType,
          unitId: targetUnitId
        }
      };
      
    } catch (error) {
      this.handleReadError(dataPoint, error as Error);
      throw new GatewayError(
        `Modbus read error: ${(error as Error).message}`,
        'MODBUS_READ_ERROR',
        dataPoint.id,
        error as Error
      );
      
    } finally {
      if (client) {
        this.releaseClient(client);
      }
    }
  }

  protected async performWrite(dataPoint: DataPointConfig, value: any): Promise<boolean> {
    if (!this.connected) {
      throw new GatewayError('Modbus client not connected', 'MODBUS_NOT_CONNECTED', dataPoint.id);
    }
    
    if (dataPoint.readOnly) {
      throw new GatewayError('Cannot write to read-only data point', 'WRITE_ERROR', dataPoint.id);
    }
    
    const { address, modbusConfig } = this.parseDataPointConfig(dataPoint);
    const { functionCode, dataType, unitId } = modbusConfig;
    
    // Apply inverse scaling if configured
    const rawValue = this.applyInverseScaling(value, dataPoint);
    
    let client: ModbusClient | undefined;
    
    try {
      client = await this.getClient();
      
      // Set the unit ID if specified in the data point config
      const targetUnitId = unitId !== undefined ? unitId : this.unitId;
      client.setID(targetUnitId);
      
      // Set the timeout for this operation
      client.setTimeout(this.connectionTimeout);
      
      let result: boolean;
      
      // Execute the appropriate Modbus write function
      switch (functionCode) {
        case ModbusFunctionCode.WRITE_SINGLE_COIL:
          result = await this.writeSingleCoil(client, address, rawValue);
          break;
          
        case ModbusFunctionCode.WRITE_SINGLE_REGISTER:
          result = await this.writeSingleRegister(client, address, rawValue, dataType);
          break;
          
        case ModbusFunctionCode.WRITE_MULTIPLE_COILS:
          result = await this.writeMultipleCoils(client, address, rawValue);
          break;
          
        case ModbusFunctionCode.WRITE_MULTIPLE_REGISTERS:
          result = await this.writeMultipleRegisters(client, address, rawValue, dataType);
          break;
          
        default:
          throw new GatewayError(
            `Unsupported Modbus write function code: ${functionCode}`,
            'UNSUPPORTED_FUNCTION_CODE',
            dataPoint.id
          );
      }
      
      // Emit write event
      this.emit(GATEWAY_EVENTS.WRITE, { 
        id: dataPoint.id, 
        name: dataPoint.name, 
        value: rawValue,
        timestamp: new Date(),
        protocol: 'modbus',
        modbus: {
          address,
          functionCode,
          dataType,
          unitId: targetUnitId
        }
      });
      
      return result;
      
    } catch (error) {
      this.handleWriteError(dataPoint, value, error as Error);
      throw new GatewayError(
        `Modbus write error: ${(error as Error).message}`,
        'MODBUS_WRITE_ERROR',
        dataPoint.id,
        error as Error
      );
      
    } finally {
      if (client) {
        this.releaseClient(client);
      }
    }
  }

  protected async performSubscribe(
    dataPoint: DataPointConfig,
    callback: (value: DataPointValue) => void
  ): Promise<() => void> {
    // For Modbus, we'll implement polling-based subscription
    // since Modbus doesn't support native subscriptions like OPC UA
    
    const pollingInterval = dataPoint.pollingInterval || 1000;
    let isSubscribed = true;
    
    const poll = async () => {
      if (!isSubscribed) return;
      
      try {
        const value = await this.performRead(dataPoint);
        callback(value);
      } catch (error) {
        this.logger.error(`Error in Modbus subscription for ${dataPoint.id}`, { error });
      }
      
      if (isSubscribed) {
        setTimeout(poll, pollingInterval);
      }
    };
    
    // Start polling
    poll();
    
    // Return unsubscribe function
    return () => {
      isSubscribed = false;
    };
  }

  // Helper methods for Modbus operations
  private async readCoil(client: ModbusClient, address: number): Promise<boolean> {
    const result = await client.readCoils(address, 1);
    return !!result.data[0];
  }

  private async readDiscreteInput(client: ModbusClient, address: number): Promise<boolean> {
    const result = await client.readDiscreteInputs(address, 1);
    return !!result.data[0];
  }

  private async readHoldingRegisters(
    client: ModbusClient,
    address: number,
    length: number,
    dataType: string
  ): Promise<number | number[]> {
    const result = await client.readHoldingRegisters(address, length);
    return this.convertRegisterData(result.data, dataType);
  }

  private async readInputRegisters(
    client: ModbusClient,
    address: number,
    length: number,
    dataType: string
  ): Promise<number | number[]> {
    const result = await client.readInputRegisters(address, length);
    return this.convertRegisterData(result.data, dataType);
  }

  private async writeSingleCoil(
    client: ModbusClient,
    address: number,
    value: boolean
  ): Promise<boolean> {
    await client.writeCoil(address, value);
    return true;
  }

  private async writeSingleRegister(
    client: ModbusClient,
    address: number,
    value: number,
    dataType: string
  ): Promise<boolean> {
    const buffer = this.convertToRegisterValue(value, dataType);
    await client.writeRegister(address, buffer[0]);
    return true;
  }

  private async writeMultipleCoils(
    client: ModbusClient,
    address: number,
    values: boolean[]
  ): Promise<boolean> {
    await client.writeCoils(address, values);
    return true;
  }

  private async writeMultipleRegisters(
    client: ModbusClient,
    address: number,
    values: number[] | number,
    dataType: string
  ): Promise<boolean> {
    const valueArray = Array.isArray(values) ? values : [values];
    const buffer = valueArray.flatMap(v => this.convertToRegisterValue(v, dataType));
    await client.writeRegisters(address, buffer);
    return true;
  }

  // Data conversion helpers
  private convertRegisterData(data: number[], dataType: string): number | number[] {
    if (data.length === 0) return 0;
    
    // For single register, return as is
    if (data.length === 1) return data[0];
    
    // For multiple registers, return as array
    return [...data];
    
    // Note: In a more complete implementation, you would handle different data types here
    // (e.g., int16, uint16, int32, float, etc.)
  }

  private convertToRegisterValue(value: number, dataType: string): number[] {
    // Simple implementation - just return the value as is
    // In a real implementation, you would handle different data types
    return [Math.round(value)];
  }

  private parseDataPointConfig(dataPoint: DataPointConfig): {
    address: number;
    modbus: {
      registerType: ModbusRegisterType;
      functionCode: ModbusFunctionCode;
      dataType: string;
      length: number;
      unitId?: number;
    };
  } {
    const address = parseInt(dataPoint.address, 10);
    
    if (isNaN(address)) {
      throw new GatewayError(
        `Invalid Modbus address: ${dataPoint.address}`,
        'INVALID_ADDRESS',
        dataPoint.id
      );
    }
    
    // Default values
    const modbusConfig = {
      registerType: ModbusRegisterType.HOLDING_REGISTER,
      functionCode: ModbusFunctionCode.READ_HOLDING_REGISTERS,
      dataType: 'uint16',
      length: 1,
      ...dataPoint.modbusConfig
    };
    
    return { address, modbus: modbusConfig };
  }

  private setupConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnectionHealth().catch(error => {
        this.logger.error('Error checking connection health', { error });
      });
    }, 30000); // Check every 30 seconds
  }

  private stopConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = undefined;
    }
  }

  private async checkConnectionHealth(): Promise<void> {
    if (this.connectionInProgress) return;
    
    try {
      this.connectionInProgress = true;
      
      // For RTU, check if the client is connected
      if (this.isRTU && this.client) {
        if (!this.client.isOpen) {
          this.logger.warn('Modbus RTU connection lost, attempting to reconnect...');
          await this.performDisconnect();
          await this.performConnect();
        }
      }
      // For TCP, check each connection in the pool
      else if (!this.isRTU) {
        const deadConnections: string[] = [];
        
        // Check each connection in the pool
        for (const [id, client] of this.connectionPool.entries()) {
          try {
            // Try a simple read operation to check if the connection is alive
            await client.readHoldingRegisters(0, 1);
          } catch (error) {
            this.logger.warn(`Connection ${id} is dead, will be replaced`, { error });
            deadConnections.push(id);
          }
        }
        
        // Replace dead connections
        for (const id of deadConnections) {
          this.connectionPool.delete(id);
          await this.createConnection(id);
        }
        
        // If we lost too many connections, try to replenish the pool
        const currentSize = this.connectionPool.size;
        if (currentSize < this.maxConnections) {
          const connectionsToAdd = this.maxConnections - currentSize;
          this.logger.info(`Replenishing connection pool with ${connectionsToAdd} connections`);
          
          for (let i = 0; i < connectionsToAdd; i++) {
            await this.createConnection(`conn-${Date.now()}-${i}`);
          }
        }
      }
      
    } catch (error) {
      this.logger.error('Error in connection health check', { error });
    } finally {
      this.connectionInProgress = false;
    }
  }

  // Scaling helpers
  private applyScaling(value: any, dataPoint: DataPointConfig): any {
    if (typeof value !== 'number' || !dataPoint.scaling) {
      return value;
    }
    
    const { factor = 1, offset = 0 } = dataPoint.scaling;
    return (value * factor) + offset;
  }

  private applyInverseScaling(value: any, dataPoint: DataPointConfig): any {
    if (typeof value !== 'number' || !dataPoint.scaling) {
      return value;
    }
    
    const { factor = 1, offset = 0 } = dataPoint.scaling;
    return (value - offset) / factor;
  }

  // Cleanup
  public override async destroy(): Promise<void> {
    await this.performDisconnect();
    await super.destroy();
  }
}
