import React, { useState } from 'react';
import { useAppTheme } from '../contexts/ThemeContext';
import { Outlet, useNavigate } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  InputBase,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconLogo from '../assets/images/icon-logo.png';

const DRAWER_WIDTH = 280;

const AppLayout: React.FC = () => {
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const navigate = useNavigate();

  // State management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

  // Menu items for sidebar
  const menuItems = [
    { text: 'داشبورد', icon: <HomeIcon />, path: '/app', badge: null },
    {
      text: 'پروژه ها',
      icon: <BookIcon />,
      path: '/app/projects',
      badge: '12',
    },
    {
      text: 'تنظیمات',
      icon: <SettingsIcon />,
      path: '/app/settings',
      badge: null,
    },
    {
      text: 'پروفایل',
      icon: <PersonIcon />,
      path: '/app/profile',
      badge: null,
    },
  ];

  // User data (mock data - replace with actual user context)
  const user = {
    name: 'سعید احمدی',
    email: 'saeed@fishchi.com',
    avatar: '/api/placeholder/40/40', // Replace with actual avatar URL
    role: 'مدیر پروژه',
  };

  // Event handlers
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
    // Add logout logic here
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // Add search logic here
    console.log('جستجو برای:', searchValue);
  };

  // Sidebar content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '56px',
              height: '56px',
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={IconLogo} alt='لوگوی فیش‌چی' width={36} height={36} />
          </Box>
          <Typography
            variant='h6'
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            فیش‌چی
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <List sx={{ gap: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(-4px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.main,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size='small'
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: 24,
                      height: 24,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Logout Button */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary='خروج' />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar
        position='fixed'
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Mobile menu button */}
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <Box
            component='form'
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: alpha(theme.palette.background.default, 0.6),
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: { xs: 200, md: 400 },
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.background.default, 0.8),
              },
              '&:focus-within': {
                bgcolor: alpha(theme.palette.background.default, 1),
                border: `1px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            <SearchIcon sx={{ color: theme.palette.text.secondary, ml: 1 }} />
            <InputBase
              placeholder='جستجو در پروژه ها...'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                flex: 1,
                '& input': {
                  padding: 0,
                },
              }}
            />
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme toggle */}
            <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
              <IconButton onClick={toggleTheme} color='inherit'>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title='اعلان‌ها'>
              <IconButton color='inherit'>
                <Badge badgeContent={4} color='error'>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Profile */}
            <Tooltip title='پروفایل کاربری'>
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      textAlign: 'right',
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {user.role}
                    </Typography>
                  </Box>
                  <Avatar
                    src={user.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </Box>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component='nav'
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label='mailbox folders'
      >
        {/* Mobile drawer */}
        <Drawer
          variant='temporary'
          anchor='left'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant='permanent'
          anchor='left'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
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
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Space for AppBar */}
        <Outlet /> {/* Child pages render here */}
      </Box>

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
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar src={user.avatar} sx={{ width: 48, height: 48 }}>
              {user.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {user.email}
              </Typography>
              <Chip
                label={user.role}
                size='small'
                sx={{
                  mt: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={() => navigate('/app/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize='small' />
            </ListItemIcon>
            پروفایل
          </MenuItem>
          <MenuItem onClick={() => navigate('/app/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize='small' />
            </ListItemIcon>
            تنظیمات
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize='small' color='error' />
            </ListItemIcon>
            خروج
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

export default AppLayout;
