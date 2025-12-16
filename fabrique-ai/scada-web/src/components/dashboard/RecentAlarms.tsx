import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  useTheme,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  SvgIcon
} from '@mui/material';
import { 
  Warning as WarningIcon, 
  Error as ErrorIcon, 
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Alarm } from '../../types/alarm';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface RecentAlarmsProps {
  alarms: Alarm[];
  maxItems?: number;
}

const RecentAlarms: React.FC<RecentAlarmsProps> = ({ 
  alarms, 
  maxItems = 5 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Sort alarms by timestamp (newest first) and limit to maxItems
  const recentAlarms = [...alarms]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);
  
  // Get severity icon and color
  const getSeverityProps = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          icon: <ErrorIcon fontSize="small" />,
          color: theme.palette.error.main,
          bgColor: theme.palette.error.light,
        };
      case 'high':
        return {
          icon: <WarningIcon fontSize="small" />,
          color: theme.palette.warning.dark,
          bgColor: theme.palette.warning.light,
        };
      case 'medium':
        return {
          icon: <WarningIcon fontSize="small" />,
          color: theme.palette.warning.main,
          bgColor: theme.palette.warning.light,
        };
      case 'low':
        return {
          icon: <InfoIcon fontSize="small" />,
          color: theme.palette.info.main,
          bgColor: theme.palette.info.light,
        };
      default:
        return {
          icon: <NotificationsIcon fontSize="small" />,
          color: theme.palette.grey[500],
          bgColor: theme.palette.grey[200],
        };
    }
  };
  
  // Handle view all click
  const handleViewAll = () => {
    navigate('/alarms');
  };
  
  // If no alarms, show a message
  if (alarms.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Recent Alarms" 
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 200,
              color: theme.palette.text.secondary,
              textAlign: 'center',
              p: 2,
            }}
          >
            <SvgIcon 
              color="success" 
              sx={{ 
                fontSize: 48, 
                mb: 2, 
                color: theme.palette.success.main,
                opacity: 0.8,
              }}
            >
              <CheckCircleIcon />
            </SvgIcon>
            <Typography variant="body1" sx={{ mb: 1 }}>
              No Active Alarms
            </Typography>
            <Typography variant="body2">
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
        title="Recent Alarms" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Tooltip title="View all alarms">
            <IconButton 
              size="small" 
              onClick={handleViewAll}
              sx={{ color: theme.palette.primary.main }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <List disablePadding>
          {recentAlarms.map((alarm, index) => {
            const severityProps = getSeverityProps(alarm.severity);
            const isAcknowledged = alarm.status === 'acknowledged';
            
            return (
              <React.Fragment key={alarm.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      cursor: 'pointer',
                    },
                    opacity: isAcknowledged ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() => navigate(`/alarms/${alarm.id}`)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: severityProps.bgColor,
                        color: severityProps.color,
                      }}
                    >
                      {severityProps.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            textDecoration: isAcknowledged ? 'line-through' : 'none',
                            color: isAcknowledged ? theme.palette.text.secondary : theme.palette.text.primary,
                          }}
                        >
                          {alarm.message}
                        </Typography>
                        <Chip
                          label={alarm.severity}
                          size="small"
                          sx={{
                            ml: 1,
                            textTransform: 'capitalize',
                            backgroundColor: severityProps.bgColor,
                            color: severityProps.color,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                        >
                          {alarm.deviceName || 'Unknown Device'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          {formatDistanceToNow(new Date(alarm.timestamp), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                    disableTypography
                  />
                </ListItem>
                {index < recentAlarms.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
        
        {alarms.length > maxItems && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              p: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Typography 
              variant="button" 
              color="primary" 
              sx={{ 
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={handleViewAll}
            >
              View All Alarms
              <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAlarms;
