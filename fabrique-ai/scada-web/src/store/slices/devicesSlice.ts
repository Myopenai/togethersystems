import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { api } from '../services/api';

// Types
export interface Device {
  id: string;
  name: string;
  type: 'opcua' | 'modbus' | 'mqtt' | 'other';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastSeen: string;
  ipAddress?: string;
  port?: number;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DataPoint {
  id: string;
  deviceId: string;
  name: string;
  address: string;
  dataType: 'boolean' | 'int16' | 'int32' | 'float' | 'double' | 'string';
  value: any;
  quality: 'good' | 'bad' | 'uncertain';
  timestamp: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  writeable: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface DevicesState {
  devices: Device[];
  currentDevice: Device | null;
  dataPoints: Record<string, DataPoint[]>;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string[];
    type: string[];
  };
}

// Initial state
const initialState: DevicesState = {
  devices: [],
  currentDevice: null,
  dataPoints: {},
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    search: '',
    status: [],
    type: [],
  },
};

// Async thunks
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { page, limit } = state.devices.pagination;
      const { search, status, type } = state.devices.filters;
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      status.forEach(s => params.append('status', s));
      type.forEach(t => params.append('type', t));
      
      const response = await api.get(`/devices?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch devices');
    }
  }
);

export const fetchDevice = createAsyncThunk(
  'devices/fetchDevice',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/devices/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch device');
    }
  }
);

export const fetchDeviceDataPoints = createAsyncThunk(
  'devices/fetchDataPoints',
  async (deviceId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/devices/${deviceId}/data-points`);
      return { deviceId, dataPoints: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch data points');
    }
  }
);

// Create the slice
const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when search changes
    },
    setStatusFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setTypeFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.type = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    updateDataPointValue: (state, action: PayloadAction<{ deviceId: string; pointId: string; value: any; quality: string; timestamp: string }>) => {
      const { deviceId, pointId, value, quality, timestamp } = action.payload;
      const points = state.dataPoints[deviceId] || [];
      const pointIndex = points.findIndex(p => p.id === pointId);
      
      if (pointIndex !== -1) {
        state.dataPoints[deviceId][pointIndex] = {
          ...state.dataPoints[deviceId][pointIndex],
          value,
          quality,
          timestamp,
        };
      }
    },
    clearCurrentDevice: (state) => {
      state.currentDevice = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch devices
    builder.addCase(fetchDevices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDevices.fulfilled, (state, action) => {
      state.loading = false;
      state.devices = action.payload.data;
      state.pagination = {
        ...state.pagination,
        total: action.payload.total,
        totalPages: action.payload.pages,
      };
    });
    builder.addCase(fetchDevices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch single device
    builder.addCase(fetchDevice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDevice.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDevice = action.payload;
    });
    builder.addCase(fetchDevice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch device data points
    builder.addCase(fetchDeviceDataPoints.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDeviceDataPoints.fulfilled, (state, action) => {
      state.loading = false;
      const { deviceId, dataPoints } = action.payload;
      state.dataPoints[deviceId] = dataPoints;
    });
    builder.addCase(fetchDeviceDataPoints.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions
export const {
  setSearch,
  setStatusFilter,
  setTypeFilter,
  setPage,
  setLimit,
  updateDataPointValue,
  clearCurrentDevice,
} = devicesSlice.actions;

// Selectors
export const selectDevices = (state: RootState) => state.devices.devices;
export const selectCurrentDevice = (state: RootState) => state.devices.currentDevice;
export const selectDeviceDataPoints = (deviceId: string) => (state: RootState) => 
  state.devices.dataPoints[deviceId] || [];
export const selectDevicesLoading = (state: RootState) => state.devices.loading;
export const selectDevicesError = (state: RootState) => state.devices.error;
export const selectDevicesPagination = (state: RootState) => state.devices.pagination;
export const selectDevicesFilters = (state: RootState) => state.devices.filters;

export default devicesSlice.reducer;
