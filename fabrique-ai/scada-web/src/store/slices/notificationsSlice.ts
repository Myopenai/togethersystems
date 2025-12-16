import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number | null;
  createdAt: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  maxNotifications: 50, // Maximum number of notifications to keep in the store
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{
      message: string;
      severity?: Notification['severity'];
      autoHideDuration?: number | null;
      action?: Notification['action'];
    }>) => {
      const { message, severity = 'info', autoHideDuration = 6000, action } = action.payload;
      
      // Create new notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        message,
        severity,
        autoHideDuration,
        createdAt: Date.now(),
        read: false,
        action,
      };
      
      // Add to the beginning of the array
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      
      // Remove oldest notification if we've reached the maximum
      if (state.notifications.length > state.maxNotifications) {
        state.notifications.pop();
      }
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
        }
      });
      state.unreadCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

// Export actions
export const {
  showNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadNotifications = (state: RootState) => 
  state.notifications.notifications.filter(n => !n.read);
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;

export default notificationsSlice.reducer;
