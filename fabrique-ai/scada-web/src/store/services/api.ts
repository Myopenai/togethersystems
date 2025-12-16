import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

// Define the base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Define API endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Handle 401 Unauthorized
    if (result.error?.status === 401) {
      // You can dispatch logout action here if needed
      // api.dispatch(logout());
    }
    
    return result;
  },
  tagTypes: [
    'Devices',
    'Device',
    'DataPoints',
    'DataPoint',
    'Alarms',
    'Alarm',
    'Users',
    'User',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // Device endpoints
    getDevices: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => 
        `/devices?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ['Devices'],
    }),
    getDevice: builder.query({
      query: (id) => `/devices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Device', id }],
    }),
    createDevice: builder.mutation({
      query: (device) => ({
        url: '/devices',
        method: 'POST',
        body: device,
      }),
      invalidatesTags: ['Devices'],
    }),
    updateDevice: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/devices/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Devices',
        { type: 'Device', id },
      ],
    }),
    deleteDevice: builder.mutation({
      query: (id) => ({
        url: `/devices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Devices'],
    }),
    
    // Data Point endpoints
    getDataPoints: builder.query({
      query: ({ deviceId, page = 1, limit = 50 }) => 
        `/devices/${deviceId}/data-points?page=${page}&limit=${limit}`,
      providesTags: (result, error, { deviceId }) => [
        'DataPoints',
        { type: 'Device', id: deviceId },
      ],
    }),
    getDataPoint: builder.query({
      query: ({ deviceId, pointId }) => 
        `/devices/${deviceId}/data-points/${pointId}`,
      providesTags: (result, error, { pointId }) => [
        { type: 'DataPoint', id: pointId },
      ],
    }),
    updateDataPoint: builder.mutation({
      query: ({ deviceId, pointId, ...updates }) => ({
        url: `/devices/${deviceId}/data-points/${pointId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { pointId }) => [
        'DataPoints',
        { type: 'DataPoint', id: pointId },
      ],
    }),
    
    // Alarm endpoints
    getAlarms: builder.query({
      query: ({ page = 1, limit = 20, status, severity }) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (status) params.append('status', status);
        if (severity) params.append('severity', severity);
        
        return `/alarms?${params.toString()}`;
      },
      providesTags: ['Alarms'],
    }),
    acknowledgeAlarm: builder.mutation({
      query: (id) => ({
        url: `/alarms/${id}/acknowledge`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Alarms',
        { type: 'Alarm', id },
      ],
    }),
    
    // User endpoints (admin only)
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Users',
        { type: 'User', id },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    
    // System endpoints
    getSystemStatus: builder.query({
      query: () => '/system/status',
    }),
    getSystemMetrics: builder.query({
      query: ({ start, end, step = '1m' }) => 
        `/system/metrics?start=${start}&end=${end}&step=${step}`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth
  useLoginMutation,
  useGetCurrentUserQuery,
  
  // Devices
  useGetDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
  
  // Data Points
  useGetDataPointsQuery,
  useGetDataPointQuery,
  useUpdateDataPointMutation,
  
  // Alarms
  useGetAlarmsQuery,
  useAcknowledgeAlarmMutation,
  
  // Users
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // System
  useGetSystemStatusQuery,
  useGetSystemMetricsQuery,
} = api;
