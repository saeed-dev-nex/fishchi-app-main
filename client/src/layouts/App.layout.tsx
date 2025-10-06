import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderOpen,
  Settings,
  Logout,
  AccountCircle,
  Brightness4,
  Brightness7,
  Source,
  Notifications,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppTheme } from '../contexts/ThemeContext';
import logo_text from '../assets/images/logo.png';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const drawerWidth = 280;

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    text: 'داشبورد',
    icon: <Dashboard />,
    path: '/app',
  },
  {
    text: 'پروژه‌ها',
    icon: <FolderOpen />,
    path: '/app/projects',

  },
    {
        text:'منابع',
        icon:<Source/> ,
        path:'/app/library',

    },
  {
    text: 'تنظیمات',
    icon: <Settings />,
    path: '/app/settings',
  },
];

const AppLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useAppTheme();

  // Responsive breakpoint - hide sidebar on MD and below
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    // Add logout logic here
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMdDown) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <img src={logo_text} alt='فیشچی' style={{ height: 40 }} />
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size='small'
                    color={isActive ? 'secondary' : 'primary'}
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      backgroundColor: isActive
                        ? 'secondary.main'
                        : 'primary.main',
                      color: 'white',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 2,
          }}
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.dark',
                color: 'text.primary',
              }}
            >
              {user?.avatar || user?.name?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant='subtitle2' noWrap>
                {user?.name}
              </Typography>
              <Typography variant='caption' color='text.secondary' noWrap>
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position='fixed'
        sx={{
          width: { md: `calc(100% - ${isMdDown ? 0 : drawerWidth}px)` },
          ml: { md: isMdDown ? 0 : `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* Menu button for mobile */}
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: isMdDown ? 'block' : 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            {navigationItems.find((item) => item.path === location.pathname)
              ?.text || 'فیشچی'}
          </Typography>

          {/* Header Actions */}
          <Stack direction='row' spacing={1} alignItems='center'>
            {/* Theme Toggle */}
            <IconButton onClick={toggleTheme} color='inherit'>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton color='inherit'>
              <Notifications />
            </IconButton>

            {/* Profile Menu */}
            <IconButton
              size='large'
              edge='end'
              aria-label='account of current user'
              aria-controls='primary-search-account-menu'
              aria-haspopup='true'
              onClick={handleProfileMenuOpen}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize='small' />
          </ListItemIcon>
          پروفایل
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize='small' />
          </ListItemIcon>
          تنظیمات
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize='small' />
          </ListItemIcon>
          خروج
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component='nav'
        sx={{
          width: { md: isMdDown ? 0 : drawerWidth },
          flexShrink: { md: 0 },
        }}
        aria-label='navigation menu'
      >
        {/* Mobile drawer */}
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: isMdDown ? 'block' : 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 3,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', md: isMdDown ? 'none' : 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${isMdDown ? 0 : drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
