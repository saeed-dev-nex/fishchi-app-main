import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import logo_text from '../assets/images/logo.png';
import logo_icon from '../assets/images/icon-logo.png';
const PublicLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static'>
        <Toolbar>
          <Box sx={{ flexGrow: 1, width: '160px', height: '48px' }}>
            <img src={logo_text} alt='logo' width='160px' height='48px' />
          </Box>
          {/* Add Login and Register Buttons */}
        </Toolbar>
      </AppBar>

      <Container component='main' sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PublicLayout;
