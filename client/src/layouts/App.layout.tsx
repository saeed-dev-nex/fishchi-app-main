import React from 'react';
import { useAppTheme } from '../contexts/ThemeContext';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
const DRAWER_WIDTH = 240;

const AppLayout: React.FC = () => {
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const menuItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, path: '/app' },
    { text: 'پروژه ها', icon: <BookIcon />, path: '/app/projects' },
    // Other Links
  ];
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* هدر بالایی */}
      <AppBar
        position='fixed'
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`, // به دلیل RTL، مارجین در سمت راست است
        }}
      >
        <Toolbar>
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            داشبورد فیش‌چی
          </Typography>

          {/* دکمه تغییر تم */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color='inherit'>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* نوار کناری دائمی */}
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        variant='permanent'
        anchor='left' // مهم: نوار کناری در سمت راست قرار می‌گیرد
      >
        <Toolbar /> {/* برای ایجاد فاصله به اندازه هدر */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* محتوای اصلی صفحه */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar /> {/* فاصله برای هدر */}
        <Outlet />{' '}
        {/* صفحات فرزند (داشبورد، پروژه‌ها و...) اینجا رندر می‌شوند */}
      </Box>
    </Box>
  );
};

export default AppLayout;
