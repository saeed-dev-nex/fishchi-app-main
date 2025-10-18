import React, { useState } from 'react';
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
  ArrowBack,
  VpnKey,
} from '@mui/icons-material';
import loginImage from '../../assets/images/login.jpg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../store/features/authSlice';

// Validation schema for reset password form
const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(1, 'کد بازیابی الزامی است')
      .length(8, 'کد بازیابی باید ۸ رقم باشد'),
    newPassword: z
      .string()
      .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
      .max(50, 'رمز عبور نمی‌تواند بیش از ۵۰ کاراکتر باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن باید یکسان باشند',
    path: ['confirmPassword'],
  });

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, message } = useSelector(
    (state: RootState) => state.auth
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get email from location state
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (!email) {
      return;
    }

    const result = await dispatch(
      resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  };

  // If no email in state, redirect to forgot password page
  if (!email) {
    navigate('/forgot-password', { replace: true });
    return null;
  }

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
              <VpnKey sx={{ fontSize: 36, color: 'white' }} />
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
              تغییر رمز عبور
            </Typography>
            <Typography
              variant='body1'
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              کد ارسال شده به ایمیل {email} را وارد کنید و رمز عبور جدید خود را
              تعیین کنید
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
              {message && (
                <Alert severity='success' sx={{ width: '100%', mb: 2 }}>
                  {message}
                </Alert>
              )}
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='code'
                label='کد بازیابی'
                autoComplete='off'
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <VpnKey />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  borderRadius: 30,
                  '& .MuiInputBase-input': {
                    direction: 'rtl',
                    textAlign: 'right',
                    letterSpacing: '0.2em',
                  },
                }}
                {...register('code')}
                error={!!errors.code}
                helperText={errors.code?.message}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                label='رمز عبور جدید'
                type={showPassword ? 'text' : 'password'}
                id='newPassword'
                autoComplete='new-password'
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
                }}
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                label='تکرار رمز عبور جدید'
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                autoComplete='new-password'
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
                          aria-label='toggle confirm password visibility'
                          onClick={handleClickShowConfirmPassword}
                          edge='end'
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
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
                }}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
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
                {isLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
              </Button>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant='body2' sx={{ cursor: 'pointer' }}>
                  <Link
                    to='/forgot-password'
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <ArrowBack fontSize='small' />
                    بازگشت به فراموشی رمز عبور
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResetPasswordPage;
