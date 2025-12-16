export type WebSocketMessageType =
  | 'DATA_POINT_UPDATE'
  | 'ALARM_TRIGGERED'
  | 'ALARM_ACKNOWLEDGED'
  | 'DEVICE_STATUS_CHANGED'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
}

export interface DataPointUpdatePayload {
  deviceId: string;
  pointId: string;
  value: any;
  quality: 'good' | 'bad' | 'uncertain';
  timestamp: string;
}

export interface AlarmTriggeredPayload {
  id: string;
  deviceId: string;
  pointId?: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AlarmAcknowledgedPayload {
  id: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
}

export interface DeviceStatusChangedPayload {
  deviceId: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastSeen: string;
  error?: string;
}

export interface SubscribeMessage {
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE';
  topics: string[];
}

export type WebSocketEvent =
  | { type: 'open' }
  | { type: 'close'; code?: number; reason?: string }
  | { type: 'error'; error: Event }
  | { type: 'message'; data: WebSocketMessage };

export type WebSocketState = 'connecting' | 'open' | 'closing' | 'closed';
