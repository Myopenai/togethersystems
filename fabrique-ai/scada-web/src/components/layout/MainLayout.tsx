import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, CssBaseline, Toolbar, useScrollTrigger } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import { useWebSocket } from '../../services/websocket';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 73;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isConnected } = useWebSocket();
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed"
        open={!collapsed}
        drawerWidth={DRAWER_WIDTH}
        collapsedDrawerWidth={COLLAPSED_DRAWER_WIDTH}
        isMobile={isMobile}
        scrolled={trigger}
        onMenuClick={handleDrawerToggle}
        connectionStatus={isConnected ? 'connected' : 'disconnected'}
      />
      
      {/* Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        collapsedDrawerWidth={COLLAPSED_DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            md: `calc(100% - ${collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)` 
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ml: { md: `${collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px` },
          pt: { xs: '64px', sm: '64px' }, // Account for app bar height
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* This pushes content below the app bar */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
