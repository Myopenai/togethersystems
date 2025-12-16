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
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Alarm } from '../../types/alarm';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface AlarmSeverityChartProps {
  alarms: Alarm[];
}

const AlarmSeverityChart: React.FC<AlarmSeverityChartProps> = ({ alarms }) => {
  const theme = useTheme();
  
  // Calculate alarm severity counts
  const severityData = useMemo(() => {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    alarms.forEach(alarm => {
      if (alarm.severity === 'critical') severityCounts.critical++;
      else if (alarm.severity === 'high') severityCounts.high++;
      else if (alarm.severity === 'medium') severityCounts.medium++;
      else if (alarm.severity === 'low') severityCounts.low++;
    });
    
    return severityCounts;
  }, [alarms]);
  
  // Prepare chart data
  const chartData: ChartData<'doughnut'> = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          severityData.critical,
          severityData.high,
          severityData.medium,
          severityData.low,
        ],
        backgroundColor: [
          theme.palette.error.dark,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper,
          theme.palette.background.paper,
          theme.palette.background.paper,
        ],
        borderWidth: 2,
      },
    ],
  };
  
  // Chart options
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme.palette.text.primary,
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  // If no alarms, show a message
  if (alarms.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Alarm Severity" 
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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </SvgIcon>
            <Typography variant="body1">No active alarms</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              All systems are operating normally
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Alarm Severity" 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={`${alarms.length} total alarms`}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <Box sx={{ height: 250, position: 'relative' }}>
          <Doughnut 
            data={chartData} 
            options={options} 
          />
        </Box>
        
        {/* Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
          {[
            { 
              label: 'Critical', 
              value: severityData.critical, 
              color: theme.palette.error.dark 
            },
            { 
              label: 'High', 
              value: severityData.high, 
              color: theme.palette.error.main 
            },
            { 
              label: 'Medium', 
              value: severityData.medium, 
              color: theme.palette.warning.main 
            },
            { 
              label: 'Low', 
              value: severityData.low, 
              color: theme.palette.info.main 
            },
          ].map((item) => (
            <Box key={item.label} sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: item.color,
                  fontWeight: 600,
                }}
              >
                {item.value}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlarmSeverityChart;
