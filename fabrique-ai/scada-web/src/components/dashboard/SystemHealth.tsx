import React, { useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  LinearProgress, 
  useTheme,
  Grid,
  Tooltip,
  SvgIcon,
  Divider
} from '@mui/material';
import { 
  Memory as MemoryIcon, 
  Storage as StorageIcon, 
  Speed as SpeedIcon, 
  NetworkCheck as NetworkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Device } from '../../types/device';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend
);

interface SystemHealthProps {
  devices: Device[];
}

interface HealthMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

const SystemHealth: React.FC<SystemHealthProps> = ({ devices }) => {
  const theme = useTheme();
  
  // Calculate system health metrics
  const metrics = useMemo(() => {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = devices.filter(d => d.status === 'offline').length;
    const warningDevices = devices.filter(d => d.status === 'warning').length;
    const errorDevices = devices.filter(d => d.status === 'error').length;
    
    // Mock data for system resources (in a real app, this would come from an API)
    const cpuUsage = Math.min(100, Math.max(0, 65 + (Math.random() * 10 - 5)));
    const memoryUsage = 75 + (Math.random() * 10 - 5);
    const diskUsage = 45 + (Math.random() * 10 - 5);
    const networkUsage = 30 + (Math.random() * 10 - 5);
    
    // Calculate overall system health score (0-100)
    const healthScore = Math.max(0, Math.min(100, 
      (onlineDevices / totalDevices) * 100 * 0.4 + // Device status (40% weight)
      (1 - errorDevices / totalDevices) * 100 * 0.3 + // Error rate (30% weight)
      (1 - warningDevices / totalDevices) * 100 * 0.2 + // Warning rate (20% weight)
      (1 - (cpuUsage / 100)) * 100 * 0.05 + // CPU usage (5% weight)
      (1 - (memoryUsage / 100)) * 100 * 0.05 // Memory usage (5% weight)
    ));
    
    return {
      healthScore: Math.round(healthScore),
      metrics: [
        {
          label: 'CPU Usage',
          value: Math.round(cpuUsage),
          max: 100,
          unit: '%',
          icon: <SpeedIcon />,
          color: theme.palette.primary.main,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        },
        {
          label: 'Memory',
          value: Math.round(memoryUsage),
          max: 100,
          unit: '%',
          icon: <MemoryIcon />,
          color: theme.palette.info.main,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        },
        {
          label: 'Disk Space',
          value: Math.round(diskUsage),
          max: 100,
          unit: '%',
          icon: <StorageIcon />,
          color: theme.palette.warning.main,
          trend: 'up',
        },
        {
          label: 'Network',
          value: Math.round(networkUsage),
          max: 100,
          unit: '%',
          icon: <NetworkIcon />,
          color: theme.palette.success.main,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        },
      ] as HealthMetric[],
      devices: {
        total: totalDevices,
        online: onlineDevices,
        offline: offlineDevices,
        warning: warningDevices,
        error: errorDevices,
      },
    };
  }, [devices, theme]);
  
  // Prepare chart data for device status
  const deviceStatusData = {
    labels: ['Online', 'Offline', 'Warning', 'Error'],
    datasets: [
      {
        data: [
          metrics.devices.online,
          metrics.devices.offline,
          metrics.devices.warning,
          metrics.devices.error,
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.grey[500],
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  // Get health status and color
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: theme.palette.success.main, icon: <CheckCircleIcon /> };
    if (score >= 75) return { status: 'Good', color: theme.palette.success.light, icon: <CheckCircleIcon /> };
    if (score >= 50) return { status: 'Fair', color: theme.palette.warning.main, icon: <WarningIcon /> };
    if (score >= 25) return { status: 'Poor', color: theme.palette.error.light, icon: <WarningIcon /> };
    return { status: 'Critical', color: theme.palette.error.main, icon: <ErrorIcon /> };
  };
  
  const healthStatus = getHealthStatus(metrics.healthScore);
  
  return (
    <Card>
      <CardHeader 
        title="System Health" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: healthStatus.color,
                mr: 1,
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              {healthStatus.status}
            </Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {/* Health Score */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box 
            sx={{
              position: 'relative',
              display: 'inline-flex',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography 
                  variant="h4" 
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: healthStatus.color,
                    lineHeight: 1,
                  }}
                >
                  {metrics.healthScore}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{ mt: 0.5 }}
                >
                  out of 100
                </Typography>
              </Box>
              
              {/* Circular progress */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={theme.palette.grey[200]}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={healthStatus.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(metrics.healthScore / 100) * 283} 283`}
                    transform="rotate(-90 50 50)"
                    style={{
                      transition: 'stroke-dasharray 0.5s ease 0s, stroke 0.5s ease',
                    }}
                  />
                </svg>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Overall System Health
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Chip
              icon={<CheckCircleIcon fontSize="small" />}
              label={`${metrics.devices.online} Online`}
              size="small"
              sx={{
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.dark,
                '& .MuiChip-icon': {
                  color: theme.palette.success.dark,
                },
              }}
            />
            <Chip
              icon={<WarningIcon fontSize="small" />}
              label={`${metrics.devices.warning} Warning`}
              size="small"
              sx={{
                backgroundColor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
                '& .MuiChip-icon': {
                  color: theme.palette.warning.dark,
                },
              }}
            />
            <Chip
              icon={<ErrorIcon fontSize="small" />}
              label={`${metrics.devices.error} Error`}
              size="small"
              sx={{
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.dark,
                '& .MuiChip-icon': {
                  color: theme.palette.error.dark,
                },
              }}
            />
          </Box>
        </Box>
        
        {/* Resource Usage */}
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
          Resource Usage
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {metrics.metrics.map((metric, index) => (
            <Grid item xs={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: `${metric.color}20`,
                    color: metric.color,
                    mr: 1.5,
                  }}
                >
                  {metric.icon}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: metric.color }}>
                      {metric.value}{metric.unit}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      mt: 0.5,
                      backgroundColor: `${metric.color}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {/* Device Status */}
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
          Device Status
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 120, mr: 3 }}>
            <Doughnut data={deviceStatusData} options={chartOptions} />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            {[
              { label: 'Online', value: metrics.devices.online, color: theme.palette.success.main },
              { label: 'Offline', value: metrics.devices.offline, color: theme.palette.grey[500] },
              { label: 'Warning', value: metrics.devices.warning, color: theme.palette.warning.main },
              { label: 'Error', value: metrics.devices.error, color: theme.palette.error.main },
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '2px',
                    backgroundColor: item.color,
                    mr: 1.5,
                  }} 
                />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
