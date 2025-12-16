import { store } from '../store';
import { updateDataPointValue } from '../store/slices/devicesSlice';
import { addAlarm } from '../store/slices/alarmsSlice';
import { showNotification } from '../store/slices/notificationsSlice';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private url: string;
  private token: string | null = null;
  private subscriptions: string[] = [];
  private isConnected = false;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    this.url = `${protocol}//${host}/ws`;
    
    // Try to get token from localStorage
    this.token = localStorage.getItem('token');
    
    // Listen for auth state changes
    store.subscribe(() => {
      const { token } = store.getState().auth;
      if (token !== this.token) {
        this.token = token;
        if (token) {
          this.reconnect();
        } else {
          this.disconnect();
        }
      }
    });
  }

  connect() {
    if (this.isConnected || !this.token) return;

    try {
      const wsUrl = `${this.url}?token=${this.token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Resubscribe to previously subscribed topics
        if (this.subscriptions.length > 0) {
          this.subscribe(this.subscriptions);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: any) {
    if (!message || !message.type) return;

    switch (message.type) {
      case 'DATA_POINT_UPDATE':
        this.handleDataPointUpdate(message.payload);
        break;
      case 'ALARM_TRIGGERED':
        this.handleAlarmTriggered(message.payload);
        break;
      case 'ALARM_ACKNOWLEDGED':
        this.handleAlarmAcknowledged(message.payload);
        break;
      case 'DEVICE_STATUS_CHANGED':
        this.handleDeviceStatusChanged(message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleDataPointUpdate(payload: any) {
    const { deviceId, pointId, value, quality, timestamp } = payload;
    
    // Update Redux store
    store.dispatch(
      updateDataPointValue({
        deviceId,
        pointId,
        value,
        quality,
        timestamp,
      })
    );
  }

  private handleAlarmTriggered(payload: any) {
    // Add alarm to Redux store
    store.dispatch(addAlarm(payload));
    
    // Show notification if user is not on the alarms page
    const { pathname } = window.location;
    if (!pathname.includes('/alarms')) {
      store.dispatch(
        showNotification({
          message: `Alarm triggered: ${payload.message}`,
          severity: payload.severity || 'warning',
          autoHideDuration: 5000,
        })
      );
    }
  }

  private handleAlarmAcknowledged(payload: any) {
    // Update alarm in Redux store
    store.dispatch(acknowledgeAlarm(payload.id));
  }

  private handleDeviceStatusChanged(payload: any) {
    const { deviceId, status, lastSeen } = payload;
    // Update device status in Redux store
    store.dispatch(updateDeviceStatus({ deviceId, status, lastSeen }));
  }

  subscribe(topics: string | string[]) {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    
    // Add to subscriptions
    topicsArray.forEach(topic => {
      if (!this.subscriptions.includes(topic)) {
        this.subscriptions.push(topic);
      }
    });
    
    // Send subscribe message if connected
    if (this.isConnected && this.socket) {
      this.sendMessage({
        type: 'SUBSCRIBE',
        topics: topicsArray,
      });
    }
  }

  unsubscribe(topics: string | string[]) {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    
    // Remove from subscriptions
    this.subscriptions = this.subscriptions.filter(
      topic => !topicsArray.includes(topic)
    );
    
    // Send unsubscribe message if connected
    if (this.isConnected && this.socket) {
      this.sendMessage({
        type: 'UNSUBSCRIBE',
        topics: topicsArray,
      });
    }
  }

  private sendMessage(message: any) {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  // Reconnect with a new token if needed
  reconnect() {
    this.disconnect();
    this.connect();
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

// Export hooks for React components
export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      webSocketService.connect();
      return () => {
        webSocketService.disconnect();
      };
    }
  }, [isAuthenticated]);
  
  return {
    subscribe: webSocketService.subscribe.bind(webSocketService),
    unsubscribe: webSocketService.unsubscribe.bind(webSocketService),
    isConnected: webSocketService.isConnected,
  };
};

export default webSocketService;
