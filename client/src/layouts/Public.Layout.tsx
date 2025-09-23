import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { Link, Outlet } from 'react-router-dom';
import logo_text from '../assets/images/logo.png';
import { useAppTheme } from '../contexts/ThemeContext';

const PublicLayout: React.FC = () => {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static' sx={{ bgcolor: '#2B2B2B' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, width: '160px', height: '48px' }}>
            <Link to='/'>
              <img src={logo_text} alt='logo' width='160px' height='48px' />
            </Link>
          </Box>
          {/* Add Login and Register Buttons */}
          <Stack direction='row' spacing={2}>
            {/* دکمه تغییر تم */}
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color='inherit'>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button variant='outlined' color='inherit'>
              <Link
                style={{ textDecoration: 'none', color: 'inherit' }}
                to='/login'
              >
                ورود
              </Link>
            </Button>
            <Button variant='contained' color='secondary'>
              <Link
                style={{ textDecoration: 'none', color: 'inherit' }}
                to='/register'
              >
                ثبت نام
              </Link>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component='main' sx={{ mt: 4, mb: 0, overflowX: 'hidden' }}>
        <Outlet />
      </Box>
      {/* فوتر */}
      <Box
        sx={{
          py: 6,
          bgcolor: 'primary.dark',
          color: 'white',
          width: '100%',
        }}
      >
        <Container maxWidth={false} sx={{ px: 0 }}>
          <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h5' fontWeight='bold' mb={2}>
                  فیشچی
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>
                  ابزار حرفه‌ای مدیریت منابع تحقیق برای پژوهشگران، دانشجویان و
                  اساتید
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='h6' fontWeight='bold' mb={2}>
                  لینک‌های سریع
                </Typography>
                <List dense>
                  {['درباره ما', 'ویژگی‌ها', 'قیمت‌گذاری', 'تماس با ما'].map(
                    (item, i) => (
                      <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                        <ListItemText primary={item} />
                      </ListItem>
                    )
                  )}
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='h6' fontWeight='bold' mb={2}>
                  تماس با ما
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.8 }}>
                  ایمیل: info@fishchi.ir
                  <br />
                  تلفن: ۰۲۱-۸۸۸۸۸۸۸۸
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Typography
              textAlign='center'
              variant='body2'
              sx={{ opacity: 0.7 }}
            >
              © ۱۴۰۳ فیشچی. تمامی حقوق محفوظ است.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
