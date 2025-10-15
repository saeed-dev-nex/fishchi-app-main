import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  Avatar,
  Divider,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  Person,
  Google,
  GitHub,
} from '@mui/icons-material';
import loginImage from '../../assets/images/login.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { loginSchema, type LoginFormInputs } from '../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { clearState, loginUser } from '../../store/features/authSlice';

// No makeStyles needed in MUI v5, we'll use the `sx` prop.

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, user, error } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    dispatch(clearState());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      // Redirect to the intended destination or dashboard
      const from = location.state?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    dispatch(loginUser(data));
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    }/api/v1/auth/google`;
  };

  const handleGitHubLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    }/api/v1/auth/github`;
  };

  return (
    <Container sx={{ mb: 2 }}>
      <Grid
        container
        component='main'
        sx={{ width: '100%', direction: 'rtl', mx: 'auto' }}
      >
        {/* Image Grid Item - hidden on extra-small screens */}
        <Grid
          size={{ xs: 0, sm: 4, md: 6 }}
          sx={{
            backgroundImage: `url(${loginImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Form Grid Item */}
        <Grid
          size={{ xs: 12, sm: 8, md: 6 }}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 4,
              borderRadius: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
              maxWidth: 450,
            }}
          >
            <Avatar
              sx={{ m: 1, bgcolor: 'secondary.main', width: 60, height: 60 }}
            >
              <Person sx={{ fontSize: 36, color: 'white' }} />
            </Avatar>
            <Typography
              component='h1'
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                marginBottom: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 20%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              ورود به حساب کاربری
            </Typography>
            <Box
              component='form'
              noValidate
              sx={{ mt: 1, width: '100%' }}
              onSubmit={handleSubmit(onSubmit)}
            >
              {error && (
                <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='email'
                label='پست الکترونیک'
                autoComplete='email'
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Email />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  borderRadius: 30,
                  '& .MuiInputBase-input': {
                    direction: 'rtl',
                    textAlign: 'right',
                  },
                }} // Apply border radius here
                {...register('email', { required: 'ایمیل الزامی است' })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                label='رمز عبور'
                type={showPassword ? 'text' : 'password'}
                id='password'
                autoComplete='current-password'
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Lock />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={handleClickShowPassword}
                          edge='end'
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  borderRadius: 30,
                  '& .MuiInputBase-input': {
                    direction: 'rtl',
                    textAlign: 'right',
                  },
                }} // Apply border radius here
                {...register('password', { required: 'رمز عبور الزامی است' })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                loading={isLoading}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 30,
                  background:
                    'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 5px 15px rgba(33, 203, 243, 0.4)',
                  },
                }}
              >
                ورود
              </Button>
              <Divider sx={{ my: 2, width: '100%' }}>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  یا
                </Typography>
              </Divider>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  sx={{
                    py: 1.5,
                    borderRadius: 30,
                    borderColor: '#df0202',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: '#df0202',
                      backgroundColor: '#df0202',
                      color: 'white',
                    },
                  }}
                >
                  ورود با گوگل
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<GitHub />}
                  onClick={handleGitHubLogin}
                  sx={{
                    py: 1.5,
                    borderRadius: 30,
                    borderColor: 'grey.400',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: '#333',
                      backgroundColor: '#151515',
                      color: 'white',
                    },
                  }}
                >
                  ورود با گیت‌هاب
                </Button>
              </Box>
              <Grid container sx={{ mt: 3 }}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ cursor: 'pointer', mb: 2 }}>
                    فراموشی رمز عبور؟
                    <Link
                      to='/forgot-password'
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}
                    >
                      کلیک کنید
                    </Link>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' sx={{ cursor: 'pointer' }}>
                    حساب کاربری ندارید؟
                    <Link
                      to='/register'
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}
                    >
                      ثبت نام کنید
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
