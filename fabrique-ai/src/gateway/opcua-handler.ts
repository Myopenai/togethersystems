import * as opcua from 'node-opcua';
import { EventEmitter } from 'events';
import { Logger } from '../common/logger';
import { BaseProtocolHandler } from './base-handler';
import { 
  DataPointConfig, 
  DataPointValue, 
  GatewayError, 
  OPCUAConfig, 
  ProtocolType,
  GATEWAY_EVENTS 
} from './types';

export class OPCUAHandler extends BaseProtocolHandler {
  private client?: opcua.OPCUAClient;
  private session?: opcua.ClientSession;
  private subscription?: opcua.ClientSubscription;
  private monitoredItems: Map<string, opcua.ClientMonitoredItem> = new Map();
  private connectionOptions: opcua.OPCUAClientOptions;
  private sessionOptions: opcua.OPCUAClientSessionOptions;
  private subscriptionOptions: opcua.ClientSubscriptionOptions;
  private keepAliveInterval?: NodeJS.Timeout;

  constructor(
    id: string, 
    name: string, 
    config: OPCUAConfig
  ) {
    super(id, name, 'opcua', config);
    
    // Set up OPC UA connection options
    this.connectionOptions = {
      applicationName: `FabriqueAI-${name}`,
      connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 5,
        maxDelay: 30000,
      },
      securityMode: opcua.MessageSecurityMode.None,
      securityPolicy: opcua.SecurityPolicy.None,
      endpoint_must_exist: false,
      keepSessionAlive: true,
      keepPendingSessionsOnDisconnect: true,
      ...this.getSecurityOptions(config),
    };

    // Session options
    this.sessionOptions = {
      sessionTimeout: 30000,
      ...(config.userName && config.password 
        ? { userIdentity: { userName: config.userName, password: config.password } } 
        : {})
    };

