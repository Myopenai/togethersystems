import { EventEmitter } from 'events';
import { Logger } from '../common/logger';
import { 
  ProtocolHandler, 
  DataPointConfig, 
  DataPointValue, 
  GatewayError, 
  GATEWAY_EVENTS,
  ProtocolType 
} from './types';

export abstract class BaseProtocolHandler extends EventEmitter implements ProtocolHandler {
  protected logger: Logger;
  protected connected: boolean = false;
  protected connectionRetries: number = 0;
  protected maxRetries: number = 5;
  protected retryInterval: number = 5000; // 5 seconds
  protected dataPoints: Map<string, DataPointConfig> = new Map();
  protected subscriptions: Map<string, (value: DataPointValue) => void> = new Map();
  protected connectionCheckInterval?: NodeJS.Timeout;
  
  constructor(
    protected readonly id: string,
    protected readonly name: string,
    protected readonly protocol: ProtocolType,
    protected readonly config: any
  ) {
    super();
    this.logger = new Logger(`${protocol.toUpperCase()}-${name}`);
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      this.logger.warn('Already connected');
      return;
    }

    try {
      this.logger.info('Connecting...');
      await this.performConnect();
      this.connected = true;
      this.connectionRetries = 0;
      this.logger.info('Connected successfully');
      this.emit(GATEWAY_EVENTS.CONNECTED, { id: this.id, name: this.name });
      
      // Start connection monitoring
      this.startConnectionMonitoring();
      
    } catch (error) {
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) {
      this.logger.warn('Not connected');
      return;
    }

