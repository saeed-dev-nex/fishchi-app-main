import React from 'react';
import { Typography, Container } from '@mui/material';

const LandingPage: React.FC = () => {
  return (
    <Container>
      <Typography variant='h2' component='h1' gutterBottom>
        به فیش‌چی خوش آمدید
      </Typography>
      <Typography variant='h5' component='p'>
        ابزار هوشمند شما برای مدیریت منابع و فیش‌برداری تحقیقاتی.
      </Typography>
      {/* در اینجا بقیه محتوای لندینگ پیج شما قرار خواهد گرفت */}
    </Container>
  );
};

export default LandingPage;
