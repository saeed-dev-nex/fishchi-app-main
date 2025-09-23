import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  AppRegistration,
} from '@mui/icons-material';
import RegisterImage from '../../assets/images/register.jpg';
import { Link, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import type { RegisterFormInputs } from '../../types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { clearState, registerUser } from '../../store/features/authSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../types';

// No makeStyles needed in MUI v5, we'll use the `sx` prop.

const RegisterPage: React.FC = () => {
  // ---------- HOOKS ----------
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, isRegistered, error, message } = useSelector(
    (state: RootState) => state.auth
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ---------- Component States  ----------
  const [showPassword, setShowPassword] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });
  // ----------------------------------------------

  // clear errors on component mount
  useEffect(() => {
    dispatch(clearState());
  }, [dispatch]);

  // redirect to verify email page if isRegistered is true
  useEffect(() => {
    if (isRegistered && submittedEmail) {
      navigate(`/verify-email?email=${encodeURIComponent(submittedEmail)}`); // redirect to verify email page
    }
  }, [isRegistered, navigate, submittedEmail]);

  // handle form submission
  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    setSubmittedEmail(data.email); // Store the submitted email
    dispatch(registerUser(data));
  };
  // ---------- Handlers ----------
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ------------------------------

  return (
    <Container sx={{ mb: 2 }}>
      <Grid container component='main' sx={{ direction: 'rtl' }}>
        {/* Image Grid Item - hidden on extra-small screens */}
        <Grid
          size={{ xs: 0, sm: 4, md: 6 }}
          sx={{
            backgroundImage: `url(${RegisterImage})`,
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
              <AppRegistration sx={{ fontSize: 36, color: 'white' }} />
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
              ایجاد حساب کاربری
            </Typography>
            <Box
              component='form'
              noValidate
              sx={{ mt: 1, width: '100%' }}
              onSubmit={handleSubmit(onSubmit)}
            >
              {error && (
                <Alert severity='error' sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}
              {message && (
                <Alert severity='success' sx={{ width: '100%' }}>
                  {message}
                </Alert>
              )}

              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='name'
                label='نام کاربر'
                autoComplete='name'
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Person />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  borderRadius: 30,
                }}
                {...register('name', { required: 'نام الزامی است' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
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
                }}
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
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                label='تکرار رمز عبور'
                type={showPassword ? 'text' : 'password'}
                id='confirmPassword'
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
                {...register('confirmPassword', {
                  required: 'تکرار رمز عبور الزامی است',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 30,
                  background:
                    'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 5px 15px rgba(252, 95, 78, 0.84)',
                  },
                }}
                loading={isLoading}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                ثبت نام
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
                  <Typography variant='body2' sx={{ cursor: 'pointer' }}>
                    حساب کاربری دارید؟
                    <Link
                      to='/login'
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        marginRight: '8px',
                      }}
                    >
                      وارد شوید
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
export default RegisterPage;
