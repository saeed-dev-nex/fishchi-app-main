import React, { useEffect } from 'react';
import { useTheme, styled, keyframes } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  Stack,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import {
  AutoStories,
  LibraryAdd,
  FormatQuote,
  Search,
  CloudUpload,
  Star,
  Psychology,
  ArrowForward,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';

// --- تعریف انیمیشن‌ها با Keyframes ---

// انیمیشن برای ظاهر شدن تدریجی و حرکت به بالا
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// انیمیشن برای درخشش و جلب توجه دکمه
const pulseEffect = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(4, 120, 87, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(4, 120, 87, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(4, 120, 87, 0);
  }
`;

// کامپوننت‌های استایل‌دهی شده برای طراحی مدرن

// کارت ویژگی با افکت شیشه‌ای و هاور
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
  }`,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(31, 41, 55, 0.6)'
      : 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
}));

// کارت نظرات کاربران با طراحی خاص
const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 3,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: -20,
    width: 100,
    height: 100,
    color: theme.palette.primary.main,
    opacity: 0.05,
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z'/%3E%3C/svg%3E") no-repeat`,
  },
}));

// دکمه اصلی با گرادینت جذاب
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(16, 185, 129, .3)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 8px 3px rgba(16, 185, 129, .4)',
  },
}));

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // لیست ویژگی‌ها برای خوانایی بهتر
  const features = [
    {
      icon: <AutoStories fontSize='large' />,
      title: 'مدیریت منابع',
      desc: 'افزودن خودکار منابع از طریق DOI/ISBN یا دستی با استخراج متادیتا از Crossref',
    },
    {
      icon: <LibraryAdd fontSize='large' />,
      title: 'فیش‌برداری هوشمند',
      desc: 'ایجاد و مدیریت فیش‌های تحقیقی با قابلیت تگ‌گذاری و دسته‌بندی',
    },
    {
      icon: <FormatQuote fontSize='large' />,
      title: 'منبع‌نویسی حرفه‌ای',
      desc: 'تبدیل خودکار به فرمت‌های APA, Vancouver, BibTeX و صدها استاندارد دیگر',
    },
    {
      icon: <Search fontSize='large' />,
      title: 'جستجوی پیشرفته',
      desc: 'جستجو در کل منابع و فیش‌ها با پشتیبانی از اتوکامپلیت',
    },
    {
      icon: <CloudUpload fontSize='large' />,
      title: 'خروجی Word',
      desc: 'ایجاد مستقیم فایل DOCX با قالب‌های از پیش تعریف شده',
    },
    {
      icon: <Psychology fontSize='large' />,
      title: 'سازماندهی هوشمند',
      desc: 'دسته‌بندی بر اساس پروژه، نویسنده، کلمات کلیدی و موضوعات',
    },
  ];

  return (
    <Box
      sx={{
        width: '100vw',
        overflowX: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* بخش Hero */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 8, md: 12 },
          position: 'relative',
          // گرادینت پس‌زمینه برای جذابیت بیشتر
          background: `radial-gradient(circle at top left, ${theme.palette.primary.light}00, ${theme.palette.background.paper} 40%)`,
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={5} alignItems='center'>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: `${fadeInUp} 1s ease-out`,
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                <Typography
                  component='h1'
                  variant={isMobile ? 'h3' : 'h2'}
                  fontWeight='bold'
                  gutterBottom
                >
                  <Box
                    component='span'
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    مدیریت هوشمند
                  </Box>
                  <br />
                  منابع تحقیق شما
                </Typography>
                <Typography
                  variant='h6'
                  color='text.secondary'
                  paragraph
                  sx={{
                    animation: `${fadeInUp} 1.2s ease-out`,
                    animationFillMode: 'both',
                  }}
                >
                  با فیشچی، منابع خود را سازماندهی کنید، فیش‌برداری هوشمند انجام
                  دهید و با یک کلیک به فرمت‌های استاندارد (APA, Vancouver و...)
                  تبدیل کنید.
                </Typography>
                <Stack
                  direction='row'
                  spacing={2}
                  sx={{
                    mt: 4,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    animation: `${fadeInUp} 1.4s ease-out`,
                    animationFillMode: 'both',
                  }}
                >
                  <GradientButton size='large' endIcon={<ArrowForward />}>
                    شروع رایگان
                  </GradientButton>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: `${fadeInUp} 1s ease-out 0.2s`,
                  animationFillMode: 'both',
                }}
              >
                <CardMedia
                  component='img'
                  image='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&q=80&w=1920&auto=format&fit=crop'
                  alt='پژوهشگر در حال کار'
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                    maxHeight: 500,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* بخش ویژگی‌های کلیدی */}
      <Box
        sx={{
          py: 12,
          position: 'relative',
          background: `radial-gradient(circle at bottom right, ${theme.palette.primary.light}1A, ${theme.palette.background.default} 50%)`,
        }}
      >
        <Container maxWidth='lg'>
          <Box
            sx={{
              textAlign: 'center',
              mb: 8,
              animation: `${fadeInUp} 1s ease-out`,
              animationFillMode: 'forwards',
            }}
          >
            <Typography variant='h3' fontWeight='bold' component='h2'>
              چرا فیشچی؟
            </Typography>
            <Typography variant='h6' color='text.secondary' sx={{ mt: 1 }}>
              تمام ابزارهای مورد نیاز شما برای یک پژوهش بی‌نقص
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={index}
                sx={{
                  animation: `${fadeInUp} 0.5s ease-out ${index * 0.15}s`,
                  animationFillMode: 'both',
                }}
              >
                <FeatureCard>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 64,
                      height: 64,
                      margin: '0 auto 16px',
                      color: '#fff',
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant='h6' fontWeight='bold' gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    {feature.desc}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* بخش نظرات کاربران */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth='lg'>
          <Box
            sx={{
              textAlign: 'center',
              mb: 8,
              animation: `${fadeInUp} 1s ease-out`,
              animationFillMode: 'forwards',
            }}
          >
            <Typography variant='h3' fontWeight='bold' component='h2'>
              دانشجویان و اساتید چه می‌گویند؟
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              {
                name: 'دکتر احمدی',
                role: 'استاد دانشگاه',
                comment:
                  'فیشچی زمان تحقیقاتم را ۵۰٪ کاهش داد! خروجی‌های APA دقیق و بدون خطا هستند.',
                avatar: 'A',
              },
              {
                name: 'سارا محمدی',
                role: 'دانشجوی دکترا',
                comment:
                  'مدیریت منابع برای پایان‌نامه با فیشچی به شدت ساده‌تر شده. پیشنهاد می‌کنم!',
                avatar: 'S',
              },
            ].map((review, index) => (
              <Grid
                size={{ xs: 12, md: 6 }}
                key={index}
                sx={{
                  animation: `${fadeInUp} 0.5s ease-out ${0.2 + index * 0.2}s`,
                  animationFillMode: 'both',
                }}
              >
                <TestimonialCard>
                  <Stack direction='row' spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {review.avatar}
                    </Avatar>
                    <Box>
                      <Typography fontWeight='bold'>{review.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {review.role}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant='body1' sx={{ fontStyle: 'italic' }}>
                    "{review.comment}"
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFC107' }} />
                    ))}
                  </Box>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* فراخوان به اقدام (CTA) */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth='md'>
          <Box
            sx={{
              p: { xs: 3, sm: 6 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              boxShadow: `0 10px 30px -5px ${theme.palette.primary.main}80`,
              animation: `${fadeInUp} 1s ease-out`,
            }}
          >
            <Typography variant='h3' fontWeight='bold' mb={2}>
              همین امروز مدیریت منابع خود را متحول کنید!
            </Typography>
            <Typography variant='h6' mb={4} sx={{ opacity: 0.9 }}>
              ۱۴ روز استفاده رایگان • بدون نیاز به کارت اعتباری
            </Typography>
            <GradientButton
              size='large'
              endIcon={<ArrowForward />}
              sx={{
                animation: `${pulseEffect} 2s infinite`, // افکت درخشش برای جلب توجه
              }}
            >
              رایگان شروع کنید
            </GradientButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
