// Supported protocol types
export type ProtocolType = 'opcua' | 'modbus' | 'mqtt' | 'http' | 'https';

// Data point configuration
export interface DataPointConfig {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  address: string;
  protocol: ProtocolType;
  readOnly: boolean;
  pollingInterval?: number;
  deadband?: number;
  scaling?: {
    factor: number;
    offset: number;
  };
  transform?: string; // JavaScript function as string for transformation
  tags?: string[];
}

// Gateway configuration
export interface GatewayConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  protocol: ProtocolType;
  connection: {
    [key: string]: any; // Protocol-specific connection parameters
  };
  dataPoints: DataPointConfig[];
  batchSize?: number;
  maxRetries?: number;
  retryInterval?: number;
}

// Data point value with metadata
export interface DataPointValue {
  id: string;
  name: string;
  value: any;
  timestamp: Date;
  quality: 'good' | 'bad' | 'uncertain';
  source: string;
  protocol: ProtocolType;
  error?: string;
}

// Protocol handler interface
export interface ProtocolHandler {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  read(dataPoint: DataPointConfig): Promise<DataPointValue>;
  write(dataPoint: DataPointConfig, value: any): Promise<boolean>;
  subscribe(dataPoint: DataPointConfig, callback: (value: DataPointValue) => void): Promise<() => void>;
  getStatus(): 'connected' | 'disconnected' | 'error';
}

// Transformation function type
export type TransformFunction = (value: any, dataPoint: DataPointConfig) => any;

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

// Error handling
export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly dataPointId?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

// Protocol-specific configurations
export interface OPCUAConfig {
  endpoint: string;
  securityPolicy?: string;
  securityMode?: string;
  userName?: string;
  password?: string;
  connectionTimeout?: number;
  keepAliveInterval?: number;
  subscriptionOptions?: {
    requestedPublishingInterval?: number;
    requestedLifetimeCount?: number;
    requestedMaxKeepAliveCount?: number;
    maxNotificationsPerPublish?: number;
    publishingEnabled?: boolean;
    priority?: number;
  };
}

export interface ModbusConfig {
  host: string;
  port: number;
  unitId: number;
  timeout?: number;
  autoReconnect?: boolean;
  reconnectTimeout?: number;
  transport?: 'tcp' | 'udp' | 'ascii' | 'rtu' | 'tcp-rtu';
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
}

export interface MQTTConfig {
  url: string;
  clientId: string;
  username?: string;
  password?: string;
  qos?: 0 | 1 | 2;
  retain?: boolean;
  clean?: boolean;
  reconnectPeriod?: number;
  keepalive?: number;
  will?: {
    topic: string;
    payload: string;
    qos: 0 | 1 | 2;
    retain: boolean;
  };
}

// Event types
export const GATEWAY_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  DATA: 'data',
  WRITE: 'write',
  CONFIG_CHANGED: 'config_changed',
  STATUS_CHANGED: 'status_changed',
} as const;

export type GatewayEvent = typeof GATEWAY_EVENTS[keyof typeof GATEWAY_EVENTS];

// Gateway status
export type GatewayStatus = {
  id: string;
  name: string;
  protocol: ProtocolType;
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
  lastActivity: Date;
  metrics: {
    readCount: number;
    writeCount: number;
    errorCount: number;
    lastReadTime?: Date;
    lastWriteTime?: Date;
    lastErrorTime?: Date;
    averageReadTime: number;
    averageWriteTime: number;
  };
};
