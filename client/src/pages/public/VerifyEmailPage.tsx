import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Container,
  Paper,
  keyframes,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store'; // تایپ‌های store را از فایل store وارد کنید
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, clearState } from '../../store/features/authSlice'; // Thunk و Action را وارد کنید

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const VerificationEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const { isLoading, user, error, message } = useSelector(
    (state: RootState) => state.auth
  );

  // ما از react-hook-form در اینجا استفاده نمی‌کنیم چون مدیریت state دستی داریم
  const [code, setCode] = useState<string[]>(Array(8).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    dispatch(clearState());
    if (!email) {
      navigate('/register');
    }
  }, [dispatch, email, navigate]);

  // ریدایرکت به داشبورد در صورت موفقیت
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  // تابعی که وقتی کد کامل شد، آن را به Redux ارسال می‌کند
  const onCodeComplete = (completedCode: string) => {
    if (email) {
      dispatch(verifyEmail({ email, code: completedCode }));
    }
  };

  // مدیریت تغییر ورودی‌ها
  const handleChange = (index: number, value: string) => {
    // فقط اعداد و حداکثر یک کاراکتر مجاز است
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== '' && index < 7) {
        // حرکت به فیلد بعدی
        setActiveIndex(index + 1);
      }

      // اگر در فیلد آخر بودیم و کامل شد، کد را ارسال کن
      if (value !== '' && index === 7) {
        const fullCode = newCode.join('');
        if (fullCode.length === 8) {
          onCodeComplete(fullCode);
        }
      }
    }
  };

  // مدیریت Backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      // حرکت به فیلد قبلی
      setActiveIndex(index - 1);
    }
  };

  // مدیریت فوکوس خودکار
  useEffect(() => {
    const currentInput = inputsRef.current[activeIndex];
    if (currentInput) {
      currentInput.focus();
    }
  }, [activeIndex]);

  return (
    <Container maxWidth='sm' sx={{ my: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 6 }, // ریسپانسیو کردن padding
          borderRadius: 4,
          backgroundColor: 'background.paper', // استفاده از تم
        }}
      >
        <Typography
          variant='h5'
          component='h1'
          align='center'
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          فعال‌سازی حساب کاربری
        </Typography>
        <Typography
          variant='body1'
          align='center'
          gutterBottom
          sx={{ mb: 4, color: 'text.secondary' }}
        >
          یک کد تأیید {8} رقمی به ایمیل شما ارسال کردیم:
          <br />
          <strong
            style={{
              direction: 'ltr',
              display: 'block',
              margin: '8px 0',
              color: 'text.primary',
            }}
          >
            {email}
          </strong>
        </Typography>

        {/* نمایش لودینگ یا خطا */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
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

        {/* Input grid */}
        <Box
          component='form' // استفاده از فرم برای رفتار بهتر در موبایل
          onSubmit={(e) => e.preventDefault()} // جلوگیری از رفرش صفحه با Enter
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse', // برای RTL
            justifyContent: 'center',
            gap: { xs: 1, md: 2 },
            my: 4,
          }}
        >
          {code.map((digit, index) => (
            <TextField
              key={index}
              slotProps={{
                input: {
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                  },
                },
              }}
              value={digit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(index, e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e, index)
              }
              onFocus={() => setActiveIndex(index)} // فوکوس را با کلیک هم مدیریت کن
              inputRef={(el) => (inputsRef.current[index] = el)}
              variant='outlined'
              autoComplete='off'
              disabled={isLoading} // در زمان لودینگ، فیلدها را غیرفعال کن
              sx={{
                width: { xs: 40, md: 50 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderWidth: '2px' },
                  // استایل‌های زیبای شما
                  ...(activeIndex === index &&
                    !isLoading && {
                      animation: `${pulseAnimation} 0.8s ease-in-out infinite`,
                      '& fieldset': { borderColor: 'primary.main' },
                    }),
                },
              }}
            />
          ))}
        </Box>

        <Typography
          variant='caption'
          align='center'
          display='block'
          sx={{ color: 'text.secondary', mt: 2 }}
        >
          لطفا کد تأیید ۸ رقمی که دریافت کرده‌اید را وارد کنید.
        </Typography>
      </Paper>
    </Container>
  );
};

export default VerificationEmail;