    // Subscription options
    this.subscriptionOptions = {
      requestedPublishingInterval: config.subscriptionOptions?.requestedPublishingInterval ?? 1000,
      requestedLifetimeCount: config.subscriptionOptions?.requestedLifetimeCount ?? 100,
      requestedMaxKeepAliveCount: config.subscriptionOptions?.requestedMaxKeepAliveCount ?? 10,
      maxNotificationsPerPublish: config.subscriptionOptions?.maxNotificationsPerPublish ?? 1000,
      publishingEnabled: true,
      priority: config.subscriptionOptions?.priority ?? 100,
    };
  }

  private getSecurityOptions(config: OPCUAConfig): Partial<opcua.OPCUAClientOptions> {
    if (!config.securityPolicy || config.securityPolicy === 'None') {
      return {};
    }

    // In a real implementation, you would load certificates and private keys
    // from secure storage based on the configuration
    return {
      securityMode: opcua.MessageSecurityMode.SignAndEncrypt,
      securityPolicy: opcua.SecurityPolicy[config.securityPolicy as keyof typeof opcua.SecurityPolicy],
      clientCertificateManager: new opcua.OPCUACertificateManager({
        automaticallyAcceptUnknownCertificate: true, // For development only!
      }),
    };
  }

  protected async performConnect(): Promise<void> {
    try {
      // Create OPC UA client
      this.client = opcua.OPCUAClient.create(this.connectionOptions);
      
      // Set up event handlers
      this.setupClientEventHandlers();
      
      // Connect to the server
      await this.client.connect(this.config.endpoint);
      
      // Create a session
      this.session = await this.client.createSession(this.sessionOptions);
      
      // Create a subscription
      this.subscription = await this.session.createSubscription2(this.subscriptionOptions);
      
      // Set up keep-alive mechanism
      this.setupKeepAlive();
      
      this.logger.info(`Connected to OPC UA server: ${this.config.endpoint}`);
      
    } catch (error) {
      await this.cleanupOnError();
      throw new GatewayError(
        `Failed to connect to OPC UA server: ${(error as Error).message}`,
        'OPCUA_CONNECTION_ERROR',
        undefined,
        error as Error
      );
    }
  }

  protected async performDisconnect(): Promise<void> {
    try {
      // Clear keep-alive interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = undefined;
      }
      
      // Close the subscription
      if (this.subscription) {
        await this.subscription.terminate();
        this.subscription = undefined;
      }
      
      // Close the session
      if (this.session) {
        await this.session.close();
        this.session = undefined;
      }
      
      // Disconnect the client
      if (this.client) {
        await this.client.disconnect();
        this.client = undefined;
      }
      
      // Clear monitored items
      this.monitoredItems.clear();
      
    } catch (error) {
      this.logger.error('Error during disconnect', { error });
      // Continue with cleanup even if there was an error
      this.forceCleanup();
      throw error;
    }
  }

  protected async performRead(dataPoint: DataPointConfig): Promise<DataPointValue> {
    if (!this.session) {
      throw new GatewayError('OPC UA session not established', 'OPCUA_SESSION_ERROR', dataPoint.id);
    }
    
    try {
      // Parse the node ID from the data point address
      const nodeId = this.parseNodeId(dataPoint.address);
      
      // Read the value from the OPC UA server
      const dataValue = await this.session.read({
        nodeId: nodeId,
        attributeId: opcua.AttributeIds.Value
      });
      
      // Convert the data value to our standard format
      return this.convertToDataPointValue(dataPoint, dataValue);
      
    } catch (error) {
      throw new GatewayError(
        `Failed to read OPC UA node: ${(error as Error).message}`,
        'OPCUA_READ_ERROR',
        dataPoint.id,
        error as Error
      );
    }
  }

  protected async performWrite(dataPoint: DataPointConfig, value: any): Promise<boolean> {
    if (!this.session) {
      throw new GatewayError('OPC UA session not established', 'OPCUA_SESSION_ERROR', dataPoint.id);
    }
    
    try {
      // Parse the node ID from the data point address
      const nodeId = this.parseNodeId(dataPoint.address);
      
      // Convert the value to the appropriate OPC UA data type
      const dataValue = this.convertToDataValue(dataPoint, value);
      
      // Write the value to the OPC UA server
      const statusCode = await this.session.write({
        nodeId: nodeId,
        attributeId: opcua.AttributeIds.Value,
        value: {
          value: dataValue
        }
      });
      
      return statusCode.isGood();
      
    } catch (error) {
      throw new GatewayError(
        `Failed to write OPC UA node: ${(error as Error).message}`,
        'OPCUA_WRITE_ERROR',
        dataPoint.id,
        error as Error
      );
    }
  }

  protected async performSubscribe(
    dataPoint: DataPointConfig, 
    callback: (value: DataPointValue) => void
  ): Promise<void> {
    if (!this.subscription) {
      throw new GatewayError('OPC UA subscription not established', 'OPCUA_SUBSCRIPTION_ERROR', dataPoint.id);
    }
    
    try {
      // Parse the node ID from the data point address
      const nodeId = this.parseNodeId(dataPoint.address);
      
      // Create monitoring parameters
      const monitoringParameters = {
        samplingInterval: dataPoint.pollingInterval ?? 1000,
        discardOldest: true,
        queueSize: 10
      };
      
      // Create the monitored item
      const monitoredItem = await this.subscription.monitor(
        { nodeId, attributeId: opcua.AttributeIds.Value },
        monitoringParameters,
        opcua.TimestampsToReturn.Both
      );
      
      // Set up the data change handler
      monitoredItem.on('changed', (dataValue: opcua.DataValue) => {
        try {
          const value = this.convertToDataPointValue(dataPoint, dataValue);
          callback(value);
        } catch (error) {
          this.logger.error('Error processing monitored item change', { 
            error, 
            dataPoint: dataPoint.id 
          });
        }
      });
      
      // Store the monitored item for later cleanup
      this.monitoredItems.set(dataPoint.id, monitoredItem);
      
      this.logger.debug(`Subscribed to OPC UA node: ${dataPoint.address}`);
      
    } catch (error) {
      throw new GatewayError(
        `Failed to subscribe to OPC UA node: ${(error as Error).message}`,
        'OPCUA_SUBSCRIBE_ERROR',
        dataPoint.id,
        error as Error
      );
    }
  }

  protected onNoSubscriptions(): void {
    // Clean up monitored items when there are no more subscriptions
    this.monitoredItems.clear();
    
    // Optionally, we could close the subscription if there are no more monitored items
    // But we'll keep it open for potential future subscriptions
  }

  public override async destroy(): Promise<void> {
    // Clean up monitored items
    this.monitoredItems.clear();
    
    // Call parent's destroy method
    await super.destroy();
  }

  private setupClientEventHandlers(): void {
    if (!this.client) return;
    
    this.client.on('backoff', (retry: number, delay: number) => {
      this.logger.warn(`Connection attempt ${retry} failed, retrying in ${delay}ms...`);
    });
    
    this.client.on('connection_lost', () => {
      this.connected = false;
      this.logger.error('Connection to OPC UA server lost');
      this.emit(GATEWAY_EVENTS.DISCONNECTED, { 
        id: this.id, 
        name: this.name,
        reason: 'connection_lost'
      });
    });
    
    this.client.on('connection_reestablished', () => {
      this.connected = true;
      this.logger.info('Connection to OPC UA server reestablished');
      this.emit(GATEWAY_EVENTS.CONNECTED, { 
        id: this.id, 
        name: this.name,
        reason: 'connection_reestablished'
      });
    });
    
    this.client.on('close', () => {
      this.connected = false;
      this.logger.info('Connection to OPC UA server closed');
      this.emit(GATEWAY_EVENTS.DISCONNECTED, { 
        id: this.id, 
        name: this.name,
        reason: 'closed'
      });
    });
  }

  private setupKeepAlive(interval: number = 30000): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    
    this.keepAliveInterval = setInterval(async () => {
      try {
        if (this.session) {
          await this.session.read({ 
            nodeId: opcua.VariableIds.Server_ServerStatus_State,
            attributeId: opcua.AttributeIds.Value 
          });
          this.logger.debug('Keep-alive check passed');
        }
      } catch (error) {
        this.logger.error('Keep-alive check failed', { error });
        // Try to reconnect if the keep-alive fails
        this.handleConnectionError(error as Error);
      }
    }, interval);
  }

  private parseNodeId(address: string): opcua.NodeIdLike {
    try {
      // This is a simplified implementation
      // In a real application, you would need to handle different node ID formats
      if (address.startsWith('ns=')) {
        return opcua.resolveNodeId(address);
      } else if (address.startsWith('i=')) {
        return opcua.resolveNodeId(`ns=0;${address}`);
      } else if (/^\d+$/.test(address)) {
        return opcua.resolveNodeId(`ns=0;i=${address}`);
      } else {
        // Assume it's a string node ID
        return opcua.resolveNodeId(`ns=0;s=${address}`);
      }
    } catch (error) {
      throw new GatewayError(
        `Invalid OPC UA node ID: ${address}`,
        'INVALID_NODE_ID',
        undefined,
        error as Error
      );
    }
  }

  private convertToDataPointValue(
    dataPoint: DataPointConfig, 
    dataValue: opcua.DataValue
  ): DataPointValue {
    // Check if the status code indicates an error
    if (!dataValue.statusCode.isGood()) {
      throw new GatewayError(
        `OPC UA read error: ${dataValue.statusCode.toString()}`,
        'OPCUA_READ_ERROR',
        dataPoint.id
      );
    }
    
    // Get the value and source timestamp
    const value = dataValue.value.value;
    const timestamp = dataValue.sourceTimestamp || new Date();
    
    // Apply scaling if configured
    const scaledValue = this.applyScaling(value, dataPoint);
    
    return {
      id: dataPoint.id,
      name: dataPoint.name,
      value: scaledValue,
      timestamp,
      quality: this.mapQuality(dataValue.statusCode),
      source: `opcua:${this.id}`,
      protocol: 'opcua'
    };
  }

  private convertToDataValue(
    dataPoint: DataPointConfig, 
    value: any
  ): opcua.DataValue {
    // Apply inverse scaling if configured
    const scaledValue = this.applyInverseScaling(value, dataPoint);
    
    // Create a data value with the current timestamp
    return new opcua.DataValue({
      value: {
        value: {
          dataType: this.mapDataType(dataPoint.dataType),
          value: scaledValue
        }
      },
      sourceTimestamp: new Date(),
      serverTimestamp: new Date()
    });
  }

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

  private mapQuality(statusCode: opcua.StatusCode): 'good' | 'bad' | 'uncertain' {
    if (statusCode.isGood()) return 'good';
    if (statusCode.isBad()) return 'bad';
    return 'uncertain';
  }

  private mapDataType(dataType: string): opcua.DataType {
    // Map common data types to OPC UA data types
    const typeMap: Record<string, opcua.DataType> = {
      'bool': opcua.DataType.Boolean,
      'boolean': opcua.DataType.Boolean,
      'int': opcua.DataType.Int32,
      'int32': opcua.DataType.Int32,
      'uint32': opcua.DataType.UInt32,
      'int64': opcua.DataType.Int64,
      'uint64': opcua.DataType.UInt64,
      'float': opcua.DataType.Float,
      'double': opcua.DataType.Double,
      'real': opcua.DataType.Double,
      'string': opcua.DataType.String,
      'datetime': opcua.DataType.DateTime,
      'byte': opcua.DataType.Byte,
      'sbyte': opcua.DataType.SByte,
      'word': opcua.DataType.UInt16,
      'dword': opcua.DataType.UInt32,
      'lword': opcua.DataType.UInt64,
    };
    
    return typeMap[dataType.toLowerCase()] || opcua.DataType.String;
  }

  private async cleanupOnError(): Promise<void> {
    try {
      await this.performDisconnect();
    } catch (error) {
      this.logger.error('Error during cleanup after connection failure', { error });
      this.forceCleanup();
    }
  }

  private forceCleanup(): void {
    // Force cleanup of resources without waiting for async operations
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = undefined;
    }
    
    this.client = undefined;
    this.session = undefined;
    this.subscription = undefined;
    this.monitoredItems.clear();
    this.connected = false;
  }
}
