import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchDevices } from '../../store/slices/devicesSlice';
import { fetchAlarms } from '../../store/slices/alarmsSlice';
import { useWebSocket } from '../../services/websocket';
import StatCard from '../../components/dashboard/StatCard';
import DeviceStatusChart from '../../components/dashboard/DeviceStatusChart';
import AlarmSeverityChart from '../../components/dashboard/AlarmSeverityChart';
import DataPointTable from '../../components/dashboard/DataPointTable';
import RecentAlarms from '../../components/dashboard/RecentAlarms';
import SystemHealth from '../../components/dashboard/SystemHealth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useToast } from '../../hooks/useToast';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { subscribe, unsubscribe } = useWebSocket();
  
  // Selectors
  const { devices, loading: devicesLoading, error: devicesError } = useSelector((state: RootState) => state.devices);
  const { alarms, loading: alarmsLoading, error: alarmsError } = useSelector((state: RootState) => state.alarms);
  
  // Local state for real-time updates
  const [realTimeData, setRealTimeData] = useState<Record<string, any>>({});
  
  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchAlarms({}));
    
    // Set up WebSocket subscriptions
    subscribe('data-updates');
    subscribe('alarms');
    
    // Clean up subscriptions on unmount
    return () => {
      unsubscribe('data-updates');
      unsubscribe('alarms');
    };
  }, [dispatch, subscribe, unsubscribe]);
  
  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'DATA_POINT_UPDATE') {
          const { deviceId, pointId, value, timestamp } = message.payload;
          setRealTimeData(prev => ({
            ...prev,
            [`${deviceId}-${pointId}`]: {
              value,
              timestamp: new Date(timestamp).toLocaleTimeString(),
            },
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    // Add event listener for WebSocket messages
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Show error toasts
  useEffect(() => {
    if (devicesError) {
      showToast(devicesError, 'error');
    }
    if (alarmsError) {
      showToast(alarmsError, 'error');
    }
  }, [devicesError, alarmsError, showToast]);
  
  // Calculate statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeAlarms = alarms.filter(a => a.status === 'active').length;
  const dataPoints = devices.reduce((acc, device) => acc + (device.dataPoints?.length || 0), 0);
  
  if (devicesLoading || alarmsLoading) {
    return <LoadingSpinner fullHeight />;
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ErrorBoundary>
            <StatCard 
              title="Total Devices"
              value={totalDevices}
              icon="devices"
              color={theme.palette.primary.main}
              trend={{ value: 5, positive: true }}
            />
          </ErrorBoundary>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ErrorBoundary>
            <StatCard 
              title="Online Devices"
              value={onlineDevices}
              icon="wifi"
              color={theme.palette.success.main}
              trend={{ value: 2, positive: true }}
              subtitle={`${totalDevices ? Math.round((onlineDevices / totalDevices) * 100) : 0}% availability`}
            />
          </ErrorBoundary>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ErrorBoundary>
            <StatCard 
              title="Active Alarms"
              value={activeAlarms}
              icon="warning"
              color={theme.palette.error.main}
              trend={{ value: 3, positive: false }}
            />
          </ErrorBoundary>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ErrorBoundary>
            <StatCard 
              title="Data Points"
              value={dataPoints}
              icon="show_chart"
              color={theme.palette.info.main}
              trend={{ value: 12, positive: true }}
            />
          </ErrorBoundary>
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <ErrorBoundary>
            <DeviceStatusChart devices={devices} />
          </ErrorBoundary>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <ErrorBoundary>
            <AlarmSeverityChart alarms={alarms} />
          </ErrorBoundary>
        </Grid>
      </Grid>
      
      {/* Tables Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ErrorBoundary>
            <DataPointTable 
              devices={devices} 
              realTimeData={realTimeData} 
            />
          </ErrorBoundary>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <ErrorBoundary>
                <RecentAlarms alarms={alarms.slice(0, 5)} />
              </ErrorBoundary>
            </Grid>
            
            <Grid item xs={12}>
              <ErrorBoundary>
                <SystemHealth devices={devices} />
              </ErrorBoundary>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
