import React from 'react';
import { 
  AppBar as MuiAppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Badge, 
  Box, 
  Tooltip,
  AppBarProps as MuiAppBarProps,
  styled,
  alpha
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { selectUnreadCount } from '../../store/slices/notificationsSlice';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  drawerWidth: number;
  collapsedDrawerWidth: number;
  isMobile: boolean;
  scrolled: boolean;
  onMenuClick: () => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'scrolled',
})<{ open: boolean; scrolled: boolean; drawerWidth: number; collapsedDrawerWidth: number }>(
  ({ theme, open, scrolled, drawerWidth, collapsedDrawerWidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && !scrolled && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    ...(open && scrolled && {
      marginLeft: collapsedDrawerWidth,
      width: `calc(100% - ${collapsedDrawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    ...(scrolled && {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      backdropFilter: 'blur(8px)',
      boxShadow: theme.shadows[1],
    }),
  })
);

const ConnectionIndicator = styled('div')<{ status: string }>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  backgroundColor: 
    status === 'connected' ? theme.palette.success.main :
    status === 'connecting' ? theme.palette.warning.main :
    theme.palette.error.main,
}));

const AppBar: React.FC<AppBarProps> = ({
  open,
  drawerWidth,
  collapsedDrawerWidth,
  isMobile,
  scrolled,
  onMenuClick,
  connectionStatus,
  ...props
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <StyledAppBar 
      position="fixed"
      open={open}
      scrolled={scrolled}
      drawerWidth={drawerWidth}
      collapsedDrawerWidth={collapsedDrawerWidth}
      elevation={0}
      {...props}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{
            marginRight: 2,
            color: theme.palette.text.primary,
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Connection Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <ConnectionIndicator status={connectionStatus} />
          <Typography variant="caption" color="text.secondary">
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </Typography>
        </Box>
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            onClick={handleNotificationsClick}
            sx={{ color: theme.palette.text.primary }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* Theme Toggle */}
        <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton 
            onClick={handleThemeToggle}
            sx={{ color: theme.palette.text.primary }}
          >
            {theme.palette.mode === 'dark' ? (
              <span className="material-icons">light_mode</span>
            ) : (
              <span className="material-icons">dark_mode</span>
            )}
          </IconButton>
        </Tooltip>
        
        {/* User Profile */}
        <Tooltip title={user?.email || 'User'}>
          <IconButton 
            onClick={handleProfileClick}
            sx={{ 
              p: 0.5,
              ml: 1,
              border: `2px solid ${theme.palette.divider}`,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Avatar 
              alt={user?.username || 'User'} 
              src={user?.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </StyledAppBar>
  );
};

export default AppBar;
