import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Tooltip, 
  IconButton,
  Collapse,
  Typography,
  alpha,
  useTheme,
  Theme,
  styled
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationsSlice';

const drawerWidth = 280;
const collapsedWidth = 73;

interface SidebarProps {
  drawerWidth: number;
  collapsedDrawerWidth: number;
  mobileOpen: boolean;
  collapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  badge?: number | string;
  requiresAdmin?: boolean;
}

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'isMobile',
})<{ collapsed: boolean; isMobile: boolean }>(
  ({ theme, collapsed, isMobile }) => ({
    width: collapsed ? collapsedWidth : drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      width: collapsed && !isMobile ? collapsedWidth : drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden',
      borderRight: 'none',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    },
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 2),
  ...theme.mixins.toolbar,
}));

const LogoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 0',
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  marginLeft: theme.spacing(1.5),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
    : 'linear-gradient(45deg, #1976d2, #42a5f5)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  isMobile,
  onClose,
  onToggleCollapse,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const unreadAlarms = useSelector((state: RootState) => 
    state.alarms.alarms.filter(alarm => !alarm.acknowledged).length
  );
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      title: 'Devices',
      path: '/devices',
      icon: <DevicesIcon />,
      children: [
        { title: 'All Devices', path: '/devices', icon: <StarBorder /> },
        { title: 'OPC UA', path: '/devices/opcua', icon: <StarBorder /> },
        { title: 'Modbus', path: '/devices/modbus', icon: <StarBorder /> },
      ],
    },
    {
      title: 'Data Visualization',
      path: '/visualization',
      icon: <TimelineIcon />,
      children: [
        { title: 'Dashboards', path: '/visualization/dashboards', icon: <StarBorder /> },
        { title: 'Trends', path: '/visualization/trends', icon: <StarBorder /> },
        { title: 'Reports', path: '/visualization/reports', icon: <StarBorder /> },
      ],
    },
    {
      title: 'Alarms',
      path: '/alarms',
      icon: <WarningIcon />,
      badge: unreadAlarms > 0 ? unreadAlarms : undefined,
    },
  ];

  // Admin menu items
  const adminMenuItems: MenuItem[] = [
    {
      title: 'User Management',
      path: '/users',
      icon: <PeopleIcon />,
      requiresAdmin: true,
    },
    {
      title: 'System Settings',
      path: '/settings',
      icon: <SettingsIcon />,
      requiresAdmin: true,
      children: [
        { title: 'General', path: '/settings/general', icon: <StarBorder /> },
        { title: 'Appearance', path: '/settings/appearance', icon: <StarBorder /> },
        { title: 'Security', path: '/settings/security', icon: <StarBorder /> },
      ],
    },
  ];

  // Combine all menu items
  const allMenuItems = [...menuItems, ...(user?.role === 'admin' ? adminMenuItems : [])];

  // Toggle submenu
  const handleSubmenuToggle = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Check if a menu item is active
  const isActive = (path: string, exact: boolean = false) => {
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  };

  // Render menu items recursively
  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => {
      const isItemActive = isActive(item.path, !item.children?.length);
      const hasChildren = item.children && item.children.length > 0;
      const isSubmenuOpen = openSubmenus[item.title] || false;

      return (
        <React.Fragment key={item.path}>
          <ListItem 
            disablePadding 
            sx={{ 
              display: 'block',
              ...(isItemActive && {
                '& .MuiListItemButton-root': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  },
                },
              }),
            }}
          >
            <Tooltip 
              title={collapsed ? item.title : ''} 
              placement="right"
              disableHoverListener={!collapsed}
            >
              <div>
                <ListItemButton
                  onClick={() => {
                    if (hasChildren) {
                      handleSubmenuToggle(item.title);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: 2.5,
                    pl: level > 0 ? theme.spacing(level * 2) : 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: isItemActive 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            right: -4,
                            top: 4,
                            border: `2px solid ${theme.palette.background.paper}`,
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  
                  {!collapsed && (
                    <>
                      <ListItemText 
                        primary={item.title} 
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isItemActive ? 500 : 'normal',
                        }}
                      />
                      {hasChildren && (
                        isSubmenuOpen ? <ExpandLess /> : <ExpandMore />
                      )}
                    </>
                  )}
                </ListItemButton>
              </div>
            </Tooltip>
          </ListItem>
          
          {hasChildren && !collapsed && (
            <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.children || [], level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: collapsed ? collapsedWidth : drawerWidth },
        flexShrink: { sm: 0 },
      }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        collapsed={collapsed}
        isMobile={true}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        <DrawerContent onToggleCollapse={onToggleCollapse} collapsed={collapsed} />
      </StyledDrawer>
      
      {/* Desktop drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
          },
        }}
        open
        collapsed={collapsed}
        isMobile={false}
      >
        <DrawerContent onToggleCollapse={onToggleCollapse} collapsed={collapsed} />
      </StyledDrawer>
    </Box>
  );
};

// Drawer content component to avoid code duplication
const DrawerContent: React.FC<{ onToggleCollapse: () => void; collapsed: boolean }> = ({ 
  onToggleCollapse, 
  collapsed 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <DrawerHeader>
        {!collapsed && (
          <LogoContainer>
            <Box 
              component="img"
              src="/logo.svg" 
              alt="SCADA Logo" 
              sx={{ 
                height: 40, 
                width: 'auto',
                display: { xs: 'none', sm: 'block' },
              }} 
            />
            <LogoText>SCADA</LogoText>
          </LogoContainer>
        )}
        {collapsed && (
          <Box 
            component="img"
            src="/logo-icon.svg" 
            alt="SCADA" 
            sx={{ 
              height: 32, 
              width: 'auto',
              mx: 'auto',
            }} 
          />
        )}
        <IconButton onClick={onToggleCollapse} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List>
          {renderMenuItems(allMenuItems)}
        </List>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 1 }}>
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: 2.5,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </>
  );
};

export default Sidebar;