    try {
      this.stopConnectionMonitoring();
      await this.performDisconnect();
      this.connected = false;
      this.logger.info('Disconnected');
      this.emit(GATEWAY_EVENTS.DISCONNECTED, { id: this.id, name: this.name });
    } catch (error) {
      this.logger.error('Error during disconnect', { error });
      throw error;
    }
  }

  public async read(dataPoint: DataPointConfig): Promise<DataPointValue> {
    this.validateDataPoint(dataPoint);
    
    try {
      const value = await this.performRead(dataPoint);
      this.emitDataPointValue(value);
      return value;
    } catch (error) {
      this.handleReadError(dataPoint, error as Error);
      throw error;
    }
  }

  public async write(dataPoint: DataPointConfig, value: any): Promise<boolean> {
    this.validateDataPoint(dataPoint);
    
    if (dataPoint.readOnly) {
      throw new GatewayError('Cannot write to read-only data point', 'WRITE_ERROR', dataPoint.id);
    }

    try {
      const result = await this.performWrite(dataPoint, value);
      this.emit(GATEWAY_EVENTS.WRITE, { 
        id: dataPoint.id, 
        name: dataPoint.name, 
        value,
        timestamp: new Date()
      });
      return result;
    } catch (error) {
      this.handleWriteError(dataPoint, value, error as Error);
      throw error;
    }
  }

  public async subscribe(dataPoint: DataPointConfig, callback: (value: DataPointValue) => void): Promise<() => void> {
    this.validateDataPoint(dataPoint);
    
    const subscriptionId = `${dataPoint.protocol}:${dataPoint.id}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.logger.warn(`Already subscribed to data point: ${dataPoint.id}`);
      return () => this.unsubscribe(subscriptionId);
    }
    
    this.subscriptions.set(subscriptionId, callback);
    
    try {
      await this.performSubscribe(dataPoint, (value) => {
        this.emitDataPointValue(value);
        callback(value);
      });
      
      this.logger.debug(`Subscribed to data point: ${dataPoint.id}`);
      
      return () => this.unsubscribe(subscriptionId);
      
    } catch (error) {
      this.subscriptions.delete(subscriptionId);
      this.logger.error(`Failed to subscribe to data point: ${dataPoint.id}`, { error });
      throw error;
    }
  }

  public getStatus(): 'connected' | 'disconnected' | 'error' {
    if (!this.connected) return 'disconnected';
    // Subclasses can override to provide more detailed status
    return 'connected';
  }

  public addDataPoint(dataPoint: DataPointConfig): void {
    this.validateDataPoint(dataPoint);
    this.dataPoints.set(dataPoint.id, dataPoint);
    this.logger.debug(`Added data point: ${dataPoint.id}`);
  }

  public removeDataPoint(dataPointId: string): boolean {
    const result = this.dataPoints.delete(dataPointId);
    if (result) {
      this.logger.debug(`Removed data point: ${dataPointId}`);
    }
    return result;
  }

  public getDataPoint(dataPointId: string): DataPointConfig | undefined {
    return this.dataPoints.get(dataPointId);
  }

  public getAllDataPoints(): DataPointConfig[] {
    return Array.from(this.dataPoints.values());
  }

  protected validateDataPoint(dataPoint: DataPointConfig): void {
    if (!dataPoint) {
      throw new GatewayError('Data point is required', 'INVALID_DATA_POINT');
    }
    
    if (!dataPoint.id) {
      throw new GatewayError('Data point ID is required', 'INVALID_DATA_POINT');
    }
    
    if (!this.dataPoints.has(dataPoint.id)) {
      throw new GatewayError(
        `Data point not found: ${dataPoint.id}`, 
        'DATA_POINT_NOT_FOUND',
        dataPoint.id
      );
    }
  }

  protected emitDataPointValue(value: DataPointValue): void {
    this.emit(GATEWAY_EVENTS.DATA, value);
    
    // Notify specific subscribers
    const subscriptionId = `${value.protocol}:${value.id}`;
    const callback = this.subscriptions.get(subscriptionId);
    if (callback) {
      try {
        callback(value);
      } catch (error) {
        this.logger.error(`Error in subscription callback for ${subscriptionId}`, { error });
      }
    }
  }

  protected handleConnectionError(error: Error): void {
    this.connectionRetries++;
    const shouldRetry = this.connectionRetries <= this.maxRetries;
    
    this.logger.error(
      `Connection error (${this.connectionRetries}/${this.maxRetries}): ${error.message}`, 
      { error, shouldRetry }
    );
    
    this.emit(GATEWAY_EVENTS.ERROR, { 
      type: 'connection_error', 
      error: error.message,
      retryCount: this.connectionRetries,
      maxRetries: this.maxRetries
    });
    
    if (shouldRetry) {
      setTimeout(() => this.connect(), this.retryInterval);
    }
  }

  protected handleReadError(dataPoint: DataPointConfig, error: Error): void {
    this.logger.error(`Read error for data point ${dataPoint.id}: ${error.message}`, { 
      error,
      dataPoint: dataPoint.id 
    });
    
    this.emit(GATEWAY_EVENTS.ERROR, { 
      type: 'read_error', 
      dataPoint: dataPoint.id,
      error: error.message
    });
  }

  protected handleWriteError(dataPoint: DataPointConfig, value: any, error: Error): void {
    this.logger.error(`Write error for data point ${dataPoint.id}: ${error.message}`, { 
      error,
      dataPoint: dataPoint.id,
      value
    });
    
    this.emit(GATEWAY_EVENTS.ERROR, { 
      type: 'write_error', 
      dataPoint: dataPoint.id,
      value,
      error: error.message
    });
  }

  protected startConnectionMonitoring(interval: number = 30000): void {
    this.stopConnectionMonitoring();
    
    this.connectionCheckInterval = setInterval(async () => {
      if (!this.connected) {
        this.logger.warn('Connection lost, attempting to reconnect...');
        try {
          await this.connect();
        } catch (error) {
          this.logger.error('Reconnection attempt failed', { error });
        }
      }
    }, interval);
  }

  protected stopConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = undefined;
    }
  }

  private unsubscribe(subscriptionId: string): void {
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      this.logger.debug(`Unsubscribed from: ${subscriptionId}`);
      
      // If no more subscriptions, we could potentially clean up resources
      // This would be protocol-specific and implemented in subclasses
      if (this.subscriptions.size === 0) {
        this.onNoSubscriptions();
      }
    }
  }

  // Abstract methods to be implemented by specific protocol handlers
  protected abstract performConnect(): Promise<void>;
  protected abstract performDisconnect(): Promise<void>;
  protected abstract performRead(dataPoint: DataPointConfig): Promise<DataPointValue>;
  protected abstract performWrite(dataPoint: DataPointConfig, value: any): Promise<boolean>;
  protected abstract performSubscribe(dataPoint: DataPointConfig, callback: (value: DataPointValue) => void): Promise<void>;
  
  // Optional lifecycle hooks
  protected onNoSubscriptions(): void {
    // Default: do nothing
    // Can be overridden by subclasses to clean up resources when there are no more subscriptions
  }

  // Cleanup resources when the handler is no longer needed
  public async destroy(): Promise<void> {
    this.stopConnectionMonitoring();
    await this.disconnect();
    this.removeAllListeners();
    this.subscriptions.clear();
    this.dataPoints.clear();
  }
}
