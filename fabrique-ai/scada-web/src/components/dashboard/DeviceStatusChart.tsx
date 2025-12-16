import React, { useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  useTheme,
  Typography,
  SvgIcon
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Device } from '../../types/device';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DeviceStatusChartProps {
  devices: Device[];
}

const DeviceStatusChart: React.FC<DeviceStatusChartProps> = ({ devices }) => {
  const theme = useTheme();
  
  // Calculate device status counts
  const statusData = useMemo(() => {
    const statusCounts = {
      online: 0,
      offline: 0,
      warning: 0,
      error: 0,
    };
    
    devices.forEach(device => {
      if (device.status === 'online') statusCounts.online++;
      else if (device.status === 'offline') statusCounts.offline++;
      else if (device.status === 'warning') statusCounts.warning++;
      else if (device.status === 'error') statusCounts.error++;
    });
    
    return statusCounts;
  }, [devices]);
  
  // Prepare chart data
  const chartData: ChartData<'bar'> = {
    labels: ['Online', 'Offline', 'Warning', 'Error'],
    datasets: [
      {
        label: 'Devices',
        data: [
          statusData.online,
          statusData.offline,
          statusData.warning,
          statusData.error,
        ],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.grey[500],
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.grey[700],
          theme.palette.warning.dark,
          theme.palette.error.dark,
        ],
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 40,
      },
    ],
  };
  
  // Chart options
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed.y || 0;
            const total = devices.length;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };
  
  // If no data, show a message
  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Device Status" 
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 300,
              color: theme.palette.text.secondary,
            }}
          >
            <SvgIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M11 7h2v2h-2zM11 11h2v6h-2z" />
            </SvgIcon>
            <Typography variant="body1">No device data available</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Add devices to see status distribution
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Device Status" 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={`${devices.length} total devices`}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <Box sx={{ height: 300, position: 'relative' }}>
          <Bar 
            data={chartData} 
            options={options} 
          />
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
          {[
            { label: 'Online', value: statusData.online, color: theme.palette.success.main },
            { label: 'Offline', value: statusData.offline, color: theme.palette.grey[500] },
            { label: 'Warning', value: statusData.warning, color: theme.palette.warning.main },
            { label: 'Error', value: statusData.error, color: theme.palette.error.main },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: item.color,
                  borderRadius: '2px',
                  mr: 1,
                }} 
              />
              <Typography variant="body2" color="textSecondary">
                {item.label}: <strong>{item.value}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusChart;
