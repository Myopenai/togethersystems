import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { api } from '../services/api';

export interface Alarm {
  id: string;
  deviceId: string;
  deviceName?: string;
  pointId?: string;
  pointName?: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'acknowledged' | 'cleared';
  timestamp: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  clearedAt?: string;
  clearedBy?: string;
  metadata?: Record<string, any>;
}

interface AlarmsState {
  alarms: Alarm[];
  activeAlarms: Alarm[];
  acknowledgedAlarms: Alarm[];
  selectedAlarm: Alarm | null;
  loading: boolean;
  error: string | null;
  filters: {
    severity: string[];
    status: string[];
    search: string;
    fromDate: string | null;
    toDate: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: AlarmsState = {
  alarms: [],
  activeAlarms: [],
  acknowledgedAlarms: [],
  selectedAlarm: null,
  loading: false,
  error: null,
  filters: {
    severity: [],
    status: [],
    search: '',
    fromDate: null,
    toDate: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

// Async thunks
export const fetchAlarms = createAsyncThunk(
  'alarms/fetchAlarms',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { page, limit } = state.alarms.pagination;
      const { severity, status, search, fromDate, toDate } = state.alarms.filters;
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      
      severity.forEach(s => params.append('severity', s));
      status.forEach(s => params.append('status', s));
      
      const response = await api.get(`/alarms?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alarms');
    }
  }
);

export const acknowledgeAlarm = createAsyncThunk(
  'alarms/acknowledgeAlarm',
  async (alarmId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/alarms/${alarmId}/acknowledge`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge alarm');
    }
  }
);

export const clearAlarm = createAsyncThunk(
  'alarms/clearAlarm',
  async (alarmId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/alarms/${alarmId}/clear`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear alarm');
    }
  }
);

// Create the slice
const alarmsSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    setAlarmFilters: (state, action: PayloadAction<Partial<AlarmsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setAlarmPagination: (state, action: PayloadAction<Partial<AlarmsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectAlarm: (state, action: PayloadAction<string | null>) => {
      if (action.payload === null) {
        state.selectedAlarm = null;
      } else {
        const alarm = state.alarms.find(a => a.id === action.payload) || null;
        state.selectedAlarm = alarm;
      }
    },
    addAlarm: (state, action: PayloadAction<Alarm>) => {
      // Check if alarm already exists
      const existingIndex = state.alarms.findIndex(a => a.id === action.payload.id);
      
      if (existingIndex >= 0) {
        // Update existing alarm
        state.alarms[existingIndex] = action.payload;
      } else {
        // Add new alarm to the beginning of the array
        state.alarms.unshift(action.payload);
        
        // Update pagination total
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      }
      
      // Update active/acknowledged lists
      state.activeAlarms = state.alarms.filter(a => a.status === 'active');
      state.acknowledgedAlarms = state.alarms.filter(a => a.status === 'acknowledged');
    },
    updateAlarm: (state, action: PayloadAction<Partial<Alarm> & { id: string }>) => {
      const index = state.alarms.findIndex(a => a.id === action.payload.id);
      
      if (index >= 0) {
        state.alarms[index] = { ...state.alarms[index], ...action.payload };
        
        // Update active/acknowledged lists
        state.activeAlarms = state.alarms.filter(a => a.status === 'active');
        state.acknowledgedAlarms = state.alarms.filter(a => a.status === 'acknowledged');
        
        // Update selected alarm if it's the one being updated
        if (state.selectedAlarm && state.selectedAlarm.id === action.payload.id) {
          state.selectedAlarm = state.alarms[index];
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch alarms
    builder.addCase(fetchAlarms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAlarms.fulfilled, (state, action) => {
      state.loading = false;
      state.alarms = action.payload.data;
      state.activeAlarms = action.payload.data.filter((a: Alarm) => a.status === 'active');
      state.acknowledgedAlarms = action.payload.data.filter((a: Alarm) => a.status === 'acknowledged');
      state.pagination = {
        ...state.pagination,
        total: action.payload.total,
        totalPages: action.payload.pages,
      };
    });
    builder.addCase(fetchAlarms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Acknowledge alarm
    builder.addCase(acknowledgeAlarm.fulfilled, (state, action) => {
      const index = state.alarms.findIndex(a => a.id === action.payload.id);
      
      if (index >= 0) {
        state.alarms[index] = {
          ...state.alarms[index],
          status: 'acknowledged',
          acknowledgedAt: action.payload.acknowledgedAt,
          acknowledgedBy: action.payload.acknowledgedBy,
        };
        
        // Update active/acknowledged lists
        state.activeAlarms = state.alarms.filter(a => a.status === 'active');
        state.acknowledgedAlarms = state.alarms.filter(a => a.status === 'acknowledged');
        
        // Update selected alarm if it's the one being acknowledged
        if (state.selectedAlarm && state.selectedAlarm.id === action.payload.id) {
          state.selectedAlarm = state.alarms[index];
        }
      }
    });

    // Clear alarm
    builder.addCase(clearAlarm.fulfilled, (state, action) => {
      const index = state.alarms.findIndex(a => a.id === action.payload.id);
      
      if (index >= 0) {
        state.alarms[index] = {
          ...state.alarms[index],
          status: 'cleared',
          clearedAt: action.payload.clearedAt,
          clearedBy: action.payload.clearedBy,
        };
        
        // Update active/acknowledged lists
        state.activeAlarms = state.alarms.filter(a => a.status === 'active');
        state.acknowledgedAlarms = state.alarms.filter(a => a.status === 'acknowledged');
        
        // Update selected alarm if it's the one being cleared
        if (state.selectedAlarm && state.selectedAlarm.id === action.payload.id) {
          state.selectedAlarm = state.alarms[index];
        }
      }
    });
  },
});

// Export actions
export const {
  setAlarmFilters,
  setAlarmPagination,
  selectAlarm,
  addAlarm,
  updateAlarm,
} = alarmsSlice.actions;

// Selectors
export const selectAlarms = (state: RootState) => state.alarms.alarms;
export const selectActiveAlarms = (state: RootState) => state.alarms.activeAlarms;
export const selectAcknowledgedAlarms = (state: RootState) => state.alarms.acknowledgedAlarms;
export const selectSelectedAlarm = (state: RootState) => state.alarms.selectedAlarm;
export const selectAlarmsLoading = (state: RootState) => state.alarms.loading;
export const selectAlarmsError = (state: RootState) => state.alarms.error;
export const selectAlarmsFilters = (state: RootState) => state.alarms.filters;
export const selectAlarmsPagination = (state: RootState) => state.alarms.pagination;

export default alarmsSlice.reducer;
